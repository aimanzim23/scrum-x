alter table public.profiles
  add column if not exists avatar_palette text not null default 'sky',
  add column if not exists avatar_emoji   text;
