import Link from "next/link";

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex flex-col items-center ${className}`}>
      <span
        className="leading-none tracking-tight"
        style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
      >
        Only Couples
      </span>
      <span className="mt-1.5 block h-px w-14 bg-[#c4a35a]" />
    </span>
  );
}

export function MarketingNav() {
  return (
    <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-7">
      <Link href="/" className="text-[22px] text-[var(--text)]">
        <Wordmark className="items-start" />
      </Link>
      <nav className="flex items-center gap-7 text-[13px] text-[var(--muted)]">
        <Link href="/how-it-works" className="hidden sm:inline hover:text-[var(--text)]">
          How it works
        </Link>
        <Link href="/pricing" className="hidden sm:inline hover:text-[var(--text)]">
          Pricing
        </Link>
        <Link href="/login" className="hover:text-[var(--text)]">
          Sign in
        </Link>
      </nav>
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="mx-auto max-w-5xl border-t border-[var(--line)] px-6 py-12 text-[13px] text-[var(--muted)]">
      <p className="max-w-md leading-relaxed mb-6">
        Only Couples is a private erotic studio for consenting adults. Personal use. Your faces stay in your studio.
      </p>
      <nav className="flex flex-wrap gap-x-6 gap-y-2">
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
