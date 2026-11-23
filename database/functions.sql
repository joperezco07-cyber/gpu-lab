create or replace function public.is_teacher() returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'teacher' and active)
$$;

-- Valida el PIN de clase (pública, sin sesión). Nunca devuelve el hash.
create or replace function public.check_class_pin(p_pin text) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_hdr text := nullif(current_setting('request.headers', true), '');
  v_xff text := coalesce((v_hdr::json) ->> 'x-forwarded-for', 'local');
  v_ip  text := btrim((string_to_array(v_xff, ','))[array_length(string_to_array(v_xff, ','), 1)]);
  v_pin text := upper(btrim(coalesce(p_pin, '')));
  c public.classes; v_state text;
begin
  delete from public.pin_attempts where at < now() - interval '1 day';
  if (select count(*) from public.pin_attempts where ip = v_ip and not ok and at > now() - interval '10 minutes') >= 10 then
    return jsonb_build_object('ok', false, 'state', 'rate_limited');
  end if;
  if v_pin !~ '^[A-Z0-9-]{4,32}$' then
    insert into public.pin_attempts(ip, ok) values (v_ip, false);
    return jsonb_build_object('ok', false, 'state', 'invalid');
  end if;
  select * into c from public.classes where pin_hash = crypt(v_pin, pin_hash) limit 1;
  if not found then
    insert into public.pin_attempts(ip, ok) values (v_ip, false);
    return jsonb_build_object('ok', false, 'state', 'invalid');
  end if;
  insert into public.pin_attempts(ip, ok) values (v_ip, true);
  v_state := case
    when not c.pin_active then 'inactive'
    when c.opens_at  is not null and c.opens_at  > now()  then 'not_started'
    when c.closes_at is not null and c.closes_at <= now() then 'closed'
    else 'open' end;
  return jsonb_build_object('ok', v_state = 'open', 'state', v_state,
    'class_name', c.name, 'opens_at', c.opens_at, 'closes_at', c.closes_at);
end $$;

-- Crear o cambiar clase/PIN (solo profesor). p_pin vacío = conservar el PIN actual.
create or replace function public.teacher_set_class(
  p_name text, p_pin text, p_active boolean, p_opens timestamptz, p_closes timestamptz, p_class_id uuid default null
) returns uuid
language plpgsql security definer set search_path = public, extensions as $$
declare v_id uuid := p_class_id; v_pin text := upper(btrim(coalesce(p_pin, '')));
begin
  if not public.is_teacher() then raise exception 'No autorizado' using errcode = '42501'; end if;
  if p_name is null or length(btrim(p_name)) not between 2 and 80 then raise exception 'Nombre de clase inválido'; end if;
  if p_opens is not null and p_closes is not null and p_closes <= p_opens then
    raise exception 'La fecha de cierre debe ser posterior a la de apertura'; end if;
  if v_pin <> '' then
    if v_pin !~ '^[A-Z0-9-]{6,32}$' then raise exception 'PIN inválido: 6 a 32 caracteres (letras, números o guion)'; end if;
    if exists (select 1 from public.classes k where k.id is distinct from v_id and k.pin_hash = crypt(v_pin, k.pin_hash)) then
      raise exception 'Ese PIN ya está en uso'; end if;
  end if;
  if v_id is null then
    if v_pin = '' then raise exception 'Se requiere un PIN para crear la clase'; end if;
    insert into public.classes(name, teacher_id, pin_hash, pin_active, opens_at, closes_at)
    values (btrim(p_name), auth.uid(), crypt(v_pin, gen_salt('bf')), coalesce(p_active, false), p_opens, p_closes)
    returning id into v_id;
  else
    update public.classes set name = btrim(p_name),
      pin_hash = case when v_pin = '' then pin_hash else crypt(v_pin, gen_salt('bf')) end,
      pin_active = coalesce(p_active, pin_active), opens_at = p_opens, closes_at = p_closes
    where id = v_id and teacher_id = auth.uid();
    if not found then raise exception 'Clase no encontrada'; end if;
  end if;
  insert into public.admin_audit(actor, action, detail) values (auth.uid(),
    case when p_class_id is null then 'class_create' else 'class_update' end,
    jsonb_build_object('class_id', v_id, 'pin_changed', v_pin <> '', 'active', p_active));
  return v_id;
end $$;

revoke all on function public.is_teacher(), public.check_class_pin(text),
  public.teacher_set_class(text,text,boolean,timestamptz,timestamptz,uuid) from public, anon, authenticated;
grant execute on function public.check_class_pin(text) to anon, authenticated;
grant execute on function public.is_teacher(), public.teacher_set_class(text,text,boolean,timestamptz,timestamptz,uuid) to authenticated;
