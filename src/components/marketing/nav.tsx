import Link from "next/link";
import Image from "next/image";

export function MarketingNav() {
  return (
    <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
      <Link href="/" className="flex items-center">
        <Image
          src="/brand/logos/01-wordmark-cream-on-black.jpg"
          alt="The Other Room"
          width={180}
          height={40}
          className="h-7 w-auto sm:h-8"
          priority
        />
      </Link>
      <nav className="flex items-center gap-6 text-[13px] text-[#f5f0e8]/75">
        <Link href="/how-it-works" className="hidden sm:inline hover:text-[#f5f0e8]">
          How it works
        </Link>
        <Link href="/pricing" className="hidden sm:inline hover:text-[#f5f0e8]">
          Pricing
        </Link>
        <Link href="/login" className="hover:text-[#f5f0e8]">
          Sign in
        </Link>
      </nav>
    </header>
  );
}
