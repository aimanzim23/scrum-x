-- Projects table
create table if not exists public.projects (
  id         bigint generated always as identity primary key,
  name       text        not null unique,
  created_at timestamptz not null default now()
);

-- Posts table
create table if not exists public.posts (
  id         bigint generated always as identity primary key,
  author     text        not null,
  handle     text        not null,
  project    text        not null,
  time       text        not null,
  text       text        not null,
  phone      text,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.projects enable row level security;
alter table public.posts    enable row level security;

-- Projects: anyone authenticated can read; anyone authenticated can insert
create policy "Authenticated users can read projects"
  on public.projects for select
  to authenticated
  using (true);

create policy "Authenticated users can insert projects"
  on public.projects for insert
  to authenticated
  with check (true);

-- Posts: anyone authenticated can read all posts
create policy "Authenticated users can read posts"
  on public.posts for select
  to authenticated
  using (true);

-- Posts: authenticated users can insert their own posts
create policy "Authenticated users can insert posts"
  on public.posts for insert
  to authenticated
  with check (handle = (auth.jwt() ->> 'email')::text);

-- Posts: users can only update their own posts
create policy "Users can update own posts"
  on public.posts for update
  to authenticated
  using  (author = auth.jwt() ->> 'email')
  with check (author = auth.jwt() ->> 'email');

-- Posts: users can only delete their own posts
create policy "Users can delete own posts"
  on public.posts for delete
  to authenticated
  using (author = auth.jwt() ->> 'email');
