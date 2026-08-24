"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

type Mood = "soft" | "playful" | "intense";

const SECTIONS = {
  soft: {
    label: "Soft",
    blurb: "Quiet intimacy — eye contact, warmth, unhurried desire.",
    heroClass: "hero-soft",
  },
  playful: {
    label: "Playful",
    blurb: "Bolder, more confident — still elegant, still private.",
    heroClass: "hero-playful",
  },
  intense: {
    label: "After dark",
    blurb: "A short shelf first. Further rooms only when you open them.",
    heroClass: "hero-intense",
  },
};

const LAUNCH_IDS = new Set([
  "outfit-try-on",
  "who-wore-it-best",
  "soft-eye-contact",
  "soft-aftercare",
  "soft-slow-undress",
  "soft-shower-laugh",
  "soft-her-choice",
  "soft-for-her",
  "romance-undress",
  "romance-naked-together",
  "romance-shower",
  "romance-kiss",
  "romance-morning",
  "zen-silent-desire",
  "erotic-missionary",
  "erotic-doggy",
  "erotic-cowgirl",
  "erotic-wall",
  "erotic-oral-her",
  "erotic-oral-him",
  "zen-nude-mirror-selfie",
  "erotic-masturbation",
  "spicy-anal",
  "spicy-creampie",
  "spicy-mmf",
  "spicy-ffm",
  "spicy-cuckold",
  "zen-rope-bound-corset",
  "zen-cum-face",
]);

