import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f0e8]">
      <header className="relative z-20 mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center">
          <Image
            src="/brand/logos/01-wordmark-cream-on-black.jpg"
            alt="The Other Room"
            width={200}
            height={48}
            className="h-8 w-auto sm:h-9"
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

      <section className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl flex-col items-center justify-center px-6 pb-20">
        <div className="relative w-full max-w-lg">
          <Image
            src="/brand/logos/03-wordmark-og-card-with-tagline.jpg"
            alt="The Other Room — A private studio for the two of you."
            width={900}
            height={500}
            priority
            className="h-auto w-full object-contain"
          />
        </div>

        <p className="mt-10 max-w-md text-center text-sm sm:text-base leading-relaxed text-[#f5f0e8]/75">
          A little kinky fun. The scenes you’d never ask a photographer for.
          Then you close the album.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/signup"
            className="inline-block rounded-full bg-[#f5f0e8] px-8 py-3 text-sm font-semibold text-[#0a0a0a] hover:bg-white transition"
          >
            Come in
          </Link>
          <Link
            href="/how-it-works"
            className="text-sm text-[#f5f0e8]/70 underline-offset-4 hover:text-[#f5f0e8] hover:underline"
          >
            How it works
          </Link>
        </div>

        <p className="mt-12 text-center text-xs tracking-wide text-[#c4a574]/90">
          Together, or on your own. Then invite them in.
        </p>
      </section>

      <section className="border-t border-white/10">
        <div className="mx-auto grid max-w-5xl gap-12 px-6 py-20 sm:grid-cols-3">
          <div>
            <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-[#c4a574]">The room</p>
            <p className="text-sm leading-relaxed text-[#f5f0e8]/85">
              Not a feed. Not an audience. A closed door, two faces, and whatever you want to see of each other.
            </p>
          </div>
          <div>
            <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-[#c4a574]">How far</p>
            <p className="text-sm leading-relaxed text-[#f5f0e8]/85">
              Playful. After dark. Explicit. Same lock. She doesn’t have to walk into the last room until you both want it.
            </p>
          </div>
          <div>
            <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-[#c4a574]">The night</p>
            <p className="text-sm leading-relaxed text-[#f5f0e8]/85">
              Add your faces once. Pick a scene. Look. Keep it — or discard it. Nothing is in the album until you say so.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-10 text-center text-xs text-[#f5f0e8]/50">
        <p className="mb-2">The Other Room is a private studio for consenting adults. Personal use. Your faces stay in your studio.</p>
        <p className="flex flex-wrap justify-center gap-4">
          <Link href="/privacy" className="hover:text-[#f5f0e8]">Privacy</Link>
          <Link href="/pricing" className="hover:text-[#f5f0e8]">Pricing</Link>
          <Link href="/contact" className="hover:text-[#f5f0e8]">Contact</Link>
          <span>18+</span>
        </p>
      </footer>
    </div>
  );
}
