import Link from "next/link";
import Image from "next/image";
import { MarketingFooter, MarketingNav } from "@/components/marketing/nav";

export default function HomePage() {
  return (
    <div className="oc-page-dark">
      <MarketingNav />

      <section className="relative mx-auto max-w-5xl px-5 pt-4 pb-16">
        <div className="relative overflow-hidden rounded-2xl min-h-[420px] sm:min-h-[520px]">
          <Image
            src="/brand/hero/hotel-room.jpg"
            alt=""
            fill
            priority
            className="object-cover object-center"
            sizes="(max-width: 1024px) 100vw, 1024px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/25" />
          <div className="relative z-10 flex flex-col justify-end h-full min-h-[420px] sm:min-h-[520px] p-6 sm:p-10">
            <h1 className="oc-serif text-4xl sm:text-6xl font-medium leading-[1.05] text-[var(--oc-cream)] mb-2">
              Only Couples.
            </h1>
            <hr className="oc-gold-rule mb-5" />
            <p className="text-xl sm:text-2xl text-[var(--oc-cream)] max-w-xl mb-3">
              A private studio for the two of you.
            </p>
            <p className="text-[var(--oc-cream-muted)] max-w-xl mb-8 leading-relaxed text-sm sm:text-base">
              From a little kinky fun to seeing each other in the kind of scenes you&apos;d never ask a
              photographer for. Your faces. Your terms. Nothing leaves your studio.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/signup" className="btn-oc-primary rounded-full px-5 py-2.5 text-sm font-semibold">
                Start with one soft scene
              </Link>
              <Link
                href="/how-it-works"
                className="btn-oc-ghost rounded-full px-5 py-2.5 text-sm font-semibold"
              >
                How face lock works
              </Link>
            </div>
          </div>
        </div>
        <p className="mt-6 text-sm text-[var(--oc-cream-muted)]">
          Together, or on your own. Then invite them in.
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-16 grid gap-5 md:grid-cols-3">
        {[
          {
            title: "What this is",
            body: "Not a feed. Not a fan site. Not a deepfake tool.\n\nAn erotic escape for personal use — images and video of you, locked to your faces, saved in a private album only you can open.",
          },
          {
            title: "The range",
            body: "Playful. After dark. Explicit.\n\nSame couple. Same lock. Different rooms. You choose how far to go. She doesn't have to see the explicit set until you both want it.",
          },
          {
            title: "How it works",
            body: "1. Add both faces once.\n2. Pick a scene — or write one.\n3. Preview. Keep it. Or delete it.\n\nThat's the whole ritual.",
          },
        ].map((card) => (
          <div key={card.title} className="oc-card p-5">
            <h2 className="oc-serif text-xl text-[var(--oc-cream)] mb-2">{card.title}</h2>
            <p className="text-sm leading-relaxed whitespace-pre-line">{card.body}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-16">
        <h2 className="oc-serif text-2xl text-[var(--oc-cream)] mb-4">Why us, not a generator</h2>
        <ul className="text-[var(--oc-cream-muted)] space-y-2 max-w-2xl text-sm sm:text-base">
          <li>Two real people, locked — not a random model.</li>
          <li>Scenes that feel like a relationship, not a dump of tabs.</li>
          <li>A library that behaves like a private album.</li>
          <li>We do not train on your photos.</li>
        </ul>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-16">
        <div className="oc-card p-5 flex flex-wrap gap-x-8 gap-y-2 text-sm text-[var(--oc-cream-muted)]">
          <span>No public gallery.</span>
          <span>Delete account, wipe storage.</span>
          <span>Adults only.</span>
          <span>Invite-only share — if you share at all.</span>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-16">
        <div className="max-w-2xl">
          <h2 className="oc-serif text-2xl text-[var(--oc-cream)] mb-3">First scene</h2>
          <p className="text-[var(--oc-cream-muted)] leading-relaxed">
            Everyone starts the same way: a soft scene that should look like the two of you. If the
            faces don&apos;t hold, you shouldn&apos;t pay. That&apos;s why the first scene is free.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-8">
        <div className="relative overflow-hidden rounded-2xl min-h-[220px]">
          <Image
            src="/brand/social/story.jpg"
            alt=""
            fill
            className="object-cover object-center opacity-60"
            sizes="(max-width: 1024px) 100vw, 1024px"
          />
          <div className="absolute inset-0 bg-black/55" />
          <div className="relative z-10 p-8 sm:p-12">
            <h2 className="oc-serif text-3xl text-[var(--oc-cream)] mb-3">
              Start together. Or start alone and send an invite.
            </h2>
            <Link
              href="/signup"
              className="btn-oc-primary rounded-full px-5 py-2.5 text-sm font-semibold inline-block mt-2"
            >
              Open the studio
            </Link>
          </div>
        </div>
      </section>

      <p className="mx-auto max-w-5xl px-5 text-xs text-[var(--oc-cream-muted)]">
        Only Couples is for consenting adults, for personal use.
      </p>

      <MarketingFooter />
    </div>
  );
}
