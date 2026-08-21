import Link from "next/link";
import Image from "next/image";
import { MarketingFooter, MarketingNav } from "@/components/marketing/nav";

export default function HomePage() {
  return (
    <div>
      <MarketingNav />

      <section className="mx-auto max-w-5xl px-6 pt-6 pb-16 sm:pt-8 sm:pb-20">
        <div className="relative overflow-hidden rounded-2xl bg-[#0a0a0a] aspect-[3/4] sm:aspect-[16/10] max-h-[78vh] mx-auto">
          <Image
            src="/brand/logos/mark-dark.jpg"
            alt="Only Couples"
            fill
            priority
            className="object-contain object-center"
            sizes="(max-width: 1024px) 100vw, 1024px"
          />
        </div>
        <div className="text-center mt-10">
          <p
            className="text-2xl sm:text-3xl leading-snug"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            A private studio for the two of you.
          </p>
          <p className="mt-4 text-[var(--muted)] max-w-md mx-auto leading-relaxed">
            A little kinky fun. The scenes you’d never ask a photographer for.
            Then you close the album.
          </p>
          <div className="mt-8">
            <Link href="/signup" className="btn btn-primary">
              Come in
            </Link>
          </div>
          <p className="mt-5 text-sm text-[var(--muted)]">
            Together, or on your own. Then invite them in.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-20 grid gap-12 sm:grid-cols-3">
        <div>
          <p className="text-[11px] tracking-[0.18em] uppercase text-[#c4a35a] mb-3">The room</p>
          <p className="leading-relaxed">
            Not a feed. Not an audience. A closed door, two faces, and whatever you want to see of each other.
          </p>
        </div>
        <div>
          <p className="text-[11px] tracking-[0.18em] uppercase text-[#c4a35a] mb-3">How far</p>
          <p className="leading-relaxed">
            Playful. After dark. Explicit. Same lock. She doesn’t have to walk into the last room until you both want it.
          </p>
        </div>
        <div>
          <p className="text-[11px] tracking-[0.18em] uppercase text-[#c4a35a] mb-3">The night</p>
          <p className="leading-relaxed">
            Add your faces once. Pick a scene. Look. Keep it — or delete it. Nothing is saved until you say so.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-xl px-6 pb-24 text-center">
        <p
          className="text-2xl sm:text-3xl leading-snug mb-5"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          If it doesn’t look like you, don’t pay.
        </p>
        <p className="text-[var(--muted)] leading-relaxed mb-8">
          Everyone starts the same way: one soft scene, free, so you can see the lock hold.
        </p>
        <Link href="/signup" className="btn btn-primary">
          Start that first scene
        </Link>
      </section>

      <MarketingFooter />
    </div>
  );
}
