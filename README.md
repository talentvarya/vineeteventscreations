# Vineet Events Creations

Event management & entertainment company website with an admin dashboard (CRM-style lead management, media gallery, artists, testimonials).

## Stack
- **Frontend:** React (Create React App + Craco) + Tailwind + shadcn/radix-ui
- **Backend & Database:** [Supabase](https://supabase.com) — Postgres database, Auth (admin login), and Storage (media uploads). No separate backend server to run or deploy.

## Setup

```bash
cd frontend
npm install --legacy-peer-deps
cp .env.example .env
```

Fill in `.env` with your Supabase project's URL and anon key (Project Settings → API in the Supabase dashboard):

```
REACT_APP_SUPABASE_URL=https://your-project-ref.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

Then:

```bash
npm start
```

> Note: if you hit an `ajv-keywords` / webpack compile error on `npm start`, `package.json` already pins compatible `ajv`/`ajv-keywords` versions via the `overrides` field for the packages that need them (`fork-ts-checker-webpack-plugin`, `babel-loader`, `file-loader`).

## Database schema

The Supabase project needs 4 tables — `enquiries`, `media`, `artists`, `testimonials` — each with Row Level Security enabled (public read/insert where appropriate, admin-only write). A `media` Storage bucket (public) holds uploaded images/videos. See the project's Supabase dashboard → SQL Editor → migration history for the exact schema, or ask whoever set up the project for the migration SQL.

The first admin login is created directly in Supabase Auth (Authentication → Users in the dashboard, or via SQL).

## Admin Panel
Visit `/admin` to log in, then `/admin/dashboard` for:
- **Enquiries** — lead/CRM pipeline (status, notes, full edit, delete, CSV export)
- **Media Gallery** — upload/edit/delete/reorder gallery images & reels
- **Artists** — upload/edit/delete artist roster
- **Testimonials** — add/edit/delete text or video reviews

## Deploying
The frontend is a static React build — deploy it anywhere that serves static sites (Vercel, Netlify, etc.) with the two `REACT_APP_SUPABASE_*` environment variables set in that platform's dashboard. There is nothing else to deploy — Supabase hosts the database, auth, and file storage.
