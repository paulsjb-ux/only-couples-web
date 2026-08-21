import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="relative min-h-screen text-[#f3ebe0]">
      <Image
        src="/brand/logos/mark-dark.jpg"
        alt=""
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-black/45" />

      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
          <Link href="/" className="text-lg tracking-tight" style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}>
            Only Couples
          </Link>
          <nav className="flex items-center gap-7 text-[13px] text-[#f3ebe0]/80">
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

        <main className="flex-1 mx-auto w-full max-w-3xl px-6 pt-16 pb-10 sm:pt-24 text-center">
          <p
            className="text-3xl sm:text-5xl leading-tight"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            A private studio for the two of you.
          </p>
          <p className="mt-5 text-[#f3ebe0]/85 max-w-md mx-auto leading-relaxed">
            A little kinky fun. The scenes you’d never ask a photographer for.
            Then you close the album.
          </p>
          <div className="mt-10">
            <Link
              href="/signup"
              className="inline-block rounded-full bg-[#f3ebe0] text-[#1a1614] px-6 py-2.5 text-sm font-semibold"
            >
              Come in
            </Link>
          </div>
          <p className="mt-5 text-sm text-[#f3ebe0]/75">
            Together, or on your own. Then invite them in.
          </p>
        </main>

        <section className="relative z-10 mx-auto w-full max-w-4xl px-6 pb-16 grid gap-10 sm:grid-cols-3">
          <div>
            <p className="text-[11px] tracking-[0.18em] uppercase text-[#c4a35a] mb-3">The room</p>
            <p className="text-[#f3ebe0]/90 leading-relaxed text-sm">
              Not a feed. Not an audience. A closed door, two faces, and whatever you want to see of each other.
            </p>
          </div>
          <div>
            <p className="text-[11px] tracking-[0.18em] uppercase text-[#c4a35a] mb-3">How far</p>
            <p className="text-[#f3ebe0]/90 leading-relaxed text-sm">
              Playful. After dark. Explicit. Same lock. She doesn’t have to walk into the last room until you both want it.
            </p>
          </div>
          <div>
            <p className="text-[11px] tracking-[0.18em] uppercase text-[#c4a35a] mb-3">The night</p>
            <p className="text-[#f3ebe0]/90 leading-relaxed text-sm">
              Add your faces once. Pick a scene. Look. Keep it — or delete it. Nothing is saved until you say so.
            </p>
          </div>
        </section>

        <section className="relative z-10 mx-auto w-full max-w-xl px-6 pb-20 text-center">
          <p
            className="text-2xl sm:text-3xl leading-snug mb-4"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            If it doesn’t look like you, don’t pay.
          </p>
          <p className="text-[#f3ebe0]/80 leading-relaxed mb-8">
            Everyone starts the same way: one soft scene, free, so you can see the lock hold.
          </p>
          <Link
            href="/signup"
            className="inline-block rounded-full bg-[#f3ebe0] text-[#1a1614] px-6 py-2.5 text-sm font-semibold"
          >
            Start that first scene
          </Link>
        </section>

        <footer className="relative z-10 mx-auto w-full max-w-5xl px-6 pb-10 text-[13px] text-[#f3ebe0]/70">
          <p className="max-w-md leading-relaxed mb-4">
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
        </footer>
      </div>
    </div>
  );
}
