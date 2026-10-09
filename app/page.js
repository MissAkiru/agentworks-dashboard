const VERTICALS = [
  {
    href: "/ventures",
    name: "Ventures",
    state: "LIVE",
    desc: "All eight ventures: status, next action, MRR, last touched. Editable, persisted to local JSON.",
    source: "data/ventures.json",
  },
  {
    href: "/intel",
    name: "B2B Intel",
    state: "LIVE (keys optional)",
    desc: "Company lookup from public registries — OpenCorporates, Companies House, news. Companies only, never individuals.",
    source: "OpenCorporates · Companies House · GNews (env keys)",
  },
  {
    href: "/security",
    name: "Security Posture",
    state: "LIVE",
    desc: "Scanner for our own domains: SSL expiry, DNS hygiene, exposed files, public repo exposure. Defensive only.",
    source: "live probes: TLS, DNS, HTTP, GitHub API",
  },
  {
    href: "/osint",
    name: "Defensive OSINT",
    state: "SCAFFOLD",
    desc: "Watch our own public footprint. Scoping in TODO.md. Individual profiling is out of scope by design.",
    source: "— (roadmap)",
  },
];

export default function Overview() {
  return (
    <div>
      <div className="mb-8">
        <div className="label mb-2">Operations · private</div>
        <h1 className="font-serif text-3xl font-medium">
          The house, at a glance.
        </h1>
        <p className="mt-2 max-w-xl text-sm text-mute">
          Three verticals running on real data, one on the roadmap. This
          dashboard tracks our ventures and public data on companies. It does
          not profile people — that boundary is in the README, the code, and
          the roadmap.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2">
        {VERTICALS.map((v) => (
          <a
            key={v.href}
            href={v.href}
            className="flex flex-col gap-3 bg-bg1 p-6 transition-colors hover:bg-bg2"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg">{v.name}</h2>
              <span
                className={
                  "border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest " +
                  (v.state === "LIVE"
                    ? "border-gold text-gold"
                    : v.state === "SCAFFOLD"
                    ? "border-line2 text-faint"
                    : "border-line2 text-mute")
                }
              >
                {v.state}
              </span>
            </div>
            <p className="text-sm text-mute">{v.desc}</p>
            <div className="mt-auto font-mono text-[10px] uppercase tracking-widest text-faint">
              source: {v.source}
            </div>
          </a>
        ))}
      </div>

      <div className="mt-8 border-l-2 border-line2 pl-4 font-mono text-[11px] leading-relaxed text-faint">
        Boundaries: public data only · companies only · defensive security on
        our own assets · nothing here surveils a person.
      </div>
    </div>
  );
}
