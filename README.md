# The Other Room

A private erotic studio for consenting adults — **soft by default, intense when you choose**.  
Formerly prototyped as “Only Couples.” Product name is **The Other Room**.

Tagline: *A private studio for the two of you.*

---

## Stack

| Layer | Choice |
|--------|--------|
| Framework | **Next.js 15** (App Router) + TypeScript |
| UI | Tailwind CSS v4, Lucide icons |
| Auth / DB / Storage | **Supabase** (`@supabase/ssr` + `supabase-js`) |
| Image generation | **ZenCreator** API (`SEEDREAM_5_PRO`) |
| Hosting | Vercel |

Design: restrained burgundy + cream + gold. Classy over sleazy. No public feeds.

---

## Getting started

```bash
# 1. Install
npm install

# 2. Environment
cp .env.local.example .env.local
```

Fill in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
ZENCREATOR_API_KEY=your_zencreator_key
```

```bash
# 3. Dev server (Turbopack)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local dev with Turbopack |
| `npm run build` | Production build (**prefer `next build` without `--turbopack` on Vercel**) |
| `npm start` | Serve production build |
| `npm run lint` | ESLint |

> **Vercel note:** Use `"build": "next build"` in `package.json`. `next build --turbopack` has caused production build failures.

---

## What’s in this build

### Marketing (public)
- Landing (`/`)
- How it works, Pricing, About, Contact, Privacy
- Login / Signup with **18+** and consent gates

### Studio (auth required)
| Route | Purpose |
|-------|---------|
| `/home` | Soft favourites + quick links |
| `/scenes` | Catalog — Soft / Playful / Intense |
| `/people` | Faces + body slots (wife, husband, lovers) |
| `/create` | Free play / scene generate → preview → keep or discard |
| `/library` | Private album of kept stills |
| `/account` | Credits placeholder + look defaults |
| `/join` | Partner invite code (create / redeem) |

### APIs
- `POST /api/generate` — ZenCreator pipeline (faces, optional outfit, multi-version, anatomy lock)
- `POST` / `DELETE /api/library` — keep or remove from album
- `POST` / `GET /api/studio` — create / fetch studio membership

### Flow
**Generate → Preview → Keep (album) or Discard**  
Nothing is public. Previews are temporary until kept.

### Outfit try-on
On Create / Scenes: upload a garment image, pick wearer, generate with outfit lock + face identity from references.

---

## Design principles (do not break)

1. **Soft first** — intense only when deliberately chosen  
2. **Classy over sleazy** — members-club energy, not neon porn grid  
3. **Private by design** — no discovery, no public gallery, no training on user photos  
4. **Consent language always present**  
5. **Couple studio is first-class**; solo is allowed but not the default UX  
6. **Mobile-first**, premium on laptop  

Brand assets live under `public/brand/` (wordmarks, rings, TOR monogram). See `docs/brand-kit.md`.

---

## Project structure

```
src/
  app/
    page.tsx                 # Landing
    login/  signup/
    about/ how-it-works/ pricing/ contact/ privacy/
    (studio)/                # Auth-gated shell
      home/ scenes/ people/ create/ library/ account/ join/
    api/
      generate/              # ZenCreator
      library/
      studio/
  components/
    StudioShell.tsx
    marketing/nav.tsx        # MarketingNav + MarketingFooter
    brand/                   # Wordmark, RingsIcon
  lib/
    scene-cores.ts           # Prompt cores per scene id
    presets.ts               # Face/body presets
    copy.ts                  # UI / email microcopy
    supabase/                # browser + server clients
middleware.ts                # Auth redirects (root only — do not also keep src/middleware.ts)
docs/
  brand-kit.md
  private-album-spec.md
public/brand/                # Logos, icons, hero
```

---

## Supabase (minimum)

Tables the app expects:

- `studios` — shared workspace  
- `studio_members` — user ↔ studio + role (`owner` \| `partner`)  
- `people` — roles, `photo_path` / `photo_body` / `photo_angle`, body attrs  
- `generations` — kept library rows (`result_url`, optional `storage_path`, `status`)  
- `studio_invites` — optional partner codes  

Storage buckets: **`people`**, **`library`** (RLS so users only access their studio paths).

Album model details: `docs/private-album-spec.md`.

---

## Deploy (Vercel)

1. Connect the GitHub repo; branch `main`.  
2. Set environment variables (Production + Preview as needed):  
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ZENCREATOR_API_KEY`  
3. Build command should run **`next build`** (not Turbopack).  
4. Push to `main` or use **Redeploy** on the Deployments tab.

---

## Roadmap (next)

1. Harden Supabase schema + RLS (credits ledger, dual-approve delete)  
2. Real credit check/spend on generate; Stripe packs  
3. Job status polling UX for long gens  
4. Full partner invite emails  
5. Video kind end-to-end (UI accepts it; pipeline is stills-first today)

---

## Licence / use

Private product. For consenting adults only. Personal use.  
We do not train public models on your references. No public gallery.
