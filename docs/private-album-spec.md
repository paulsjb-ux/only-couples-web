# Private Album — Product & Engineering Spec

**Product:** Only Couples / The Other Room (private AI studio for couples)  
**Document type:** Single source of truth — product rules + coding instructions  
**Status:** MVP-ready  

---

## 1. Purpose

The private album is not a side feature. It is the product after generation.

Users generate scenes with their own faces. Outputs start as **previews**. Only an explicit **Keep** places media into a private, couple-owned library. Nothing is public. Nothing is used to train models.

**One-line definition:**  
A shared, locked library of scenes that look like you — soft by default, explicit by choice, never a public feed.

---

## 2. Non-negotiables

1. No public gallery, no global feed, no SEO of media.  
2. Preview outputs are **not** library items until Keep.  
3. Delete means remove from product storage (within stated wipe SLA).  
4. Do not use user reference photos or album media for model training.  
5. Soft intensity is the default path; After dark is gated.  
6. Couple studio is first-class; solo is allowed but not the default UX.  
7. UI and copy stay classy (members-club), not neon porn-grid.

---

## 3. Core principles

1. **Private by default** — nothing is public, shareable, or trainable unless the couple explicitly acts.  
2. **Both own it** — either partner can save, hide, or delete (policy for dual-approve is optional later).  
3. **Soft first** — album UX never leads with the most explicit still.  
4. **Reversible** — preview before commit; delete is real (wipe).  
5. **Feels like an album** — covers, dates, moods — not a grid of random gens.

---

## 4. Domain model

```text
User
Studio                 // one shared workspace per couple (or solo owner)
  members[]            // user ids + role (owner | partner)
Album
  studio_id
  name
  kind                 // soft | playful | after_dark | custom
  cover_still_id?      // optional
  created_by
  hidden_for[]         // user ids who must not see this album
Scene
  studio_id
  intensity            // soft | playful | after_dark
  prompt_meta          // structured fields preferred
  face_refs[]          // reference ids only
  status               // pending | succeeded | failed
Still / Clip           // media asset
  scene_id
  album_id?            // null while preview-only
  status               // preview | kept | discarded
  visibility           // both | hidden_from_partner
  favorite_by[]
  created_by
  expires_at?          // for previews only
```

### Model rules

- `preview` stills: TTL (e.g. 24h) or deleted on discard; **never** returned by album list queries.  
- `kept` stills: always have `album_id`.  
- `discarded`: hard-delete media + DB row (or soft-delete + async wipe job).  
- Hierarchy: **Studio → Album → Scene → Still/Clip → Versions** (versions optional post-MVP).

---

## 5. Object summary (product view)

| Object | Meaning |
|--------|---------|
| **Studio** | The couple’s shared workspace (one per pair) |
| **Album** | Collection inside the studio (Soft, After dark, custom names) |
| **Scene** | A generation job (prompt + faces + intensity + status) |
| **Still / Clip** | Output media (image or short video) |
| **Version** | Variants of the same scene (regen, intensity shift) — later |

---

## 6. Core flows

### 6.1 Generate → Preview → Keep / Discard

```text
Generate → Preview (not saved) → Keep / Discard
                ↓ Keep
         Choose album (or create)
                ↓
         Optional: title, mood tag, hide from partner
                ↓
         In album, private
```

**Rules**

- Preview is temporary (TTL or until discard).  
- Keep is the only path into the album.  
- Discard = hard delete of that output (and intermediates where possible).  
- Never auto-save every generation into the library.

**Acceptance**

- Album queries never return `preview` or `discarded`.  
- Discarded bytes are not readable via signed URL after wipe job runs.

### 6.2 Albums

**Default albums (on first Keep or studio bootstrap)**

- **Soft** — smiling, clothed / gentle intimate (hero set)  
- **Playful** — lingerie, teasing (optional in MVP)  
- **After dark** — explicit (only after age + consent gate)

**Custom albums**

- Free naming (“Paris weekend”, “For her birthday”)  
- Optional cover still (user-chosen; default = first soft keep)  
- Optional private description  

**Sort / filter**

- By date  
- By intensity  
- By album  
- By media type (still / video)  
- Favorites only  

