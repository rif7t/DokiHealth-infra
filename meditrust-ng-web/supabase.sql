-- Run this SQL in Supabase / Postgres
-- Basic auth is handled by Supabase Auth (email OTP).

-- 1) Profiles (patients + doctors base)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  created_at timestamp with time zone default now()
);

-- 2) Doctors public info (duplicated subset, intentionally public-readable)
create table if not exists public.doctors_public (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  specialty text not null default 'General Practice',
  bio text,
  rating numeric default 4.4,
  online boolean default false
);

-- 3) Appointments
create table if not exists public.appointments (
  id bigserial primary key,
  patient_id uuid references auth.users(id) on delete set null,
  doctor_id uuid references auth.users(id) on delete set null,
  slot text not null,
  status text not null default 'scheduled',
  created_at timestamp with time zone default now()
);

-- Convenience view for joins
create or replace view public.appointments_view as
select a.*, p.full_name as patient_name, d.full_name as doctor_name, d.specialty
from appointments a
left join profiles p on p.id = a.patient_id
left join doctors_public d on d.id = a.doctor_id;

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.doctors_public enable row level security;
alter table public.appointments enable row level security;

-- Policies
-- profiles: users can read/update their own profile
create policy "read_own_profile" on public.profiles
  for select using (auth.uid() = id);
create policy "upsert_own_profile" on public.profiles
  for insert with check (auth.uid() = id);
create policy "update_own_profile" on public.profiles
  for update using (auth.uid() = id);

-- doctors_public: anyone can read; owners can upsert
create policy "read_doctors" on public.doctors_public
  for select using (true);
create policy "upsert_own_doctor" on public.doctors_public
  for insert with check (auth.uid() = id);
create policy "update_own_doctor" on public.doctors_public
  for update using (auth.uid() = id);

-- appointments: patient creates; patient or doctor involved can read/update/delete their rows
create policy "patient_create_appointment" on public.appointments
  for insert with check (auth.uid() = patient_id);
create policy "view_own_appointments" on public.appointments
  for select using (auth.uid() = patient_id or auth.uid() = doctor_id);
create policy "update_own_appointments" on public.appointments
  for update using (auth.uid() = patient_id or auth.uid() = doctor_id);
create policy "delete_own_appointments" on public.appointments
  for delete using (auth.uid() = patient_id);

-- Seed a few doctors (replace uuids with real auth user ids later)
-- For demo without auth, create anonymous test users and insert here.
-- insert into doctors_public(id, full_name, specialty, bio, online) values
--   ('00000000-0000-0000-0000-000000000001','Dr. Mira Herwitz','Orthopedic','Bone and joint specialist', true),
--   ('00000000-0000-0000-0000-000000000002','Dr. Ardi Yusriandy','Dermatology','Skin care expert', true);
