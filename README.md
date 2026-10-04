# Bite House — exact-design Next.js rebuild

This update recreates the supplied YUMMY/Burger House visual design as the Bite House Next.js homepage while keeping real application capabilities.

## What is real
- Native-scroll 135-frame burger sequence from `public/burger_frames/frame_001.jpg` … `frame_135.jpg`.
- Live menu reads active products from `/api/products` and falls back to the bundled starter menu until Supabase is available.
- Cart is persisted in the browser and supports bun/extra customization.
- Checkout posts to `/api/orders`, where server code re-checks product prices and allowed extras before writing the order to Supabase.
- Easypaisa manual transfer flow uses 03349552257 and only asks for the transaction/reference ID — never a PIN or OTP.
- Reservations and contact messages are written to Supabase.
- Admin login + product CRUD + order status + reservation/message status are protected by the admin session cookie.
- EmailJS is integrated server-side through its REST endpoint. No new npm package is required.

## Important: no new install required
This ZIP intentionally excludes `package.json`, `package-lock.json`, `bun.lock`, `node_modules`, `.next`, `.env.local`, and your burger frames. Extract/replace these app/component/lib files over your existing Bite House project. Your existing dependencies and 135 JPG frames stay in place.

## Supabase setup
Run `supabase/schema.sql` once in Supabase SQL Editor. Then put the Supabase URL + secret key in `.env.local` locally and in Vercel Environment Variables.

## EmailJS setup
Create one EmailJS email service and these templates:
1. Order admin: `EMAILJS_ORDER_ADMIN_TEMPLATE_ID`
2. Order customer: `EMAILJS_ORDER_CUSTOMER_TEMPLATE_ID` (optional)
3. Reservation: `EMAILJS_RESERVATION_TEMPLATE_ID`
4. Contact: `EMAILJS_CONTACT_TEMPLATE_ID`

The template should use dynamic variables such as `{{to_email}}`, `{{reply_to}}`, `{{customer_name}}`, `{{order_number}}`, `{{items}}`, `{{total}}`, `{{payment_reference}}`, `{{name}}`, `{{message}}`, etc. Set the template's recipient to `{{to_email}}` when you want the server to choose the recipient.

## Local env
Copy `.env.example` to `.env.local` and fill the values. Never commit `.env.local`.

## Vercel
Import the GitHub repo as a Next.js project. Vercel installs dependencies from your existing lockfile automatically. Add the same environment variables in Vercel and deploy.