const RAW = `
outfit-try-on|In this outfit|solo|soft|wife|👗|Any garment — her or him in it, exact fabric and cut\nwho-wore-it-best|Who wore it best|solo|soft|wife|✨|Editorial — the exact piece on your face\nromance-undress|Undressed|solo|soft|wife|✨|Same pose and place — clothing set aside
romance-naked-together|Both undressed|couple|soft|wife,husband|🤍|The two of you, same pose, nothing between you
romance-kiss|In bed|couple|soft|wife,husband|💋|Close, warm light, unhurried
romance-shower|After the shower|couple|soft|wife,husband|🚿|Steam, soft light, a shared mirror moment
romance-morning|Morning light|couple|soft|wife,husband|🌅|White sheets, close, smiling
romance-massage|Soft light|solo|soft|wife|🕯|Her form in quiet, flattering light
zen-undress-v3|Seated, undressed|solo|soft|wife|🖤|Fashion pose held — clothing set aside
zen-shower-pose|In the shower|solo|soft|wife|🚿|Water, light, a new pose
zen-low-angle|From below|solo|soft|wife|📷|Low angle, same room, same face
zen-larger-hips|Fuller figure|solo|soft|wife|💫|Same face and pose — a softer, fuller line
zen-foam-shower|Foam and water|solo|soft|wife|🫧|Soft face, water and foam
zen-carpet-kneel|Kneeling|solo|soft|wife|🛏|Kneeling on the carpet, unhurried
zen-bedroom-v|On the bed|solo|playful|wife|🌙|On the bed, open, soft light
zen-bed-selfie|Bed selfie|solo|playful|wife|📱|A private selfie on the bed
zen-bare-pussy|Bare|solo|playful|wife|🖤|Same woman, bare, quiet and direct
zen-spread-jewel|Open, jewel light|solo|playful|wife|💎|On the floor, open, hands close
zen-spread-pussy|Open for you|solo|playful|wife|🌸|Close, open, her face in frame
zen-nude-body|Full portrait|solo|playful|wife|🤍|A clean full portrait of her
erotic-masturbation|Touching herself|solo|playful|wife|✋|On the bed, alone with her hands
erotic-lovemaking|Missionary|couple|playful|wife,husband|💕|Together on the bed, close and joined
erotic-one-night|Open and joined|couple|playful|wife,male_lover|🌙|On her back, open, joined
erotic-doggy|From behind|couple|playful|wife,husband|🔥|From behind, deep and close
erotic-missionary|Folded close|couple|playful|wife,husband|💋|Legs drawn in, close and joined
erotic-oral-her|His mouth on her|couple|playful|wife,husband|👅|His mouth, her pleasure
erotic-oral-him|Her mouth on him|couple|playful|wife,husband|👄|Her lips around him, close
erotic-cowgirl|She rides|couple|playful|wife,husband|💃|She above him, legs open
erotic-wall|Against the wall|couple|playful|wife,husband|🚪|Standing, one leg raised, joined
zen-floor-spread|On the floor|couple|playful|wife,husband|🪵|On the floor, open, joined
zen-pov-handjob|Her hand, his gaze|couple|playful|wife,husband|😊|She smiles while her hand works
zen-hungry|Eager mouth|couple|playful|wife,husband|🔥|Eager, looking up
zen-deepthroat-close|Close oral|couple|playful|wife,husband|👄|Close, deep, her mouth on him
zen-intense-oral|Intense oral|couple|playful|wife,husband|💋|Side-on, intent
zen-drooling|Deep oral|couple|intense|wife,husband|💦|Deep, wet, intent
zen-face-hold|Hands in her hair|couple|intense|wife,husband|🤲|His hands guide; she stays with him
zen-squat-dt|Kneeling, deep|couple|intense|wife,husband|⬇️|From above — kneeling, deep
zen-blonde-devotion|Devotion|couple|playful|wife,husband|🙏|Close oral, eye contact
zen-golden-oral|Golden hour|couple|playful|wife,husband|🌇|Warm light, her mouth on him
zen-sultry-oral|Sultry oral|couple|playful|wife,husband|🔥|Slow, close, unhurried
zen-parking-bj|Outside, hidden|couple|playful|wife,husband|🚗|Outside, private, oral
zen-pov-anal|From behind, anal|couple|intense|wife,husband|🍑|From behind, anal, his view
zen-anal-bath|Bathroom, anal|couple|intense|wife,husband|🚿|Bathroom light, anal, his view
spicy-anal|Anal|couple|intense|wife,husband|🍑|Anal, junction visible
spicy-creampie|Filled|couple|intense|wife,male_lover|💦|After, still full
zen-cum-face|A soft finish on her face|couple|intense|wife,husband|🤍|A soft finish on her face
zen-face-full|Finish|couple|intense|wife,husband|💦|Finish on her face, mouth open
zen-cum-tits|On her chest|couple|intense|wife,husband|💗|On her chest, she lies back
zen-cum-beauty|Marked|solo|intense|wife|✨|Her face and lingerie, marked
zen-glory|Through the wall|solo|intense|wife|🔘|She takes a penis through a glory hole, the penis belongs to an unseen man, correct anatomy, no extra genitals
zen-spread-open|Spread open|couple|intense|wife,husband|🦵|Legs held open, joined
spicy-bbc|BBC|couple|intense|wife,male_lover|🖤|With a well-endowed black lover
spicy-dp|Double|three|intense|wife,husband,male_lover|🔥|Two men both penetrating the woman, each penis attached only to its own man, correct anatomy, no extra genitals
spicy-spitroast|Between two|three|intense|wife,husband,male_lover|⚡|One man in her mouth, one man penetrating her, two penises only, each attached to its own man, correct anatomy
spicy-cuckold|He watches|three|intense|wife,male_lover,husband|👁|He watches; the other man is with her
spicy-mmf|MMF|three|intense|wife,husband,male_lover|🔥|Two men and one woman, only two penises each attached to its own man, no extra genitals, no body fusion
spicy-ffm|FFM|three|intense|husband,wife,female_lover|💜|Two women kiss, man on the right — one penis at his hips only, hand on shaft near base, not between breasts, correct anatomy
zen-collar-three|Collar Threesome|three|intense|wife,husband,male_lover|⛓|She wears a collar, two men, only two penises each belonging to one man, correct anatomy
zen-double-facial|Two finishes|three|intense|wife,husband,male_lover|💦|She kneels between two men, two penises only, finish on her face, correct anatomy
zen-cocks-around|Surrounded|three|intense|wife,husband,male_lover|⭕|She is surrounded by two men only — no extra or anonymous shafts, two penises total, correct anatomy
zen-dominatrix|Dominatrix|solo|intense|wife|👠|Her in charge, latex or leather
zen-fierce-dom|Fierce dominatrix|solo|intense|wife|🗡|Fierce, in-control portrait of her
zen-pink-light|In pink light|couple|playful|wife,husband|💗|Pink practical light, his face and her body
zen-combining|Combining|couple|playful|wife,husband|🧬|Blend both references into one explicit couple frame
zen-flashing-tits|Sexy Flashing Tits|solo|soft|wife|💚|Same woman — lift her top and flash her breasts outdoors
zen-elegant-bar|Elegant Bar Pose|solo|soft|wife|🍸|Glamorous bar portrait, red latex or cocktail dress
zen-instapic-selfie|Instapic Selfie|solo|soft|wife|📱|Mirror or handheld phone selfie, polished influencer look
zen-heart-hands|Heart Hands|solo|soft|wife|🖤|Elegant portrait making a heart shape with both hands
zen-soft-portrait|Soft Portrait|solo|soft|wife|🌸|Close beauty portrait, soft light, same woman
zen-50s-noir|50s Noir Movie|solo|soft|wife|🎬|Black-and-white 1950s film-noir still of the same woman
zen-purple-grainy|Purple Grainy|solo|soft|wife|💜|Moody purple-grade portrait, same woman
zen-exposed-street|Exposed Street Pose|solo|playful|wife|🌃|Night street, topless or nearly nude editorial pose
zen-grass-nude|Grass Sitting Nude|solo|playful|wife|🌿|Fully nude sitting in grass outdoors
zen-used-condoms|After, playful|solo|playful|wife|🫧|Close portrait with a used condom near her face
zen-black-dildo-ride|Riding Black Dildo On Bed|solo|playful|wife|🖤|Nude on the bed riding a black dildo
zen-thong-anus|Thongs Over Anus|solo|playful|wife|🔥|Rear view, thong pulled aside over her anus
zen-cum-selfie|After the first|solo|playful|wife|💦|Close selfie with fresh cum on her face
zen-member-near-face|Close beside her|couple|playful|wife,husband|👄|Erect penis belonging only to the man next to her face, beauty close-up, correct anatomy
zen-cum-on-clothes|On her clothes|couple|playful|wife,husband|🤍|Semen on her lingerie or clothes, mirror selfie mood
zen-penis-against-face|Against her cheek|couple|playful|wife,husband|🔥|Large erect penis belonging only to the man pressed against her face on the bed, correct anatomy
zen-armpit-job|Armpit Job|couple|playful|wife,husband|💪|His penis (attached only to him) between her arm and side, beach or bright light, correct anatomy
zen-dildo-insertion|Dildo Insertion|solo|playful|wife|💗|Sitting, inserting a dildo into her vagina
zen-pov-impregnation|Deep missionary|couple|intense|wife,husband|🤰|POV missionary, deep penetration, impregnation fantasy still
zen-reverse-cowgirl-anal|Reverse Cowgirl Anal|couple|intense|wife,husband|🔥|Reverse cowgirl with anal penetration
zen-anal-frontal|Anal Frontal View|couple|intense|wife,husband|🍑|She on all fours, anal penetration, face toward camera
zen-cowgirl-anal-bbc|Cowgirl Anal Sex BBC|couple|intense|wife,male_lover|🖤|Cowgirl anal with a large dark-skinned partner
zen-doggystyle-double|Doggystyle Double Penis|three|intense|wife,husband,male_lover|🔥|Doggy with two men, two penises only, each attached to its own man, correct anatomy, no extra genitals
zen-mounted-deepthroat|Deep from above|couple|intense|wife,husband|👅|She on her back, deepthroat from above
zen-cheekbulge-tongue|Cheek and tongue|couple|intense|wife,male_lover|👅|Cheek bulge oral with tongue on the shaft
zen-two-dicks-mouth|Two at her mouth|three|intense|wife,husband,male_lover|💋|Two erect penises at her mouth, each belonging to one of the two men, no extras, correct anatomy
zen-sloppy-v2|Messy kiss|couple|intense|wife,husband|💧|Messy oral, saliva and tears, selfie energy
zen-rope-bound-corset|Rope Bound Corset|solo|intense|wife|🪢|Shibari rope and corset, bound portrait
zen-harness-ballgag|Harness Ball Gag|solo|intense|wife|🔴|Red harness ball gag close portrait
zen-tape-bound|Tape Bound|solo|intense|wife|📼|Red tape bondage in a chair, same woman
zen-breast-rope|Breast Rope Harness|solo|intense|wife|🪢|Chest rope harness, bare breasts framed by rope
zen-dental-gag|Open mouth restraint|couple|intense|wife,husband|😬|Open dental gag, oral with saliva
zen-ponytail-grab|Ponytail Grab Fellatio|couple|intense|wife,husband|🎀|He holds her ponytail while she sucks
zen-pigtail-handles|Pigtails Handles Blowjob|couple|intense|wife,husband|🎀|POV oral, he uses her pigtails as handles
zen-oral-cum-strings|Close after|couple|intense|wife,husband|💦|Tongue out, semen strings from glans to her mouth
zen-finger-on-mouth|Finger on Mouth|solo|soft|wife|🤫|Fashion portrait, finger to her lips
zen-licking-lips|Licking her lips|solo|playful|wife|👅|Close face, tongue out, semen on lips
zen-rural-sheer|Rural Sheer Black Outfit|solo|soft|wife|🌾|Sheer black top in a rural field
zen-semen-bucket|Barn fantasy|solo|intense|wife|🪣|Barn pose, nude cowgirl hat, milking-bucket fantasy
zen-pussy-cover-selfie|Pussy Cover Selfie|solo|playful|wife|📱|Nude mirror selfie, hand covering her vulva
zen-blindfolded|Blindfolded woman|solo|intense|wife|🙈|Black blindfold, topless seated pose
zen-strapon|Strapon Dildo|solo|intense|wife|💗|Lingerie with a strap-on dildo
zen-chair-naked|Chair Relaxed Naked|solo|playful|wife|🪑|Nude reclining in an armchair
zen-cum-flooded|Afterglow, close|solo|intense|wife|🤍|Studio nude, semen overflowing her vulva
zen-tied-belts|Tied with Belts|solo|intense|wife|🖤|Leather belt harness, breasts bound and exposed
zen-park-facial|Night park close|solo|intense|wife|🌳|Night park close-up, semen on her face
zen-train-pussy|Naked Pussy on the Train|solo|playful|wife|🚆|On a train seat, jacket on, vulva exposed
zen-red-panties|Naked in Red Panties|solo|soft|wife|❤️|Topless in red panties, hallway portrait
zen-outdoor-chair|Outdoor Chair Scene|solo|playful|wife|🪴|Fishnet on a patio chair, legs open
zen-ruined-makeup|Ruined makeup|solo|intense|wife|💄|Smudged mascara selfie after a messy scene
zen-knees-in-cum|On her knees|solo|intense|wife|💧|Kneeling outdoors, semen on chest, tongue out
zen-cum-on-ass|Along her back|solo|intense|wife|🍑|Rear view, semen on her buttocks
zen-nude-mirror-selfie|Nude Mirror Selfie|solo|playful|wife|📱|Nude bedroom selfie with phone on a tripod
zen-reading-masturbation|Reading & Touching herself|solo|playful|wife|📖|Reading a book while touching herself
zen-candid-vagina-selfie|Candid Vagina Selfie|solo|playful|wife|📱|Couch selfie, legs open, phone in hand
zen-silent-desire|Silent Desire|solo|soft|wife|😶|Close face, lips parted, quiet hungry look
zen-backdoor-aesthetic|Backdoor Aesthetic|solo|playful|wife|🍑|Prone rear view on a bench, artistic nude
zen-bare-composition|Bare Composition|solo|soft|wife|🖼|Art-nude in a chair, arms raised
zen-restroom-oral|Restroom Oral Sex|couple|intense|wife,husband|🚻|Public restroom, kneeling blowjob
zen-anal-plug-spread|Anal Plug Spread|solo|intense|wife|💎|Sitting on the floor, legs open, plug in
zen-kilt-skirt-sex|Kilt Skirt Sex|couple|playful|wife,husband|🎀|On the bed in a tartan kilt, penetration
zen-bathtub-selfie|Nude Bathtub Selfie|solo|playful|wife|🛁|Nude in the tub, wet skin selfie
zen-waterfall-nude|Nude Under Waterfall|solo|soft|wife|💧|Fully nude under a jungle waterfall
zen-x-cross|X Cross BDSM|solo|intense|wife|✖️|Bound to a wooden Saint Andrew's cross
zen-cowgirl-blindfold|Cowgirl Blindfold|couple|intense|wife,husband|🙈|Blindfolded cowgirl on the sofa
zen-floor-bound|Floor Bound Scene|solo|intense|wife|🪢|Hogtied on the floor with rope
zen-horseback-anal|Anal Sex on Horseback|couple|intense|wife,husband|🏇|Reverse-cowgirl anal, she faces away
zen-pussy-caress|Pussy Caress|solo|playful|wife|✋|On a sofa in a silk shirt, touching herself
zen-shibari-oral-pov|Shibari Oral POV|couple|intense|wife,husband|🪢|Pink rope, kneeling POV blowjob
zen-ahegao|Overwhelmed look|solo|intense|wife|😵|Street kneeling ahegao face
soft-eye-contact|Eye contact in bed|couple|soft|wife,husband|👁|Quiet intimacy — looking at each other, no rush
soft-shower-laugh|Laughing in the shower|couple|soft|wife,husband|🚿|Playful shower — steam, smiles, closeness
soft-slow-undress|Slow undress together|couple|soft|wife,husband|🤍|Helping each other out of clothes — equal, unhurried
soft-her-choice|She leads|couple|soft|wife,husband|✦|She is on top, confident, looking at him
soft-aftercare|Aftercare portrait|couple|soft|wife,husband|🌙|After — holding each other, calm, close
soft-for-her|Undressed for her|couple|soft|wife,husband|🖤|He is nude for her gaze — her desire in frame
`.trim();

