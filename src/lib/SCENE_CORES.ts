/**
 * Scene prompt module — production rewrite
 *
 * Short cores. Assembly adds people, location, title, focus, realism.
 * getSceneNegative() is the API negative prompt.
 * scenePeople() tells the app how many reference photos to attach.
 */

export type PersonCount = 1 | 2 | 3;
export type SceneLocation = "bed" | "shower" | "outdoor" | "studio" | "keep";

export type SceneSpec = {
  people: PersonCount;
  location: SceneLocation;
  core: string;
  focus?: string;
  negativeExtra?: string;
  needsOutfitRef?: boolean;
};

export const SCENE_SPECS: Record<string, SceneSpec> = {
  "romance-undress": { people: 1, location: "keep", core: `Solo adult woman {p1}. Same pose and room as the reference. Clothes removed, fully nude. No other person.`, focus: `One subject only. Face and body match the reference, age-true skin.`, negativeExtra: `second person, man behind her, couple pose, group shot, extra hands` },
  "romance-naked-together": { people: 2, location: "bed", core: `Two adults {p1} and {p2} on a bed. Full explicit sex: erect penis inside her vagina, junction visible.`, focus: `Sharp vaginal junction. Faces readable.` },
  "romance-kiss": { people: 2, location: "bed", core: `Two adults {p1} and {p2} on a bed. Doggy: she on all fours, he behind, penis inside her vagina, junction visible.`, focus: `Sharp vaginal junction. Faces readable.` },
  "romance-shower": { people: 2, location: "shower", core: `Two adults {p1} and {p2} in a steamy shower. Nude couple, wet skin, mirror selfie allowed. Penis, breasts, vulva visible.`, focus: `Faces sharp. Real skin. Act matches the title.` },
  "romance-morning": { people: 2, location: "bed", core: `Two adults {p1} and {p2} in bed under white sheets. Tender smiles, eye contact, not mid-sex.`, focus: `Faces sharp. Real skin. Act matches the title.`, negativeExtra: `mid-thrust, explicit penetration as the main subject` },
  "romance-massage": { people: 1, location: "keep", core: `Solo adult woman {p1}. Same pose and room as the reference. Fully nude. No other person.`, focus: `One subject only. Face and body match the reference, age-true skin.`, negativeExtra: `second person, man behind her, couple pose, group shot, extra hands` },
  "zen-undress-v3": { people: 1, location: "studio", core: `Solo adult woman {p1} fully nude on studio cube or stool. Same seated pose. No other person.`, focus: `One subject only. Face and body match the reference, age-true skin.` },
  "zen-shower-pose": { people: 1, location: "shower", core: `Solo adult woman {p1} kneeling in a shower, looking up, wet, nude or soaked lingerie. No other person.`, focus: `One subject only. Face and body match the reference, age-true skin.` },
  "zen-low-angle": { people: 1, location: "keep", core: `Solo adult woman {p1}, same room, extreme low angle looking up her nude body. No other person.`, focus: `One subject only. Face and body match the reference, age-true skin.` },
  "zen-larger-hips": { people: 1, location: "keep", core: `Solo adult woman {p1}, same face and pose. Fuller natural hips and larger natural breasts. Still her. No other person.`, focus: `One subject only. Face and body match the reference, age-true skin.` },
  "zen-foam-shower": { people: 1, location: "shower", core: `Solo adult woman {p1} in the shower, foam and water, nude, playful smile. No other person.`, focus: `One subject only. Face and body match the reference, age-true skin.` },
  "zen-carpet-kneel": { people: 1, location: "bed", core: `Solo adult woman {p1} kneeling nude at the foot of a bed. Warm lamps. No other person.`, focus: `One subject only. Face and body match the reference, age-true skin.` },
  "zen-bedroom-v": { people: 1, location: "bed", core: `Solo adult woman {p1} sitting nude on a bed, legs in a V, vulva visible. No other person.`, focus: `One subject only. Face and body match the reference, age-true skin.` },
  "zen-bed-selfie": { people: 1, location: "bed", core: `Solo adult woman {p1} on a white bed, phone in hand, legs spread, nude, vulva visible. No other person.`, focus: `One subject only. Face and body match the reference, age-true skin.` },
  "zen-bare-pussy": { people: 1, location: "bed", core: `Solo adult woman {p1} on a bed, legs open, realistic vulva clear. Keep glasses if the reference has them. No other person.`, focus: `One subject only. Face and body match the reference, age-true skin.` },
  "zen-spread-jewel": { people: 1, location: "bed", core: `Solo adult woman {p1} on a bed or rug, legs wide, hands framing vulva. Optional jewel anal plug. No other person.`, focus: `One subject only. Face and body match the reference, age-true skin.` },
  "zen-spread-pussy": { people: 1, location: "bed", core: `Solo adult woman {p1} on a bed spreading her vulva with her fingers, looking at camera. No other person.`, focus: `One subject only. Face and body match the reference, age-true skin.` },
  "zen-nude-body": { people: 1, location: "bed", core: `Solo adult woman {p1} full-body nude portrait beside or on a bed. Natural breasts and vulva. No other person.`, focus: `One subject only. Face and body match the reference, age-true skin.` },
  "erotic-masturbation": { people: 1, location: "bed", core: `Solo adult woman {p1} on a bed touching her vulva, looking at camera, aroused. No other person.`, focus: `One subject only. Face and body match the reference, age-true skin.` },
  "erotic-lovemaking": { people: 2, location: "bed", core: `Two adults {p1} and {p2} on a bed. Missionary. Penis inside her vagina, junction visible.`, focus: `Sharp vaginal junction. Faces readable.` },
  "erotic-one-night": { people: 2, location: "bed", core: `Two adults {p1} and {p2} on a bed. Legs spread. POV from his hips, penis inside her vagina. Her face toward camera.`, focus: `Sharp vaginal junction. Faces readable.` },
  "erotic-doggy": { people: 2, location: "bed", core: `Two adults {p1} and {p2} on a bed. Doggy. Penis inside her vagina from behind, entry visible.`, focus: `Sharp vaginal junction. Faces readable.` },
  "erotic-missionary": { people: 2, location: "bed", core: `Two adults {p1} and {p2} on a bed. Folded missionary, knees to chest. Penis inside her vagina, junction sharp.`, focus: `Sharp vaginal junction. Faces readable.` },
  "erotic-oral-her": { people: 2, location: "bed", core: `Cunnilingus only. Two adults {p1} and {p2} on a bed. His mouth on her vulva. No penile penetration.`, focus: `Sharp mouth and shaft. Realistic saliva, not cartoon goo.`, negativeExtra: `fellatio, vaginal penetration` },
  "erotic-oral-him": { people: 2, location: "bed", core: `Fellatio only. Two adults {p1} and {p2} on a bed. His erect penis in her mouth. No vaginal sex.`, focus: `Sharp mouth and shaft. Realistic saliva, not cartoon goo.`, negativeExtra: `vaginal penetration, cunnilingus` },
  "erotic-cowgirl": { people: 2, location: "bed", core: `Two adults {p1} and {p2} on a bed. Cowgirl. She faces camera, penis inside her vagina.`, focus: `Sharp vaginal junction. Faces readable.` },
  "erotic-wall": { people: 2, location: "outdoor", core: `Two adults {p1} and {p2}. Standing sex against a wall, one leg up. Penis inside her vagina.`, focus: `Sharp vaginal junction. Faces readable.` },
  "zen-floor-spread": { people: 2, location: "bed", core: `Two adults {p1} and {p2}. She on a wood floor, legs spread. POV, penis inside her vagina.`, focus: `Sharp vaginal junction. Faces readable.` },
  "zen-pov-handjob": { people: 2, location: "outdoor", core: `Two adults {p1} and {p2} outdoors by a car. She topless, both hands on his erect penis, POV looking down.`, focus: `Faces sharp. Real skin. Act matches the title.` },
  "zen-hungry": { people: 2, location: "bed", core: `Two adults {p1} and {p2} on a bed. She looks up, mouth near his erect penis, about to take it.`, focus: `Sharp mouth and shaft. Realistic saliva, not cartoon goo.`, negativeExtra: `vaginal penetration, cunnilingus` },
  "zen-deepthroat-close": { people: 2, location: "bed", core: `Two adults {p1} and {p2} on a bed. Close-up fellatio, penis deep in her mouth, hollowed cheeks.`, focus: `Sharp mouth and shaft. Realistic saliva, not cartoon goo.`, negativeExtra: `vaginal penetration, cunnilingus` },
  "zen-intense-oral": { people: 2, location: "bed", core: `Two adults {p1} and {p2} on a bed. Side close-up, her mouth stretched around his erect penis.`, focus: `Sharp mouth and shaft. Realistic saliva, not cartoon goo.`, negativeExtra: `vaginal penetration, cunnilingus` },
  "zen-drooling": { people: 2, location: "bed", core: `Two adults {p1} and {p2} on a bed. Deepthroat with thick realistic saliva on chin and shaft.`, focus: `Sharp mouth and shaft. Realistic saliva, not cartoon goo.`, negativeExtra: `vaginal penetration, cunnilingus` },
  "zen-face-hold": { people: 2, location: "bed", core: `Two adults {p1} and {p2} on a bed. His hands in her hair, penis in her mouth, eye contact.`, focus: `Sharp mouth and shaft. Realistic saliva, not cartoon goo.`, negativeExtra: `vaginal penetration, cunnilingus` },
  "zen-squat-dt": { people: 2, location: "bed", core: `Two adults {p1} and {p2}. Overhead: she squats, penis in her mouth, looking up.`, focus: `Sharp mouth and shaft. Realistic saliva, not cartoon goo.`, negativeExtra: `vaginal penetration, cunnilingus` },
  "zen-blonde-devotion": { people: 2, location: "bed", core: `Two adults {p1} and {p2} on a bed. Extreme close-up, penis in her mouth, she looks into camera.`, focus: `Sharp mouth and shaft. Realistic saliva, not cartoon goo.`, negativeExtra: `vaginal penetration, cunnilingus` },
  "zen-golden-oral": { people: 2, location: "outdoor", core: `Two adults {p1} and {p2} at golden hour on a rooftop or balcony. Her tongue on his erect penis.`, focus: `Sharp mouth and shaft. Realistic saliva, not cartoon goo.`, negativeExtra: `vaginal penetration, cunnilingus` },
  "zen-sultry-oral": { people: 2, location: "bed", core: `Two adults {p1} and {p2} on a bed. Close oral, heavy eye contact, penis in her mouth.`, focus: `Sharp mouth and shaft. Realistic saliva, not cartoon goo.`, negativeExtra: `vaginal penetration, cunnilingus` },
  "zen-parking-bj": { people: 2, location: "outdoor", core: `Two adults {p1} and {p2} at night beside a car. She on her knees, penis in her mouth.`, focus: `Sharp mouth and shaft. Realistic saliva, not cartoon goo.`, negativeExtra: `vaginal penetration, cunnilingus` },
  "zen-pov-anal": { people: 2, location: "bed", core: `POV anal doggy only. Two adults {p1} and {p2} on a bed. Penis inside her anus, not vagina. She looks back.`, focus: `Sharp anal junction. Faces readable.`, negativeExtra: `vaginal penetration as the main act, oral` },
  "zen-anal-bath": { people: 2, location: "shower", core: `Anal bathroom POV only. Two adults {p1} and {p2} in a tiled bathroom. Penis inside her anus from behind.`, focus: `Sharp anal junction. Faces readable.`, negativeExtra: `vaginal penetration as the main act, oral` },
  "spicy-anal": { people: 2, location: "bed", core: `Anal only. Two adults {p1} and {p2} on a bed. Penis inside her anus, junction visible. Not vagina.`, focus: `Sharp anal junction. Faces readable.`, negativeExtra: `vaginal penetration as the main act, oral` },
  "spicy-creampie": { people: 2, location: "bed", core: `Creampie aftermath. Two adults {p1} and {p2} on a bed. Semen leaking from her vagina onto labia and thighs.`, focus: `Realistic semen texture, not paint or cartoon.` },
  "zen-cum-face": { people: 2, location: "bed", core: `Facial only. Two adults {p1} and {p2} on a bed. Semen on her face; penis near her face.`, focus: `Realistic semen texture, not paint or cartoon.` },
  "zen-face-full": { people: 2, location: "bed", core: `Two adults {p1} and {p2} on a bed. Heavy facial, semen on face and tongue, penis at her lips.`, focus: `Realistic semen texture, not paint or cartoon.` },
  "zen-cum-tits": { people: 2, location: "bed", core: `Two adults {p1} and {p2} on a bed. Semen on her breasts and chest.`, focus: `Realistic semen texture, not paint or cartoon.` },
  "zen-cum-beauty": { people: 1, location: "bed", core: `Solo adult woman {p1} kneeling in a bathroom. Semen on face, hair and chest, white lingerie. No other person.`, focus: `Realistic semen texture, not paint or cartoon.` },
  "zen-glory": { people: 1, location: "bed", core: `Solo adult woman {p1} plus one anonymous penis through a glory hole. She kneels, penis in her mouth. No second face.`, focus: `Sharp mouth and shaft. Realistic saliva, not cartoon goo.`, negativeExtra: `vaginal penetration, cunnilingus` },
  "zen-spread-open": { people: 2, location: "bed", core: `Two adults {p1} and {p2} on a bed. Legs held wide, penis inside her vagina, junction close, mouth open.`, focus: `Sharp vaginal junction. Faces readable.` },
  "spicy-bbc": { people: 2, location: "bed", core: `Two adults {p1} and {p2} on a bed. Dark-skinned man, large penis inside her vagina. No extra people.`, focus: `Sharp vaginal junction. Faces readable.` },
  "spicy-dp": { people: 3, location: "bed", core: `Three adults {p1} {p2} {p3} on a bed. Double penetration: one penis in vagina, one in anus. Two penises only.`, focus: `Faces sharp. Real skin. Act matches the title.`, negativeExtra: `extra penis, three penises, fused bodies, extra limbs` },
  "spicy-spitroast": { people: 3, location: "bed", core: `Three adults {p1} {p2} {p3} on a bed. One penis in her mouth, one in her vagina. Two penises only.`, focus: `Faces sharp. Real skin. Act matches the title.`, negativeExtra: `extra penis, three penises, fused bodies, extra limbs` },
  "spicy-cuckold": { people: 3, location: "bed", core: `Three adults {p1}, lover {p2}, husband {p3} watching from a seat. On a bed. Only the lover is inside her.`, focus: `Faces sharp. Real skin. Act matches the title.` },
  "spicy-mmf": { people: 3, location: "bed", core: `Three adults {p1} {p2} {p3} on a bed. Two men, one woman. Two penises only, no extras, bodies not fused.`, focus: `Faces sharp. Real skin. Act matches the title.`, negativeExtra: `extra penis, three penises, fused bodies, extra limbs` },
  "spicy-ffm": { people: 3, location: "bed", core: `Three adults man {p1}, women {p2} {p3} on a bed. Women kiss. Exactly one penis, attached only to the man.`, focus: `Faces sharp. Real skin. Act matches the title.` },
  "zen-collar-three": { people: 3, location: "bed", core: `Three adults: collared woman {p1}, men {p2} {p3} on a bed. Two penises only.`, focus: `Faces sharp. Real skin. Act matches the title.` },
  "zen-double-facial": { people: 3, location: "bed", core: `Three adults {p1} {p2} {p3} on a bed. She kneels between them, semen on her face. Two penises only.`, focus: `Faces sharp. Real skin. Act matches the title.` },
  "zen-cocks-around": { people: 3, location: "bed", core: `Three adults {p1} {p2} {p3} on a bed. Two men only, two penises only. She faces camera.`, focus: `Faces sharp. Real skin. Act matches the title.` },
  "zen-dominatrix": { people: 1, location: "studio", core: `Solo adult woman {p1}. Dominatrix portrait, leather or latex. No other person.`, focus: `One subject only. Face and body match the reference, age-true skin.` },
  "zen-fierce-dom": { people: 1, location: "studio", core: `Solo adult woman {p1}. Fierce dominatrix pose, dark wardrobe or nude with boots. No other person.`, focus: `One subject only. Face and body match the reference, age-true skin.` },
  "zen-pink-light": { people: 2, location: "bed", core: `Two adults {p1} and {p2} on a bed under pink gel light. Penis inside her vagina.`, focus: `Sharp vaginal junction. Faces readable.` },
  "zen-combining": { people: 2, location: "bed", core: `Two adults {p1} and {p2} on a bed. Combine both references into one couple. Penis inside her vagina. Correct bodies, no face swap.`, focus: `Sharp vaginal junction. Faces readable.` },
  "zen-flashing-tits": { people: 1, location: "outdoor", core: `Solo adult woman {p1} outdoors flashing bare breasts, playful smile. No other person.`, focus: `One subject only. Face and body match the reference, age-true skin.` },
  "zen-elegant-bar": { people: 1, location: "studio", core: `Solo adult woman {p1} in an upscale bar, fitted dress, fashion pose. No other person.`, focus: `One subject only. Face and body match the reference, age-true skin.` },
  "zen-instapic-selfie": { people: 1, location: "bed", core: `Solo adult woman {p1} bedroom mirror selfie, phone in hand, casual top. No other person.`, focus: `One subject only. Face and body match the reference, age-true skin.` },
  "zen-heart-hands": { people: 1, location: "bed", core: `Solo adult woman {p1} making a heart with both hands, refined dress. No other person.`, focus: `One subject only. Face and body match the reference, age-true skin.` },
  "zen-soft-portrait": { people: 1, location: "studio", core: `Solo adult woman {p1} tight beauty portrait, shoulders visible. No other person.`, focus: `Skin texture and catchlights on the face.` },
  "zen-50s-noir": { people: 1, location: "studio", core: `Solo adult woman {p1}. 1950s black-and-white noir still, tailored coat or dress. No other person.`, focus: `One subject only. Face and body match the reference, age-true skin.` },
  "zen-purple-grainy": { people: 1, location: "studio", core: `Solo adult woman {p1} purple grade, grain, long coat, hallway. No other person.`, focus: `One subject only. Face and body match the reference, age-true skin.` },
  "zen-exposed-street": { people: 1, location: "outdoor", core: `Solo adult woman {p1} night street, topless or sheer, bare breasts. No bystanders. No other person.`, focus: `One subject only. Face and body match the reference, age-true skin.` },
  "zen-grass-nude": { people: 1, location: "outdoor", core: `Solo adult woman {p1} sitting nude in sunny grass, vulva visible. No other person.`, focus: `One subject only. Face and body match the reference, age-true skin.` },
  "zen-used-condoms": { people: 1, location: "bed", core: `Solo adult woman {p1} on a bed holding a used condom near her face, nude or topless. No other person.`, focus: `One subject only. Face and body match the reference, age-true skin.` },
  "zen-black-dildo-ride": { people: 1, location: "bed", core: `Solo adult woman {p1} on a bed riding a black dildo, clear penetration. No other person.`, focus: `One subject only. Face and body match the reference, age-true skin.` },
  "zen-thong-anus": { people: 1, location: "bed", core: `Solo adult woman {p1} on a bed, rear view, thong pulled aside, anus visible. No other person.`, focus: `One subject only. Face and body match the reference, age-true skin.` },
  "zen-cum-selfie": { people: 1, location: "bed", core: `Solo adult woman {p1} close selfie, semen on cheeks and lips. No other person.`, focus: `Realistic semen texture, not paint or cartoon.` },
  "zen-member-near-face": { people: 2, location: "bed", core: `Two adults {p1} and {p2} on a bed. His erect penis next to her face; she looks at camera.`, focus: `Faces sharp. Real skin. Act matches the title.` },
  "zen-cum-on-clothes": { people: 2, location: "bed", core: `Two adults {p1} and {p2} on a bed. White lingerie with fresh semen on the fabric; penis nearby.`, focus: `Realistic semen texture, not paint or cartoon.` },
  "zen-penis-against-face": { people: 2, location: "bed", core: `Two adults {p1} and {p2} on a bed. His erect penis pressed to her cheek and lips.`, focus: `Faces sharp. Real skin. Act matches the title.` },
  "zen-armpit-job": { people: 2, location: "outdoor", core: `Two adults {p1} and {p2} standing close. Penis held under her arm against her side.`, focus: `Faces sharp. Real skin. Act matches the title.` },
  "zen-dildo-insertion": { people: 1, location: "bed", core: `Solo adult woman {p1} on a bed inserting a realistic dildo into her vagina. No other person.`, focus: `One subject only. Face and body match the reference, age-true skin.` },
  "zen-pov-impregnation": { people: 2, location: "bed", core: `Two adults {p1} and {p2} on a bed. POV missionary, penis deep in her vagina.`, focus: `Sharp vaginal junction. Faces readable.` },
  "zen-reverse-cowgirl-anal": { people: 2, location: "bed", core: `Two adults {p1} and {p2} on a bed. Reverse cowgirl, penis in her anus, junction clear.`, focus: `Sharp anal junction. Faces readable.`, negativeExtra: `vaginal penetration as the main act, oral` },
  "zen-anal-frontal": { people: 2, location: "bed", core: `Two adults {p1} and {p2} on a bed or couch. Doggy anal, she looks back, penis in her anus.`, focus: `Sharp anal junction. Faces readable.`, negativeExtra: `vaginal penetration as the main act, oral` },
  "zen-cowgirl-anal-bbc": { people: 2, location: "bed", core: `Two adults {p1} and {p2} on a bed. Cowgirl anal, large dark penis in her anus.`, focus: `Sharp anal junction. Faces readable.`, negativeExtra: `vaginal penetration as the main act, oral` },
  "zen-doggystyle-double": { people: 3, location: "bed", core: `Three adults {p1} {p2} {p3} on a bed. Doggy DP: penis in vagina and anus. Two penises only.`, focus: `Faces sharp. Real skin. Act matches the title.`, negativeExtra: `extra penis, three penises, fused bodies, extra limbs` },
  "zen-mounted-deepthroat": { people: 2, location: "bed", core: `Two adults {p1} and {p2} on a bed. She on her back, head toward lens, penis deep in her mouth.`, focus: `Sharp mouth and shaft. Realistic saliva, not cartoon goo.`, negativeExtra: `vaginal penetration, cunnilingus` },
  "zen-cheekbulge-tongue": { people: 2, location: "bed", core: `Two adults {p1} and {p2} on a bed. Close oral, cheek bulge, tongue on the shaft.`, focus: `Sharp mouth and shaft. Realistic saliva, not cartoon goo.`, negativeExtra: `vaginal penetration, cunnilingus` },
  "zen-two-dicks-mouth": { people: 3, location: "bed", core: `Three adults {p1} {p2} {p3} on a bed. Two erect penises at her mouth. Two penises only.`, focus: `Sharp mouth and shaft. Realistic saliva, not cartoon goo.`, negativeExtra: `vaginal penetration, cunnilingus, extra penis, three penises, fused bodies, extra limbs` },
  "zen-sloppy-v2": { people: 2, location: "bed", core: `Two adults {p1} and {p2} on a bed. Messy oral, heavy saliva, watery eyes.`, focus: `Sharp mouth and shaft. Realistic saliva, not cartoon goo.`, negativeExtra: `vaginal penetration, cunnilingus` },
  "zen-rope-bound-corset": { people: 1, location: "bed", core: `Solo adult woman {p1} in rope bondage over a bra or corset. No other person.`, focus: `One subject only. Face and body match the reference, age-true skin.` },
  "zen-harness-ballgag": { people: 1, location: "bed", core: `Solo adult woman {p1} close portrait, leather head harness and ball gag. No other person.`, focus: `One subject only. Face and body match the reference, age-true skin.` },
  "zen-tape-bound": { people: 1, location: "bed", core: `Solo adult woman {p1} seated, red bondage tape on torso, arms, legs. No other person.`, focus: `One subject only. Face and body match the reference, age-true skin.` },
  "zen-breast-rope": { people: 1, location: "bed", core: `Solo adult woman {p1} shibari chest harness, bare breasts framed. No other person.`, focus: `One subject only. Face and body match the reference, age-true skin.` },
  "zen-dental-gag": { people: 2, location: "bed", core: `Two adults {p1} and {p2} on a bed. Metal dental gag, penis at her open mouth.`, focus: `Sharp mouth and shaft. Realistic saliva, not cartoon goo.`, negativeExtra: `vaginal penetration, cunnilingus` },
  "zen-ponytail-grab": { people: 2, location: "bed", core: `Two adults {p1} and {p2} on a bed. Side oral, he grips her ponytail, penis in her mouth.`, focus: `Sharp mouth and shaft. Realistic saliva, not cartoon goo.`, negativeExtra: `vaginal penetration, cunnilingus` },
  "zen-pigtail-handles": { people: 2, location: "bed", core: `Two adults {p1} and {p2} on a bed. POV oral, he holds her pigtails, penis in her mouth.`, focus: `Sharp mouth and shaft. Realistic saliva, not cartoon goo.`, negativeExtra: `vaginal penetration, cunnilingus` },
  "zen-oral-cum-strings": { people: 2, location: "bed", core: `Two adults {p1} and {p2} on a bed. After climax, semen strings from glans to her tongue.`, focus: `Sharp mouth and shaft. Realistic saliva, not cartoon goo.`, negativeExtra: `vaginal penetration, cunnilingus` },
  "zen-finger-on-mouth": { people: 1, location: "bed", core: `Solo adult woman {p1} in a black dress, one finger on her lips. No other person.`, focus: `One subject only. Face and body match the reference, age-true skin.` },
  "zen-licking-lips": { people: 1, location: "bed", core: `Solo adult woman {p1} close portrait, tongue on lips, semen on mouth. No other person.`, focus: `Realistic semen texture, not paint or cartoon.` },
  "zen-rural-sheer": { people: 1, location: "outdoor", core: `Solo adult woman {p1} countryside, sheer black outfit, breasts visible through fabric. No other person.`, focus: `One subject only. Face and body match the reference, age-true skin.` },
  "zen-semen-bucket": { people: 1, location: "outdoor", core: `Solo adult woman {p1} kneeling nude in a barn beside a metal bucket. No other person.`, focus: `One subject only. Face and body match the reference, age-true skin.` },
  "zen-pussy-cover-selfie": { people: 1, location: "bed", core: `Solo adult woman {p1} bedroom mirror selfie, nude, one hand covering vulva. No other person.`, focus: `One subject only. Face and body match the reference, age-true skin.` },
  "zen-blindfolded": { people: 1, location: "bed", core: `Solo adult woman {p1} seated, black blindfold, topless. No other person.`, focus: `One subject only. Face and body match the reference, age-true skin.` },
  "zen-strapon": { people: 1, location: "bed", core: `Solo adult woman {p1} standing in lingerie with a realistic strap-on. No other person.`, focus: `One subject only. Face and body match the reference, age-true skin.` },
  "zen-chair-naked": { people: 1, location: "bed", core: `Solo adult woman {p1} sitting nude in an armchair, arms behind head. No other person.`, focus: `One subject only. Face and body match the reference, age-true skin.` },
  "zen-cum-flooded": { people: 1, location: "bed", core: `Solo adult woman {p1} seated facing camera, semen overflowing her vulva. No other person.`, focus: `Realistic semen texture, not paint or cartoon.` },
  "zen-tied-belts": { people: 1, location: "outdoor", core: `Solo adult woman {p1} outdoors, leather belts as a harness, breasts exposed. No other person.`, focus: `One subject only. Face and body match the reference, age-true skin.` },
  "zen-park-facial": { people: 1, location: "outdoor", core: `Solo adult woman {p1} night park, semen on face and hair. No other person.`, focus: `Realistic semen texture, not paint or cartoon.` },
  "zen-train-pussy": { people: 1, location: "outdoor", core: `Solo adult woman {p1} on a train, blazer, no underwear, vulva visible, empty seats. No other person.`, focus: `One subject only. Face and body match the reference, age-true skin.` },
  "zen-red-panties": { people: 1, location: "bed", core: `Solo adult woman {p1} hallway, topless, only red panties. No other person.`, focus: `One subject only. Face and body match the reference, age-true skin.` },
  "zen-outdoor-chair": { people: 1, location: "outdoor", core: `Solo adult woman {p1} on an outdoor wicker chair, sheer lingerie, legs open. No other person.`, focus: `One subject only. Face and body match the reference, age-true skin.` },
  "zen-ruined-makeup": { people: 1, location: "bed", core: `Solo adult woman {p1} close selfie, running mascara, after-sex stare. No other person.`, focus: `One subject only. Face and body match the reference, age-true skin.` },
  "zen-knees-in-cum": { people: 1, location: "outdoor", core: `Solo adult woman {p1} kneeling in a garden, semen on breasts and face. No other person.`, focus: `Realistic semen texture, not paint or cartoon.` },
  "zen-cum-on-ass": { people: 1, location: "bed", core: `Solo adult woman {p1} on a bed looking back, semen on ass and lower back. No other person.`, focus: `Realistic semen texture, not paint or cartoon.` },
  "zen-nude-mirror-selfie": { people: 1, location: "bed", core: `Solo adult woman {p1} bedroom mirror, fully nude, phone on a tripod. No other person.`, focus: `One subject only. Face and body match the reference, age-true skin.` },
  "zen-reading-masturbation": { people: 1, location: "bed", core: `Solo adult woman {p1} in a chair reading a book while touching her vulva. No other person.`, focus: `One subject only. Face and body match the reference, age-true skin.` },
  "zen-candid-vagina-selfie": { people: 1, location: "bed", core: `Solo adult woman {p1} on a bed or sofa, nude selfie, legs open, vulva visible. No other person.`, focus: `One subject only. Face and body match the reference, age-true skin.` },
  "zen-silent-desire": { people: 1, location: "bed", core: `Solo adult woman {p1} tight beauty close-up, lips parted. No other person.`, focus: `Skin texture and catchlights on the face.` },
  "zen-backdoor-aesthetic": { people: 1, location: "bed", core: `Solo adult woman {p1} on a bed, prone rear view, buttocks and anus visible. No other person.`, focus: `One subject only. Face and body match the reference, age-true skin.` },
  "zen-bare-composition": { people: 1, location: "bed", core: `Solo adult woman {p1} nude in an armchair, arms raised, fine-art pose. No other person.`, focus: `One subject only. Face and body match the reference, age-true skin.` },
  "zen-restroom-oral": { people: 2, location: "outdoor", core: `Two adults {p1} and {p2} in a public restroom. She kneels, penis in her mouth, jeans open.`, focus: `Sharp mouth and shaft. Realistic saliva, not cartoon goo.`, negativeExtra: `vaginal penetration, cunnilingus` },
  "zen-anal-plug-spread": { people: 1, location: "bed", core: `Solo adult woman {p1} on a bed, legs spread, jewel anal plug, vulva visible. No other person.`, focus: `One subject only. Face and body match the reference, age-true skin.` },
  "zen-kilt-skirt-sex": { people: 2, location: "bed", core: `Two adults {p1} and {p2} on a bed. Tartan kilt, topless, penis inside her vagina.`, focus: `Sharp vaginal junction. Faces readable.` },
  "zen-bathtub-selfie": { people: 1, location: "shower", core: `Solo adult woman {p1} nude in a white bathtub, phone selfie. No other person.`, focus: `One subject only. Face and body match the reference, age-true skin.` },
  "zen-waterfall-nude": { people: 1, location: "outdoor", core: `Solo adult woman {p1} nude under a jungle waterfall. No other person.`, focus: `One subject only. Face and body match the reference, age-true skin.` },
  "zen-x-cross": { people: 1, location: "bed", core: `Solo adult woman {p1} bound on a wooden X-cross, ball gag, breasts exposed. No other person.`, focus: `One subject only. Face and body match the reference, age-true skin.` },
  "zen-cowgirl-blindfold": { people: 2, location: "bed", core: `Two adults {p1} and {p2} on a bed or sofa. Blindfolded cowgirl, penis in her vagina.`, focus: `Sharp vaginal junction. Faces readable.` },
  "zen-floor-bound": { people: 1, location: "bed", core: `Solo adult woman {p1} hogtied with rope on a living-room floor. No other person.`, focus: `One subject only. Face and body match the reference, age-true skin.` },
  "zen-horseback-anal": { people: 2, location: "bed", core: `Two adults {p1} and {p2} on a bed. Reverse-cowgirl anal, her back to camera, penis in anus.`, focus: `Sharp anal junction. Faces readable.`, negativeExtra: `vaginal penetration as the main act, oral` },
  "zen-pussy-caress": { people: 1, location: "bed", core: `Solo adult woman {p1} on a bed or sofa, open shirt, hand on her vulva. No other person.`, focus: `One subject only. Face and body match the reference, age-true skin.` },
  "zen-shibari-oral-pov": { people: 2, location: "bed", core: `Two adults {p1} and {p2} on a bed. Pink shibari on her, POV, penis in her mouth.`, focus: `Sharp mouth and shaft. Realistic saliva, not cartoon goo.`, negativeExtra: `vaginal penetration, cunnilingus` },
  "zen-ahegao": { people: 1, location: "outdoor", core: `Solo adult woman {p1} kneeling on a city street, ahegao expression. No other person.`, focus: `One subject only. Face and body match the reference, age-true skin.` },
  "soft-eye-contact": { people: 2, location: "bed", core: `Two adults {p1} and {p2} in bed. Soft morning light, eye contact, tender, not mid-sex.`, focus: `Faces sharp. Real skin. Act matches the title.`, negativeExtra: `mid-thrust, explicit penetration as the main subject` },
  "soft-shower-laugh": { people: 2, location: "shower", core: `Two adults {p1} and {p2} in a steamy shower, laughing, nude, arms around each other.`, focus: `Faces sharp. Real skin. Act matches the title.` },
  "soft-slow-undress": { people: 2, location: "bed", core: `Two adults {p1} and {p2} in a bedroom dusk. They undress each other slowly. Not mid-sex.`, focus: `Faces sharp. Real skin. Act matches the title.`, negativeExtra: `mid-thrust, explicit penetration as the main subject` },
  "soft-her-choice": { people: 2, location: "bed", core: `Two adults {p1} and {p2} on a bed. She rides him, in control, penis inside her vagina.`, focus: `Sharp vaginal junction. Faces readable.` },
  "soft-aftercare": { people: 2, location: "bed", core: `Two adults {p1} and {p2} holding each other in bed after sex. Calm, no mid-act.`, focus: `Faces sharp. Real skin. Act matches the title.`, negativeExtra: `mid-thrust, explicit penetration as the main subject` },
  "soft-for-her": { people: 2, location: "bed", core: `Two adults {p1} and {p2}. Frame centres her gaze; his nude body is offered to her.`, focus: `Faces sharp. Real skin. Act matches the title.`, negativeExtra: `mid-thrust, explicit penetration as the main subject` },
  "outfit-try-on": { people: 1, location: "studio", core: `SOLO. One adult only. Wear the EXACT outfit from the outfit reference. Face from the face reference only. No other person. Default: on a bed or clean studio.`, focus: `Sharp face and exact garment: colour, cut, fabric, lace, hardware.`, negativeExtra: `second person, man behind her, couple pose, group shot, extra hands, wrong outfit, different dress, original model face`, needsOutfitRef: true },
  "who-wore-it-best": { people: 1, location: "studio", core: `SOLO. One adult only. Full-body editorial of the chosen person in the EXACT outfit from the outfit reference. Face from the face reference only. No other person. Clean background.`, focus: `Sharp face and exact garment: colour, cut, fabric, lace, hardware.`, negativeExtra: `second person, man behind her, couple pose, group shot, extra hands, wrong outfit, different dress, original model face`, needsOutfitRef: true },
};

