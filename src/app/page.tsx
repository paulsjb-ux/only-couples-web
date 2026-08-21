import Link from "next/link";
import Image from "next/image";
import { MarketingFooter, MarketingNav } from "@/components/marketing/nav";

export default function HomePage() {
  return (
    <div>
      <MarketingNav />

      <section className="mx-auto max-w-5xl px-5 pt-10 pb-12">
        <h1
          className="text-4xl sm:text-6xl font-medium leading-[1.05] mb-5"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          Only Couples.
        </h1>
        <p className="text-xl sm:text-2xl max-w-2xl mb-4">
          A private studio for the two of you.
        </p>
        <p className="text-[var(--muted)] max-w-2xl mb-8 leading-relaxed">
          From a little kinky fun to seeing each other in the kind of scenes you’d never ask a photographer for. Your faces. Your terms. Nothing leaves your studio.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/signup" className="btn btn-primary">
            Start with one soft scene
          </Link>
          <Link
            href="/how-it-works"
            className="rounded-full px-4 py-2 text-sm font-bold bg-white border border-[var(--line)]"
          >
            How face lock works
          </Link>
        </div>
        <p className="mt-8 text-sm text-[var(--muted)]">
          Together, or on your own. Then invite them in.
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-16">
        <div className="relative overflow-hidden rounded-2xl aspect-[16/8] bg-[#1a1614]">
          <Image
            src="/brand/hero/hotel-room.jpg"
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 1024px"
            priority
          />
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-16 grid gap-6 md:grid-cols-3">
        <div className="card p-5">
          <h2 className="text-lg mb-2" style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}>
            What this is
          </h2>
          <p className="text-sm text-[var(--muted)] leading-relaxed">
            Not a feed. Not a fan site. Not a deepfake tool.
            <br />
            <br />
            An erotic escape for personal use — images and video of you, locked to your faces, saved in a private album only you can open.
          </p>
        </div>
        <div className="card p-5">
          <h2 className="text-lg mb-2" style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}>
            The range
          </h2>
          <p className="text-sm text-[var(--muted)] leading-relaxed">
            Playful. After dark. Explicit.
            <br />
            <br />
            Same couple. Same lock. Different rooms. You choose how far to go. She doesn’t have to see the explicit set until you both want it.
          </p>
        </div>
        <div className="card p-5">
          <h2 className="text-lg mb-2" style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}>
            How it works
          </h2>
          <ol className="text-sm text-[var(--muted)] leading-relaxed list-decimal pl-4 space-y-1">
            <li>Add both faces once.</li>
            <li>Pick a scene — or write one.</li>
            <li>Preview. Keep it. Or delete it.</li>
          </ol>
          <p className="text-sm text-[var(--muted)] mt-3">That’s the whole ritual.</p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-16">
        <h2 className="text-2xl mb-4" style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}>
          Why us, not a generator
        </h2>
        <ul className="text-[var(--muted)] space-y-2 max-w-2xl">
          <li>Two real people, locked — not a random model.</li>
          <li>Scenes that feel like a relationship, not a dump of tabs.</li>
          <li>A library that behaves like a private album.</li>
          <li>We do not train on your photos.</li>
        </ul>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-16">
        <div className="card p-5 flex flex-wrap gap-x-8 gap-y-2 text-sm">
          <span>No public gallery.</span>
          <span>Delete account, wipe storage.</span>
          <span>Adults only.</span>
          <span>Invite-only share — if you share at all.</span>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-16">
        <div className="max-w-2xl">
          <h2 className="text-2xl mb-3" style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}>
            First scene
          </h2>
          <p className="text-[var(--muted)] leading-relaxed">
            Everyone starts the same way: a soft scene that should look like the two of you. If the faces don’t hold, you shouldn’t pay. That’s why the first scene is free.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-8">
        <div className="hero p-8 sm:p-12">
          <h2
            className="text-3xl mb-3 text-white"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            Start together. Or start alone and send an invite.
          </h2>
          <Link href="/signup" className="btn btn-primary mt-2 inline-block">
            Open the studio
          </Link>
        </div>
      </section>

      <p className="mx-auto max-w-5xl px-5 text-xs text-[var(--muted)]">
        Only Couples is for consenting adults, for personal use.
      </p>

      <MarketingFooter />
    </div>
  );
}
