import Link from "next/link";

export function MarketingNav() {
  return (
    <header className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-5">
      <Link
        href="/"
        className="text-lg tracking-tight"
        style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
      >
        Only Couples
      </Link>
      <nav className="hidden items-center gap-5 text-sm text-[var(--muted)] sm:flex">
        <Link href="/studio/home">Studio</Link>
        <Link href="/how-it-works">How it works</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/pricing">Pricing</Link>
        <Link href="/login">Sign in</Link>
      </nav>
      <Link href="/signup" className="btn btn-primary text-sm px-4 py-2">
        Start a scene
      </Link>
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="mx-auto mt-20 max-w-5xl border-t border-[var(--line)] px-5 py-10 text-sm text-[var(--muted)]">
      <p className="mb-4 max-w-xl">
        Only Couples is a private erotic studio for consenting adults. Personal use. Your faces stay in your studio.
      </p>
      <nav className="flex flex-wrap gap-x-5 gap-y-2">
        <Link href="/how-it-works">How it works</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/pricing">Pricing</Link>
        <Link href="/about">About</Link>
        <Link href="/contact">Contact</Link>
        <span>18+</span>
      </nav>
    </footer>
  );
}
