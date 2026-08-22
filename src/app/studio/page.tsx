import { redirect } from "next/navigation";

/** Old /studio links → /home (middleware sends guests to /login). */
export default function StudioEntryPage() {
  redirect("/home");
}
