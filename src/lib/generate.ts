/**
 * Hook this up to your existing generation endpoint.
 * Replace the fetch URL and headers with yours.
 */

import type { CreateScreenState } from "../data/outfit-integration";
import { toGenerationPayload } from "../data/outfit-integration";

export async function generateImages(state: CreateScreenState) {
  const payload = toGenerationPayload(state);

  // TODO: point this at your real API
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Generate failed (${res.status}): ${text}`);
  }

  return res.json();
}