export const SCENE_CORES: Record<string, string> = Object.fromEntries(
  Object.entries(SCENE_SPECS).map(([id, spec]) => [id, spec.core])
);

const STYLE =
  "Photoreal camera photograph of real adults. Natural skin texture, visible pores, age-true. Tack-sharp. Not CGI.";

const REALISM =
  "Match each reference as a whole person: face, skull, neck, hands, skin tone, age, wrinkles, pores, belly, hips, breasts or chest, body fat. Size attributes change that same body — do not swap a different body on.";

export const DEFAULT_NEGATIVE =
  "extra people, crowd, bystanders, extra hands, extra limbs, fused bodies, extra penis, floating penis, face swap, wrong identity, plastic skin, poreless face, waxy skin, CGI, doll, mannequin, airbrushed, teen, child, text, watermark";

export const SOLO_NEGATIVE =
  "man in frame, partner, boyfriend, second person, third person, group shot, couple pose, hands on her waist from behind, two faces";

function locationLock(spec: SceneSpec | undefined): string {
  switch (spec?.location) {
    case "shower":
      return " LOCATION: bathroom or shower as required.";
    case "outdoor":
      return " LOCATION: the outdoor or public setting named in the core.";
    case "studio":
      return " LOCATION: clean studio or editorial backdrop.";
    case "keep":
      return " LOCATION: keep the reference room and pose.";
    default:
      return " LOCATION: on a bed in a bedroom or hotel. Not a shower, not wet tile, not a steam mirror selfie.";
  }
}