### 6.3 Couple invite + shared studio

1. Owner creates studio and uploads their face references.  
2. Owner creates invite token (expiry; single-use or limited).  
3. Partner accepts → joins `members`, uploads face references.  
4. Two-person generations use both face ref sets when available.

**Permissions (MVP)**

| Action           | Owner | Partner |
|------------------|-------|---------|
| Generate         | ✓     | ✓       |
| Keep             | ✓     | ✓       |
| Delete still     | ✓     | ✓       |
| Create album     | ✓     | ✓       |
| Invite           | ✓     | optional |
| Destroy studio   | ✓     | document: owner-only **or** both |

Solo mode is allowed (e.g. consistent single face) but product defaults and copy stay couple-first.

### 6.4 Hide from partner

- Per-still: `visibility = hidden_from_partner`  
- Per-album: `hidden_for[]`  
- Hidden items excluded from the other member’s API responses.  
- Creator still sees them (e.g. surprise gift set).

### 6.5 Intensity gates

| Level       | Access                                              | Album behavior                          |
|-------------|-----------------------------------------------------|-----------------------------------------|
| Soft        | Always                                              | Default album; hero empty state         |
| Playful     | After opt-in or first soft keep                     | Separate album                          |
| After dark  | Age gate + explicit consent on user/studio           | Separate; prefer soft success first     |

- Do not return After dark albums or stills until gate is true.  
- Hide 3+ person / extreme categories until 2-person anatomy is reliable.  
- Album never surfaces locked tiers in the main grid.

### 6.6 Delete and wipe

| Action            | Effect                                              |
|-------------------|----------------------------------------------------|
| Discard preview   | Output gone                                        |
| Delete still      | Removed from album + storage                       |
| Delete album      | All stills inside removed                          |
| Leave studio      | Partner loses access; clarify copy policy          |
| Delete account    | Studio + refs + stills wiped on stated schedule    |
| Destroy studio    | Immediate wipe request; notify partner if shared   |

UI copy (plain language):  
*“Delete removes this from your album and our storage. We don’t keep a copy for training.”*

Store `wipe_requested_at` / `wiped_at`. Do not leave orphaned object storage.

---

## 7. Library UI requirements

**Studio home**

- Cover row of albums (editorial, not dense NSFW grid)  
- Recent keeps (last 8–12), soft-first when mixed  
- Empty state: *“Your private album is empty. Start with a soft scene.”*

**Inside an album**

- Chronological or manual order  
- Tap still → full view + actions  
- Select mode for batch delete or move  

**Full-view actions**

- Favorite  
- Move to another album  
- Hide from partner  
- Download (optional; watermark-free for paid)  
- Delete (confirm)  
- “Make another version”  
- “Softer / more intense” (guided intensity shift)

**Do not build**

- Public share-to-feed  
- Social share sheet as default  
- Explore / discovery grid of other users’ media  

---

## 8. Privacy controls (product, not only legal)

**Always on**

- No public gallery  
- No search indexing of media  
- “We don’t train on your photos” at upload and in settings  
- Delete account → wipe storage (state the timeline, e.g. within 30 days, sooner if possible)

**Per-item**

- Hide from partner  
- Optional device PIN / biometrics for After dark (post-MVP)  
- Session auto-lock (post-MVP)

**Downloads**

- Optional; default off on free  
- Paid: download without watermark  
- Warning: once downloaded, it is outside our control  

**Sharing (strict)**

- No social share buttons in MVP  
- Optional later: time-limited private view link (default **off**)  
- Default = no external links until user enables “Allow private links”

---

## 9. Notifications (minimal)

- Partner kept a new still (if not hidden)  
- Partner invited you  
- Private link expiring (if feature exists)  

Do **not** use companion-style nagging (“your studio misses you”).

---

## 10. API surface (minimal)

```text
POST   /scenes                       // generate
GET    /scenes/:id/preview           // authz: member only
POST   /stills/:id/keep              // body: { album_id, visibility? }
POST   /stills/:id/discard
GET    /albums                       // member’s visible albums
POST   /albums
GET    /albums/:id/stills
PATCH  /stills/:id                   // favorite, move, visibility
DELETE /stills/:id
POST   /studio/invites
POST   /studio/invites/accept
POST   /studio/destroy
DELETE /account                      // schedule full wipe
```

