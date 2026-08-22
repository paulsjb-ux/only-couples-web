# Only Couples — code fixes (upload these files)

Copy each file into your project at the **exact path** shown below.
Then delete the duplicate middleware under `src/`.

## Files in this package

| Path in this ZIP | Destination in your repo |
|------------------|--------------------------|
| `.env.local.example` | project root |
| `middleware.ts` | project root (overwrite) |
| `DELETE-src-middleware.ts.txt` | (instruction only — delete `src/middleware.ts`) |
| `src/app/signup/page.tsx` | overwrite |
| `src/app/(studio)/join/page.tsx` | overwrite (was empty) |
| `src/app/api/studio/route.ts` | **new** — create folder if needed |
| `src/app/api/generate/route.ts` | overwrite |
| `src/app/api/library/route.ts` | overwrite |

## What each fix does

1. **`.env.local.example`** — template for required env vars.
2. **`middleware.ts`** — allows public marketing pages (`/about`, `/pricing`, etc.) and ignores static image assets.
3. **Delete `src/middleware.ts`** — Next.js should only have one middleware file at the project root.
4. **`signup/page.tsx`** — after auth signup, calls `/api/studio` to create `studios` + `studio_members`.
5. **`api/studio/route.ts`** — creates studio for the current user if missing; also supports GET.
6. **`join/page.tsx`** — partner invite: generate code / enter code (needs `studio_invites` table — see below).
7. **`api/generate/route.ts`** — reads `versions` and `outfitPath`, loops generations, returns `{ items: [...] }` (compatible with Create page).
8. **`api/library/route.ts`** — keeps optional `storage_path` / `status` when present; falls back to minimal columns.

## Supabase tables you need

Minimum for the app to work:

```sql
-- studios
create table if not exists studios (
  id uuid primary key default gen_random_uuid(),
  name text,
  created_by uuid references auth.users(id),
  owner_id uuid references auth.users(id), -- optional alias
  created_at timestamptz default now()
);

-- studio_members
create table if not exists studio_members (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid references studios(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text default 'owner', -- owner | partner
  unique (studio_id, user_id)
);

-- people (already used by UI)
-- photo_path, photo_body, photo_angle, age, body_shape, breasts, penis, role, studio_id

-- generations
create table if not exists generations (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid references studios(id) on delete cascade,
  kind text default 'image',
  prompt text,
  result_url text,
  storage_path text,
  status text default 'kept',
  created_at timestamptz default now()
);

-- optional: partner invites
create table if not exists studio_invites (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid references studios(id) on delete cascade,
  code text unique not null,
  created_by uuid references auth.users(id),
  used_at timestamptz,
  used_by uuid references auth.users(id),
  created_at timestamptz default now()
);
```

Also ensure Storage buckets **`people`** and **`library`** exist with RLS so authenticated users can read/write only paths under their `studio_id`.

## After uploading

```bash
# 1. Copy files into the project
# 2. Remove duplicate middleware
rm src/middleware.ts

# 3. Env
cp .env.local.example .env.local
# fill in keys

# 4. Restart dev server
npm run dev
```

If signup still shows “No studio”, open the browser console after signup and check `/api/studio` response — usually an RLS or missing-column issue on `studios` / `studio_members`.
