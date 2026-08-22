import { redirect } from "next/navigation";

/**
 * /studio is not a real page — studio lives at /home, /create, etc.
 * Unauthenticated users hit middleware → /login before this runs when protected.
 * This covers direct visits and old "Come in" links.
 */
export default function StudioEntryPage() {
  redirect("/home");
}
