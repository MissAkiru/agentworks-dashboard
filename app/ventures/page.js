"use client";
import { useEffect, useState } from "react";

const STATUSES = ["Live", "Building", "Private", "Planned", "Raising", "Paused"];
const LANES = ["Brand", "Product", "Service", "Private"];

export const dynamic = "force-dynamic";

export default function VenturesPage() {
  const [ventures, setVentures] = useState([]);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ventures")
      .then((r) => r.json())
      .then((j) => {
        setVentures(j.ventures || []);
        setLoading(false);
      })
      .catch(() => {
        setMsg("could not load ventures store");
        setLoading(false);
      });
  }, []);

  function patch(i, field, value) {
    setVentures((rows) => rows.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));
    setDirty(true);
    setMsg("");
  }

  async function save() {
    setSaving(true);
    try {
      const r = await fetch("/api/ventures", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ventures }),
      });
      const j = await r.json();
      if (r.ok) {
        setDirty(false);
        setMsg(`saved — ${j.count} ventures → data/ventures.json`);
      } else {
        setMsg(`save failed: ${j.error}`);
      }
    } catch (e) {
      setMsg(`save failed: ${e.message}`);
    } finally {
      setSaving(false);
    }
  }

  const totalMrr = ventures.reduce((s, v) => s + (Number(v.mrr) || 0), 0);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="label mb-2">Vertical 01 · Ventures</div>
          <h1 className="font-serif text-3xl font-medium">Eight ventures, one page.</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] text-mute">
            MRR (seed data — confirm): <span className="text-gold">${totalMrr.toLocaleString()}</span>
          </span>
          <button className="btn-gold" onClick={save} disabled={!dirty || saving}>
            {saving ? "saving…" : "save"}
          </button>
        </div>
      </div>

      {msg && (
        <div className="mb-4 border border-line2 px-4 py-2 font-mono text-[11px] text-mute">{msg}</div>
      )}

      {loading ? (
        <div className="panel p-8 font-mono text-xs text-faint">loading store…</div>
      ) : (
        <div className="panel overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse font-mono text-[12px]">
            <thead>
              <tr className="border-b border-line2 bg-bg1 text-left">
                {["venture", "lane", "status", "next action", "mrr ($)", "last touched"].map((h) => (
                  <th key={h} className="px-4 py-3 font-mono text-[10px] uppercase tracking-label text-gold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ventures.map((v, i) => (
                <tr key={v.id} className="border-b border-line align-top last:border-0 hover:bg-bg2/40">
                  <td className="px-4 py-3">
                    <div className="font-sans text-sm text-ink">{v.name}</div>
                    <div className="text-[10px] text-faint">{v.id}</div>
                  </td>
                  <td className="px-4 py-3">
                    <select className="field-input !w-28 !px-2 !py-1 text-[11px]" value={v.lane} onChange={(e) => patch(i, "lane", e.target.value)}>
                      {LANES.map((l) => (
                        <option key={l}>{l}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      className={
                        "field-input !w-28 !px-2 !py-1 text-[11px] " +
                        (v.status === "Live" || v.status === "Raising" ? "!border-gold !text-gold" : "")
                      }
                      value={v.status}
                      onChange={(e) => patch(i, "status", e.target.value)}
                    >
                      {STATUSES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      className="field-input !px-2 !py-1 text-[11px]"
                      value={v.next_action}
                      placeholder="next action…"
                      onChange={(e) => patch(i, "next_action", e.target.value)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="0"
                      className="field-input !w-24 !px-2 !py-1 text-[11px]"
                      value={v.mrr}
                      onChange={(e) => patch(i, "mrr", e.target.value)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="date"
                      className="field-input !w-36 !px-2 !py-1 text-[11px]"
                      value={v.last_touched}
                      onChange={(e) => patch(i, "last_touched", e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 border-l-2 border-line2 pl-4 font-mono text-[11px] text-faint">
        Persistence: this edit saves to dashboard/data/ventures.json (local JSON for now; the API
        route is the swap point for a real database). Seed MRR figures are placeholders — confirm
        or correct before using them anywhere external.
      </div>
    </div>
  );
}
