/**
 * Drop at: src/app/(studio)/create/loading.tsx
 * Instant skeleton while create page loads.
 */
export default function CreateLoading() {
  return (
    <div className="flex flex-col gap-6 p-6 max-w-lg mx-auto animate-pulse">
      <div className="h-10 w-48 rounded-full bg-rose-100" />
      <div className="h-10 w-40 rounded-full bg-rose-100" />
      <div className="h-10 w-56 rounded-full bg-rose-100" />
      <div className="h-11 w-32 rounded-full bg-rose-200" />
      <p className="text-sm text-rose-400 mt-2">Loading studio…</p>
    </div>
  );
}
