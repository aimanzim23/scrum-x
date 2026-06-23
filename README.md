# Scrum-X

A lightweight daily scrum report sharing app for teams. Post your standup updates, filter by project or date, and contact teammates directly via WhatsApp.

## Features

- Post daily standup updates (up to 280 characters)
- Organize posts by project 
- Filter by time: All, Today, Yesterday, or custom date
- Email/password authentication via Supabase
- WhatsApp contact button per post
- Dark UI, mobile-friendly
- Daily calendar streaks

## Tech Stack

- [Next.js 16](https://nextjs.org) (App Router) + TypeScript
- [Supabase](https://supabase.com) (database + auth)
- [Tailwind CSS 4](https://tailwindcss.com)

## Getting Started

```bash
npm install
cp .env.example .env.local   # fill in your Supabase credentials
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

See [CONTRIBUTING.md](./CONTRIBUTING.md) for full setup instructions.

## Contributing

Pull requests are welcome. Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before submitting changes.

## License

[MIT](./LICENSE)
