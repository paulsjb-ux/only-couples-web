import Link from "next/link";

/**
 * The Other Room — marketing homepage
 * CTAs go to /login; middleware sends authenticated users to /home.
 */
export default function HomePage() {
  return (
    <>
      <header className="nav">
        <Link href="/" className="nav-mark">
          The Other Room
        </Link>
        <div className="nav-actions">
          <a href="#how">How it works</a>
          <Link href="/login">Sign in</Link>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="hero" id="top">
          <div className="hero-inner">
            <p className="hero-kicker">Private by design</p>
            <h1>The Other Room</h1>
            <div className="hero-rule" aria-hidden />
            <p className="hero-tag">A private studio for the two of you.</p>
            <p className="hero-lead">
              Scenes with <strong>your</strong> faces — not a random model.
              Soft by default. Explicit only when you both choose. Nothing is
              public.
            </p>
            <div className="hero-cta">
              <Link className="btn btn-primary" href="/login">
                Come in
              </Link>
              <a className="btn btn-ghost" href="#how">
                How it works
              </a>
            </div>
            <p className="hero-foot">
              Together, or on your own — then invite them in.
            </p>
          </div>
        </section>

        {/* PROMISE */}
        <div className="promise">
          <div className="promise-grid">
            <div className="promise-item">
              <h3 className="serif">Your faces</h3>
              <p>
                Identity lock for two real people. It should look like you —
                not a stranger from a prompt dump.
              </p>
            </div>
            <div className="promise-item">
              <h3 className="serif">Your pace</h3>
              <p>
                Start soft. Move to playful or after dark only when you&apos;re
                ready. She shouldn&apos;t bounce on first open.
              </p>
            </div>
            <div className="promise-item">
              <h3 className="serif">Your album</h3>
              <p>
                Preview, then keep or discard. A private library — not a feed,
                not a gallery, not training data.
              </p>
            </div>
          </div>
        </div>

        {/* HOW */}
        <section className="section how" id="how">
          <div>
            <p className="section-label">How it works</p>
            <h2 className="section-title">From empty room to private album</h2>
            <p className="section-body">
              Built for couples who want something personal — a bit of fun
              through to scenes you&apos;d never ask a photographer for.
            </p>
          </div>
          <ol className="steps">
            <li className="step">
              <span className="step-num">01</span>
              <div>
                <h3 className="serif">Lock your faces</h3>
                <p>
                  Each of you adds a few reference photos. They stay in your
                  studio. We don&apos;t train on them.
                </p>
              </div>
            </li>
            <li className="step">
              <span className="step-num">02</span>
              <div>
                <h3 className="serif">Start soft</h3>
                <p>
                  The first scene is gentle — bed, morning light, the two of
                  you. No shock, no homepage explicit.
                </p>
              </div>
            </li>
            <li className="step">
              <span className="step-num">03</span>
              <div>
                <h3 className="serif">Preview, then decide</h3>
                <p>
                  Every image is a preview until you Keep it. Discard removes
                  it. Keep puts it in your private album.
                </p>
              </div>
            </li>
            <li className="step">
              <span className="step-num">04</span>
              <div>
                <h3 className="serif">Invite when you&apos;re ready</h3>
                <p>
                  Open the studio alone, or invite your partner. Shared library.
                  Optional hide-from-partner for surprises.
                </p>
              </div>
            </li>
          </ol>
        </section>

        {/* INTENSITY */}
        <section className="section" id="intensity">
          <p className="section-label">Intensity</p>
          <h2 className="section-title">Soft first. Then as far as you want.</h2>
          <p className="section-body">
            One product, three doors. You choose how far to open them — never
            the other way around.
          </p>
          <div className="tiers">
            <article className="tier tier-soft">
              <p className="label">Always open</p>
              <h3 className="serif">Soft</h3>
              <p>
                Smiling, close, clothed or barely. The scene that should always
                work on first try.
              </p>
            </article>
            <article className="tier">
              <p className="label">When you&apos;re ready</p>
              <h3 className="serif">Playful</h3>
              <p>
                Tease, lingerie, tension. Still private. Still the two of you.
              </p>
            </article>
            <article className="tier">
              <p className="label">Consent gated</p>
              <h3 className="serif">After dark</h3>
              <p>
                Explicit, on your terms. Unlocked only after you say so — not on
                the homepage.
              </p>
            </article>
          </div>
        </section>

        {/* PRIVACY */}
        <section className="section" id="privacy">
          <p className="section-label">Privacy</p>
          <h2 className="section-title">This is not a public gallery</h2>
          <p className="section-body">
            The product is the closed album. If it ever feels like a feed,
            we&apos;ve failed.
          </p>
          <div className="privacy-box">
            <ul className="privacy-list">
              <li>
                <span className="dot" />
                Photos stay in your studio — not used to train a public model
              </li>
              <li>
                <span className="dot" />
                No public gallery by default. No SEO of your scenes
              </li>
              <li>
                <span className="dot" />
                Delete account and we wipe storage
              </li>
              <li>
                <span className="dot" />
                Preview → keep or discard. Nothing auto-saves into the album
              </li>
              <li>
                <span className="dot" />
                Hide from partner when you want a surprise
              </li>
              <li>
                <span className="dot" />
                Adult-only access, real enough for the way we process payments
              </li>
            </ul>
          </div>
        </section>

        {/* WHO */}
        <section className="section" id="who">
          <p className="section-label">Who it&apos;s for</p>
          <h2 className="section-title">Built for couples — not for everyone</h2>
          <div className="audience">
            <div className="audience-card">
              <h3 className="serif">Couples already sharing</h3>
              <p>
                You send nudes or play with AI casually. You want it to look
                like both of you.
              </p>
            </div>
            <div className="audience-card">
              <h3 className="serif">Someone buying for two</h3>
              <p>
                A gift of a private studio — soft enough she&apos;ll open it,
                deep enough you&apos;ll both stay.
              </p>
            </div>
            <div className="audience-card">
              <h3 className="serif">One consistent &ldquo;us&rdquo;</h3>
              <p>
                Not a new stranger every prompt. The same two faces, a
                relationship-shaped scene list.
              </p>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <div className="final">
          <h2 className="serif">
            Close the door.
            <br />
            Open the album.
          </h2>
          <p>Private scenes with your faces. Soft by default. Yours alone.</p>
          <Link className="btn btn-primary" href="/login">
            Come in
          </Link>
        </div>
      </main>

      <footer className="site-footer">
        <div>
          <p className="footer-mark">The Other Room</p>
          <p style={{ marginTop: "0.35rem" }}>
            A private studio for the two of you.
          </p>
        </div>
        <div className="footer-links">
          <a href="#privacy">Privacy</a>
          <a href="#how">How it works</a>
          <Link href="/privacy">Privacy policy</Link>
          <Link href="/contact">Contact</Link>
        </div>
      </footer>
    </>
  );
}
