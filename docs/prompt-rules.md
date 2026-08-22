# Prompt builder rules — location / background

## Required assembly

```
final_positive =
  subject_and_faces
  + action_or_pose
  + intensity_cues
  + "location: " + location.prompt   // REQUIRED — never omit
  + quality_tags

final_negative =
  global_negatives.txt
  + template.negative_extra (if any)
  + user_negative (if any)
```

## Location resolution

1. If user selected a location → use it.  
2. Else if scene template has `location_id` → use that.  
3. Else → `locations.json` → `default_location_id` (`bedroom_morning`).  
4. Never fall through to empty location or model default.

## Forbidden unless location is shower

Do not append:

- wet skin, water droplets, steamy, steam
- tiles, tiled wall, glass door, shower head
- bathroom, bathtub

## Soft first scene

Always load `soft-hero-template.json` for onboarding / empty-album CTA.  
It must remain non-bathroom.

## Debug

Log the exact `final_positive` and `final_negative` strings.  
If output is still shower, search logs for: shower, bathroom, wet, steam, tiles.
