"use client";

import { useEffect, useState } from "react";
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
  const pipe = prompt.split("|");
  const right = (pipe.length > 1 ? pipe.slice(1).join("|") : pipe[0]).trim();
  return right.split("(")[0].trim() || "Scene";
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

function pathFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const m = url.match(/\/object\/(?:sign|public)\/library\/([^?]+)/);
    if (m?.[1]) return decodeURIComponent(m[1]);
  } catch {
    /* ignore */
  }
  return null;
}

function candidates(path: string): string[] {
  const set = new Set<string>([path]);
  if (path.includes("/preview/")) set.add(path.replace("/preview/", "/kept/"));
  if (path.includes("/kept/")) set.add(path.replace("/kept/", "/preview/"));
  const parts = path.split("/").filter(Boolean);
  if (parts.length >= 2) {
    const sid = parts[0];
    const file = parts[parts.length - 1];
    set.add(`${sid}/preview/${file}`);
    set.add(`${sid}/kept/${file}`);
  }
  return [...set];
}

export default function LibraryPage() {
  const [items, setItems] = useState<Gen[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [lightbox, setLightbox] = useState<Gen | null>(null);
  const [failedIds, setFailedIds] = useState<Record<string, boolean>>({});

  async function signAny(
    path: string,
    thumb = true
  ): Promise<{ url: string; path: string } | null> {
    const supabase = createClient();
    const transform = thumb
      ? { transform: { width: 600, height: 800, resize: "contain" as const } }
      : undefined;
    for (const p of candidates(path)) {
      try {
        const { data, error } = await supabase.storage
          .from("library")
          .createSignedUrl(p, 60 * 60 * 6, transform);
        if (!error && data?.signedUrl) return { url: data.signedUrl, path: p };
        if (transform) {
          const plain = await supabase.storage
            .from("library")
            .createSignedUrl(p, 60 * 60 * 6);
          if (!plain.error && plain.data?.signedUrl)
            return { url: plain.data.signedUrl, path: p };
        }
      } catch {
        /* next */
      }
    }
    return null;
  }

  async function load() {
    setLoading(true);
    setNote("");
    try {
      // Always load the album through the server route. The server refreshes
      // private Supabase Storage signed URLs from the durable storage_path,
      // so expired browser URLs can never make saved images disappear.
      const res = await fetch("/api/library", {
        method: "GET",
        cache: "no-store",
        credentials: "include",
      });

      if (res.status === 401) {
        setNote("Sign in to see your album.");
        setItems([]);
        return;
      }

      if (!res.ok) {
        throw new Error(`Library request failed (${res.status})`);
      }

      const payload = (await res.json()) as { items?: Gen[] };
      const rows = Array.isArray(payload.items) ? payload.items : [];
      setItems(rows);
      setFailedIds({});
    } catch (e) {
      console.error("library load", e);
      setNote("Something went wrong loading the album. Pull to refresh.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function findMissing() {
    setBusy(true);
    setNote("Searching storage…");
    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        setNote("Sign in first.");
        return;
      }
      const { data: memberships } = await supabase
        .from("studio_members")
        .select("studio_id")
        .eq("user_id", userData.user.id)
        .limit(1);
      const sid = memberships?.[0]?.studio_id as string | undefined;
      if (!sid) {
        setNote("No studio.");
        return;
      }

      const found: { path: string; url: string }[] = [];
      for (const folder of [`${sid}/kept`, `${sid}/preview`, sid]) {
        try {
          const { data: files } = await supabase.storage.from("library").list(folder, {
            limit: 100,
          });
          if (!files) continue;
          for (const f of files) {
            if (!f?.name || !f.name.includes(".")) continue;
            const objectPath = `${folder}/${f.name}`;
            const signed = await signAny(objectPath);
            if (signed) found.push(signed);
          }
        } catch {
          /* continue */
        }
      }

      // Re-sign current rows again
      const next = [...items];
      let fi = 0;
      for (let i = 0; i < next.length; i++) {
        const row = next[i];
        const path = row.storage_path || pathFromUrl(row.result_url);
        if (path) {
          const signed = await signAny(path);
          if (signed) {
            next[i] = { ...row, result_url: signed.url, storage_path: signed.path };
            continue;
          }
        }
        if ((!row.result_url || failedIds[row.id]) && fi < found.length) {
          const hit = found[fi++];
          next[i] = { ...row, result_url: hit.url, storage_path: hit.path };
        }
      }
      setItems(next);
      setFailedIds({});
      setNote(
        found.length
          ? `Checked storage (${found.length} files found). Updated what we could.`
          : "No files found in storage. Generate again and Keep."
      );
    } catch (e) {
      console.error(e);
      setNote("Search failed. Try again later.");
    } finally {
      setBusy(false);
    }
  }

  async function downloadToDevice(url: string, id: string, title: string) {
    setBusy(true);
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = `the-other-room-${title.replace(/[^a-z0-9]+/gi, "-").toLowerCase().slice(0, 32) || id.slice(0, 8)}.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(href);
      setNote("Download started.");
    } catch {
      window.open(url, "_blank");
      setNote("Opened image — long-press to save.");
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
      setNote("Removed.");
    } catch {
      setNote("Delete failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: "36rem", margin: "0 auto", paddingBottom: 40 }}>
      <div style={{ marginBottom: 20 }}>
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

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        <button
          type="button"
          disabled={busy || loading}
          onClick={() => void findMissing()}
          style={{
            minHeight: 40,
            padding: "8px 16px",
            borderRadius: 999,
            border: "1.5px solid rgba(26,22,20,0.12)",
            background: "#fff",
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
            color: "#1a1614",
          }}
        >
          {busy ? "Working…" : "Find missing pictures"}
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => void load()}
          style={{
            minHeight: 40,
            padding: "8px 16px",
            borderRadius: 999,
            border: "1.5px solid rgba(26,22,20,0.12)",
            background: "#fff",
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
            color: "#1a1614",
          }}
        >
          Refresh
        </button>
        <Link
          href="/scenes"
          style={{
            minHeight: 40,
            padding: "8px 16px",
            borderRadius: 999,
            background: "linear-gradient(135deg, #8B4A54, #7A3E48)",
            color: "#fff",
            fontWeight: 600,
            fontSize: 13,
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          New scene
        </Link>
      </div>

      {note ? (
        <p style={{ fontSize: 13, color: "#5c534c", marginBottom: 16, lineHeight: 1.4 }}>{note}</p>
      ) : null}

      {loading ? (
        <p style={{ fontSize: 14, color: "#5c534c" }}>Loading album…</p>
      ) : items.length === 0 ? (
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
          <p style={{ fontSize: 14, color: "#5c534c", margin: "0 0 16px" }}>
            Generate a scene, then Keep it here.
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
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, maxWidth: 420, margin: "0 auto" }}>
          {items.map((item) => {
            const title = prettyTitle(item.prompt);
            const cast = prettyCast(item.prompt);
            const broken = failedIds[item.id] || !item.result_url;
            return (
              <div
                key={item.id}
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  overflow: "hidden",
                  border: "1px solid rgba(26,22,20,0.08)",
                }}
              >
                <button
                  type="button"
                  onClick={() => !broken && item.result_url && setLightbox(item)}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: 0,
                    border: "none",
                    background: "#2a181c",
                    cursor: broken ? "default" : "pointer",
                  }}
                >
                  <div style={{ width: "100%", aspectRatio: "3 / 4", position: "relative", background: "#2a181c" }}>
                    {!broken && item.result_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.result_url}
                        alt={title}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          objectPosition: "center center",
                          display: "block",
                        }}
                        onError={() => setFailedIds((p) => ({ ...p, [item.id]: true }))}
                      />
                    ) : (
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "rgba(255,255,255,0.6)",
                          fontSize: 13,
                          padding: 20,
                          textAlign: "center",
                          gap: 8,
                        }}
                      >
                        <span>Image couldn&apos;t load</span>
                        <span style={{ fontSize: 12, opacity: 0.85 }}>
                          Tap Find missing pictures, or generate again
                        </span>
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
                      marginBottom: 2,
                    }}
                  >
                    {title}
                  </div>
                  {cast ? (
                    <div style={{ fontSize: 11, color: "#5c534c", marginBottom: 10 }}>{cast}</div>
                  ) : null}
                  {!broken && item.result_url ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => downloadToDevice(item.result_url!, item.id, title)}
                      style={{
                        width: "100%",
                        minHeight: 40,
                        borderRadius: 999,
                        border: "none",
                        background: "linear-gradient(135deg, #8B4A54, #7A3E48)",
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: 13,
                        cursor: "pointer",
                        marginBottom: 6,
                      }}
                    >
                      Download
                    </button>
                  ) : (
                    <Link
                      href="/scenes"
                      style={{
                        display: "block",
                        textAlign: "center",
                        minHeight: 40,
                        lineHeight: "40px",
                        borderRadius: 999,
                        background: "#F7F0EA",
                        color: "#1a1614",
                        fontWeight: 600,
                        fontSize: 13,
                        textDecoration: "none",
                        marginBottom: 6,
                      }}
                    >
                      Generate again
                    </Link>
                  )}
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

      {lightbox?.result_url ? (
        <div
          role="dialog"
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox.result_url}
            alt=""
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "100%", maxHeight: "85vh", objectFit: "contain", borderRadius: 12 }}
          />
        </div>
      ) : null}
    </div>
  );
}
