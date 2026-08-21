import Link from "next/link";
import Image from "next/image";

export function MarketingNav() {
  return (
    <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
      <Link href="/" className="flex items-center gap-3 shrink-0">
        <Image
          src="/brand/logos/mark-light-trim.jpg"
          alt="Only Couples"
          width={44}
          height={58}
          className="h-11 w-auto object-contain"
          priority
        />
        <span
          className="hidden sm:block text-lg tracking-tight"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          Only Couples
        </span>
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
      <div className="flex items-start gap-4 mb-6">
        <Image
          src="/brand/logos/mark-light-trim.jpg"
          alt=""
          width={36}
          height={48}
          className="h-9 w-auto object-contain mt-0.5"
        />
        <p className="max-w-md leading-relaxed">
          Only Couples is a private erotic studio for consenting adults. Personal use. Your faces stay in your studio.
        </p>
      </div>
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
