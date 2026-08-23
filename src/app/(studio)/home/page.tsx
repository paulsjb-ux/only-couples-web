import Link from "next/link";

const FAVOURITES = [
  {
    id: "romance-undress",
    name: "Undressed",
    desc: "The same pose and place — simply without clothes",
    emoji: "✨",
    cast: "wife",
  },
  {
    id: "romance-kiss",
    name: "In bed",
    desc: "Quiet intimacy, warm light, close",
    emoji: "💋",
    cast: "wife,husband",
  },
  {
    id: "romance-shower",
    name: "After the shower",
    desc: "Steam, soft light, a shared mirror moment",
    emoji: "🚿",
    cast: "wife,husband",
  },
  {
    id: "romance-morning",
    name: "Morning light",
    desc: "White sheets, unhurried, smiling",
    emoji: "🌅",
    cast: "wife,husband",
  },
  {
    id: "romance-massage",
    name: "Soft light",
    desc: "Her form in quiet, flattering light",
    emoji: "🕯",
    cast: "wife",
  },
  {
    id: "zen-undress-v3",
    name: "Seated, undressed",
    desc: "Fashion pose held — clothing set aside",
    emoji: "🖤",
    cast: "wife",
  },
];

const primaryBtn: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "14px 20px",
  borderRadius: 999,
  fontSize: 15,
  fontWeight: 600,
  textDecoration: "none",
  color: "#fff",
  background: "linear-gradient(135deg, #8B4A54, #7A3E48)",
  boxShadow: "0 4px 14px rgba(139, 74, 84, 0.25)",
  border: "none",
  cursor: "pointer",
  WebkitTapHighlightColor: "rgba(139,74,84,0.25)",
  position: "relative",
  zIndex: 5,
  pointerEvents: "auto",
};

const secondaryBtn: React.CSSProperties = {
  ...primaryBtn,
  color: "#1a1614",
  background: "#fff",
  boxShadow: "0 1px 3px rgba(26,22,20,0.06)",
  border: "1px solid rgba(26,22,20,0.12)",
};

export default function HomePage() {
  return (
    <div style={{ position: "relative", zIndex: 5, pointerEvents: "auto", maxWidth: "100%", overflowX: "hidden" }}>
      <div style={{ marginBottom: 32 }}>
        <h1
          style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "1.75rem",
            fontWeight: 500,
            marginBottom: 8,
            color: "#1a1614",
          }}
        >
          The Other Room
        </h1>
        <p
          style={{
            fontSize: 15,
            color: "#5c534c",
            maxWidth: 480,
            lineHeight: 1.5,
          }}
        >
          A private erotic studio for two — soft by default, intense when you
          choose.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 12,
          marginBottom: 40,
        }}
      >
        <Link href="/scenes" style={primaryBtn}>
          Browse scenes
        </Link>
        <Link href="/people" style={secondaryBtn}>
          Your people
        </Link>
        <Link href="/library" style={secondaryBtn}>
          Library
        </Link>
      </div>

      <div
        style={{
          fontSize: 11,
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: "#c4a574",
          marginBottom: 12,
          fontWeight: 600,
        }}
      >
        Soft favourites
      </div>
      <p
        style={{
          fontSize: 14,
          color: "#5c534c",
          marginBottom: 20,
          maxWidth: 520,
        }}
      >
        Start with quiet intimacy. Eye contact, warmth, unhurried desire.
        Intense scenes stay behind a toggle on the Scenes page.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
        {FAVOURITES.map((tpl) => (
          <Link
            key={tpl.id}
            href={`/create?scene=${tpl.id}&cast=${tpl.cast}&name=${encodeURIComponent(tpl.name)}`}
            style={{
              display: "block",
              padding: 16,
              borderRadius: 16,
              background: "#fff",
              border: "1px solid rgba(26,22,20,0.1)",
              textDecoration: "none",
              color: "#1a1614",
              boxShadow: "0 1px 3px rgba(26,22,20,0.04)",
              position: "relative",
              zIndex: 5,
              pointerEvents: "auto",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-cormorant), Georgia, serif",
                fontSize: 18,
                marginBottom: 4,
              }}
            >
              {tpl.emoji} {tpl.name}
            </div>
            <p style={{ fontSize: 12, color: "#5c534c", lineHeight: 1.4 }}>
              {tpl.desc}
            </p>
          </Link>
        ))}
      </div>

      <p
        style={{
          marginTop: 40,
          textAlign: "center",
          fontSize: 12,
          color: "#5c534c",
        }}
      >
        The Other Room · private studio · 18+
      </p>
    </div>
  );
}
