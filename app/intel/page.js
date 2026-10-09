"use client";
import { useState } from "react";

export const dynamic = "force-dynamic";

function SourceCard({ title, children }) {
  return (
    <div className="panel">
      <div className="panel-head">
        <span>{title}</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function Rows({ items, render }) {
  if (!items || items.length === 0) {
    return <div className="font-mono text-[11px] text-faint">no results</div>;
  }
  return (
    <div className="divide-y divide-line">
      {items.map((it, i) => (
        <div key={i} className="py-3 font-mono text-[12px]">
          {render(it)}
        </div>
      ))}
    </div>
  );
}

export default function IntelPage() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function search(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    setData(null);
    try {
      const r = await fetch(`/api/intel?company=${encodeURIComponent(query.trim())}`);
      const j = await r.json();
      if (!r.ok) setError(j.error || "lookup failed");
      else setData(j);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <div className="label mb-2">Vertical 02 · B2B Intel</div>
        <h1 className="font-serif text-3xl font-medium">Companies. Public data. Nothing else.</h1>
        <p className="mt-2 max-w-2xl text-sm text-mute">
          Registry + news lookup on <em>companies</em> from free public APIs. Officer, director,
          and other individual fields are stripped from every response — by design, per the
          guardrails.
        </p>
      </div>

      <form onSubmit={search} className="mb-6 flex max-w-xl gap-3">
        <input
          className="field-input"
          placeholder="company name (e.g. Emirates NBD, Rolls Royce, Stripe)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="btn-gold shrink-0" disabled={loading}>
          {loading ? "looking…" : "lookup"}
        </button>
      </form>

      {error && <div className="mb-4 border border-bad/50 px-4 py-2 font-mono text-[11px] text-bad">{error}</div>}

      {loading && <div className="panel p-8 font-mono text-xs text-faint">querying registries…</div>}

      {data && (
        <div className="space-y-4">
          {data.missing && (
            <SourceCard title="Setup required (free keys)">
              <div className="space-y-2 font-mono text-[11px] leading-relaxed text-mute">
                {data.missing.map((m) => (
                  <div key={m}>
                    <span className="text-gold">{m}</span>
                    {data.setup[m] && <span className="text-faint"> — {data.setup[m]}</span>}
                  </div>
                ))}
              </div>
            </SourceCard>
          )}

          <SourceCard title="OpenCorporates (global registries)">
            <Rows
              items={data.sources.opencorporates}
              render={(it) => (
                <div className="space-y-1">
                  <div className="text-ink">{it.name} <span className="text-faint">#{it.company_number}</span></div>
                  <div className="text-faint">
                    {it.jurisdiction} · {it.status} · {it.type || "—"} · inc. {it.incorporated || "—"}
                  </div>
                  <div className="text-faint">
                    website: {it.website || "n/a"}
                    {it.company_url && (
                      <>
                        {" · "}
                        <a href={it.company_url} className="text-gold" target="_blank" rel="noreferrer">registry record ↗</a>
                      </>
                    )}
                  </div>
                </div>
              )}
            />
          </SourceCard>

          <SourceCard title="Companies House (UK)">
            <Rows
              items={data.sources.companies_house}
              render={(it) => (
                <div className="space-y-1">
                  <div className="text-ink">{it.name} <span className="text-faint">#{it.company_number}</span></div>
                  <div className="text-faint">
                    {it.status || "—"} · {it.type || "—"} · inc. {it.incorporated || "—"} {it.locality ? `· ${it.locality}` : ""}
                  </div>
                  <div className="text-faint">
                    {it.sic_codes?.length ? `SIC: ${it.sic_codes.join(" / ")}` : "SIC: n/a"}
                    {it.website ? ` · ${it.website}` : ""}
                    {it.page && (
                      <>
                        {" · "}
                        <a href={it.page} className="text-gold" target="_blank" rel="noreferrer">CH record ↗</a>
                      </>
                    )}
                  </div>
                </div>
              )}
            />
          </SourceCard>

          {data.sources.news !== undefined && (
            <SourceCard title="Public news mentions (last 5)">
              <Rows
                items={data.sources.news}
                render={(it) => (
                  <div className="space-y-0.5">
                    <a href={it.url} className="text-ink hover:text-gold" target="_blank" rel="noreferrer">
                      {it.title}
                    </a>
                    <div className="text-faint">
                      {it.source} · {String(it.date).slice(0, 10)}
                    </div>
                  </div>
                )}
              />
            </SourceCard>
          )}

          <div className="border-l-2 border-line2 pl-4 font-mono text-[11px] leading-relaxed text-faint">
            {data.note}
          </div>
        </div>
      )}
    </div>
  );
}
