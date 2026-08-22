# Keep / Discard API — The Other Room

Next.js App Router drop-in. Previews stay out of the album until Keep.

```text
src/
  app/api/
    scenes/route.ts
    stills/[id]/keep/route.ts
    stills/[id]/discard/route.ts
    albums/route.ts
    albums/[id]/stills/route.ts
  lib/
    album-store.ts      # swap for real DB + storage
    auth-studio.ts      # swap for real auth
  types/
    album.ts
docs/
  KEEP-DISCARD.md
```

Copy `src/` into your app’s `src/`. Ensure `@/` path alias points at `src/`.
