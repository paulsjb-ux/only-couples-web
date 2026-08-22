The Other Room — complete package
=================================
Product: The Other Room (formerly Only Couples)
Tagline: A private studio for the two of you.

Contents
--------
Studio
  src/app/(studio)/create/page.tsx     Versions 1-4, Keep/Discard, cast upload
  src/app/(studio)/library/page.tsx    Private album + download
  src/app/(studio)/scenes/page.tsx     Soft links + correct result thumbs
  src/app/api/generate/route.ts        Preview-only (no auto-keep)
  src/app/api/library/route.ts         Keep = insert
  src/lib/scene-cores.ts               SCENE LOCK templates (anal/oral/etc.)
  src/lib/presets.ts

Brand
  public/brand/logos/*                 Wordmarks
  public/brand/icons/*                 Rings, TOR favicon, app icon
  src/app/page.tsx                     Landing
  src/app/layout-metadata.ts           Title + favicon
  src/components/marketing/nav.tsx
  src/components/brand/*
  src/app/brand-tor.css
  src/app/studio-contrast.css

Docs
  docs/private-album-spec.md
  docs/brand-kit.md

Install
-------
1. Copy public/brand → project public/brand
2. Copy src files over matching paths
3. globals.css:
     @import "./studio-contrast.css";
     @import "./brand-tor.css";
4. layout.tsx: export metadata from layout-metadata.ts
5. git push → Vercel

Flow: Generate → Preview → Keep (album) or Discard

Outfit try-on (this build)
--------------------------
- Create: "Add me in this outfit" — upload garment image, pick wearer
- Scenes: "Add me in this outfit" + "Who wore it best"
- Generate: outfit as Zen asset #1 + OUTFIT LOCK; face refs for identity
