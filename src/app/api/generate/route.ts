// Snippet: wire buildScenePrompt into the generate route
// (Integrate into your existing route.ts)

import { NextRequest, NextResponse } from "next/server";
import { buildScenePrompt } from "@/lib/scene-cores";

// ... other existing imports ...

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sceneId, faceDescription, outfitDescription, role, ...rest } = body;

    // Build the hardened After Dark prompt
    const { prompt, negative } = buildScenePrompt(
      sceneId,
      faceDescription,
      outfitDescription,
      role
    );

    // Pass to your ZenCreator / generation backend
    const generationPayload = {
      ...rest,
      prompt,
      negative_prompt: negative,
      // ... other params (model, steps, etc.)
    };

    // ... existing generation call using generationPayload ...

    return NextResponse.json({ /* success response */ });
  } catch (error) {
    // ... existing error handling ...
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
