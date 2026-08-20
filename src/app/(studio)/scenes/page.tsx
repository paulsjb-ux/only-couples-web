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
zen-bare-pussy|Bare, soft|solo|playful|wife|🖤|Same woman, nude on the desk
zen-spread-jewel|Open, jewel light|solo|playful|wife|💎|On the floor, legs spread
zen-spread-pussy|Open for you|solo|playful|wife|🌸|Close explicit spread, her face in frame
zen-floor-spread|Floor Spread|couple|playful|wife,husband|🪵|On the floor, legs held open
zen-squat-dt|Kneeling deep|couple|intense|wife,husband|⬇️|Overhead: she takes him deep
zen-blonde-devotion|Blonde Devotion|couple|playful|wife,husband|🙏|Worshipful oral, eye contact
zen-golden-oral|Golden Hour Oral|couple|playful|wife,husband|🌇|Sunset rooftop oral
zen-sultry-oral|Sultry Oral|couple|playful|wife,husband|🔥|Slow oral close-up
zen-parking-bj|Parking Lot|couple|playful|wife,husband|🚗|Outdoor oral
zen-pov-anal|POV Anal|couple|intense|wife,husband|🍑|From behind
zen-anal-bath|Anal Bathroom|couple|intense|wife,husband|🚿|Bathroom POV
spicy-creampie|Filled|couple|intense|wife,male_lover|💦|After, with the male lover
zen-cum-face|Soft finish, face|couple|intense|wife,husband|🤍|Finish on her face
zen-face-full|Soft finish|couple|intense|wife,husband|💦|Heavy facial
zen-cum-tits|On her chest|couple|intense|wife,husband|💗|On her breasts
zen-glory|Through the wall|solo|intense|wife|🔘|Glory hole
zen-spread-open|Spread Wide Open|couple|intense|wife,husband|🦵|Legs held open
spicy-bbc|BBC|couple|intense|wife,male_lover|🖤|With a well-endowed male lover
spicy-spitroast|Spit roast|three|intense|wife,husband,male_lover|⚡|Oral plus penetration
zen-collar-three|Collar Threesome|three|intense|wife,husband,male_lover|⛓|She wears a collar, two men
zen-double-facial|Two finishes|three|intense|wife,husband,male_lover|💦|Between two men
zen-dominatrix|Dominatrix|solo|intense|wife|👠|Her in charge
zen-fierce-dom|Fierce dominatrix|solo|intense|wife|🗡|In-control portrait
zen-pink-light|In pink light|couple|playful|wife,husband|💗|Pink light, close bodies
zen-flashing-tits|Flashing|solo|soft|wife|💚|Lift her top outdoors
zen-elegant-bar|Elegant Bar|solo|soft|wife|🍸|Glamorous bar portrait
zen-instapic-selfie|Instapic Selfie|solo|soft|wife|📱|Polished phone selfie
zen-heart-hands|Heart Hands|solo|soft|wife|🖤|Heart shape with both hands
zen-exposed-street|Exposed Street|solo|playful|wife|🌃|Night street editorial
zen-grass-nude|Grass Sitting Nude|solo|playful|wife|🌿|Nude in grass
zen-black-dildo-ride|Riding on the bed|solo|playful|wife|🖤|On the bed with a toy
zen-thong-anus|Thong aside|solo|playful|wife|🔥|Rear view, thong pulled aside
zen-chair-naked|Chair Relaxed Naked|solo|playful|wife|🪑|Nude in an armchair
zen-red-panties|Red Panties|solo|soft|wife|❤️|Topless in red panties
zen-pussy-caress|Pussy Caress|solo|playful|wife|✋|On a sofa, touching herself
zen-kilt-skirt-sex|Kilt Skirt|couple|playful|wife,husband|🎀|On the bed in a kilt
zen-horseback-anal|Reverse cowgirl|couple|intense|wife,husband|🏇|She faces away
zen-ahegao|Overwhelmed look|solo|intense|wife|😵|Overwhelmed expression
zen-used-condoms|After, playful|solo|playful|wife|🫧|Close portrait after
zen-cum-selfie|After the first|solo|playful|wife|💦|Close selfie after
zen-member-near-face|Close beside her|couple|playful|wife,husband|👄|Beside her face
zen-cum-on-clothes|On her clothes|couple|playful|wife,husband|🤍|On her lingerie
zen-penis-against-face|Against her cheek|couple|playful|wife,husband|🔥|Pressed against her face
zen-armpit-job|Armpit Job|couple|playful|wife,husband|💪|Between her arm and side
zen-dildo-insertion|Dildo Insertion|solo|playful|wife|💗|Sitting, inserting a toy
zen-pov-impregnation|Deep missionary|couple|intense|wife,husband|🤰|Deep missionary
zen-reverse-cowgirl-anal|Reverse Cowgirl Anal|couple|intense|wife,husband|🔥|Reverse cowgirl
zen-anal-frontal|Anal Frontal View|couple|intense|wife,husband|🍑|On all fours, face toward camera
zen-cowgirl-anal-bbc|Cowgirl Anal BBC|couple|intense|wife,male_lover|🖤|Cowgirl with male lover
zen-doggystyle-double|Doggystyle Double|three|intense|wife,husband,male_lover|🔥|Two men
zen-mounted-deepthroat|Deep from above|couple|intense|wife,husband|👅|From above
zen-cheekbulge-tongue|Cheek and tongue|couple|intense|wife,male_lover|👅|With male lover
zen-two-dicks-mouth|Two at her mouth|three|intense|wife,husband,male_lover|💋|Two men at once
zen-sloppy-v2|Messy kiss|couple|intense|wife,husband|💧|Messy oral
zen-rope-bound-corset|Rope Bound Corset|solo|intense|wife|🪢|Shibari and corset
zen-harness-ballgag|Harness Ball Gag|solo|intense|wife|🔴|Harness portrait
zen-tape-bound|Tape Bound|solo|intense|wife|📼|Tape bondage in a chair
zen-breast-rope|Breast Rope Harness|solo|intense|wife|🪢|Chest rope harness
zen-dental-gag|Open mouth restraint|couple|intense|wife,husband|😬|Open-mouth restraint
zen-ponytail-grab|Ponytail Grab|couple|intense|wife,husband|🎀|He holds her ponytail
zen-pigtail-handles|Pigtails|couple|intense|wife,husband|🎀|Pigtails as handles
zen-oral-cum-strings|Close after|couple|intense|wife,husband|💦|Close after
zen-finger-on-mouth|Finger on Mouth|solo|soft|wife|🤫|Fashion portrait
zen-licking-lips|Licking her lips|solo|playful|wife|👅|Close face
zen-rural-sheer|Rural Sheer|solo|soft|wife|🌾|Sheer black top in a field
zen-semen-bucket|Barn fantasy|solo|intense|wife|🪣|Barn pose
zen-pussy-cover-selfie|Cover Selfie|solo|playful|wife|📱|Nude mirror selfie
zen-blindfolded|Blindfolded|solo|intense|wife|🙈|Topless, seated
zen-strapon|Strapon|solo|intense|wife|💗|Lingerie with a strap-on
zen-cum-flooded|Afterglow, close|solo|intense|wife|🤍|Afterglow close-up
zen-tied-belts|Tied with Belts|solo|intense|wife|🖤|Leather belt harness
zen-park-facial|Night park|solo|intense|wife|🌳|Night park close-up
zen-train-pussy|On the Train|solo|playful|wife|🚆|On a train seat
zen-outdoor-chair|Outdoor Chair|solo|playful|wife|🪴|Patio chair
zen-ruined-makeup|Ruined makeup|solo|intense|wife|💄|After a messy scene
zen-knees-in-cum|On her knees|solo|intense|wife|💧|Kneeling outdoors
zen-cum-on-ass|Along her back|solo|intense|wife|🍑|Rear view
zen-candid-vagina-selfie|Candid Selfie|solo|playful|wife|📱|Couch selfie
zen-backdoor-aesthetic|Backdoor Aesthetic|solo|playful|wife|🍑|Prone rear view
zen-anal-plug-spread|Plug Spread|solo|intense|wife|💎|On the floor, plug in
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