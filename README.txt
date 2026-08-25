tor-uploads — upload UI + progress timing
=========================================

This zip is only the upload / Make / progress pieces.

File
----
src/components/CreateUploads.tsx

Progress timing
---------------
  8%   → start
  →92% → while generating (every 400ms)
  100% → on complete
  Label: “Making… N%”

UI
--
  • Rose outline pills: “Choose face photo” / “Upload outfit photo”
  • Native file inputs: className="sr-only" (hidden)
  • Rounded role select
  • Make button → “Making…” while running
  • Progress bar only while isGenerating

See:
  src/app/(studio)/create/HOW_TO_USE.txt

Until you replace the old markup and redeploy, the live site
will keep showing the grey browser “Choose File” controls.
