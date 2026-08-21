import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-5 py-24 text-center">
      <h1
        className="text-4xl mb-3"
        style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
      >
        This room doesn’t exist.
      </h1>
      <Link href="/" className="underline text-sm">
        Back to the studio
      </Link>
    </div>
  );
}
