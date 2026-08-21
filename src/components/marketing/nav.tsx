import Link from "next/link";
import Image from "next/image";

export function MarketingNav() {
  return (
    <header className="mx-auto flex max-w-4xl items-center justify-between px-6 py-8">
      <Link href="/" className="shrink-0">
        <Image
          src="/brand/logos/wordmark-hero.jpg"
          alt="Only Couples"
          width={200}
          height={55}
          className="h-8 w-auto object-contain object-left"
          priority
        />
      </Link>
      <nav className="flex items-center gap-7 text-[13px] tracking-wide text-[var(--muted)]">
        <Link href="/how-it-works" className="hidden sm:inline">
          How it works
        </Link>
        <Link href="/privacy" className="hidden sm:inline">
          Privacy
        </Link>
        <Link href="/pricing" className="hidden sm:inline">
          Pricing
        </Link>
        <Link href="/login">Sign in</Link>
      </nav>
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="mx-auto max-w-4xl border-t border-[var(--line)] px-6 py-12 text-[13px] text-[var(--muted)]">
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
