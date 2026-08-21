import Link from "next/link";

export default function NotFound() {
  return (
    <div className="oc-page-dark mx-auto max-w-xl px-5 py-24 text-center">
      <h1 className="oc-serif text-4xl mb-3 text-[var(--oc-cream)]">This room doesn&apos;t exist.</h1>
      <hr className="oc-gold-rule mx-auto mb-6" />
      <Link href="/" className="underline text-sm text-[var(--oc-cream-muted)]">
        Back to the studio
      </Link>
    </div>
  );
}