const TEMPLATES = RAW.split("\n")
  .map((line) => line.trim())
  .filter((line) => line.includes("|"))
  .map((line) => {
    const [id, name, group, mood, prefer, emoji, desc] = line.split("|");
    return {
      id: id || "",
      name: name || "",
      group: group || "solo",
      mood: (mood as Mood) || "soft",
      prefer: (prefer || "wife")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      emoji: emoji || "",
      desc: desc || "",
    };
  })
  .filter((row) => row.id);


export default function ScenesPage() {
  const [showIntense, setShowIntense] = useState(false);
  const [mood, setMood] = useState<Mood>("soft");
  const [inputs, setInputs] = useState<{ role: string; url: string }[]>([]);
  const [results, setResults] = useState<{ prompt: string; url: string; path?: string | null }[]>([]);
  const [note, setNote] = useState("");

  useEffect(() => {
    void load();
  }, []);



  async function signLibraryUrl(
    supabase: ReturnType<typeof createClient>,
    path: string | null | undefined,
    fallbackUrl: string | null,
    thumb = true
  ): Promise<{ url: string; path: string | null } | null> {
    const tryPaths: string[] = [];
    if (path) {
      tryPaths.push(path);
      if (path.includes("/preview/")) tryPaths.push(path.replace("/preview/", "/kept/"));
      if (path.includes("/kept/")) tryPaths.push(path.replace("/kept/", "/preview/"));
    }
    if (fallbackUrl) {
      try {
        const m = fallbackUrl.match(/\/object\/(?:sign|public)\/library\/([^?]+)/);
        if (m?.[1]) {
          const recovered = decodeURIComponent(m[1]);
          tryPaths.push(recovered);
          if (recovered.includes("/preview/"))
            tryPaths.push(recovered.replace("/preview/", "/kept/"));
          if (recovered.includes("/kept/"))
            tryPaths.push(recovered.replace("/kept/", "/preview/"));
        }
      } catch {
        /* */
      }
    }
    const transform = thumb
      ? { transform: { width: 480, height: 640, resize: "contain" as const } }
      : undefined;
    const seen = new Set<string>();
    for (const c of tryPaths) {
      if (!c || seen.has(c)) continue;
      seen.add(c);
      try {
        const { data, error } = await supabase.storage
          .from("library")
          .createSignedUrl(c, 60 * 60 * 6, transform as any);
        if (!error && data?.signedUrl) return { url: data.signedUrl, path: c };
        // Fallback without transform if project has transforms disabled
        if (transform) {
          const plain = await supabase.storage
            .from("library")
            .createSignedUrl(c, 60 * 60 * 6);
          if (!plain.error && plain.data?.signedUrl)
            return { url: plain.data.signedUrl, path: c };
        }
      } catch {
        /* next */
      }
    }
    if (fallbackUrl && fallbackUrl.startsWith("http")) {
      return { url: fallbackUrl, path: path || null };
    }
    return null;
  }

  async function load() {
    setNote("");
    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const { data: memberships } = await supabase
        .from("studio_members")
        .select("studio_id")
        .eq("user_id", userData.user.id)
        .limit(1);
      const sid = memberships?.[0]?.studio_id as string | undefined;
      if (!sid) return;

      // People faces — parallel sign
      const { data: people } = await supabase.from("people").select("*").eq("studio_id", sid);
      const faceJobs = (people || [])
        .filter((person: { photo_path?: string }) => person.photo_path)
        .map(async (person: { photo_path: string; role: string }) => {
          const { data: signed } = await supabase.storage
            .from("people")
            .createSignedUrl(person.photo_path, 60 * 60, {
              transform: { width: 200, height: 260, resize: "cover" },
            } as any);
          // fallback no transform
          let url = signed?.signedUrl;
          if (!url) {
            const plain = await supabase.storage
              .from("people")
              .createSignedUrl(person.photo_path, 60 * 60);
            url = plain.data?.signedUrl;
          }
          return url ? { role: person.role, url } : null;
        });
      const faceResults = await Promise.all(faceJobs);
      setInputs(
        faceResults.filter(Boolean) as { role: string; url: string }[]
      );

      // Generations only — no full bucket list on every open
      let gens: {
        prompt?: string | null;
        result_url?: string | null;
        storage_path?: string | null;
      }[] = [];
      const full = await supabase
        .from("generations")
        .select("prompt,result_url,storage_path")
        .eq("studio_id", sid)
        .order("created_at", { ascending: false })
        .limit(80);
      if (full.error) {
        const basic = await supabase
          .from("generations")
          .select("prompt,result_url")
          .eq("studio_id", sid)
          .order("created_at", { ascending: false })
          .limit(80);
        gens = (basic.data as typeof gens) || [];
      } else {
        gens = (full.data as typeof gens) || [];
      }

      const mapped = (
        await Promise.all(
          gens.map(async (g) => {
            if (!g.result_url && !g.storage_path) return null;
            const signed = await signLibraryUrl(
              supabase,
              g.storage_path,
              g.result_url || null,
              true
            );
            if (!signed) return null;
            return {
              prompt: g.prompt || "",
              url: signed.url,
              path: signed.path,
            };
          })
        )
      ).filter(Boolean) as { prompt: string; url: string; path?: string | null }[];

      setResults(mapped);
      if (mapped.length) {
        setNote(`${mapped.length} scene image${mapped.length > 1 ? "s" : ""} ready`);
        setTimeout(() => setNote(""), 2500);
      }
    } catch (e) {
      console.error(e);
      setNote("Could not load scene images");
    }
  }

  function picFor(id: string, name: string) {
    const needle = id.toLowerCase();
    const nameNeedle = (name || "").toLowerCase().trim();
    // Prefer prompt that contains scene id
    let hit = results.find((r) => {
      const p = String(r.prompt || "").toLowerCase();
      const path = String(r.path || "").toLowerCase();
      return (
        p.includes(needle) ||
        p.startsWith(needle + " |") ||
        p.startsWith(needle + "|") ||
        path.includes(needle)
      );
    });
    if (!hit && nameNeedle.length > 2) {
      hit = results.find((r) => {
        const p = String(r.prompt || "").toLowerCase();
        return p.includes(nameNeedle);
      });
    }
    return hit?.url || null;
  }

  const templates = TEMPLATES.filter((t) => {
    if (!showIntense && t.mood === "intense") return false;
    if (mood === "soft") return t.mood === "soft";
    if (mood === "playful") return t.mood === "playful";
    if (mood === "intense") return t.mood === "intense";
    return true;
  }).filter((t) => {
    // Short shelf: prefer launch set for soft when not after dark
    if (showIntense) return true;
    if (t.mood === "intense") return false;
    return LAUNCH_IDS.has(t.id) || t.mood === "soft" || t.mood === "playful";
  });

  // Soft shelf: max ~8 soft when soft selected
  const shown =
    mood === "soft" && !showIntense
      ? templates.filter((t) => t.mood === "soft").slice(0, 8)
      : mood === "playful" && !showIntense
        ? templates.filter((t) => t.mood === "playful").slice(0, 8)
        : templates;

  const section = SECTIONS[mood === "intense" || showIntense ? "intense" : mood];

  return (
    <div style={{ maxWidth: "28rem", margin: "0 auto", paddingBottom: 48 }}>
      <h1
        style={{
          fontFamily: "var(--font-cormorant), Georgia, serif",
          fontSize: "1.75rem",
          fontWeight: 500,
          color: "#1a1614",
          margin: "0 0 8px",
        }}
      >
        {showIntense ? "After dark" : section.label}
      </h1>
      <p style={{ fontSize: 14, color: "#5c534c", lineHeight: 1.5, margin: "0 0 20px" }}>
        {showIntense
          ? "Further rooms — only while you keep them open."
          : section.blurb}
      </p>

      {/* Same chip language as Cast / Create — no native checkboxes */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 24,
        }}
      >
        {(
          [
            { key: "soft" as Mood, label: "Soft" },
            { key: "playful" as Mood, label: "Playful" },
            { key: "intense" as Mood, label: "After dark" },
          ]
        ).map((m) => {
          const on =
            m.key === "intense"
              ? showIntense || mood === "intense"
              : !showIntense && mood === m.key;
          return (
            <button
              key={m.key}
              type="button"
              className={on ? "tor-chip tor-chip-on" : "tor-chip"}
              onClick={() => {
                if (m.key === "intense") {
                  setShowIntense(true);
                  setMood("intense");
                } else {
                  setShowIntense(false);
                  setMood(m.key);
                }
              }}
              style={{ minHeight: 44, padding: "10px 18px", fontSize: 14 }}
            >
              {m.label}
            </button>
          );
        })}
      </div>

      {note ? (
        <p style={{ fontSize: 12, color: "#5c534c", marginBottom: 12 }}>{note}</p>
      ) : null}





      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {shown.map((tpl) => {
          const resultUrl = picFor(tpl.id, tpl.name);
          const needed = tpl.prefer
            .map((role) => inputs.find((i) => i.role === role))
            .filter(Boolean) as { role: string; url: string }[];
          const faces =
            needed.length > 0
              ? needed
              : inputs.slice(0, Math.min(tpl.prefer.length || 2, inputs.length));
          const isThree = faces.length >= 3;

          const inputLabel = (text: string) => (
            <span
              style={{
                position: "absolute",
                bottom: 8,
                left: "50%",
                transform: "translateX(-50%)",
                fontSize: 11,
                fontWeight: 500,
                color: "#fff",
                background: "rgba(30,30,30,0.85)",
                padding: "3px 10px",
                borderRadius: 10,
                letterSpacing: "0.2px",
              }}
            >
              {text}
            </span>
          );

          return (
            <div
              key={tpl.id}
              style={{
                background: "#fff",
                borderRadius: 16,
                border: "1px solid rgba(26,22,20,0.08)",
                padding: "16px",
                boxShadow: "0 1px 3px rgba(26,22,20,0.04)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 12,
                  marginBottom: 8,
                }}
              >
                <h2
                  style={{
                    fontFamily: "var(--font-cormorant), Georgia, serif",
                    fontSize: 28,
                    fontWeight: 400,
                    margin: 0,
                    color: "#1a1614",
                    lineHeight: 1.15,
                    flex: 1,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {tpl.name}
                </h2>
                <Link
                  href={`/create?scene=${tpl.id}&cast=${tpl.prefer.join(",")}&name=${encodeURIComponent(tpl.name)}`}
                  style={{
                    flexShrink: 0,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 40,
                    padding: "0 18px",
                    borderRadius: 999,
                    background: "linear-gradient(135deg, #8B4A54, #7A3E48)",
                    color: "#fff",
                    fontWeight: 500,
                    fontSize: 14,
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  Try scene
                </Link>
              </div>

              <p
                style={{
                  fontSize: 15,
                  color: "#555",
                  lineHeight: 1.45,
                  margin: "0 0 16px",
                }}
              >
                {tpl.desc}
              </p>

              {isThree ? (
                /* ===== 3 inputs: stacked left column + tall result (mockup) ===== */
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    width: "100%",
                    minHeight: 280,
                    alignItems: "stretch",
                  }}
                >
                  <div
                    style={{
                      width: "38%",
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                      minWidth: 0,
                    }}
                  >
                    {faces.slice(0, 3).map((face) => (
                      <div
                        key={face.role}
                        style={{
                          position: "relative",
                          flex: 1,
                          minHeight: 0,
                          borderRadius: 14,
                          overflow: "hidden",
                          background: "#f0f0f0",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                        }}
                      >
                        <img
                          src={face.url}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            objectPosition: "top center",
                            display: "block",
                          }}
                        />
                        {inputLabel("input")}
                      </div>
                    ))}
                  </div>
                  <div
                    style={{
                      flex: 1,
                      position: "relative",
                      minWidth: 0,
                      borderRadius: 16,
                      overflow: "hidden",
                      background: resultUrl
                        ? "#1C1917"
                        : "linear-gradient(145deg, #3a1f24, #7A3E48)",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                    }}
                  >
                    {resultUrl ? (
                      <img
                        src={resultUrl}
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          objectPosition: "center 15%",
                          display: "block",
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : null}
                    {inputLabel("result")}
                  </div>
                </div>
              ) : (
                /* ===== 1–2 inputs: side-by-side 50/50 (unchanged) ===== */
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                    width: "100%",
                    alignItems: "stretch",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      alignItems: "stretch",
                      minWidth: 0,
                      width: "100%",
                      minHeight: 140,
                    }}
                  >
                    {faces.length === 0 ? (
                      <Link
                        href="/people"
                        style={{
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          minHeight: 140,
                          borderRadius: 12,
                          background: "#F7F0EA",
                          fontSize: 12,
                          color: "#8B4A54",
                          textDecoration: "underline",
                        }}
                      >
                        Add faces
                      </Link>
                    ) : (
                      faces.map((face) => (
                        <div
                          key={face.role}
                          style={{
                            position: "relative",
                            flex: 1,
                            minWidth: 0,
                            borderRadius: 12,
                            overflow: "hidden",
                            background: "#1C1917",
                            minHeight: 140,
                          }}
                        >
                          <img
                            src={face.url}
                            alt=""
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              objectPosition: "top center",
                              display: "block",
                            }}
                          />
                          {inputLabel("input")}
                        </div>
                      ))
                    )}
                  </div>
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      minWidth: 0,
                      minHeight: 140,
                      borderRadius: 12,
                      overflow: "hidden",
                      background: resultUrl
                        ? "#1C1917"
                        : "linear-gradient(145deg, #3a1f24, #7A3E48)",
                    }}
                  >
                    {resultUrl ? (
                      <img
                        src={resultUrl}
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          objectPosition: "center center",
                          display: "block",
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : null}
                    {inputLabel("result")}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!shown.length ? (
        <p style={{ fontSize: 14, color: "#5c534c", marginTop: 16 }}>
          No scenes in this room yet.
        </p>
      ) : null}
    </div>
  );
}
