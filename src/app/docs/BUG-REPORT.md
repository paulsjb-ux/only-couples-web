# Audit: only-couples-web-main vs the-other-room.zip

## the-other-room.zip
Brand kit only (logos, hero, icons, docs). **Not** application source.
Do not merge it over `src/` except optional assets into `public/brand/`.

## only-couples-web-main — bugs found

### Critical (breaks pages / build)
1. **`src/app/(studio)/join/page.tsx` was EMPTY (0 bytes)**  
   No default export → `/join` fails. **Fixed in this package.**

2. **`/terms` linked but no page**  
   Footer could 404. **Added `src/app/terms/page.tsx`.**

### High (wrong or stub behaviour)
3. **Two parallel album systems**  
   - Real UI (`create`, `library`) uses **`/api/library` + Supabase**.  
   - Stub routes `/api/stills/.../keep|discard` and `/api/scenes` use **in-memory `albumStore`** + **demo-user** in `auth-studio.ts`.  
   They do **not** share data. Safe to ignore stubs until wired to Supabase; do not call them from UI.

4. **`src/lib/auth-studio.ts`** still returns hardcoded `demo-user` / `demo-studio`.  
   Only affects the stub stills/albums API routes.

5. **`src/prompts/*` not read by `/api/generate`**  
   Generate uses `scene-cores.ts` + Zen API. Prompt JSON files are unused until you wire them.

### Medium (UX)
6. **Signup** used white inputs / weak padding on dark shell — **restyled** to match login.  
7. **Login** padding fix included again if missing on deploy.  
8. **Junk 1-byte files** — delete manually:
   - `src/app/api/studio/Delete`
   - `src/app/api/albums/[id]/stills/Delete`

### Already OK
- Homepage CTAs → `/login`
- `/studio` → redirect `/home`
- Keep/Discard in create → `/api/library`
- Middleware public routes + auth redirect to `/home`

## Env required to run
```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
ZENCREATOR_API_KEY=
```

## Apply this zip
Merge into repo root, then delete the two `Delete` placeholder files, commit, redeploy.
