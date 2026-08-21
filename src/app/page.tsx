import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="bg-[#0a0a0a] text-[#f3ebe0]">
      <header className="relative z-20 mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <Link
          href="/"
          className="text-lg tracking-tight"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          Only Couples
        </Link>
        <nav className="flex items-center gap-7 text-[13px] text-[#f3ebe0]/75">
          <Link href="/how-it-works" className="hidden sm:inline hover:text-[#f3ebe0]">
            How it works
          </Link>
          <Link href="/pricing" className="hidden sm:inline hover:text-[#f3ebe0]">
            Pricing
          </Link>
          <Link href="/login" className="hover:text-[#f3ebe0]">
            Sign in
          </Link>
        </nav>
      </header>

      <section className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl flex-col items-center justify-center px-6 pb-16">
        <div className="relative w-full max-w-md aspect-[3/4]">
          <Image
            src="/brand/logos/mark-dark.jpg"
            alt="Only Couples"
            fill
            priority
            className="object-contain"
            sizes="(max-width: 768px) 90vw, 420px"
          />
        </div>
        <p
          className="mt-8 text-center text-2xl sm:text-3xl leading-snug"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          A private studio for the two of you.
        </p>
        <p className="mt-4 max-w-md text-center text-sm sm:text-base leading-relaxed text-[#f3ebe0]/75">
          A little kinky fun. The scenes you’d never ask a photographer for.
          Then you close the album.
        </p>
        <Link
          href="/signup"
          className="mt-8 inline-block rounded-full bg-[#f3ebe0] px-7 py-2.5 text-sm font-semibold text-[#1a1614]"
        >
          Come in
        </Link>
        <p className="mt-4 text-sm text-[#f3ebe0]/60">
          Together, or on your own. Then invite them in.
        </p>
      </section>

      <section className="border-t border-white/10">
        <div className="mx-auto grid max-w-5xl gap-12 px-6 py-20 sm:grid-cols-3">
          <div>
            <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-[#c4a35a]">The room</p>
            <p className="text-sm leading-relaxed text-[#f3ebe0]/85">
              Not a feed. Not an audience. A closed door, two faces, and whatever you want to see of each other.
            </p>
          </div>
          <div>
            <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-[#c4a35a]">How far</p>
            <p className="text-sm leading-relaxed text-[#f3ebe0]/85">
              Playful. After dark. Explicit. Same lock. She doesn’t have to walk into the last room until you both want it.
            </p>
          </div>
          <div>
            <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-[#c4a35a]">The night</p>
            <p className="text-sm leading-relaxed text-[#f3ebe0]/85">
              Add your faces once. Pick a scene. Look. Keep it — or delete it. Nothing is saved until you say so.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10">
        <div className="mx-auto max-w-xl px-6 py-20 text-center">
          <p
            className="mb-4 text-2xl sm:text-3xl leading-snug"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            If it doesn’t look like you, don’t pay.
          </p>
          <p className="mb-8 leading-relaxed text-[#f3ebe0]/75">
            Everyone starts the same way: one soft scene, free, so you can see the lock hold.
          </p>
          <Link
            href="/signup"
            className="inline-block rounded-full border border-[#f3ebe0]/40 px-7 py-2.5 text-sm font-semibold text-[#f3ebe0] hover:bg-[#f3ebe0] hover:text-[#1a1614]"
          >
            Start that first scene
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-5xl px-6 py-10 text-[13px] text-[#f3ebe0]/60">
          <p className="mb-5 max-w-md leading-relaxed">
            Only Couples is a private erotic studio for consenting adults. Personal use. Your faces stay in your studio.
          </p>
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/how-it-works" className="hover:text-[#f3ebe0]">How it works</Link>
            <Link href="/privacy" className="hover:text-[#f3ebe0]">Privacy</Link>
            <Link href="/pricing" className="hover:text-[#f3ebe0]">Pricing</Link>
            <Link href="/about" className="hover:text-[#f3ebe0]">About</Link>
            <Link href="/contact" className="hover:text-[#f3ebe0]">Contact</Link>
            <span>18+</span>
          </nav>
        </div>
      </footer>
    </div>
  );
}
