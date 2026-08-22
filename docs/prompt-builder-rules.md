# Prompt builder — all three fixes

## Assembly order

```text
final_positive =
  face/subject locks
  + action/pose
  + intensity cues
  + anatomy-rules.json positive_suffix          // 2-person
  + "location: " + location.prompt              // required
  + quality tags (no wet/steam unless shower)

final_negative =
  prompts/global-negatives.txt
  + anatomy-rules.json negative_suffix
  + template negative_extra
  + user negative
```

## 1. Soft default location

- Resolve location: user pick → template location_id → `locations.json` `default_location_id` (`bedroom_morning`).  
- Never omit location.  
- Never append wet/steam/tiles unless location id is `shower`.

## 2. Two-person anatomy

- Always apply `anatomy-rules.json` suffixes for couple gens.  
- `max_people_mvp: 2`.  
- Hide FFM / group cards until stable.

## 3. Album keep/discard

- Generation creates `preview` only.  
- Keep → Soft album default.  
- Discard → wipe.  
- See `docs/private-album-mvp.md`.

## Debug

Log final positive + negative. Search for: shower, bathroom, third person, extra limbs.
