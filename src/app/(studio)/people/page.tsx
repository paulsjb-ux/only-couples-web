"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Person = {
  id?: string;
  role: string;
  name: string | null;
  photo_path: string | null;
  photo_url?: string | null;
};

const ROLES = [
  { key: "wife", label: "Wife" },
  { key: "husband", label: "Husband" },
  { key: "female_lover", label: "Female lover" },
  { key: "male_lover", label: "Male lover" },
];

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
    setMessage("Add the couple, then optional extra faces.");
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
    const label = ROLES.find((r) => r.key === role)?.label || role;
    if (existing?.id) {
      await supabase.from("people").update({ photo_path: path }).eq("id", existing.id);
    } else {
      await supabase.from("people").insert({
        studio_id: studioId,
        role,
        name: label,
        photo_path: path,
      });
    }

    await loadPeople(studioId);
    setBusyRole(null);
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ROLES.map((role) => {
            const person = people.find((p) => p.role === role.key);
            return (
              <div key={role.key} className="card p-5 text-center">
                <div className="mx-auto mb-4 aspect-[3/4] max-h-[260px] rounded-2xl overflow-hidden bg-gradient-to-br from-[#1C1917] to-[#5C2E36] flex items-center justify-center">
                  {person?.photo_url ? (
                    <img
                      src={person.photo_url}
                      alt={role.label}
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <span className="text-white/30 text-5xl">✦</span>
                  )}
                </div>
                <div
                  className="text-xl font-medium mb-3"
                  style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
                >
                  {role.label}
                </div>
                <label className="btn btn-primary w-full text-sm cursor-pointer">
                  {busyRole === role.key
                    ? "Uploading…"
                    : person?.photo_url
                    ? "Change photo"
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
            );
          })}
        </div>
      )}
    </div>
  );
}