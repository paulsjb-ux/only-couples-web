# Changelog

All notable production changes to The Other Room are recorded here.

## [1.0.0] - 2026-08-27

### Baseline
- Established the current production application as the v1.0.0 release baseline.
- User-supplied Wife and Husband identities supported.
- Lover identities support user uploads or the preloaded lover catalogue.
- Supabase-backed scene catalogue and outfit library.
- Production image generation through ZenCreate.
- Single-submit generation guard verified: one user tap creates one `/api/generate` request.
- Single-image ZenCreate generation verified in production.
- Private studio/library workflow retained.

### Versioning
- Added a single application version constant.
- Added visible app version on the Account screen.
- Added semantic-versioning policy and release workflow.
