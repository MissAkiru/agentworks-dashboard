export const metadata = { title: "OSINT — Scaffold · HOK Command" };

export default function OsintPage() {
  return (
    <div>
      <div className="mb-6">
        <div className="label mb-2">Vertical 04 · Defensive OSINT</div>
        <h1 className="font-serif text-3xl font-medium">Scaffold. Not built.</h1>
        <p className="mt-2 max-w-2xl text-sm text-mute">
          The planned fourth vertical: watch <em>our own</em> public footprint — brand mentions,
          domain history, repo activity, forum threads about our tools — so nothing about the
          house surprises the house.
        </p>
      </div>

      <div className="panel p-6">
        <div className="mb-4 font-mono text-[10px] uppercase tracking-label text-gold">Scope, in writing</div>
        <ul className="max-w-2xl space-y-2 font-mono text-[12px] leading-relaxed text-mute">
          <li><span className="text-ok">IN</span> — public data about Akiru Systems entities: domains, repos, brand mentions, our own products&apos; public surface.</li>
          <li><span className="text-ok">IN</span> — public business data on companies we work with or against (same rules as B2B Intel).</li>
          <li><span className="text-bad">OUT</span> — any profiling, tracking, or aggregation of named individuals. Not a watcher. Not a dossier. Not ever.</li>
          <li><span className="text-bad">OUT</span> — anything behind a login, a paywall, or a ToS we haven&apos;t read and agreed to.</li>
        </ul>
      </div>

      <div className="mt-4">
        <a href="/TODO.md" className="btn-ghost">
          Read the roadmap → /TODO.md (repo root: dashboard/TODO.md)
        </a>
      </div>

      <div className="mt-4 border-l-2 border-line2 pl-4 font-mono text-[11px] leading-relaxed text-faint">
        This page is a deliberate placeholder: the vertical exists as a scoped TODO, not as a
        half-built feature. If a future task here starts asking for a person&apos;s data, the
        task is out of scope by the rule above — close it, don&apos;t bend it.
      </div>
    </div>
  );
}
