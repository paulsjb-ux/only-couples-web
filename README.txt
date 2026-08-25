tor-ui-templates-progress
=========================

FIX (2026-08-25): page.tsx now uses valid JSX handlers.
Previous version had onChange={/* comment */} which broke the Vercel build.

Changes in this package:

1. src/lib/scene-cores.ts
   - Explicit After Dark templates with harder, anatomy-locked prompts
   - Shared bedroom + negatives
   - buildScenePrompt() helper

2. src/app/(studio)/create/page.tsx
   - Self-contained, compilable reference implementation
   - Rose primary + outline pill buttons for face/outfit uploads (sr-only inputs)
   - Rounded select for roles
   - Timed progress bar: 8% → 92% while loading, 100% on complete
   - Label “Making… N%”
   - Real onChange handlers (handleFaceUpload / handleOutfitUpload)

3. src/app/api/generate/route.ts
   - Wired buildScenePrompt() into the generation path

How to integrate:
- Copy scene-cores.ts into src/lib/
- Merge the UI patterns (labels, select, progress bar, startProgress) into your real create/page.tsx
- In your generate route, import and call buildScenePrompt() as shown

Still open / external:
- Top up ZenCreator credits at app.zencreator.pro/billing if Makes fail
- Auth/studio membership already fixed earlier

Product notes addressed:
- Age selection remains text hint only
- Face photo still drives identity
- After Dark scenes now have explicit cores to reduce standing portraits / weak penetration / anatomy errors
- Grey upload buttons replaced with rose/cream matching UI
- “Making…” is now a real progress bar
