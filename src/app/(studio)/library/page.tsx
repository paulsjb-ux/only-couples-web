"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Gen = {
  id: string;
  result_url: string | null;
  storage_path?: string | null;
  prompt: string | null;
  kind: string | null;
  created_at?: string;
};

function prettyTitle(prompt: string | null): string {
  if (!prompt) return "Scene";
  // "id | Name (cast)" or "Name"
  const pipe = prompt.split("|");
  const right = (pipe.length > 1 ? pipe.slice(1).join("|") : pipe[0]).trim();
  const name = right.split("(")[0].trim();
  return name || "Scene";
}


function pathFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    // supabase: .../object/sign/library/<path>?token=  or /object/public/library/<path>
    const m = url.match(/\/object\/(?:sign|public)\/library\/([^?]+)/);
    if (m?.[1]) return decodeURIComponent(m[1]);
  } catch {
    /* */
  }
  return null;
}

function prettyCast(prompt: string | null): string | null {
  if (!prompt) return null;
  const m = prompt.match(/\(([^)]+)\)\s*$/);
  if (!m) return null;
  return m[1]
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .join(" · ");
}

export default function LibraryPage() {
  const [items, setItems] = useState<Gen[]>([]);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [lightbox, setLightbox] = useState<Gen | null>(null);

  const refreshUrls = useCallback(async (rows: Gen[]) => {
    const supabase = createClient();
    const out: Gen[] = [];
    for (const original of rows) {
      let url = original.result_url;
      const path = original.storage_path || pathFromUrl(original.result_url);
      if (path) {
        try {
          const { data, error } = await supabase.storage
            .from("library")
            .createSignedUrl(path, 60 * 60 * 24 * 7);
          if (!error && data?.signedUrl) {
            url = data.signedUrl;
          }
        } catch {
          /* keep existing */
        }
      }
      out.push({ ...original, result_url: url, storage_path: path });
    }
    return out;
  }, []);

  async function load() {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const { data: memberships } = await supabase
      .from("studio_members")
      .select("studio_id")
      .eq("user_id", userData.user.id)
      .limit(1);
    const sid = memberships?.[0]?.studio_id;
    if (!sid) return;

    // Try with storage_path; fall back if column missing
    let data: Gen[] | null = null;
    const full = await supabase
      .from("generations")
      .select("id, result_url, storage_path, prompt, kind, created_at")
      .eq("studio_id", sid)
      .order("created_at", { ascending: false })
      .limit(60);
    if (full.error) {
      const basic = await supabase
        .from("generations")
        .select("id, result_url, prompt, kind, created_at")
        .eq("studio_id", sid)
        .order("created_at", { ascending: false })
        .limit(60);
      data = (basic.data as Gen[]) || [];
    } else {
      data = (full.data as Gen[]) || [];
    }

    const withUrls = await refreshUrls(data);
    setItems(withUrls);
  }

  useEffect(() => {
    void load();
  }, []);

  async function downloadToDevice(url: string, id: string, title: string) {
    setBusy(true);
    setNote("Preparing download…");
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      const safe = title.replace(/[^a-z0-9]+/gi, "-").toLowerCase().slice(0, 40);
      a.download = `the-other-room-${safe || id.slice(0, 8)}.jpg`;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(href);
      setNote("Saved. On iPhone: share sheet → Save Image. On Mac: check Downloads.");
    } catch {
      window.open(url, "_blank");
      setNote("Opened image — long-press or right-click to save.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string, path?: string | null) {
    if (!confirm("Remove this from your private album?")) return;
    setBusy(true);
    try {
      await fetch("/api/library", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, path: path || undefined }),
      });
      setItems((prev) => prev.filter((x) => x.id !== id));
      if (lightbox?.id === id) setLightbox(null);
      setNote("Removed from album.");
    } catch {
      alert("Delete failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: "36rem", margin: "0 auto" }}>
      <div className="studio-hero">
        <h1
          style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "1.65rem",
            fontWeight: 500,
            color: "#1a1614",
            margin: "0 0 0.35rem",
          }}
        >
          Library
        </h1>
        <p style={{ fontSize: 14, color: "#5c534c", margin: 0, lineHeight: 1.45 }}>
          Private album. Nothing is public. We don&apos;t train on your photos.
        </p>
      </div>

      {note && (
        <p style={{ fontSize: 13, color: "#5c534c", marginBottom: 16 }}>{note}</p>
      )}

      {items.length === 0 ? (
        <div
          style={{
            background: "#fff",
            border: "1px solid rgba(26,22,20,0.1)",
            borderRadius: 16,
            padding: 28,
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-cormorant), Georgia, serif",
              fontSize: 22,
              margin: "0 0 8px",
              color: "#1a1614",
            }}
          >
            The album is empty
          </p>
          <p style={{ fontSize: 14, color: "#5c534c", margin: "0 0 16px", lineHeight: 1.45 }}>
            Start with a soft scene. Previews stay private until you Keep them.
          </p>
          <Link
            href="/scenes"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 48,
              padding: "0 24px",
              borderRadius: 999,
              background: "linear-gradient(135deg, #8B4A54, #7A3E48)",
              color: "#fff",
              fontWeight: 600,
              fontSize: 15,
              textDecoration: "none",
            }}
          >
            Browse soft scenes
          </Link>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 16,
            maxWidth: 420,
            margin: "0 auto",
            width: "100%",
          }}
        >
          {items.map((item) => {
            const title = prettyTitle(item.prompt);
            const cast = prettyCast(item.prompt);
            return (
              <div
                key={item.id}
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  overflow: "hidden",
                  border: "1px solid rgba(26,22,20,0.08)",
                  boxShadow: "0 1px 3px rgba(26,22,20,0.04)",
                }}
              >
                <button
                  type="button"
                  onClick={() => item.result_url && setLightbox(item)}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: 0,
                    border: "none",
                    background: "#2a181c",
                    cursor: item.result_url ? "pointer" : "default",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      aspectRatio: "3 / 4",
                      background: "#2a181c",
                    }}
                  >
                    {item.result_url ? (
                      <img
                        src={item.result_url}
                        alt={title}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          objectPosition: "top center",
                          display: "block",
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.opacity = "0.3";
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "rgba(255,255,255,0.4)",
                          fontSize: 12,
                          padding: 12,
                          textAlign: "center",
                        }}
                      >
                        Image unavailable
                      </div>
                    )}
                  </div>
                </button>
                <div style={{ padding: "10px 12px 12px" }}>
                  <div
                    style={{
                      fontFamily: "var(--font-cormorant), Georgia, serif",
                      fontSize: 16,
                      color: "#1a1614",
                      lineHeight: 1.25,
                      marginBottom: 2,
                    }}
                  >
                    {title}
                  </div>
                  {cast && (
                    <div style={{ fontSize: 11, color: "#5c534c", marginBottom: 10 }}>
                      {cast}
                    </div>
                  )}
                  <button
                    type="button"
                    disabled={busy || !item.result_url}
                    onClick={() =>
                      item.result_url &&
                      downloadToDevice(item.result_url, item.id, title)
                    }
                    style={{
                      width: "100%",
                      minHeight: 40,
                      borderRadius: 999,
                      border: "none",
                      background: "linear-gradient(135deg, #8B4A54, #7A3E48)",
                      color: "#fff",
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: busy || !item.result_url ? "not-allowed" : "pointer",
                      opacity: !item.result_url ? 0.5 : 1,
                      marginBottom: 6,
                    }}
                  >
                    Download
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => remove(item.id, item.storage_path)}
                    style={{
                      width: "100%",
                      minHeight: 32,
                      border: "none",
                      background: "transparent",
                      color: "#5c534c",
                      fontSize: 12,
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && lightbox.result_url && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setLightbox(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(12,10,9,0.92)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              border: "none",
              background: "rgba(255,255,255,0.12)",
              color: "#fff",
              borderRadius: 999,
              width: 40,
              height: 40,
              fontSize: 20,
              cursor: "pointer",
            }}
          >
            ×
          </button>
          <img
            src={lightbox.result_url}
            alt={prettyTitle(lightbox.prompt)}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "100%",
              maxHeight: "85vh",
              objectFit: "contain",
              borderRadius: 12,
            }}
          />
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              marginTop: 16,
              display: "flex",
              gap: 10,
              width: "100%",
              maxWidth: 320,
            }}
          >
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                downloadToDevice(
                  lightbox.result_url!,
                  lightbox.id,
                  prettyTitle(lightbox.prompt)
                )
              }
              style={{
                flex: 1,
                minHeight: 48,
                borderRadius: 999,
                border: "none",
                background: "linear-gradient(135deg, #8B4A54, #7A3E48)",
                color: "#fff",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Download
            </button>
            <button
              type="button"
              onClick={() => setLightbox(null)}
              style={{
                flex: 1,
                minHeight: 48,
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.25)",
                background: "transparent",
                color: "#fff",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
