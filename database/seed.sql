-- 1) Crea antes tu usuario profesor en Supabase → Authentication → Users (correo real + contraseña fuerte).
-- 2) Cambia el correo y el PIN. NO subas a GitHub el PIN real.
insert into public.profiles (id, role, full_name)
select id, 'teacher', 'Profesor' from auth.users where email = 'CAMBIA_ESTE_CORREO@ejemplo.com'
on conflict (id) do nothing;

insert into public.classes (name, teacher_id, pin_hash, pin_active, opens_at, closes_at)
select 'GPU LAB – Clase 1', p.id, crypt('CAMBIA-ESTE-PIN', gen_salt('bf')), true, now(), now() + interval '90 days'
from public.profiles p where p.role = 'teacher'
  and not exists (select 1 from public.classes);
