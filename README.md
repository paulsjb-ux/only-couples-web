# Mobile-first — all studio screens

## Covers
| Screen | Fixed |
|--------|--------|
| Shell / nav | Yes — matchMedia shell |
| Home | Yes — stacked CTAs |
| Create | Yes — preview max ~55vh, full-width forms |
| Library | Yes — 2-col, cell max 40vh |
| People | Yes — compact face/body thumbs |
| Scenes | Yes — no full-viewport hero; smaller thumbs |
| Account / Join | Already studio-hero (from earlier delta) |

## Replace
```text
src/components/StudioShell.tsx
src/app/globals.css
src/app/(studio)/home/page.tsx
src/app/(studio)/create/page.tsx
src/app/(studio)/library/page.tsx
src/app/(studio)/people/page.tsx
src/app/(studio)/scenes/page.tsx
```

Commit → push → private tab after Vercel Ready.
