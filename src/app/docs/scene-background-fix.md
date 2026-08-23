# Scene background fix — The Other Room

Stops generations defaulting to shower/bathroom.

## Files

| File | Purpose |
|------|---------|
| `global-negatives.txt` | Append to every negative prompt |
| `locations.json` | Allowed locations by intensity; soft default is bed |
| `soft-hero-template.json` | First-scene template (no shower) |
| `prompt-rules.md` | Builder rules for eng / agents |

## Rules

1. Location is **required** on every generate.
2. If user does not pick a location → use soft default from `locations.json` (`bedroom_morning`).
3. Always merge `global-negatives.txt` into the negative prompt.
4. Do not append wet/steam/tiles quality tags unless location is explicitly `shower`.

## Quick test

Positive only: `couple in bed, smiling, soft morning light, linen sheets`  
+ negatives from `global-negatives.txt`  

If output is still a shower, location is forced elsewhere (style preset or reference image).
