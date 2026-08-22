# Drop-in layout — scene background fix

Copy into your app root (merge with existing folders).

```
prompts/                         # runtime — load these in the prompt builder
  global-negatives.txt
  locations.json
  soft-hero-template.json

configs/scenes/                  # optional alternate path (same JSON)
  locations.json
  soft-hero-template.json

docs/
  scene-background-fix.md
  prompt-rules.md
  private-album-spec.md
```

Use either `prompts/` **or** `configs/scenes/` for the JSON — not both unless you keep them in sync.

Wire `buildPrompt` to:
1. Require a location (default: `bedroom_morning` from locations.json)
2. Always append `prompts/global-negatives.txt`
3. Use `soft-hero-template.json` for the first soft scene
