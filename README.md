# The Other Room — drop into Next.js repo root

Merge with your existing `docs/` and create `prompts/`.

```text
prompts/
  global-negatives.txt      # shower block + anatomy block
  locations.json            # soft default = bedroom_morning
  soft-hero-template.json   # first scene
  anatomy-two-person.txt    # human-readable anatomy lines
  anatomy-rules.json        # machine suffixes + hide 3-person

docs/
  prompt-builder-rules.md   # how to assemble prompts
  private-album-mvp.md      # keep / discard API + states
  private-album-spec.md     # full product spec (optional copy)
```

## Three fixes

1. **Background** — required location; default morning bed; shower only if selected.  
2. **Anatomy** — exactly two people; strong anti-extra-limb negatives; no 3-person UI yet.  
3. **Album** — preview → keep/discard; Soft default album; no public gallery.

Wire `src` prompt builder to read `prompts/*` and implement album routes per `docs/private-album-mvp.md`.
