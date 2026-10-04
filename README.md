# Bite House — Real Next.js + Supabase

This replacement is designed to be copied over your existing Bite House project. It does **not** add a new npm/bun dependency, so you do not need to run `bun install` or `npm install` again.

## What is real now
- Supabase-backed products with admin create/edit/delete.
- Supabase-backed orders with persistent records and status updates.
- Supabase-backed reservation requests and contact messages.
- Easypaisa transaction ID is saved with each order.
- Optional Resend notifications for new orders, reservations and contact messages.
- Admin login uses an HTTP-only signed cookie.
- Still one dynamic Next.js app — no separate Express backend.
- Scroll-controlled 135-frame burger hero with safe null checks.

## One-time Supabase step
Run `supabase/schema.sql` once in Supabase SQL Editor. The service-role API routes then use your environment variables.

Required server variables:
`SUPABASE_URL`
`SUPABASE_SERVICE_ROLE_KEY`
`ADMIN_PASSWORD`
`ADMIN_SESSION_SECRET`

Optional:
`ADMIN_EMAIL`
`RESEND_API_KEY`
`RESEND_FROM_EMAIL`

Keep your existing `.env.local` file. Never commit it to GitHub.

## Replace files
Extract this ZIP over your existing project folder and replace the matching files. Keep your existing `node_modules`, `package.json`, `package-lock.json`/Bun lockfile, and your existing `public/burger_frames` folder.

After replacement, the next normal step is simply to run your existing dev/build command. No dependency installation is required by this update.
