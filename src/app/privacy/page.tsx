import { MarketingFooter, MarketingNav } from "@/components/marketing/nav";

export default function PrivacyPage() {
  return (
    <div className="oc-page-dark">
      <MarketingNav />
      <article className="mx-auto max-w-2xl px-5 py-10 space-y-10">
        <header>
          <h1
            className="text-4xl mb-4 oc-serif text-[var(--oc-cream)]"
          >
            Your studio stays yours
          </h1>
          <p className="text-[var(--oc-cream-muted)] leading-relaxed">
            This is an erotic escape for the two of you. It is not a place to make images of anyone who didn’t sit down and join.
          </p>
        </header>

        <section>
          <h2 className="text-2xl mb-2 oc-serif text-[var(--oc-cream)]">
            Photos
          </h2>
          <p className="text-[var(--oc-cream-muted)] leading-relaxed">
            Reference photos stay in your studio. We do not use them to train a public model. We do not put them in a gallery.
          </p>
        </section>

        <section>
          <h2 className="text-2xl mb-2 oc-serif text-[var(--oc-cream)]">
            What we don’t do
          </h2>
          <ul className="text-[var(--oc-cream-muted)] leading-relaxed space-y-1">
            <li>We don’t make images of celebrities.</li>
            <li>We don’t make images of people who aren’t in your studio.</li>
            <li>We don’t promise “undetectable real people.”</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl mb-2 oc-serif text-[var(--oc-cream)]">
            Delete
          </h2>
          <p className="text-[var(--oc-cream-muted)] leading-relaxed">
            Delete a scene, it’s gone.
            <br />
            Delete your account, we wipe storage.
          </p>
        </section>

        <section>
          <h2 className="text-2xl mb-2 oc-serif text-[var(--oc-cream)]">
            Adults
          </h2>
          <p className="text-[var(--oc-cream-muted)] leading-relaxed">
            18+ only. We gate that properly — for you, and for the people who process payments.
          </p>
        </section>

        <section>
          <h2 className="text-2xl mb-2 oc-serif text-[var(--oc-cream)]">
            Access
          </h2>
          <p className="text-[var(--oc-cream-muted)] leading-relaxed">
            You can invite your partner. You cannot invite the internet.
          </p>
        </section>
      </article>
      <MarketingFooter />
    </div>
  );
}
