# The Other Room — Version Control

## Release numbering

The app uses Semantic Versioning:

- `MAJOR` — architecture or compatibility-changing release, e.g. `2.0.0`
- `MINOR` — backwards-compatible feature release, e.g. `1.1.0`
- `PATCH` — backwards-compatible bug fix, e.g. `1.0.1`

Release tags use a leading `v`, for example `v1.0.0`.

## Branches

- `main` — production only
- `v2` — Version 2 development and audit work

Do not make experimental v2 changes directly on `main`.

## Production release process

1. Complete and test changes on the development branch.
2. Update `src/lib/version.ts`.
3. Update `package.json` and `package-lock.json`.
4. Update `CHANGELOG.md`.
5. Merge the approved release to `main`.
6. Verify the production Vercel deployment.
7. Create a GitHub release/tag matching the application version.

## v1 baseline

The current stable production baseline is `v1.0.0`.

Create the GitHub tag from the production commit that is actually live when the baseline is frozen. Do not tag an older source archive merely because it was used to prepare these version-control files.
