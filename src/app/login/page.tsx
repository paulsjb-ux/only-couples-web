"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adult, setAdult] = useState(false);
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!adult || !consent) {
      setError("Please confirm you are 18+ and only use consented photos.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/home");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div
              className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-white text-lg font-extrabold"
              style={{
                background: "linear-gradient(135deg, #8B4A54, #7A3E48, #5C2E36)",
              }}
            >
              OC
            </div>
          </Link>
          <h1
            className="text-2xl font-medium"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            Enter your studio
          </h1>
        </div>

        <div className="hero mb-6">
          <p className="text-white/90 text-sm leading-relaxed">
            Private 18+ space. Soft by default. Intense only when you choose.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-[var(--text)]">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5 text-[var(--text)]">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-3 pt-1">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={adult}
                onChange={(e) => setAdult(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-[var(--line)] accent-[var(--accent)]"
              />
              <span className="text-sm text-[var(--text)]">I am 18 or older</span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-[var(--line)] accent-[var(--accent)]"
              />
              <span className="text-sm text-[var(--text)] leading-snug">
                I only use photos of adults who consented, for private personal use
              </span>
            </label>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full disabled:opacity-60"
          >
            {loading ? "Entering…" : "Enter studio"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--muted)]">
          No studio yet?{" "}
          <Link href="/signup" className="font-semibold text-[var(--accent)] hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
