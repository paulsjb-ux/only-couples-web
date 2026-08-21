import Link from "next/link";
import Image from "next/image";

export function MarketingNav({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const light = variant === "light";
  return (
    <header
      className={`mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-5 ${
        light ? "text-[var(--oc-ink)]" : "text-[var(--oc-cream)]"
      }`}
    >
      <Link href="/" className="flex items-center gap-2 shrink-0">
        <Image
          src={light ? "/brand/logos/wordmark-dark-trim.jpg" : "/brand/logos/wordmark-light-trim.jpg"}
          alt="Only Couples"
          width={160}
          height={40}
          className="h-8 w-auto object-contain"
          priority
        />
      </Link>
      <nav
        className={`hidden items-center gap-5 text-sm sm:flex ${
          light ? "text-[var(--oc-ink-muted)]" : "text-[var(--oc-cream-muted)]"
        }`}
      >
        <Link href="/home" className="hover:opacity-100 opacity-80 transition">
          Studio
        </Link>
        <Link href="/how-it-works" className="hover:opacity-100 opacity-80 transition">
          How it works
        </Link>
        <Link href="/privacy" className="hover:opacity-100 opacity-80 transition">
          Privacy
        </Link>
        <Link href="/pricing" className="hover:opacity-100 opacity-80 transition">
          Pricing
        </Link>
        <Link href="/login" className="hover:opacity-100 opacity-80 transition">
          Sign in
        </Link>
      </nav>
      <Link href="/signup" className="btn-oc-primary text-sm px-4 py-2 rounded-full font-semibold">
        Start a scene
      </Link>
    </header>
  );
}

export function MarketingFooter({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const light = variant === "light";
  return (
    <footer
      className={`mx-auto mt-20 max-w-5xl border-t px-5 py-10 text-sm ${
        light
          ? "border-[var(--oc-line)] text-[var(--oc-ink-muted)]"
          : "border-white/10 text-[var(--oc-cream-muted)]"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-6 mb-6">
        <div>
          <Image
            src={light ? "/brand/logos/wordmark-dark-trim.jpg" : "/brand/logos/wordmark-light-trim.jpg"}
            alt="Only Couples"
            width={140}
            height={36}
            className="h-7 w-auto object-contain mb-3 opacity-90"
          />
          <p className="max-w-md leading-relaxed">
            Only Couples is a private erotic studio for consenting adults. Personal use. Your faces
            stay in your studio.
          </p>
        </div>
        <Image
          src="/brand/icons/rings-trim.jpg"
          alt=""
          width={64}
          height={42}
          className="h-10 w-auto object-contain opacity-70 hidden sm:block"
        />
      </div>
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