export function scenePeople(id: string): PersonCount {
  return SCENE_SPECS[id]?.people ?? 2;
}

export function sceneNeedsOutfitRef(id: string): boolean {
  return !!SCENE_SPECS[id]?.needsOutfitRef;
}

export function getSceneNegative(id: string): string {
  const spec = SCENE_SPECS[id];
  const parts = [DEFAULT_NEGATIVE];
  if (!spec || spec.people === 1) parts.push(SOLO_NEGATIVE);
  if (spec?.location !== "shower") parts.push("bathroom takeover, shower couple, steam mirror selfie");
  if (spec?.negativeExtra) parts.push(spec.negativeExtra);
  return parts.join(", ");
}

export function getSceneCore(id: string, sceneName: string, attributes?: string) {
  const spec = SCENE_SPECS[id];
  const core =
    spec?.core ||
    `Photoreal adult scene titled "${sceneName}". Keep the reference people. Do not invent a different act.`;

  const count =
    spec?.people === 1
      ? " PEOPLE: exactly one adult in the frame."
      : spec?.people === 3
        ? " PEOPLE: exactly three adults. No extras."
        : " PEOPLE: exactly two adults.";

  const title = ` TITLE: "${sceneName}".`;
  const act = " ACT: follow the core. Do not swap the act.";
  const focus = spec?.focus ? ` FOCUS: ${spec.focus}` : "";
  const attrs = attributes?.trim() ? ` ATTRIBUTES: ${attributes.trim()}.` : "";

  return `${core}${count}${locationLock(spec)}${act}${title}${focus}${attrs} ${REALISM} ${STYLE}`;
}

