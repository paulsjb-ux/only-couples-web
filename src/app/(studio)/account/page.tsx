export default function AccountPage() {
  return (
    <div>
      <div className="hero mb-8">
        <h1
          className="text-2xl font-medium mb-1"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          Account
        </h1>
        <p className="text-white/90 text-sm">
          Studio settings, credits, and preferences.
        </p>
      </div>

      <div className="space-y-6 max-w-lg">
        {/* Credits */}
        <div className="card p-5">
          <div className="section-kicker">Credits</div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-3xl font-extrabold tracking-tight">20</span>
            <span className="text-sm text-[var(--muted)]">remaining</span>
          </div>
          <p className="text-xs text-[var(--muted)] mb-4">
            Images cost 1 credit · Videos cost 2 credits
          </p>
          <button className="btn btn-primary w-full sm:w-auto">
            Buy more credits
          </button>
        </div>

        {/* Look defaults */}
        <div className="card p-5">
          <div className="section-kicker">Look defaults</div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5">Intensity</label>
              <select className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 text-sm">
                <option>Soft</option>
                <option selected>Sensual</option>
                <option>Explicit</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">Lighting</label>
              <select className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 text-sm">
                <option>Soft window</option>
                <option>Bedroom lamp</option>
                <option>Hotel night</option>
                <option>Studio softbox</option>
                <option>Golden hour</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">Aspect ratio</label>
              <select className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 text-sm">
                <option>3:4</option>
                <option>9:16</option>
                <option>1:1</option>
                <option>16:9</option>
              </select>
            </div>
          </div>
        </div>

        {/* Danger zone */}
        <div className="card p-5 border-red-100">
          <div className="section-kicker text-red-700">Danger zone</div>
          <p className="text-sm text-[var(--muted)] mb-4">
            Permanently delete your studio and all generated content.
          </p>
          <button className="btn text-sm text-red-700 border border-red-200 bg-red-50 hover:bg-red-100">
            Delete studio
          </button>
        </div>
      </div>
    </div>
  );
}
