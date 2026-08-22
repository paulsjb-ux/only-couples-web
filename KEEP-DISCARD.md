# Keep / Discard wiring

## Routes added

| Method | Path | Effect |
|--------|------|--------|
| POST | `/api/scenes` | Generate → **preview** still only |
| POST | `/api/stills/:id/keep` | preview → **kept** (Soft album default) |
| POST | `/api/stills/:id/discard` | → **discarded** + wipe queue |
| GET | `/api/albums` | List albums (creates Soft if needed) |
| GET | `/api/albums/:id/stills` | **Kept** stills only |

## Drop into your repo

```text
src/app/api/scenes/route.ts
src/app/api/stills/[id]/keep/route.ts
src/app/api/stills/[id]/discard/route.ts
src/app/api/albums/route.ts
src/app/api/albums/[id]/stills/route.ts
src/lib/album-store.ts
src/lib/auth-studio.ts
src/types/album.ts
```

## Replace before production

1. `auth-studio.ts` — real session + studio membership  
2. `album-store.ts` — Prisma/Drizzle/Supabase + S3/R2 delete on discard  
3. `POST /api/scenes` — call your image pipeline; private bucket keys only  

## UI flow

```text
Generate → show preview (not in album grid)
  [Keep]  → POST /api/stills/:id/keep
  [Discard] → POST /api/stills/:id/discard
Album grid → GET /api/albums/:id/stills  (kept only)
```

## Rule

Album queries must filter `status === "kept"`. Never return preview/discarded.
