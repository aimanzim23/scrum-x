-- Public scrum reports (/scrums/DD-MM-YYYY/PROJECT) are readable without logging in,
-- so the anon role needs read access to posts and projects.
--
-- NOTE: the anon key ships in the browser bundle, so this makes every post and
-- project readable by anyone who extracts it — not only the shared date/project.
-- Writes stay restricted to authenticated users by the policies in the init migration.

create policy "Anyone can read projects"
  on public.projects for select
  to anon
  using (true);

create policy "Anyone can read posts"
  on public.posts for select
  to anon
  using (true);