export function buildSceneRequest(id: string, sceneName: string, attributes?: string) {
  const people = scenePeople(id);
  return {
    prompt: getSceneCore(id, sceneName, attributes),
    negativePrompt: getSceneNegative(id),
    people,
    maxReferenceImages: people,
    needsOutfitRef: sceneNeedsOutfitRef(id),
  };
}

export type ImageRef = {
  url: string;
  kind?: "person" | "outfit" | "unknown";
};

export type GenerateInput = {
  id: string;
  sceneName: string;
  attributes?: string;
  /** Person photos in slot order: p1, p2, p3 */
  personRefs?: ImageRef[];
  /** Garment photo for outfit-try-on / who-wore-it-best */
  outfitRef?: ImageRef | null;
};

export type GenerateJob = {
  id: string;
  sceneName: string;
  prompt: string;
  negativePrompt: string;
  people: PersonCount;
  /** Person refs only, already sliced to the scene max */
  personRefs: ImageRef[];
  outfitRef: ImageRef | null;
  needsOutfitRef: boolean;
  warnings: string[];
};

/**
 * Final wiring helper.
 * Call this immediately before the generation engine.
 * - slices person refs to scenePeople(id)
 * - keeps outfit refs separate so they cannot be treated as a second person
 * - always returns a negative prompt for the engine negative field
 */
export function prepareGenerateJob(input: GenerateInput): GenerateJob {
  const { id, sceneName, attributes } = input;
  const people = scenePeople(id);
  const needsOutfit = sceneNeedsOutfitRef(id);
  const warnings: string[] = [];

  const incoming = (input.personRefs ?? []).filter(Boolean);
  const personRefs = incoming.slice(0, people);
  if (incoming.length > people) {
    warnings.push(
      `Dropped ${incoming.length - people} extra person ref(s). This scene allows ${people}.`
    );
  }
  if (personRefs.length < people) {
    warnings.push(
      `This scene expects ${people} person ref(s); received ${personRefs.length}.`
    );
  }

  let outfitRef = input.outfitRef ?? null;
  if (needsOutfit && !outfitRef) {
    warnings.push("This scene needs an outfit reference image.");
  }
  if (!needsOutfit && outfitRef) {
    outfitRef = null;
    warnings.push("Outfit ref ignored; this scene is not an outfit scene.");
  }

  return {
    id,
    sceneName,
    prompt: getSceneCore(id, sceneName, attributes),
    negativePrompt: getSceneNegative(id),
    people,
    personRefs,
    outfitRef,
    needsOutfitRef: needsOutfit,
    warnings,
  };
}
