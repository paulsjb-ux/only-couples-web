import Link from "next/link";

const FAVOURITES = [
  {
    id: "romance-undress",
    name: "Taking her clothes off",
    desc: "Same pose, location — clothes gone",
    emoji: "✨",
    cast: "wife",
  },
  {
    id: "romance-kiss",
    name: "Intimate Bed Scene",
    desc: "Beautiful couple in an intimate bedroom",
    emoji: "💋",
    cast: "wife,husband",
  },
  {
    id: "romance-shower",
    name: "After Shower Couple",
    desc: "Naked couple, bathroom mirror selfie",
    emoji: "🚿",
    cast: "wife,husband",
  },
  {
    id: "romance-morning",
    name: "Bedroom Smile",
    desc: "Soft bedroom, close and smiling",
    emoji: "🌅",
    cast: "wife,husband",
  },
  {
    id: "romance-massage",
    name: "Her body, soft light",
    desc: "Same woman — body nude from reference",
    emoji: "🕯",
    cast: "wife",
  },
  {
    id: "zen-undress-v3",
    name: "Undress Woman",
    desc: "Same seated fashion pose, clothes gone",
    emoji: "🖤",
    cast: "wife",
  },
];

export default function HomePage() {
  return (
    <div>
      <div className="hero mb-8">
        <h1
          className="text-2xl md:text-3xl font-medium mb-2"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          The Other Room
        </h1>
        <p className="text-white/90 text-sm md:text-base max-w-lg">
          A private erotic studio for two — soft by default, intense when you choose.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
        <Link href="/scenes" className="btn btn-primary text-center">
          Browse scenes
        </Link>
        <Link href="/people" className="btn btn-secondary text-center">
          Your people
        </Link>
        <Link href="/library" className="btn btn-secondary text-center">
          Library
        </Link>
      </div>

      <div className="section-kicker">Soft favourites</div>
      <p className="text-sm text-[var(--muted)] mb-5 max-w-xl">
        Start with quiet intimacy. Eye contact, warmth, unhurried desire.
        Intense scenes stay behind a toggle on the Scenes page.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FAVOURITES.map((tpl) => (
          <Link
            key={tpl.id}
            href={`/create?scene=${tpl.id}&cast=${tpl.cast}&name=${encodeURIComponent(tpl.name)}`}
            className="card p-4 hover:border-[#E8D0D2] transition-all hover:shadow-md group"
          >
            <div
              className="text-lg font-medium mb-1 group-hover:text-[var(--accent)] transition-colors"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
            >
              {tpl.emoji} {tpl.name}
            </div>
            <p className="text-xs text-[var(--muted)] leading-snug">{tpl.desc}</p>
          </Link>
        ))}
      </div>

      <p className="mt-10 text-center text-xs text-[var(--muted)]">
        The Other Room · private studio · 18+
      </p>
    </div>
  );
}
