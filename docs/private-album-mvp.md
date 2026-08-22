# Private album — MVP implement (keep / discard)

Product: The Other Room  
Goal: Preview is temporary. Only **Keep** enters the album. Nothing public.

## State machine

```text
generate → Still.status = preview
preview  → keep  → status = kept, album_id set
preview  → discard → status = discarded, wipe media
```

Album list queries **never** return `preview` or `discarded`.

## Domain (minimal)

```text
Studio { id, members[] }
Album  { id, studio_id, kind: soft|playful|after_dark|custom, hidden_for[] }
Scene  { id, studio_id, intensity, status }
Still  { id, scene_id, album_id?, status: preview|kept|discarded,
         visibility: both|hidden_from_partner, created_by, expires_at? }
```

## API

```text
POST   /api/scenes                 // generate → preview still
GET    /api/scenes/:id/preview
POST   /api/stills/:id/keep        // body: { album_id?, visibility? }
POST   /api/stills/:id/discard
GET    /api/albums                 // visible to member only
POST   /api/albums
GET    /api/albums/:id/stills       // status=kept only
PATCH  /api/stills/:id             // favorite, move, hide
DELETE /api/stills/:id
```

## Keep rules

1. If `album_id` omitted → default Soft album for studio.  
2. Create Soft album on first keep if missing.  
3. Set `status=kept`, clear `expires_at`.  
4. Optional `visibility: hidden_from_partner`.

## Discard rules

1. Set `status=discarded`.  
2. Delete object storage (or enqueue wipe job).  
3. Remove from UI immediately.  
4. Preview TTL optional (e.g. 24h) as backup.

## Soft first

- Empty album CTA: soft hero scene (`prompts/soft-hero-template.json`).  
- After dark album only after age + consent gate.  
- Hide 3+ person templates until anatomy is stable.

## Privacy

- No public gallery routes.  
- Copy: photos stay in your studio; we don’t train on your photos; delete wipes storage.

## Acceptance

- [ ] Preview never in album list  
- [ ] Keep requires album (Soft default)  
- [ ] Discard wipes media  
- [ ] Partner cannot see hidden_from_partner  
- [ ] After dark gated  
- [ ] No explore / public feed  
