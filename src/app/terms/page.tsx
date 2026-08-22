import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-16">
      <Link href="/" className="text-sm underline underline-offset-2 mb-8 inline-block">
        ← Back
      </Link>
      <h1
        className="text-3xl mb-4"
        style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
      >
        Terms
      </h1>
      <div className="space-y-4 text-sm leading-relaxed" style={{ color: "var(--cream-muted, #c9bdb0)" }}>
        <p>The Other Room is a private adult (18+) studio for personal use by consenting adults.</p>
        <p>You must only upload photos of adults who have consented. Content is for private use — not for public distribution or training third-party models via this product.</p>
        <p>We may suspend accounts that violate these rules or applicable law.</p>
        <p>Full legal terms will replace this summary before paid launch.</p>
      </div>
    </main>
  );
}
