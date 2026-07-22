alter table public.posts add column if not exists is_draft boolean not null default false;
