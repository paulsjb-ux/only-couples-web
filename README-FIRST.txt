THE OTHER ROOM — VERSION CONTROL BASELINE

Upload/replace everything in this ZIP at the same paths in the GitHub repository.

This establishes application version 1.0.0 in code and adds:
- CHANGELOG.md
- docs/VERSIONING.md
- docs/RELEASE-v1.0.0.md
- src/lib/version.ts
- Account-page version display
- package/package-lock version 1.0.0
- GitHub PR checklist

IMPORTANT:
Do not create the v1.0.0 Git tag until Vercel confirms this commit is READY in production.
After that, create:
1. GitHub tag/release: v1.0.0 from that exact production commit.
2. GitHub branch: v2 from that same v1.0.0 commit.

main remains production; v2 becomes the Version 2 development branch.
