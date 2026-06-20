# WS Task API

Premium dark dashboard built with Next.js 15, TypeScript, Tailwind CSS, and Supabase.

## Tech Stack

- **Next.js 15** — App Router
- **TypeScript** — Full type safety
- **Tailwind CSS** — Dark glassmorphism UI
- **Supabase** — Auth, PostgreSQL
- **Netlify** — Production deployment

## Features

### Authentication
- No public registration — admin creates users
- Role-based access (admin / user)

### User Dashboard
- Username, API Key, today's stats
- Current balance (auto-updated via admin income additions)
- Monthly statistics chart
- Withdrawal history & requests (min $10)

### Admin Panel
- Incremental stat updates (registrations, valid users, SMS, income)
- **Add Income** — automatically adds to user balance and logs to history
- Withdraw approve/reject with auto balance deduction on approve
- Lifetime statistics tracking

## Quick Start

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_APP_NAME` | WS Task API |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key |

## Database

Run `supabase/schema.sql` for new projects, or `supabase/migration_v4_ws_task.sql` for upgrades.

## Balance System

- Admin **Add Income** → `balance = balance + added_income` (logged in history)
- Admin **Approve withdraw** → `balance = balance - withdraw_amount`
- Rejected withdrawals do not affect balance

## License

Private — WS Task API
