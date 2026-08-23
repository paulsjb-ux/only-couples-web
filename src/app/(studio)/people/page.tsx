"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Person = {
  id?: string;
  role: string;
  name: string | null;
  photo_path: string | null;
  photo_body?: string | null;
  photo_angle?: string | null;
  photo_url?: string | null;
  body_url?: string | null;
  angle_url?: string | null;
  age?: string | null;
  body_shape?: string | null;
  breasts?: string | null;
  penis?: string | null;
};

const ROLES = [
  { key: "wife", label: "Wife", sex: "f" },
  { key: "husband", label: "Husband", sex: "m" },
  { key: "female_lover", label: "Female lover", sex: "f" },
  { key: "male_lover", label: "Male lover", sex: "m" },
];

const AGES = ["20s", "30s", "40s", "50s", "60s", "70s"];
const SHAPES = ["slim", "athletic", "average", "curvy", "full", "large", "heavy"];
const BREASTS = ["small", "medium", "full", "large"];
const PENIS = ["average", "large", "very large"];

type Slot = "face" | "body" | "angle";

const SLOT_META: { key: Slot; label: string; field: "photo_path" | "photo_body" | "photo_angle"; hint: string }[] = [
  { key: "face", label: "Face", field: "photo_path", hint: "A clear portrait — soft light, eyes toward the lens" },
  { key: "body", label: "Body", field: "photo_body", hint: "Full or three-quarter figure, natural stance" },
  { key: "angle", label: "Angle", field: "photo_angle", hint: "A second angle — profile or slight turn" },
];

