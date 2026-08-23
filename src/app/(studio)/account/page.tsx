"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AccountPage() {
  const [studioId, setStudioId] = useState<string | null>(null);
  const [studioName, setStudioName] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/studio");
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) {
          setLoadError(data.error || "Could not load studio");
          return;
        }
        setStudioId(data.studio_id || null);
        setRole(data.role || null);
        setStudioName(data.studio?.name || null);
      } catch {
        if (!cancelled) setLoadError("Network error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function copyCode() {
    if (!studioId) return;
    try {
      await navigator.clipboard.writeText(studioId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div>
      <div className="studio-hero">
        <h1>Account</h1>
        <p>Studio settings, partner invite, and preferences.</p>
      </div>

      <div className="tor-stack" style={{ maxWidth: "36rem" }}>
        {/* Invite partner */}
        <div className="card">
          <div className="section-kicker">Partner</div>
          <h2
            className="text-lg font-medium mb-2"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            Invite to this studio
          </h2>
          <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>
            Share this code. They sign up, open{" "}
            <Link href="/join" className="underline">
              Join
            </Link>
            , and enter it. Same private album.
          </p>
          {loadError && (
            <p className="text-sm text-red-700 mb-3">{loadError}</p>
          )}
          {studioId ? (
            <>
              <div className="rounded-xl border border-[var(--line)] bg-[#faf7f5] px-4 py-3 font-mono text-xs break-all mb-3">
                {studioId}
              </div>
              {studioName && (
                <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>
                  Studio: {studioName}
                  {role ? ` · ${role}` : ""}
                </p>
              )}
              <button
                type="button"
                onClick={copyCode}
                className="btn btn-studio-primary text-sm"
              >
                {copied ? "Copied" : "Copy invite code"}
              </button>
            </>
          ) : (
            !loadError && (
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                Loading studio…
              </p>
            )
          )}
        </div>

        {/* Credits */}
        <div className="card">
          <div className="section-kicker">Credits</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em" }}>20</span>
            <span style={{ fontSize: "0.875rem", color: "var(--tor-muted, #5c534c)" }}>
              remaining
            </span>
          </div>
          <p className="text-xs mb-4" style={{ color: "var(--muted)" }}>
            Images cost 1 credit · Videos cost 2 credits
          </p>
          <button type="button" className="btn btn-studio-secondary">
            Buy more credits
          </button>
        </div>

        {/* Privacy reminder */}
        <div className="card">
          <div className="section-kicker">Privacy</div>
          <ul className="text-sm space-y-2" style={{ color: "var(--muted)" }}>
            <li>Photos stay in your studio — not used to train a public model.</li>
            <li>Preview → Keep or Discard. Nothing auto-saves to the album.</li>
            <li>No public gallery by default.</li>
          </ul>
          <p className="mt-4 text-sm">
            <Link href="/join" className="underline underline-offset-2">
              Join a partner&apos;s studio
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
