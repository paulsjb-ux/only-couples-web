# Only Couples — New Frontend

Modern Next.js rebuild of the Only Couples private erotic studio.  
Moves off Streamlit onto a proper commercial-ready frontend while keeping Supabase as the backend of record.

## Stack

- **Next.js 15** (App Router) + TypeScript
- **Tailwind CSS v4**
- **Supabase** (Auth + Database + Storage) — you already have this
- **Lucide React** for icons
- Design system tuned for classy / high-end feel (deep rose, champagne gold, warm ivory)

## Getting started

```bash
cd only-couples-web

# 1. Install dependencies
npm install

# 2. Copy env and fill in your Supabase values
cp .env.local.example .env.local
# Edit .env.local with:
#   NEXT_PUBLIC_SUPABASE_URL=
#   NEXT_PUBLIC_SUPABASE_ANON_KEY=
#   (and later ZENCREATOR_API_KEY)

# 3. Run the dev server
npm run dev
```

Open http://localhost:3000

## Current status (Phase 1 — Frontend foundation)

### Done
- Design system (colours, typography, components) — restrained burgundy + gold, no candy pink
- Landing page
- Login / Signup with 18+ + consent gates
- Studio shell (desktop sidebar + mobile drawer)
- Core pages:
  - Home
  - Scenes (Soft / Playful / Intense with intensity toggle)
  - Your people
  - Free play
  - Library
  - Account (credits + look defaults)

### Next (in priority order)

1. **Supabase schema**  
   - `studios` table  
   - `people` (faces + roles)  
   - `generations` / library  
   - `credits` ledger  
   - Couple linking

2. **Real auth protection**  
   - Middleware that redirects unauthenticated users  
   - Session handling with `@supabase/ssr`

3. **People upload flow**  
   - Face upload → Supabase Storage  
   - Role assignment (Wife / Husband / Lover)

4. **Port the template catalog**  
   - Move `catalog.py` data into TypeScript or a JSON/API  
   - Real template cards with previews

5. **Generation pipeline**  
   - Server action or API route that calls ZenCreator  
   - Job status + credit spend/refund  
   - Results saved to library

6. **Stripe credits**  
   - Buy credit packs  
   - Webhook to top up the ledger

## Design principles (do not break)

- Soft by default, intense only when deliberately chosen
- Classy over sleazy (Killing Kittens energy)
- Mobile-first, but looks premium on laptop
- Private by design — no public feeds, no discovery
- Consent language is always present

## Project structure

```
src/
  app/
    page.tsx                 # Landing
    login/                   # Login
    signup/                  # Create studio
    (studio)/                # Authenticated area
      layout.tsx             # StudioShell
      home/
      scenes/
      people/
      create/
      library/
      account/
  components/
    StudioShell.tsx          # Sidebar + mobile nav
  lib/
    supabase/
      client.ts
      server.ts
    utils.ts
```

## Notes for the original Streamlit app

- Keep the old Streamlit version running until the new frontend is feature-complete.
- The excellent prompt catalog and intensity packs in `catalog.py` should be ported carefully — they are a core asset.
- Credits, people, and gallery data currently live in local folders + optional Supabase Storage. We will migrate that data model into proper tables.