**AuthZ:** every route requires studio membership; apply hide filters in the **query layer**, not only in the UI.

---

## 11. Storage and security

- Face refs and kept media in private bucket; short-lived signed URLs only.  
- Preview objects in a separate prefix with lifecycle expiry.  
- Encrypt at rest; log signed URL issue/revoke where useful.  
- Rate-limit generate and keep.  
- Product policy layer: block celebrity / non-consensual “any face” undress paths.  
- Training pipelines must exclude user refs and album media.

---

## 12. Privacy copy (surface in product)

Show at upload, keep, and settings — short, plain:

- Photos stay in your studio.  
- We don’t train on your photos.  
- Delete removes media from our storage.

No legalese in primary UI.

---

## 13. UI states that must be handled

1. Empty studio — CTA: start soft scene.  
2. Preview — Keep / Discard only; no share.  
3. Album grid — editorial covers.  
4. Still detail — favorite, move, hide, delete, another version.  
5. Gate modal — After dark consent.  
6. Delete confirm — plain wipe language.  
7. Partner invite pending / accepted.

---

## 14. MVP vs later

### MVP (ship first)

- [ ] Preview → keep / discard  
- [ ] Soft + After dark albums (or Soft + one “Private”)  
- [ ] Shared studio + invite  
- [ ] Delete still / album  
- [ ] Hide from partner  
- [ ] No public gallery  
- [ ] Account / studio wipe  
- [ ] Intensity gate for After dark  

### Next

- User-named albums + covers  
- Gift / hidden unlock albums  
- Private time-limited links (default off)  
- Dual-approve for After dark keep/delete  
- Device PIN for After dark  
- Video clips in the same album model  
- Batch organize  

### Later

- Encrypted export  
- Partner roles (viewer vs editor)  
- Optional print / physical partner (careful)

### Out of scope for MVP

- Public links  
- Dual-approval on every After dark action  
- Print fulfillment  
- AI “memory” outside the studio  
- 3+ person scenes until 2-person quality is solid  

---

## 15. Acceptance checklist

- [ ] Preview never appears in album list  
- [ ] Keep requires album; Soft is default  
- [ ] Discard wipes media  
- [ ] Partner cannot see `hidden_from_partner` items  
- [ ] After dark blocked without consent gate  
- [ ] No public gallery routes exist  
- [ ] Account/studio delete schedules full wipe  
- [ ] Training pipeline excludes user refs and album media  
- [ ] Empty states and delete copy use plain privacy language  
- [ ] Album list filters by membership + visibility in the API  

---

## 16. Success metrics

- % of generations that get **kept** (not discarded)  
- % of studios with **both** partners active in the album  
- Soft → After dark conversion without bounce  
- Delete/wipe requests completed within SLA  
- Support tickets about “is this public?” → trend toward zero  

---

## 17. Implementation notes for engineers / coding agents

1. Prefer **explicit state transitions** (`preview → kept | discarded`) over “save everything then soft-delete.”  
2. Album list endpoints must filter by membership + visibility in the **query layer**.  
3. Do not implement explore feeds, public profiles, or social share as defaults.  
4. Soft scene reliability and 2-person anatomy quality block After dark and multi-person features.  
5. When in doubt, choose the more private behavior.

---

## 18. Related product positioning (context)

- **Not** an AI girlfriend app (Candy.ai-style character chat).  
- **Not** a public NSFW prompt gallery (Promptchan-style).  
- **Not** a non-consensual undress tool.  
- **Is** a private couple studio: identity lock for two real faces, soft-first, private album, wipe on delete.

Competitor contrast (for product, not necessarily in UI):

- vs Candy: they sell a character; we sell the two of you.  
- vs SoulGen: they lock one face; we lock both.  
- vs Promptchan: they publish a gallery; we keep a private album.  
- vs Pose AI: they make the anniversary photo; we make the after-dark one — still private.

---

*End of spec. Use this document as the single reference when implementing private album behavior.*
