"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Mood = "soft" | "playful" | "intense";

const SECTIONS = {
  soft: {
    label: "Soft",
    blurb: "Quiet intimacy — eye contact, warmth, unhurried desire.",
    heroClass: "hero-soft",
  },
  playful: {
    label: "Playful",
    blurb: "Confident, sexy, explicit — for when you want more heat.",
    heroClass: "hero-playful",
  },
  intense: {
    label: "Intense",
    blurb: "Bold fantasies — only when you choose to open them.",
    heroClass: "hero-intense",
  },
};

const RAW = `
romance-undress|Taking her clothes off|solo|soft|wife|✨|Keep the same pose, location and woman — make her naked
romance-naked-together|Male + Female Undresser|couple|soft|wife,husband|🤍|Same couple, same pose — both fully nude
romance-kiss|Intimate Bed Scene|couple|soft|wife,husband|💋|Beautiful couple in an intimate bedroom scene
romance-shower|After Shower Couple|couple|soft|wife,husband|🚿|Naked couple taking a bathroom mirror selfie
romance-morning|Bedroom Smile|couple|soft|wife,husband|🌅|Soft bedroom, close and smiling
romance-massage|Her body, soft light|solo|soft|wife|🕯|Same woman — body nude from reference
zen-undress-v3|Undress Woman|solo|soft|wife|🖤|Same seated fashion pose, clothes gone
romance-window|Window light|couple|soft|wife,husband|🌤|Soft daylight, standing close
romance-sofa|Sofa embrace|couple|soft|wife,husband|🛋|Quiet living-room intimacy
romance-bath|Shared bath|couple|soft|wife,husband|🛁|Warm water, slow and close
romance-mirror|Bedroom mirror|couple|soft|wife,husband|🪞|They watch each other
romance-robe|Robe slipping|solo|soft|wife|🤍|Same woman, robe falling open
romance-sheet|In the sheets|couple|soft|wife,husband|🛏|Tangled and unhurried
romance-kiss-neck|Neck kiss|couple|soft|wife,husband|💋|Close, his mouth on her neck
romance-hands|Hands on her|couple|soft|wife,husband|✋|He undresses her slowly
zen-portrait-soft|Soft portrait|solo|soft|wife|📷|Close beauty portrait, soft light, same woman
zen-50s-noir|50s Noir Movie|solo|soft|wife|🎬|Black-and-white 1950s film-noir still
zen-purple-grainy|Purple Grainy|solo|soft|wife|💜|Moody purple-grade portrait
erotic-missionary|Missionary|couple|playful|wife,husband|💫|Classic intimate position
erotic-cowgirl|Cowgirl|couple|playful|wife,husband|🔥|She on top, face to face
erotic-oral-him|Oral for him|couple|playful|wife,husband|👄|Intimate oral scene
erotic-doggy|From behind|couple|playful|wife,husband|🌙|Passionate doggy style
erotic-against-wall|Against the wall|couple|playful|wife,husband|🚪|Standing, urgent
erotic-lap|In his lap|couple|playful|wife,husband|🪑|She straddles him
erotic-oral-her|Oral for her|couple|playful|wife,husband|🌸|His mouth on her
erotic-spoon|Spooning|couple|playful|wife,husband|🌙|Side by side, close
erotic-shower-sex|Shower sex|couple|playful|wife,husband|🚿|Wet, standing
erotic-hotel|Hotel night|couple|playful|wife,husband|🏨|City-light suite
spicy-ffm|Two women + him|three|intense|husband,wife,female_lover|⚡|Threesome with a female lover
spicy-mmf|Two men + her|three|intense|wife,husband,male_lover|⚡|Threesome with a male lover
spicy-dp|Double penetration|three|intense|wife,husband,male_lover|🔥|Bold group fantasy
spicy-anal|Anal|couple|intense|wife,husband|🖤|Explicit anal scene
spicy-cuckold|She with another man|couple|intense|wife,male_lover|👁|She with the male lover
spicy-hotwife|Hotwife|three|intense|wife,husband,male_lover|🔥|He watches
spicy-lesbian|Two women|couple|intense|wife,female_lover|💜|Wife with female lover
zen-shower-pose|Pose Change In The Shower|solo|soft|wife|🚿|Same woman in the shower, new wet kneeling pose
zen-low-angle|Shoot from below|solo|soft|wife|📷|Same woman and room — camera from way below
zen-larger-hips|Larger hips and breasts|solo|soft|wife|💫|Same face and pose — fuller hips and breasts
zen-foam-shower|Foam Shower Girl|solo|soft|wife|🫧|Wet and soapy in the shower
zen-carpet-kneel|Carpet Kneel Pose|solo|soft|wife|🛏|Kneeling on the bedroom carpet, nude
zen-bedroom-v|Bedroom V Position|solo|playful|wife|🌙|On the bed, legs in a V, nude
zen-bed-selfie|Bed Selfie Spread|solo|playful|wife|📱|Nude on the bed taking a spread selfie
zen-nude-body|Nude Body|solo|playful|wife|🤍|Clean full-nude portrait of her
erotic-masturbation|Masturbation|solo|playful|wife|✋|On the bed touching herself
erotic-lovemaking|Missionary Surprise|couple|playful|wife,husband|💕|Missionary on the bed
erotic-one-night|Spread Wide and Filled|couple|playful|wife,male_lover|🌙|On her back, the male lover is inside
erotic-wall|Against the wall|couple|playful|wife,husband|🚪|Standing, one leg up
zen-pov-handjob|POV Handjob Smile|couple|playful|wife,husband|😊|She smiles while stroking him
zen-hungry|Hungry For Him|couple|playful|wife,husband|🔥|Eager oral, looking up
zen-deepthroat-close|Deepthroat Closeup|couple|playful|wife,husband|👄|Tight close-up
zen-intense-oral|Intense Oral|couple|playful|wife,husband|💋|Tight side-on oral
zen-nude-mirror-selfie|Nude Mirror Selfie|solo|playful|wife|📱|Nude bedroom selfie
zen-reading-masturbation|Reading and Masturbation|solo|playful|wife|📖|Reading a book while touching herself
zen-silent-desire|Silent Desire|solo|soft|wife|😶|Close face, lips parted
zen-bare-composition|Bare Composition|solo|soft|wife|🖼|Art-nude in a chair
zen-bathtub-selfie|Nude Bathtub Selfie|solo|playful|wife|🛁|Nude in the tub
zen-waterfall-nude|Nude Under Waterfall|solo|soft|wife|💧|Fully nude under a waterfall
soft-eye-contact|Eye contact in bed|couple|soft|wife,husband|👁|Quiet intimacy — looking at each other
soft-shower-laugh|Laughing in the shower|couple|soft|wife,husband|🚿|Steam, smiles, closeness
soft-slow-undress|Slow undress together|couple|soft|wife,husband|🤍|Helping each other out of clothes
soft-her-choice|She leads|couple|playful|wife,husband|✦|She is on top, confident
soft-aftercare|Aftercare portrait|couple|soft|wife,husband|🌙|After — holding each other
soft-for-her|Undressed for her|couple|playful|wife,husband|🖤|He is nude for her gaze
zen-drooling|Hungry oral|couple|intense|wife,husband|💦|Deep in her throat
zen-face-hold|Face Hold Oral|couple|intense|wife,husband|🤲|His hands on her head
zen-restroom-oral|Restroom Oral|couple|intense|wife,husband|🚻|Public restroom, kneeling
zen-x-cross|X Cross|solo|intense|wife|✖️|Bound to a wooden cross
zen-cowgirl-blindfold|Cowgirl Blindfold|couple|intense|wife,husband|🙈|Blindfolded cowgirl
zen-floor-bound|Floor Bound|solo|intense|wife|🪢|Hogtied on the floor
zen-shibari-oral-pov|Shibari Oral|couple|intense|wife,husband|🪢|Rope, kneeling oral
spicy-watch|He watches|three|intense|wife,husband,male_lover|👁|She with the male lover, he watches
spicy-two-men|Two men|three|intense|wife,husband,male_lover|⚡|Both men with her
spicy-two-women|Two women with him|three|intense|husband,wife,female_lover|⚡|Both women with him
`.trim();

