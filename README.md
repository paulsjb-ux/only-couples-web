# Wow UI package

## Files
```
src/app/(studio)/library/page.tsx   — album grid, clean titles, lightbox, re-signed URLs
src/app/api/library/route.ts        — Keep promotes preview→kept + stores storage_path
src/app/(studio)/create/page.tsx    — outfit required for outfit scenes; clearer versions
src/app/globals.css                 — studio system (from ui-tidy)
```

## Why Library showed "?" 
Signed URLs expire. On load we re-sign from `storage_path`. On Keep we copy
`preview/` → `kept/` and save a 30-day signed URL + path.

## Deploy
Replace files on main → push → Vercel Ready → private tab.
New Keeps will display; old rows without storage_path may still fail until re-kept.
