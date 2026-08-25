tor-combined — engines + speed + UI
===================================

One package with everything from the last two updates.

CONTENTS
--------
src/lib/scene-cores.ts          After Dark templates + buildScenePrompt()
src/lib/engines.ts              seedream-uncensored | flux-klein-nsfw | sdxl

src/app/api/generate/route.ts   Dual provider (Wiro Seedream + ZenCreator)
src/app/api/warm/route.ts       Edge warm endpoint (kills cold starts)

src/components/CreateUploads.tsx    Rose pills + progress bar
src/components/CreatePageClient.tsx Wires uploads + engine picker + generate

src/app/fonts.ts                next/font + display:swap
src/app/layout-snippet.tsx      How to apply fonts in root layout
src/app/(studio)/create/loading.tsx     Instant skeleton
src/app/(studio)/create/page-snippet.tsx dynamic() import pattern

src/middleware-snippet.ts       Auth gate for /create
vercel-cron-snippet.json        Cron every 5 min → /api/warm

SETUP ORDER
-----------
1. Copy src/lib/* and the two API routes.
2. Set env:
     WIRO_API_KEY=...
     ZENCREATOR_API_KEY=...
3. Merge fonts + layout snippet; remove old manual font links.
4. Add create/loading.tsx.
5. Point create/page.tsx at the dynamic CreatePageClient pattern
   (or merge CreateUploads into your existing page).
6. Optional: middleware + vercel cron for warm.
7. Adjust ZenCreator model/tool names in generate/route.ts to match your docs.

ENGINES
-------
seedream-uncensored  → Wiro   (~$0.03)   default — best cost/quality
flux-klein-nsfw      → ZenCreator        best anatomy
sdxl                 → ZenCreator        cheap drafts

SPEED
-----
- Fonts: text visible immediately
- Create JS isolated from homepage
- loading.tsx skeleton
- /api/warm + cron ≈ removes ~1s cold TTFB

After deploy, hard-reload and check TTFB on /.
