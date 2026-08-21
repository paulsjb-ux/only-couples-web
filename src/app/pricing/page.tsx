import Link from "next/link";
import { MarketingFooter, MarketingNav } from "@/components/marketing/nav";

export default function PricingPage() {
  return (
    <div>
      <MarketingNav />
      <article className="mx-auto max-w-5xl px-5 py-10">
        <h1
          className="text-4xl mb-3 max-w-2xl"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          Pay for privacy and likeness. Not for more templates.
        </h1>

        <div className="grid gap-5 md:grid-cols-3 mt-10">
          <div className="card p-6">
            <h2 className="text-2xl mb-2" style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}>
              Free
            </h2>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              One or two soft scenes. So you can see the faces lock. Limited saves. Optional watermark.
            </p>
          </div>
          <div className="card p-6 ring-1 ring-[var(--accent)]">
            <h2 className="text-2xl mb-2" style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}>
              Couple
            </h2>
            <p className="text-3xl mb-2">$29–49<span className="text-base text-[var(--muted)]"> / month</span></p>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              Monthly studio. Both faces. Full library. Playful and After dark.
            </p>
          </div>
          <div className="card p-6">
            <h2 className="text-2xl mb-2" style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}>
              Explicit
            </h2>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              An add-on. Unlocks the spicier set so the front of the house can stay quieter.
            </p>
          </div>
        </div>

        <ul className="mt-10 text-sm text-[var(--muted)] space-y-2 max-w-xl">
          <li>First pack of scenes: $19–29</li>
          <li>Annual: a quieter price if you’re staying</li>
          <li>Gift: a code that says for us</li>
          <li>No infinite free gens</li>
        </ul>

        <p className="mt-6 text-sm text-[var(--muted)] max-w-xl">
          Heavy video will cost more than stills. We’ll show the cost before you run it.
        </p>

        <Link href="/signup" className="btn btn-primary inline-block mt-8">
          Start with one soft scene
        </Link>
      </article>
      <MarketingFooter />
    </div>
  );
}
