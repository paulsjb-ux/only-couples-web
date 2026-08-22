import type { Studio } from "@/types/album";

/**
 * Replace with your real session + DB lookup.
 * Must return the studio the user belongs to, or null.
 */
export async function requireStudioMember(
  _request: Request,
  studioId?: string
): Promise<{ userId: string; studio: Studio } | null> {
  // TODO: read session (e.g. next-auth / clerk / cookies)
  const userId = "demo-user";
  const studio: Studio = {
    id: studioId ?? "demo-studio",
    members: [
      { userId: "demo-user", role: "owner" },
      { userId: "demo-partner", role: "partner" },
    ],
  };

  const isMember = studio.members.some((m) => m.userId === userId);
  if (!isMember) return null;
  return { userId, studio };
}

export function isStudioMember(studio: Studio, userId: string): boolean {
  return studio.members.some((m) => m.userId === userId);
}
