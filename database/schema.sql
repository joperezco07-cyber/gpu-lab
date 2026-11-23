-- GPU LAB 2.0 · Etapa 2 · Esquema base (orden de ejecución: schema → functions → policies → seed)
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        text not null check (role in ('student','teacher')),
  full_name   text not null check (length(btrim(full_name)) between 2 and 120),
  public_id   text unique check (public_id ~ '^GPU-[A-Z0-9]{6}$'),   -- lo usa la Etapa 3
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  last_login  timestamptz
);

create table if not exists public.classes (
  id                uuid primary key default gen_random_uuid(),
  name              text not null check (length(btrim(name)) between 2 and 80),
  teacher_id        uuid not null references public.profiles(id),
  pin_hash          text not null,                    -- bcrypt; el PIN nunca se guarda en claro
  pin_active        boolean not null default false,
  opens_at          timestamptz,
  closes_at         timestamptz,
  evaluations_open  boolean not null default false,
  created_at        timestamptz not null default now(),
  check (opens_at is null or closes_at is null or closes_at > opens_at)
);
create index if not exists classes_teacher_idx on public.classes(teacher_id);

create table if not exists public.pin_attempts (   -- límite de intentos
  id bigserial primary key, ip text not null, ok boolean not null, at timestamptz not null default now()
);
create index if not exists pin_attempts_ip_idx on public.pin_attempts(ip, at desc);

create table if not exists public.admin_audit (    -- auditoría administrativa
  id bigserial primary key, actor uuid not null, action text not null,
  detail jsonb not null default '{}', at timestamptz not null default now()
);
