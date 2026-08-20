"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Person = {
  id?: string;
  role: string;
  name: string | null;
  photo_path: string | null;
  photo_url?: string | null;
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

export default function PeoplePage() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Loading your studio…");
  const [studioId, setStudioId] = useState<string | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [busyRole, setBusyRole] = useState<string | null>(null);

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

    const sid = memberships?.[0]?.studio_id as string | undefined;
    if (!sid) {
      setMessage("No studio found.");
      setLoading(false);
      return;
    }

    setStudioId(sid);
    await loadPeople(sid);
    setMessage("Photo plus age, shape, and size. These stay with that person.");
    setLoading(false);
  }

  async function loadPeople(sid: string) {
    const supabase = createClient();
    const { data } = await supabase.from("people").select("*").eq("studio_id", sid);
    const withUrls: Person[] = [];
    for (const person of data || []) {
      let photo_url: string | null = null;
      if (person.photo_path) {
        const { data: signed } = await supabase.storage
          .from("people")
          .createSignedUrl(person.photo_path, 60 * 60);
        photo_url = signed?.signedUrl || null;
      }
      withUrls.push({ ...person, photo_url });
    }
    setPeople(withUrls);
  }

  async function upload(role: string, file?: File) {
    if (!file || !studioId) {
      alert("Studio not ready, or no photo selected.");
      return;
    }
    setBusyRole(role);
    const supabase = createClient();
    const path = `${studioId}/${role}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from("people")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      alert(uploadError.message);
      setBusyRole(null);
      return;
    }

    const existing = people.find((p) => p.role === role);
    if (existing?.id) {
      await supabase.from("people").update({ photo_path: path }).eq("id", existing.id);
    } else {
      await supabase.from("people").insert({
        studio_id: studioId,
        role,
        name: ROLES.find((r) => r.key === role)?.label || role,
        photo_path: path,
      });
    }

    await loadPeople(studioId);
    setBusyRole(null);
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

  return (
    <div>
      <div className="hero mb-8">
        <h1
          className="text-2xl font-medium mb-1"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          Your people
        </h1>
        <p className="text-white/90 text-sm">{message}</p>
      </div>

      {loading ? (
        <p className="text-sm text-[var(--muted)]">Please wait…</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {ROLES.map((role) => {
            const person = people.find((p) => p.role === role.key);
            return (
              <div key={role.key} className="card p-5">
                <div className="flex gap-4">
                  <div className="w-28 shrink-0">
                    <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-to-br from-[#1C1917] to-[#5C2E36] flex items-center justify-center">
                      {person?.photo_url ? (
                        <img
                          src={person.photo_url}
                          alt={role.label}
                          className="w-full h-full object-cover object-top"
                        />
                      ) : (
                        <span className="text-white/30 text-4xl">✦</span>
                      )}
                    </div>
                    <label className="btn btn-primary w-full text-xs mt-2 cursor-pointer">
                      {busyRole === role.key
                        ? "Uploading…"
                        : person?.photo_url
                        ? "Change"
                        : "Add face"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={busyRole !== null}
                        onChange={(e) => upload(role.key, e.target.files?.[0])}
                      />
                    </label>
                  </div>

                  <div className="flex-1 space-y-2">
                    <div
                      className="text-xl font-medium"
                      style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
                    >
                      {role.label}
                    </div>
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
