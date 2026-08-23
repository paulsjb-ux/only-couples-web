# The Other Room — Final full update (22 Aug 2026)

Yesterday’s light/pink studio look + today’s TOR rename + missing product wiring.

## What’s included

### Look
- Light/pink StudioShell, rose primary buttons, white cards
- Marketing site stays dark TOR cream/gold
- No marketing full-viewport `.hero` inside studio pages

### Product wiring (this update)
1. **Prompts → generate** — `src/lib/prompt-rules.ts` loads `src/prompts/*`
   - Default location: bedroom morning (not shower)
   - Global negatives + two-person anatomy
   - Soft-hero extras for morning / free soft scenes
2. **Partner invite** — `POST /api/studio/join` with studio UUID
   - Account shows copyable invite code
   - Join page calls the API (no longer a dead placeholder)
3. **Nav** — “Join partner” under You

### Already present
- CTAs → /login, /studio → /home
- Keep/Discard via /api/library (Supabase)
- Login/signup polish, terms, not-found
- Brand kit, docs, landing HTML

## Deploy

```bash
cd app
npm install
# .env.local
# NEXT_PUBLIC_SUPABASE_URL=
# NEXT_PUBLIC_SUPABASE_ANON_KEY=
# ZENCREATOR_API_KEY=
npm run build
```

## Still optional / later
- Short human invite codes (currently studio UUID)
- Wire demo `/api/stills` to Supabase or delete stubs
- Soft/playful/after-dark consent gates as product rules
