create table if not exists public.profiles (
  handle       text        primary key,
  avatar_variant text      not null default 'beam',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Anyone authenticated can read profiles (to render avatars)
create policy "Authenticated users can read profiles"
  on public.profiles for select
  to authenticated
  using (true);

-- Users can only insert their own profile
create policy "Users can insert own profile"
  on public.profiles for insert
  to authenticated
  with check (handle = split_part(auth.jwt() ->> 'email', '@', 1));

-- Users can only update their own profile
create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using  (handle = split_part(auth.jwt() ->> 'email', '@', 1))
  with check (handle = split_part(auth.jwt() ->> 'email', '@', 1));
