import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-10">
          <div
            className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl text-white text-2xl font-extrabold"
            style={{
              background: "linear-gradient(135deg, #8B4A54, #7A3E48, #5C2E36)",
              boxShadow: "0 8px 24px rgba(122,62,72,0.3)",
            }}
          >
            OC
          </div>
          <h1
            className="text-3xl md:text-4xl font-medium tracking-wide mb-2"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            Only Couples
          </h1>
          <p className="text-[var(--muted)] text-sm md:text-base leading-relaxed max-w-sm mx-auto">
            A private erotic studio for two — soft by default, intense when you choose.
          </p>
        </div>

        {/* Hero card */}
        <div className="hero mb-8">
          <h2
            className="text-xl mb-2 font-medium"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            Welcome to your studio
          </h2>
          <p className="text-white/90 text-sm leading-relaxed">
            This is not a deepfake site. It is a shared erotic escape for adults who consent.
            Never upload anyone who did not agree.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link
            href="/login"
            className="btn btn-primary w-full text-center block"
          >
            Enter studio
          </Link>
          <Link
            href="/signup"
            className="btn btn-secondary w-full text-center block"
          >
            Create a new studio
          </Link>
        </div>

        <p className="mt-8 text-center text-xs text-[var(--muted)]">
          Private 18+ studio · Classy, consensual, yours alone
        </p>
      </div>
    </main>
  );
}