export default function PeoplePage() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Loading your studio…");
  const [studioId, setStudioId] = useState<string | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  useEffect(() => {
    start();
  }, []);

  async function start() {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) {
      setMessage("Please log in again.");
      setLoading(false);
      return;
    }

    const { data: memberships, error } = await supabase
      .from("studio_members")
      .select("studio_id")
      .eq("user_id", user.id)
      .limit(1);

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    let sid = memberships?.[0]?.studio_id as string | undefined;
    if (!sid) {
      // Create a studio on first visit so "Your people" always works
      try {
        const res = await fetch("/api/studio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Our Studio" }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.studio_id) {
          sid = data.studio_id;
        } else {
          setMessage(
            data.error ||
              "No studio yet. Open Account or try again — we need a studio before faces can be saved."
          );
          setLoading(false);
          return;
        }
      } catch {
        setMessage("Could not reach the studio service. Check your connection and try again.");
        setLoading(false);
        return;
      }
    }

    setStudioId(sid);
    await loadPeople(sid);
    setMessage("A clear face photo is essential. Body and angle help the likeness hold.");
    setLoading(false);
  }

  async function signed(path: string | null | undefined) {
    if (!path) return null;
    const supabase = createClient();
    const { data } = await supabase.storage.from("people").createSignedUrl(path, 60 * 60);
    return data?.signedUrl || null;
  }

  async function loadPeople(sid: string) {
    const supabase = createClient();
    const { data } = await supabase.from("people").select("*").eq("studio_id", sid);
    const withUrls: Person[] = [];
    for (const person of data || []) {
      withUrls.push({
        ...person,
        photo_url: await signed(person.photo_path),
        body_url: await signed(person.photo_body),
        angle_url: await signed(person.photo_angle),
      });
    }
    setPeople(withUrls);
  }

  async function upload(role: string, slot: Slot, file?: File) {
    if (!file || !studioId) {
      alert("Studio not ready, or no photo selected.");
      return;
    }
    const busy = `${role}-${slot}`;
    setBusyKey(busy);
    const supabase = createClient();
    const path = `${studioId}/${role}-${slot}.jpg`;
    const field = SLOT_META.find((s) => s.key === slot)!.field;

    const { error: uploadError } = await supabase.storage
      .from("people")
      .upload(path, file, { upsert: true, contentType: file.type || "image/jpeg" });

    if (uploadError) {
      alert(uploadError.message);
      setBusyKey(null);
      return;
    }

    const existing = people.find((p) => p.role === role);
    if (existing?.id) {
      const { error } = await supabase.from("people").update({ [field]: path }).eq("id", existing.id);
      if (error) alert(error.message);
    } else {
      const { error } = await supabase.from("people").insert({
        studio_id: studioId,
        role,
        name: ROLES.find((r) => r.key === role)?.label || role,
        [field]: path,
      });
      if (error) alert(error.message);
    }

    await loadPeople(studioId);
    setBusyKey(null);
  }

  async function saveField(role: string, field: string, value: string) {
    if (!studioId) return;
    const supabase = createClient();
    const existing = people.find((p) => p.role === role);
    if (existing?.id) {
      const { error } = await supabase.from("people").update({ [field]: value }).eq("id", existing.id);
      if (error) {
        alert(error.message);
        return;
      }
    } else {
      const { error } = await supabase.from("people").insert({
        studio_id: studioId,
        role,
        name: ROLES.find((r) => r.key === role)?.label || role,
        [field]: value,
      });
      if (error) {
        alert(error.message);
        return;
      }
    }
    await loadPeople(studioId);
  }

  function Select({
    label,
    value,
    options,
    onChange,
  }: {
    label: string;
    value?: string | null;
    options: string[];
    onChange: (v: string) => void;
  }) {
    return (
      <label className="block text-left">
        <span className="text-xs font-semibold text-[var(--muted)]">{label}</span>
        <select
          className="mt-1 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Not set</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </label>
    );
  }

  function slotUrl(person: Person | undefined, slot: Slot) {
    if (!person) return null;
    if (slot === "face") return person.photo_url;
    if (slot === "body") return person.body_url;
    return person.angle_url;
  }

  return (
    <div>
      <div className="studio-hero mb-6">
        <h1
          className="text-2xl font-medium mb-1"
          style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            color: "var(--text, #1a1614)",
          }}
        >
          Your people
        </h1>
        <p className="text-sm text-[var(--muted)]">{message}</p>
      </div>

      {loading ? (
        <p className="text-sm text-[var(--muted)]">Please wait…</p>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {ROLES.map((role) => {
            const person = people.find((p) => p.role === role.key);
            return (
              <div key={role.key} className="card p-3 sm:p-5">
                <div
                  className="text-xl font-medium mb-4"
                  style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
                >
                  {role.label}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 8,
                    marginBottom: 16,
                    width: "100%",
                    minWidth: 0,
                  }}
                >
                  {SLOT_META.map((slot) => {
                    const url = slotUrl(person, slot.key);
                    const busy = busyKey === `${role.key}-${slot.key}`;
                    return (
                      <div key={slot.key} style={{ textAlign: "center", minWidth: 0 }}>
                        <div
                          style={{
                            width: "100%",
                            aspectRatio: "3 / 4",
                            maxHeight: 110,
                            margin: "0 auto 8px",
                            borderRadius: 12,
                            overflow: "hidden",
                            background: "linear-gradient(to bottom right, #1C1917, #5C2E36)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {url ? (
                            <img
                              src={url}
                              alt={slot.label}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                objectPosition: "top center",
                                display: "block",
                              }}
                            />
                          ) : (
                            <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>
                              {slot.label}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>
                          {slot.label}
                        </div>
                        <div
                          style={{
                            fontSize: 10,
                            color: "#5c534c",
                            marginBottom: 8,
                            lineHeight: 1.25,
                          }}
                        >
                          {slot.hint}
                        </div>
                        <label
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "100%",
                            minHeight: 36,
                            borderRadius: 999,
                            fontSize: 11,
                            fontWeight: 600,
                            color: "#fff",
                            background: "linear-gradient(135deg, #8B4A54, #7A3E48)",
                            cursor: busyKey ? "not-allowed" : "pointer",
                            opacity: busyKey ? 0.6 : 1,
                          }}
                        >
                          {busy ? "…" : url ? "Change" : "Add"}
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/heic,.jpg,.jpeg,.png,.webp"
                            style={{ display: "none" }}
                            disabled={busyKey !== null}
                            onChange={(e) => upload(role.key, slot.key, e.target.files?.[0])}
                          />
                        </label>
                      </div>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Select
                    label="Age"
                    value={person?.age}
                    options={AGES}
                    onChange={(v) => saveField(role.key, "age", v)}
                  />
                  <Select
                    label="Body"
                    value={person?.body_shape}
                    options={SHAPES}
                    onChange={(v) => saveField(role.key, "body_shape", v)}
                  />
                  {role.sex === "f" ? (
                    <Select
                      label="Breasts"
                      value={person?.breasts}
                      options={BREASTS}
                      onChange={(v) => saveField(role.key, "breasts", v)}
                    />
                  ) : (
                    <Select
                      label="Penis"
                      value={person?.penis}
                      options={PENIS}
                      onChange={(v) => saveField(role.key, "penis", v)}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
