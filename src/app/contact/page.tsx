import { MarketingFooter, MarketingNav } from "@/components/marketing/nav";

export default function ContactPage() {
  return (
    <div className="oc-page-dark">
      <MarketingNav />
      <article className="mx-auto max-w-2xl px-5 py-10">
        <h1
          className="text-4xl mb-4 oc-serif text-[var(--oc-cream)]"
        >
          Contact
        </h1>
        <p className="text-[var(--oc-cream-muted)] leading-relaxed">
          Studio questions, privacy, deletion: hello@onlycouples.app
        </p>
        <p className="text-sm text-[var(--oc-cream-muted)] mt-6">
          We use what’s required to run your account. No advertising pixels on explicit pages.
        </p>
      </article>
      <MarketingFooter />
    </div>
  );
}
