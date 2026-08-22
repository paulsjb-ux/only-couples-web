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
      <div className="hero mb-8">
        <h1
          className="text-2xl font-medium mb-1 text-white"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          Your people
        </h1>
        <p className="text-white/90 text-sm">{message}</p>
      </div>

      {loading ? (
        <p className="text-sm text-[var(--muted)]">Please wait…</p>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {ROLES.map((role) => {
            const person = people.find((p) => p.role === role.key);
            return (
              <div key={role.key} className="card p-5">
                <div
                  className="text-xl font-medium mb-4"
                  style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
                >
                  {role.label}
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  {SLOT_META.map((slot) => {
                    const url = slotUrl(person, slot.key);
                    const busy = busyKey === `${role.key}-${slot.key}`;
                    return (
                      <div key={slot.key} className="text-center">
                        <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-to-br from-[#1C1917] to-[#5C2E36] flex items-center justify-center mb-2">
                          {url ? (
                            <img
                              src={url}
                              alt={slot.label}
                              className="w-full h-full object-cover object-top"
                            />
                          ) : (
                            <span className="text-white/30 text-sm">{slot.label}</span>
                          )}
                        </div>
                        <div className="text-xs font-semibold mb-0.5">{slot.label}</div>
                        <div className="text-[10px] text-[var(--muted)] mb-2 leading-tight">
                          {slot.hint}
                        </div>
                        <label className="btn btn-primary w-full text-[11px] cursor-pointer px-2 py-1.5">
                          {busy ? "…" : url ? "Change" : "Add"}
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/heic,.jpg,.jpeg,.png,.webp"
                            className="hidden"
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
