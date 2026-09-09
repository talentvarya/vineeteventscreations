# PRD — Vineet Events Creations

## Original Problem Statement
Build a premium, DHAMAKEDAR (high-energy, bold, grand & royal) multi-page website for event management company "Vineet Events Creations" (19+ years, based in Dehradun, PAN India). Should feel like a live event experience, not a boring corporate site.

## Architecture
- Frontend: React 19 + React Router 7 + Tailwind + Framer Motion + canvas-confetti + sonner
- Backend: FastAPI + MongoDB (motor)
- Integrations: Gemini 3 Flash (AI chatbot via emergentintegrations/Emergent LLM key), JWT auth (bcrypt)

## User Personas
- Prospective client (bride/groom, corporate, parent) browsing services and submitting enquiries
- Admin (Vineet team) managing enquiries via dashboard

## Core Requirements (static)
- Multi-page: Home, About, Services, Artist Gallery, Events Gallery, Testimonials, Blog, Contact, Admin
- Black + Royal Gold + Deep Maroon theme, glow/pulse micro-interactions, spark particles, confetti on submit
- Draggable floating WhatsApp button (+97471913089)
- AI chatbot (Gemini 3 Flash) for queries + enquiry collection
- Enquiries stored in DB, admin panel to view/filter/update status/notes/delete + CSV export
- 19+ years trust signal highlighted on Home, About, Footer

## Implemented (2026-06)
- Full multi-page site with cinematic hero, animated stat counters, service cards, gallery preview, testimonials carousel, blog preview, final CTA
- Services page tabs + enquire modal; filterable Artist & Events galleries + lightbox; blog + article pages; contact (map, form, FAQ)
- Draggable WhatsApp button, AI chatbot (Gemini 3 Flash Hinglish)
- Enquiry API + confetti success; Admin JWT login + dashboard (KPIs, search, filter, status/notes, delete, CSV export)
- SEO meta tags + keywords

## Iteration 3 (2026-06) — Reel Videos, Artist Filter, Testimonials, Homepage Ordering
- Reel videos: admin uploads MP4s (kind=video); Instagram feed autoplays them (autoPlay muted loop)
- Artist Categories Filter: public /artists Star Roster has category tabs
- Testimonial Uploads: new admin Testimonials tab (text + video reviews, ratings); public Testimonials page + home carousel are DB-driven (5 seeded)
- Homepage Ordering: media has sort_order; admin reorders with up/down arrows; home feed & gallery preview honour order
- Endpoints: GET /api/testimonials, POST/DELETE /api/admin/testimonials, PATCH /api/admin/media/{id}
- Tested: backend 36/36 pytest; frontend verified (reorder click fixed — badges set pointer-events-none, controls moved top-right)

## Iteration 2 (2026-06) — Media, Instagram Feed, Artist Profiles
- Emergent Object Storage integration: admin upload of images/reels (multipart), public serving via /api/files
- Admin dashboard tabs: Enquiries | Media Gallery (upload/tag/reel flag/delete) | Artists (add/edit/delete with photo upload)
- Dynamic Events & Artist galleries fetched from /api/media (seeded with 13 items, 6 reels)
- Instagram-style "Live From Our Reels" feed on Home from /api/media?reel=true
- Bookable Artist Profiles (/artists Star Roster): AI-generated placeholder photos, category + availability badges, Book Now -> prefilled enquiry
- Seeded 6 artists (AI images) + 13 media on startup; client replaces via admin upload
- Tested: backend 25/25 pytest, frontend 100% — no blocking issues (rate card intentionally NOT built per user)

## Business Details
- Phone: +91-8588838594 | WhatsApp: +97471913089 | Email: vineet.eventsncreations@gmail.com
- Address: Canal Road, Dehradun, Uttarakhand, India 248001
- Admin: admin@vineetevents.com / Admin@123

## Backlog (P1/P2)
- P1: Real event photos/videos upload (object storage), Instagram/YouTube live feed embed
- P1: Downloadable rate-card PDF
- P2: Streaming chatbot responses, admin add-new-artist/event content management
- P2: Google Reviews live integration, blog CMS
