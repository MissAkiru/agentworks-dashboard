"use client";
import { useState } from "react";

export const dynamic = "force-dynamic";

const STATUS_STYLE = {
  pass: "border-ok/60 text-ok",
  warn: "border-gold text-gold",
  fail: "border-bad text-bad",
  skip: "border-line2 text-faint",
};

export default function SecurityPage() {
  const [domain, setDomain] = useState("akirusystems.com");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function run(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setData(null);
    try {
      const r = await fetch(`/api/security?domain=${encodeURIComponent(domain.trim().toLowerCase())}`);
      const j = await r.json();
      if (!r.ok) setError(j.error || "scan failed");
      else setData(j);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const overallStyle =
    data?.overall === "pass"
      ? "border-ok text-ok"
      : data?.overall === "warn"
      ? "border-gold text-gold"
      : data?.overall === "fail"
      ? "border-bad text-bad"
      : "border-line2 text-faint";

  return (
    <div>
      <div className="mb-6">
        <div className="label mb-2">Vertical 03 · Security Posture</div>
        <h1 className="font-serif text-3xl font-medium">Our doors. Checked.</h1>
        <p className="mt-2 max-w-2xl text-sm text-mute">
          Defensive scanner for domains we own: certificate life, DNS hygiene, exposed config
          files, public repo exposure. It points at our own assets only — this is a locksmith,
          not a crowbar.
        </p>
      </div>

      <form onSubmit={run} className="mb-6 flex max-w-xl gap-3">
        <input className="field-input" value={domain} onChange={(e) => setDomain(e.target.value)} />
        <button className="btn-gold shrink-0" disabled={loading}>
          {loading ? "scanning…" : "run scan"}
        </button>
      </form>

      {error && <div className="mb-4 border border-bad/50 px-4 py-2 font-mono text-[11px] text-bad">{error}</div>}
      {loading && <div className="panel p-8 font-mono text-xs text-faint">probing TLS, DNS, HTTP, GitHub…</div>}

      {data && (
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-4">
            <span className={"border px-3 py-1 font-mono text-[11px] uppercase tracking-widest " + overallStyle}>
              {data.overall}
            </span>
            <span className="font-mono text-[11px] text-mute">{data.summary}</span>
            <span className="font-mono text-[11px] text-faint">
              {data.domain} · {new Date(data.checked_at).toUTCString()}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-px border border-line bg-line md:grid-cols-2">
            {data.checks.map((c) => (
              <div key={c.id} className="bg-bg1 p-4">
                <div className="mb-1 flex items-center justify-between gap-3">
                  <span className="font-mono text-[11px] uppercase tracking-widest text-mute">{c.label}</span>
                  <span className={"border px-2 py-0.5 font-mono text-[10px] uppercase " + STATUS_STYLE[c.status]}>
                    {c.status}
                  </span>
                </div>
                <div className="break-words font-mono text-[12px] leading-relaxed text-ink/85">{c.detail}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 border-l-2 border-line2 pl-4 font-mono text-[11px] leading-relaxed text-faint">
            Checks: SSL cert expiry/chain · apex + www DNS alignment · MX/SPF/DMARC (if the domain
            claims email) · exposed .env / .git / .DS_Store / wp-config · public repo exposure +
            secret scan (needs GITHUB_TOKEN for the deep search). Set GITHUB_TOKEN in
            dashboard/.env.local to unlock the secret scan.
          </div>
        </div>
      )}
    </div>
  );
}
