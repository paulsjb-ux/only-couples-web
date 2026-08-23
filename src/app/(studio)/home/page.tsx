import Link from "next/link";

const FAVOURITES = [
  { id: "romance-morning", name: "Morning light", desc: "White sheets, unhurried", cast: "wife,husband" },
  { id: "romance-kiss", name: "In bed", desc: "Quiet intimacy, warm light", cast: "wife,husband" },
  { id: "romance-undress", name: "Undressed", desc: "Same pose — simply without clothes", cast: "wife" },
  { id: "romance-shower", name: "After the shower", desc: "Steam, soft light", cast: "wife,husband" },
];

export default function HomePage() {
  return (
    <div style={{ maxWidth: "28rem", margin: "0 auto", paddingBottom: 48 }}>
      {/* Door */}
      <div
        style={{
          borderRadius: 20,
          padding: "40px 28px 36px",
          marginBottom: 36,
          background: "linear-gradient(165deg, #2a181c 0%, #1a1214 55%, #3a1f24 100%)",
          color: "#f3ebe0",
          textAlign: "center",
          boxShadow: "0 16px 40px rgba(26, 18, 20, 0.35)",
        }}
      >
        <p
          style={{
            fontSize: 11,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "#c4a574",
            margin: "0 0 16px",
            fontWeight: 600,
          }}
        >
          Private studio
        </p>
        <h1
          style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "2rem",
            fontWeight: 500,
            margin: "0 0 12px",
            lineHeight: 1.15,
            color: "#f3ebe0",
          }}
        >
          The Other Room
        </h1>
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.5,
            color: "rgba(243,235,224,0.72)",
            margin: "0 0 28px",
            maxWidth: "16rem",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Together, or on your own. Soft by default.
        </p>
        <Link
          href="/scenes"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 52,
            padding: "0 32px",
            borderRadius: 999,
            background: "linear-gradient(135deg, #8B4A54, #7A3E48)",
            color: "#fff",
            fontWeight: 600,
            fontSize: 16,
            textDecoration: "none",
            boxShadow: "0 8px 24px rgba(139, 74, 84, 0.4)",
          }}
        >
          Open a soft scene
        </Link>
        <div style={{ marginTop: 18 }}>
          <Link
            href="/join"
            style={{ color: "rgba(243,235,224,0.55)", fontSize: 13, textDecoration: "underline" }}
          >
            Invite partner
          </Link>
        </div>
      </div>

      <p
        style={{
          fontSize: 11,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "#c4a574",
          fontWeight: 600,
          marginBottom: 14,
        }}
      >
        Soft favourites
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {FAVOURITES.map((tpl) => (
          <Link
            key={tpl.id}
            href={`/create?scene=${tpl.id}&cast=${tpl.cast}&name=${encodeURIComponent(tpl.name)}`}
            style={{
              display: "block",
              padding: "16px 18px",
              borderRadius: 16,
              background: "#fff",
              border: "1px solid rgba(26,22,20,0.08)",
              textDecoration: "none",
              color: "#1a1614",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-cormorant), Georgia, serif",
                fontSize: 18,
                marginBottom: 4,
              }}
            >
              {tpl.name}
            </div>
            <div style={{ fontSize: 13, color: "#5c534c", lineHeight: 1.4 }}>{tpl.desc}</div>
          </Link>
        ))}
      </div>

      <p style={{ fontSize: 12, color: "#5c534c", marginTop: 28, textAlign: "center", lineHeight: 1.5 }}>
        Nothing leaves this studio. Intense rooms stay closed until you open them.
      </p>
    </div>
  );
}
