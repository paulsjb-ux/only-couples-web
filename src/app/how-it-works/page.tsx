import { MarketingFooter, MarketingNav } from "@/components/marketing/nav";

export default function HowItWorksPage() {
  return (
    <div>
      <MarketingNav />
      <article className="mx-auto max-w-2xl px-5 py-10 space-y-10">
        <header>
          <h1
            className="text-4xl mb-4"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            How the studio works
          </h1>
          <p className="text-[var(--muted)] leading-relaxed">
            You bring two faces. We keep them consistent. You decide the scene.
          </p>
        </header>

        <section>
          <h2 className="text-2xl mb-2" style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}>
            Faces
          </h2>
          <p className="text-[var(--muted)] leading-relaxed">
            Upload a few clear photos of each of you. Front-facing, good light, one person per photo. The studio locks identity from those references. That’s the difference between “us” and “someone who sort of looks like us.”
          </p>
        </section>

        <section>
          <h2 className="text-2xl mb-2" style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}>
            Together or apart
          </h2>
          <p className="text-[var(--muted)] leading-relaxed">
            One of you can set up the studio. The other gets an invite. You can generate together, or one of you can make something and save it for later. Both of you can delete.
          </p>
        </section>

        <section>
          <h2 className="text-2xl mb-2" style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}>
            Scenes
          </h2>
          <p className="text-[var(--muted)] leading-relaxed">
            Choose from Playful, After dark, or Explicit — or describe what you want. We hide the most intense rooms until two-person scenes are reliable. We don’t lead with group scenes.
          </p>
        </section>

        <section>
          <h2 className="text-2xl mb-2" style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}>
            Preview, keep, delete
          </h2>
          <p className="text-[var(--muted)] leading-relaxed">
            Nothing is saved until you say so. If a frame is wrong, delete it. If the night is over, the album stays closed.
          </p>
        </section>

        <section>
          <h2 className="text-2xl mb-2" style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}>
            Video
          </h2>
          <p className="text-[var(--muted)] leading-relaxed">
            Stills first. Short clips when the faces hold. Same privacy rules.
          </p>
        </section>

        <section>
          <h2 className="text-2xl mb-2" style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}>
            Share
          </h2>
          <p className="text-[var(--muted)] leading-relaxed">
            There is no public gallery. If you want to send a scene, you send an invite link — not a post.
          </p>
        </section>
      </article>
      <MarketingFooter />
    </div>
  );
}
