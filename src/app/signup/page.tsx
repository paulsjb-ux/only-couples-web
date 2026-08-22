"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [studioName, setStudioName] = useState("");
  const [adult, setAdult] = useState(false);
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!adult || !consent) {
      setError("Please confirm you are 18+ and only use consented photos.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { studio_name: studioName || "Our Studio" },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/home");
    router.refresh();
  }

  const field = {
    borderColor: "rgba(243,235,224,0.15)",
    background: "#1a1816",
    color: "#f3ebe0",
  } as const;

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center"
      style={{
        paddingTop: "max(3rem, env(safe-area-inset-top))",
        paddingBottom: "max(3rem, env(safe-area-inset-bottom))",
        paddingLeft: "max(1.25rem, env(safe-area-inset-left))",
        paddingRight: "max(1.25rem, env(safe-area-inset-right))",
      }}
    >
      <div className="w-full max-w-md" style={{ paddingTop: "1.5rem", paddingBottom: "2rem" }}>
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div
              className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-white text-lg font-extrabold"
              style={{
                background: "linear-gradient(135deg, #8B4A54, #7A3E48, #5C2E36)",
              }}
            >
              TOR
            </div>
          </Link>
          <h1
            className="text-2xl font-medium"
            style={{
              fontFamily: "var(--font-cormorant), Georgia, serif",
              color: "#f3ebe0",
            }}
          >
            Create your studio
          </h1>
          <p className="text-sm mt-2" style={{ color: "#c9bdb0" }}>
            Private by design. Soft by default.
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-5">
          <div>
            <label className="block text-sm mb-2" style={{ color: "#c9bdb0" }}>
              Studio name
            </label>
            <input
              type="text"
              value={studioName}
              onChange={(e) => setStudioName(e.target.value)}
              className="w-full rounded-xl border px-4 py-3.5 focus:outline-none"
              style={field}
              placeholder="Our studio"
            />
          </div>
          <div>
            <label className="block text-sm mb-2" style={{ color: "#c9bdb0" }}>
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border px-4 py-3.5 focus:outline-none"
              style={field}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-sm mb-2" style={{ color: "#c9bdb0" }}>
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border px-4 py-3.5 focus:outline-none"
              style={field}
              placeholder="At least 8 characters"
              autoComplete="new-password"
            />
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={adult}
                onChange={(e) => setAdult(e.target.checked)}
                className="mt-1 h-4 w-4 rounded shrink-0"
              />
              <span className="text-sm" style={{ color: "#f3ebe0" }}>
                I am 18 or older
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 h-4 w-4 rounded shrink-0"
              />
              <span className="text-sm leading-snug" style={{ color: "#f3ebe0" }}>
                I only use photos of adults who consented, for private personal use
              </span>
            </label>
          </div>

          {error && (
            <div
              className="rounded-xl border px-4 py-3 text-sm"
              style={{
                borderColor: "rgba(200,80,80,0.4)",
                background: "rgba(80,20,20,0.35)",
                color: "#f5c4c4",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full disabled:opacity-60"
            style={{ minHeight: "3rem" }}
          >
            {loading ? "Creating…" : "Create studio"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm" style={{ color: "#c9bdb0" }}>
          Already have a studio?{" "}
          <Link href="/login" className="underline underline-offset-2">
            Enter it
          </Link>
        </p>
      </div>
    </main>
  );
}
