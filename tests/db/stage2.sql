-- Pruebas Etapa 2 (ejecutar en una BD de prueba vacía, NO en producción).
-- Simula el entorno Supabase: roles anon/authenticated, esquema auth, pgcrypto en "extensions".
\set ON_ERROR_STOP on
\set QUIET on
set client_min_messages = notice;
create role anon nologin; create role authenticated nologin;
create schema auth; create table auth.users(id uuid primary key default gen_random_uuid(), email text);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
create schema extensions; create extension pgcrypto schema extensions;
grant usage on schema public, auth, extensions to anon, authenticated;
\i database/schema.sql
\i database/functions.sql
\i database/policies.sql

do $$
declare
  t uuid := gen_random_uuid(); s uuid := gen_random_uuid(); cid uuid; cid2 uuid; v jsonb; failed boolean; n int;
  procedure_name text;
begin
  insert into auth.users(id,email) values (t,'prof@test.local'),(s,'est@test.local');
  insert into public.profiles(id,role,full_name) values (t,'teacher','Profe Prueba'),(s,'student','Estudiante Prueba');
  insert into public.classes(name,teacher_id,pin_hash,pin_active,opens_at,closes_at)
    values ('Clase T', t, extensions.crypt('GPU-2026', extensions.gen_salt('bf')), true, now()-interval '1 day', now()+interval '1 day')
    returning id into cid;

  -- A. Validación del PIN como visitante anónimo
  perform set_config('request.headers','{"x-forwarded-for":"9.9.9.1"}',true);
  set local role anon;
  v := public.check_class_pin('GPU-2026');            assert v->>'state'='open' and (v->>'ok')::boolean, 'A1 PIN válido abre';
  v := public.check_class_pin('  gpu-2026 ');          assert v->>'state'='open', 'A2 minúsculas y espacios';
  v := public.check_class_pin('GPU-9999');             assert v->>'state'='invalid' and v->'class_name' is null, 'A3 PIN incorrecto no revela clase';
  v := public.check_class_pin('''; DROP TABLE classes;--'); assert v->>'state'='invalid', 'A4 inyección SQL rechazada';
  reset role;
  perform 1 from public.classes; assert found, 'A5 la tabla classes sigue existiendo';
  raise notice 'PASS A: validación de PIN (válido, normalización, incorrecto, inyección)';

  -- B. Estados de la clase
  perform set_config('request.headers','{"x-forwarded-for":"9.9.9.2"}',true);
  update public.classes set pin_active=false where id=cid;
  v := public.check_class_pin('GPU-2026'); assert v->>'state'='inactive' and not (v->>'ok')::boolean, 'B1 PIN desactivado';
  update public.classes set pin_active=true, opens_at=now()+interval '1 hour' where id=cid;
  v := public.check_class_pin('GPU-2026'); assert v->>'state'='not_started', 'B2 antes de apertura';
  update public.classes set opens_at=now()-interval '2 days', closes_at=now()-interval '1 day' where id=cid;
  v := public.check_class_pin('GPU-2026'); assert v->>'state'='closed', 'B3 después del cierre';
  update public.classes set opens_at=now()-interval '1 day', closes_at=now()+interval '1 day' where id=cid;
  v := public.check_class_pin('GPU-2026'); assert v->>'state'='open', 'B4 reabierta';
  raise notice 'PASS B: desactivado, antes de apertura, después de cierre, reabierto';

  -- C. Límite de intentos (10 fallos / 10 min por IP)
  perform set_config('request.headers','{"x-forwarded-for":"9.9.9.3"}',true);
  for i in 1..10 loop perform public.check_class_pin('MALO-'||i); end loop;
  v := public.check_class_pin('GPU-2026'); assert v->>'state'='rate_limited', 'C1 bloqueo tras 10 fallos';
  perform set_config('request.headers','{"x-forwarded-for":"9.9.9.4"}',true);
  v := public.check_class_pin('GPU-2026'); assert v->>'state'='open', 'C2 otra IP no se ve afectada';
  raise notice 'PASS C: límite de intentos por IP';

  -- D. Permisos / RLS
  failed := false; begin set local role anon; perform pin_hash from public.classes; exception when insufficient_privilege then failed := true; end; reset role;
  assert failed, 'D1 anon NO puede leer pin_hash';
  failed := false; begin set local role anon; perform * from public.profiles; exception when insufficient_privilege then failed := true; end; reset role;
  assert failed, 'D2 anon NO puede leer profiles';
  failed := false; begin set local role anon; perform public.teacher_set_class('X Clase','ABC-1234',true,null,null); exception when insufficient_privilege then failed := true; end; reset role;
  assert failed, 'D3 anon NO puede ejecutar teacher_set_class';
  perform set_config('request.jwt.claim.sub', s::text, true);
  failed := false; begin set local role authenticated; perform public.teacher_set_class('X Clase','ABC-1234',true,null,null); exception when insufficient_privilege then failed := true; end; reset role;
  assert failed, 'D4 estudiante autenticado NO puede crear clases';
  failed := false; begin set local role authenticated; perform pin_hash from public.classes; exception when insufficient_privilege then failed := true; end; reset role;
  assert failed, 'D5 usuario autenticado NO puede leer pin_hash';
  set local role authenticated; select count(*) into n from public.classes; reset role;
  assert n = 0, 'D6 estudiante no ve clases por RLS';
  failed := false; begin set local role authenticated; perform * from public.profiles where id = t; if not found then failed := true; end if; end; reset role;
  assert failed, 'D7 estudiante no ve el perfil del profesor';
  failed := false; begin set local role authenticated; update public.classes set pin_active=false; exception when insufficient_privilege then failed := true; end; reset role;
  assert failed, 'D8 estudiante NO puede modificar clases';
  raise notice 'PASS D: anon y estudiante sin acceso a pin_hash, clases ni funciones de profesor';

  -- E. Profesor
  perform set_config('request.jwt.claim.sub', t::text, true);
  set local role authenticated;
  cid2 := public.teacher_set_class('Clase Nueva','NUEVA-2026',true, now(), now()+interval '30 days');
  select count(*) into n from public.classes; assert n = 2, 'E1 profesor ve sus clases (2)';
  failed := false; begin perform public.teacher_set_class('Otra','nueva-2026',true,null,null); exception when others then failed := sqlerrm like '%en uso%'; end;
  assert failed, 'E2 PIN duplicado rechazado';
  failed := false; begin perform public.teacher_set_class('Otra','ABC-1234',true, now(), now()-interval '1 day'); exception when others then failed := sqlerrm like '%posterior%'; end;
  assert failed, 'E3 cierre anterior a apertura rechazado';
  failed := false; begin perform public.teacher_set_class('Otra','abc',true,null,null); exception when others then failed := sqlerrm like '%PIN inválido%'; end;
  assert failed, 'E4 PIN corto rechazado';
  perform public.teacher_set_class('Clase Nueva',null,false, now(), now()+interval '30 days', cid2);   -- desactivar conservando PIN
  failed := false; begin perform pin_hash from public.classes; exception when insufficient_privilege then failed := true; end;
  assert failed, 'E5 ni el profesor lee pin_hash';
  reset role;
  v := public.check_class_pin('NUEVA-2026'); assert v->>'state'='inactive', 'E6 desactivar conserva el PIN y el estado se refleja';
  perform public.teacher_set_class('Clase Nueva','CAMBIADO-1',true, now(), now()+interval '30 days', cid2);
  v := public.check_class_pin('NUEVA-2026'); assert v->>'state'='invalid', 'E7 el PIN anterior deja de funcionar';
  v := public.check_class_pin('CAMBIADO-1'); assert v->>'state'='open', 'E8 el PIN nuevo funciona';
  select count(*) into n from public.admin_audit where actor = t; assert n = 3, 'E9 auditoría registró 3 acciones (obtenidas: '||n||')';
  select count(*) into n from public.classes where pin_hash like 'GPU%' or pin_hash like 'NUEVA%'; assert n = 0, 'E10 pin_hash no contiene el PIN en claro';
  select count(*) into n from public.classes where pin_hash like '$2%'; assert n = 2, 'E11 hashes bcrypt';
  raise notice 'PASS E: crear/cambiar/activar/desactivar PIN, validaciones, auditoría, bcrypt';
end $$;
