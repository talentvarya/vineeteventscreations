# Vineet Events Creations

Event management & entertainment company website with an admin dashboard (CRM-style lead management, media gallery, artists, testimonials).

## Stack
- **Backend:** FastAPI + MongoDB (Motor/PyMongo)
- **Frontend:** React (Create React App + Craco) + Tailwind + shadcn/radix-ui

## Setup

### 1. Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/
cp .env.example .env         # then fill in real values
uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

You also need a local or cloud **MongoDB** instance running, with its connection string set as `MONGO_URL` in `.env`.

### 2. Frontend
```bash
cd frontend
npm install --legacy-peer-deps
cp .env.example .env         # then fill in real values
npm start
```

> Note: if you hit an `ajv-keywords` / webpack compile error on `npm start`, add an `overrides` block to `frontend/package.json` pinning `ajv` to `^8.12.0` (see project history / issues for the exact fix), or use `yarn install` instead of `npm install`.

### Environment variables
See `backend/.env.example` and `frontend/.env.example`. Notably:
- `EMERGENT_LLM_KEY` — powers the AI chatbot and image/video upload (object storage). Without it, the rest of the site works fine but those two features are disabled.
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — seeded as the first admin login on backend startup.

## Admin Panel
Visit `/admin` to log in, then `/admin/dashboard` for:
- **Enquiries** — lead/CRM pipeline (status, notes, full edit, delete, CSV export)
- **Media Gallery** — upload/edit/delete/reorder gallery images & reels
- **Artists** — upload/edit/delete artist roster
- **Testimonials** — add/edit/delete text or video reviews
