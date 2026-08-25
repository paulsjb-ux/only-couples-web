/**
 * MERGE into src/app/(studio)/create/page.tsx
 * dynamic() keeps create JS out of the homepage bundle.
 */

import dynamic from "next/dynamic";

const CreatePageClient = dynamic(
  () => import("@/components/CreatePageClient"),
  {
    loading: () => (
      <div className="p-6 text-sm text-rose-400 animate-pulse">
        Loading studio…
      </div>
    ),
  }
);

export default function CreatePage() {
  return <CreatePageClient />;
}
