import { MarketingFooter, MarketingNav } from "@/components/marketing/nav";

const FAQ = [
  {
    q: "Is this a deepfake site?",
    a: "No. It’s a private studio for couples who both belong in the scene. We don’t build images of people who aren’t in your account.",
  },
  {
    q: "Do we both have to be there?",
    a: "No. One of you can start. The other can join with an invite. Both of you can delete.",
  },
  {
    q: "Will it actually look like us?",
    a: "That’s the whole product. If the first soft scene doesn’t hold the faces, don’t pay.",
  },
  {
    q: "Is there a public gallery?",
    a: "No.",
  },
  {
    q: "Do you train on our photos?",
    a: "No. We don’t train a public model on your references.",
  },
  {
    q: "Can I delete everything?",
    a: "Yes. Scenes, faces, account.",
  },
  {
    q: "What about video?",
    a: "Short clips, same lock, same privacy. We don’t lead with that until stills are right.",
  },
  {
    q: "Is this for women as well as men?",
    a: "It has to be. If she bounces, there is no couple product.",
  },
  {
    q: "Can I use this for content I post publicly?",
    a: "This is built for personal use. If you ever publish, that’s on you — and it still requires everyone in the frame to have agreed.",
  },
  {
    q: "Why isn’t the homepage explicit?",
    a: "Because the first open shouldn’t feel like a tube site. Intensity is a room you walk into, not the shop window.",
  },
];

export default function AboutPage() {
  return (
    <div >
      <MarketingNav />
      <article className="mx-auto max-w-2xl px-5 py-10 space-y-12">
        <header>
          <h1
            className="text-4xl mb-4" style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            Why this exists
          </h1>
          <div className="text-[var(--oc-cream-muted)] leading-relaxed space-y-4">
            <p>We wanted scenes of us — not a model, not a stranger, not a folder of other people’s fantasies.</p>
            <p>
              The tools that existed were either a girlfriend chatbot or a generator that treated two real people as an afterthought. Faces slipped. Anatomy broke. Privacy was a footnote.
            </p>
            <p>
              The Other Room is a private studio. You come together or you come separately. You make what you’d never commission. Then you close the album.
            </p>
          </div>
        </header>

        <section className="space-y-6">
          {FAQ.map((item) => (
            <div key={item.q}>
              <h2 className="text-lg mb-1">{item.q}</h2>
              <p className="text-sm text-[var(--muted)] leading-relaxed">{item.a}</p>
            </div>
          ))}
        </section>
      </article>
      <MarketingFooter />
    </div>
  );
}
