import Link from "next/link";
import Image from "next/image";
import { MarketingFooter, MarketingNav } from "@/components/marketing/nav";

export default function HomePage() {
  return (
    <div>
      <MarketingNav />

      <section className="mx-auto max-w-4xl px-6 pt-16 pb-20 sm:pt-24 sm:pb-28 text-center">
        <Image
          src="/brand/logos/wordmark-hero.jpg"
          alt="Only Couples"
          width={560}
          height={155}
          className="mx-auto h-auto w-[min(100%,28rem)] object-contain"
          priority
        />
        <p className="mt-10 text-xl sm:text-2xl tracking-tight max-w-lg mx-auto">
          A private studio for the two of you.
        </p>
        <p className="mt-5 text-[var(--muted)] max-w-md mx-auto leading-relaxed text-[15px]">
          Your faces. Your terms. Nothing leaves your studio.
        </p>
        <div className="mt-10">
          <Link href="/signup" className="btn btn-primary">
            Start a scene
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-24 grid gap-16 sm:grid-cols-3 text-center sm:text-left">
        <div>
          <h2
            className="text-lg mb-3"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            Not a feed
          </h2>
          <p className="text-sm text-[var(--muted)] leading-relaxed">
            An erotic escape for personal use. Locked to your faces. Saved in a private album only you can open.
          </p>
        </div>
        <div>
          <h2
            className="text-lg mb-3"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            You choose how far
          </h2>
          <p className="text-sm text-[var(--muted)] leading-relaxed">
            Playful. After dark. Explicit. Same couple. Same lock. She doesn’t have to see the explicit set until you both want it.
          </p>
        </div>
        <div>
          <h2
            className="text-lg mb-3"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            The ritual
          </h2>
          <p className="text-sm text-[var(--muted)] leading-relaxed">
            Add both faces once. Pick a scene. Preview. Keep it — or delete it. Nothing is saved until you say so.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-6 pb-24 text-center">
        <h2
          className="text-2xl mb-4"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          Why us, not a generator
        </h2>
        <p className="text-[var(--muted)] leading-relaxed">
          Two real people, locked — not a random model. Scenes that feel like a relationship. A library that behaves like a private album. We do not train on your photos.
        </p>
        <p className="mt-8 text-xs tracking-wide text-[var(--muted)] uppercase">
          No public gallery · Adults only · Delete everything
        </p>
      </section>

      <section className="mx-auto max-w-2xl px-6 pb-24 text-center">
        <h2
          className="text-2xl mb-4"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          Start with one soft scene
        </h2>
        <p className="text-[var(--muted)] leading-relaxed mb-8">
          If the faces don’t hold, you shouldn’t pay. That’s why the first scene is free.
        </p>
        <Link href="/signup" className="btn btn-primary">
          Open the studio
        </Link>
      </section>

      <MarketingFooter />
    </div>
  );
}
