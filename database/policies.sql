alter table public.profiles     enable row level security;
alter table public.classes      enable row level security;
alter table public.pin_attempts enable row level security;   -- sin políticas = nadie accede directo
alter table public.admin_audit  enable row level security;

revoke all on public.profiles, public.classes, public.pin_attempts, public.admin_audit from anon, authenticated;
grant select on public.profiles to authenticated;
-- pin_hash queda fuera de los permisos de columna: ningún cliente puede leerlo
grant select (id, name, teacher_id, pin_active, opens_at, closes_at, evaluations_open, created_at)
  on public.classes to authenticated;

drop policy if exists profiles_self on public.profiles;
create policy profiles_self on public.profiles for select to authenticated using (id = auth.uid());
drop policy if exists classes_teacher on public.classes;
create policy classes_teacher on public.classes for select to authenticated
  using (teacher_id = auth.uid() and public.is_teacher());
