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
romance-massage|Her body, soft light|solo|soft|wife|🕯|Same woman, location and pose — body nude from reference
zen-undress-v3|Undress Woman V3|solo|soft|wife|🖤|Same seated fashion pose, clothes gone
zen-shower-pose|Pose Change In The Shower|solo|soft|wife|🚿|Same woman in the shower, new wet kneeling pose
zen-low-angle|Shoot from below|solo|soft|wife|📷|Same woman and room — camera from way below
zen-larger-hips|Larger hips and breasts|solo|soft|wife|💫|Same face and pose — fuller hips and breasts
zen-foam-shower|Foam Shower Girl|solo|soft|wife|🫧|Sweet-faced, wet and soapy in the shower
zen-carpet-kneel|Carpet Kneel Pose|solo|soft|wife|🛏|Kneeling on the bedroom carpet, nude
zen-bedroom-v|Bedroom V Position|solo|playful|wife|🌙|On the bed, legs in a V, nude
zen-bed-selfie|Bed Selfie Spread|solo|playful|wife|📱|Nude on the bed taking a spread selfie
zen-bare-pussy|Bare, soft|solo|playful|wife|🖤|Same woman, nude on the desk — vulva the focus
zen-spread-jewel|Open, jewel light|solo|playful|wife|💎|On the floor, legs spread, hands on her vulva
zen-spread-pussy|Open for you|solo|playful|wife|🌸|Close explicit spread, her face in frame
zen-nude-body|Nude Body|solo|playful|wife|🤍|Clean full-nude portrait of her
erotic-masturbation|Masturbation|solo|playful|wife|✋|On the bed touching herself
erotic-lovemaking|Missionary Surprise|couple|playful|wife,husband|💕|Missionary on the bed, mid-entry
erotic-one-night|Spread Wide & Filled|couple|playful|wife,male_lover|🌙|On her back, legs wide, he is inside
erotic-doggy|Deep From Behind|couple|playful|wife,husband|🔥|Doggy, deep from behind
erotic-missionary|Folded Missionary|couple|playful|wife,husband|💋|Her legs folded back, he is inside
erotic-oral-her|He goes down|couple|playful|wife,husband|👅|His mouth on her vulva
erotic-oral-him|Deepthroat Blowjob|couple|playful|wife,husband|👄|Her lips around him, close
erotic-cowgirl|Blonde Cowgirl Ride|couple|playful|wife,husband|💃|She rides him, legs wide
erotic-wall|Against the wall|couple|playful|wife,husband|🚪|Standing, one leg up, he is inside
zen-floor-spread|Floor Spread|couple|playful|wife,husband|🪵|On the floor, legs held open, he is inside
zen-pov-handjob|POV Handjob Smile|couple|playful|wife,husband|😊|She smiles while stroking him, outdoor POV
zen-hungry|Hungry For Cock|couple|playful|wife,husband|🔥|Eager oral, looking up
zen-deepthroat-close|Deepthroat Closeup|couple|playful|wife,husband|👄|Tight close-up of her taking him deep
zen-intense-oral|Intense Oral|couple|playful|wife,husband|💋|Tight side-on oral
zen-drooling|Hungry oral|couple|intense|wife,husband|💦|Heavy saliva, deep in her throat
zen-face-hold|Face Hold Oral|couple|intense|wife,husband|🤲|His hands on her head while she sucks
zen-squat-dt|Kneeling deep|couple|intense|wife,husband|⬇️|Overhead: she squats and takes him deep
zen-blonde-devotion|Blonde Devotion|couple|playful|wife,husband|🙏|Close, worshipful oral, eye contact
zen-golden-oral|Golden Hour Oral|couple|playful|wife,husband|🌇|Sunset rooftop, tongue on him
zen-sultry-oral|Sultry Oral|couple|playful|wife,husband|🔥|Slow, sultry oral close-up
zen-parking-bj|Parking Lot Blowjob|couple|playful|wife,husband|🚗|Outdoor / parking lot oral
zen-pov-anal|POV Anal Doggy|couple|intense|wife,husband|🍑|POV from behind, penis in her anus
zen-anal-bath|Anal Bathroom POV|couple|intense|wife,husband|🚿|Bathroom, anal POV
spicy-anal|Anal|couple|intense|wife,husband|🍑|Anal sex, junction visible
spicy-creampie|Filled|couple|intense|wife,male_lover|💦|Semen leaking from her
zen-cum-face|Soft finish, face|couple|intense|wife,husband|🤍|Finish on her face
zen-face-full|Soft finish|couple|intense|wife,husband|💦|Heavy facial, mouth open
zen-cum-tits|On her chest|couple|intense|wife,husband|💗|Semen on her breasts, she lies back
zen-cum-beauty|Covered beauty|solo|intense|wife|✨|Her face and lingerie streaked
zen-glory|Through the wall|solo|intense|wife|🔘|She takes a penis through a glory hole
zen-spread-open|Spread Wide Open|couple|intense|wife,husband|🦵|Legs held open, he is inside, she moans
spicy-bbc|BBC|couple|intense|wife,male_lover|🖤|With a well-endowed black lover
spicy-dp|Double penetration|three|intense|wife,husband,male_lover|🔥|Two men, both inside
spicy-spitroast|Spit roast|three|intense|wife,husband,male_lover|⚡|Oral plus penetration
spicy-cuckold|Cuckold|three|intense|wife,male_lover,husband|👁|He watches her with another
spicy-mmf|MMF|three|intense|wife,husband,male_lover|🔥|Two men, one woman
spicy-ffm|FFM|three|intense|husband,wife,female_lover|💜|Two women, one man
zen-collar-three|Collar Threesome|three|intense|wife,husband,male_lover|⛓|She wears a collar, two men
zen-double-facial|Two finishes|three|intense|wife,husband,male_lover|💦|She kneels between two men, finish on her face
zen-cocks-around|Surrounded|three|intense|wife,husband,male_lover|⭕|She is surrounded — extra anonymous shafts allowed
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
zen-member-near-face|Close beside her|couple|playful|wife,husband|👄|Erect penis next to her face, beauty close-up
zen-cum-on-clothes|On her clothes|couple|playful|wife,husband|🤍|Semen on her lingerie or clothes, mirror selfie mood
zen-penis-against-face|Against her cheek|couple|playful|wife,husband|🔥|Large erect penis pressed against her face on the bed
zen-armpit-job|Armpit Job|couple|playful|wife,husband|💪|His penis between her arm and side, beach or bright light
zen-dildo-insertion|Dildo Insertion|solo|playful|wife|💗|Sitting, inserting a dildo into her vagina
zen-pov-impregnation|Deep missionary|couple|intense|wife,husband|🤰|POV missionary, deep penetration, impregnation fantasy still
zen-reverse-cowgirl-anal|Reverse Cowgirl Anal|couple|intense|wife,husband|🔥|Reverse cowgirl with anal penetration
zen-anal-frontal|Anal Frontal View|couple|intense|wife,husband|🍑|She on all fours, anal penetration, face toward camera
zen-cowgirl-anal-bbc|Cowgirl Anal Sex BBC|couple|intense|wife,male_lover|🖤|Cowgirl anal with a large dark-skinned partner
zen-doggystyle-double|Doggystyle Double Penis|three|intense|wife,husband,male_lover|🔥|Doggy with two men, double penetration energy
zen-mounted-deepthroat|Deep from above|couple|intense|wife,husband|👅|She on her back, deepthroat from above
zen-cheekbulge-tongue|Cheek and tongue|couple|intense|wife,male_lover|👅|Cheek bulge oral with tongue on the shaft
zen-two-dicks-mouth|Two at her mouth|three|intense|wife,husband,male_lover|💋|Two erect penises at her mouth at once
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
zen-reading-masturbation|Reading & Masturbation|solo|playful|wife|📖|Reading a book while touching herself
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
soft-her-choice|She leads|couple|playful|wife,husband|✦|She is on top, confident, looking at him
soft-aftercare|Aftercare portrait|couple|soft|wife,husband|🌙|After — holding each other, calm, close
soft-for-her|Undressed for her|couple|playful|wife,husband|🖤|He is nude for her gaze — her desire in frame
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
  const [inputs, setInputs] = useState<{ role: string; url: string }[]>([]);
  const [results, setResults] = useState<{ prompt: string; url: string }[]>([]);

  useEffect(() => {
    load();
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

    const { data: people } = await supabase.from("people").select("*").eq("studio_id", sid);
    const next: { role: string; url: string }[] = [];
    for (const person of people || []) {
      if (!person.photo_path) continue;
      const { data: signed } = await supabase.storage
        .from("people")
        .createSignedUrl(person.photo_path, 60 * 60);
      if (signed?.signedUrl) next.push({ role: person.role, url: signed.signedUrl });
    }
    setInputs(next);

    const { data: gens } = await supabase
      .from("generations")
      .select("prompt,result_url")
      .eq("studio_id", sid)
      .not("result_url", "is", null)
      .order("created_at", { ascending: false });
    setResults(
      (gens || [])
        .filter((g: any) => g.result_url)
        .map((g: any) => ({ prompt: g.prompt || "", url: g.result_url }))
    );
  }

  function picsFor(name: string) {
    const needle = name.toLowerCase();
    return results.filter((r) => r.prompt.toLowerCase().includes(needle)).slice(0, 4);
  }

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
                : "bg-white border border-[var(--line)] text-[var(--text)]"
            )}
          >
            {SECTIONS[m].label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {templates.map((tpl) => {
          const needed = tpl.prefer
            .map((role) => inputs.find((i) => i.role === role))
            .filter(Boolean) as { role: string; url: string }[];
          const pics = picsFor(tpl.name);

          return (
            <div key={tpl.id} className="card p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <h2
                  className="text-2xl leading-tight"
                  style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
                >
                  {tpl.name}
                </h2>
                <Link
                  href={`/create?scene=${tpl.id}&cast=${tpl.prefer.join(",")}`}
                  className="btn btn-primary shrink-0 text-sm"
                >
                  Try scene
                </Link>
              </div>
              <p className="text-sm text-[var(--muted)] mb-4">{tpl.desc}</p>

              <div className="flex gap-3 items-start">
                <div className="flex flex-col gap-2 shrink-0">
                  {needed.length === 0 ? (
                    <Link href="/people" className="text-xs underline">
                      Add faces
                    </Link>
                  ) : (
                    needed.map((face) => (
                      <div key={face.role} className="relative w-24 h-32 rounded-xl overflow-hidden">
                        <img src={face.url} alt="" className="w-full h-full object-cover object-top" />
                        <span className="absolute bottom-1 left-1 text-[10px] bg-black/50 text-white px-1.5 py-0.5 rounded-full">
                          input
                        </span>
                      </div>
                    ))
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 w-[240px] shrink-0">
                  {[0, 1, 2, 3].map((n) => (
                    <div key={n} className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gradient-to-br from-[#3A1F24] to-[#7A3E48]">
                      {pics[n] ? (
                        <img src={pics[n].url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/25 text-[10px]">
                          result
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}