const TEMPLATES = RAW.split("\n").map((line) => {
  const [id, name, group, mood, prefer, emoji, desc] = line.split("|");
  return {
    id,
    name,
    group,
    mood: mood as Mood,
    prefer: prefer.split(","),
    emoji,
    desc,
  };
});

export default function ScenesPage() {
  const [showIntense, setShowIntense] = useState(false);
  const [mood, setMood] = useState<Mood>("soft");

  const availableMoods: Mood[] = showIntense
    ? ["soft", "playful", "intense"]
    : ["soft", "playful"];

  const current = SECTIONS[mood];
  const templates = TEMPLATES.filter((t) => t.mood === mood);

  return (
    <div>
      <div className={cn("hero mb-6", current.heroClass)}>
        <h1
          className="text-2xl font-medium mb-1"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          {current.label}
        </h1>
        <p className="text-white/90 text-sm">{current.blurb}</p>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showIntense}
            onChange={(e) => {
              setShowIntense(e.target.checked);
              if (!e.target.checked && mood === "intense") setMood("soft");
            }}
            className="h-4 w-4 rounded accent-[var(--accent)]"
          />
          <span className="text-sm font-semibold">Show intense scenes</span>
        </label>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {availableMoods.map((m) => (
          <button
            key={m}
            onClick={() => setMood(m)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-bold transition-all",
              mood === m
                ? "bg-[var(--accent)] text-white shadow-md"
                : "bg-white border border-[var(--line)] text-[var(--text)] hover:border-[#E8D0D2]"
            )}
          >
            {SECTIONS[m].label}
          </button>
        ))}
      </div>

      <div className="section-kicker">Templates · {templates.length}</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((tpl) => (
          <Link
            key={tpl.id}
            href={`/create?scene=${tpl.id}&cast=${tpl.prefer.join(",")}`}
            className="card overflow-hidden hover:border-[#E8D0D2] transition-all hover:shadow-lg group"
          >
            <div className="aspect-[3/4] max-h-[160px] bg-gradient-to-br from-[#4A2C2A] to-[#7A3E48] flex items-center justify-center text-4xl text-white/40">
              {tpl.emoji}
            </div>
            <div className="p-4">
              <div
                className="text-lg font-medium mb-0.5 group-hover:text-[var(--accent)] transition-colors"
                style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
              >
                {tpl.name}
              </div>
              <p className="text-xs text-[var(--muted)] leading-snug">{tpl.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}