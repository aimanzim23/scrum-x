# Contributing to Scrum-X

Thanks for contributing! Follow the steps below to get set up.

## Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) account (free tier is fine)
- npm

## Local Setup

1. **Fork and clone the repo**

   ```bash
   git clone https://github.com/YOUR_USERNAME/scrum-x.git
   cd scrum-x
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Then fill in your own Supabase credentials in `.env.local`:

   | Variable | Where to find it |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Project Settings → API |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Project Settings → API |

4. **Run the database migration**

   In your Supabase dashboard, open the **SQL Editor** and run the contents of:

   ```
   supabase/migrations/20240101000000_init.sql
   ```

   This creates the `posts` and `projects` tables and sets up Row Level Security policies.

   > Alternatively, if you have the [Supabase CLI](https://supabase.com/docs/guides/cli) installed and a linked project, run:
   > ```bash
   > supabase db push
   > ```

5. **Run the dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Making Changes

1. Create a branch from `main`:

   ```bash
   git checkout -b feat/your-feature-name
   ```

2. Make your changes and verify the app works locally.

3. Run the linter before committing:

   ```bash
   npm run lint
   ```

4. Build to check for TypeScript/build errors:

   ```bash
   npm run build
   ```

5. Commit with a clear message:

   ```bash
   git commit -m "feat: describe what you added"
   ```

6. Push and open a Pull Request against `main`.

## Commit Message Convention

Use the prefix that best describes the change:

| Prefix | When to use |
|---|---|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `chore:` | Tooling, deps, config |
| `refactor:` | Code restructure with no behavior change |
| `docs:` | Documentation only |

## Project Structure

```
app/
  components/     # Shared React components (Feed, etc.)
  lib/            # Supabase client and shared types
  login/          # Auth page
  post/[id]/      # Post detail page
  page.tsx        # Home / feed page
  layout.tsx      # Root layout
```

## Notes

- Never commit `.env.local` — it is gitignored.
- This project uses **Next.js 16** which has breaking changes from earlier versions. Check `node_modules/next/dist/docs/` if something behaves unexpectedly.
- Styling is done with **Tailwind CSS 4** — utility classes only, no custom CSS unless necessary.
