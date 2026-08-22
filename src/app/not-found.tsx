import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-5 py-24 text-center min-h-screen flex flex-col items-center justify-center">
      <h1
        className="text-4xl mb-3"
        style={{ fontFamily: "var(--font-cormorant), Georgia, serif", color: "#f3ebe0" }}
      >
        This room doesn&apos;t exist.
      </h1>
      <p className="text-sm mb-8" style={{ color: "#c9bdb0" }}>
        That path isn&apos;t part of the studio.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 text-sm">
        <Link href="/" className="underline underline-offset-2">
          Home
        </Link>
        <Link href="/login" className="underline underline-offset-2">
          Sign in
        </Link>
        <Link href="/home" className="underline underline-offset-2">
          Studio home
        </Link>
      </div>
    </div>
  );
}
