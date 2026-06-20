# Netlify Deployment Guide — WS Task API

## Prerequisites

- [Netlify account](https://app.netlify.com) (free tier works)
- [Supabase project](https://supabase.com) with schema applied
- Git repository (GitHub, GitLab, or Bitbucket)

---

## Step 1: Supabase Setup

1. Create a new Supabase project
2. Open **SQL Editor** → run `supabase/schema.sql` (new) or `supabase/migration_v4_ws_task.sql` (upgrade)
3. Go to **Authentication → Providers → Email**
   - Disable **Enable sign ups** (no public registration)
4. Go to **Settings → API** and copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

### Create First Admin

1. **Authentication → Users → Add User**
   - Email: `admin@yourdomain.com`
   - Password: strong password
   - Auto Confirm: Yes
2. Run in SQL Editor:

```sql
UPDATE public.users
SET role = 'admin', username = 'admin'
WHERE email = 'admin@yourdomain.com';
```

---

## Step 2: Deploy to Netlify

### Via Git (Recommended)

1. Push project to GitHub/GitLab
2. Log in to [Netlify](https://app.netlify.com)
3. **Add new site → Import an existing project**
4. Connect your Git provider and select the repo
5. Build settings (auto-detected from `netlify.toml`):
   - Build command: `npm run build`
   - Publish directory: handled by `@netlify/plugin-nextjs`
6. Add environment variables (Site settings → Environment variables):

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `NEXT_PUBLIC_APP_NAME` | WS Task API |
| `NEXT_PUBLIC_APP_URL` | Your Netlify URL (update after deploy) |

7. Click **Deploy site**

### Via Netlify CLI

```bash
npm install -g netlify-cli
netlify login
cd rakib-tech-dashboard
netlify init
netlify deploy --prod
```

---

## Step 3: Configure Supabase Redirect URLs

After deploy, add your Netlify URL to Supabase:

1. **Authentication → URL Configuration**
2. **Site URL:** `https://your-site.netlify.app`
3. **Redirect URLs:** add:
   - `https://your-site.netlify.app/**`
   - `http://localhost:3000/**` (for local dev)

---

## Step 4: Custom Domain (Optional)

1. Netlify → **Domain management → Add custom domain**
2. Follow DNS instructions (CNAME or A record)
3. HTTPS is automatic via Let's Encrypt
4. Update environment variable:
   - `NEXT_PUBLIC_APP_URL=https://yourdomain.com`
5. Add custom domain to Supabase redirect URLs

---

## Local Development

```bash
cp .env.example .env.local
# Fill in Supabase credentials
npm install
npm run dev
```

Open http://localhost:3000

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Login redirect loop | Check Supabase redirect URLs include your domain |
| Admin API 403 | Verify `SUPABASE_SERVICE_ROLE_KEY` is set in Netlify |
| Build fails | Ensure Node 20+ (set in `netlify.toml`) |
| RLS errors | Re-run `supabase/schema.sql` |
| User not created on signup | Check trigger `on_auth_user_created` exists |

---

## Security Checklist

- [ ] Public sign-ups disabled in Supabase
- [ ] `SUPABASE_SERVICE_ROLE_KEY` only in server env (never `NEXT_PUBLIC_`)
- [ ] RLS enabled on all tables
- [ ] HTTPS enabled on custom domain
- [ ] Strong admin password set
