# HOK Command Dashboard

Private operations dashboard for Akiru Systems. Local-first, run with
`npm run dev`. Dark, gold, monospace — terminal crossed with a luxury
magazine.

**This dashboard tracks our ventures and public business data on companies.
It does not profile, track, or surveil individuals. That boundary is a
product decision, not a feature to configure around.**

## Run

```bash
npm install
npm run dev        # → http://localhost:3000
```

Production: `npm run build && npm start`.

## Verticals

| Vertical | Page | Data source | Keys needed |
|---|---|---|---|
| Ventures | `/ventures` | `data/ventures.json` (editable, persisted via `/api/ventures`) | none |
| B2B Intel | `/intel` | OpenCorporates (global), Companies House (UK), GNews (optional) | free: `OPEN_CORPORATES_API_KEY`, `COMPANIES_HOUSE_API_KEY`; optional `GNEWS_API_KEY` |
| Security Posture | `/security` | live probes: TLS handshake, DNS (A/CNAME/MX/TXT/SPF/DMARC), HTTP file checks, GitHub API | none (GITHUB_TOKEN optional, unlocks deep secret scan) |
| Defensive OSINT | `/osint` | scaffold only — see `TODO.md` | — |

## Environment

Create `dashboard/.env.local` (never commit it):

```
OPEN_CORPORATES_API_KEY=
COMPANIES_HOUSE_API_KEY=
GNEWS_API_KEY=
GITHUB_TOKEN=
```

Free-key registration:
- OpenCorporates: register at api.opencorporates.com → copy token
- Companies House: developer.company-information.service.gov.uk → API key
- GNews (optional): gnews.io free tier
- GitHub: a fine-grained token with read access to the org's public repos is
  enough for the secret scan

## Design language

Palette and type come from `shared/brand/tokens.css` (same house, same
look): near-black surfaces, warm off-white ink, one gold for signal,
serif for headers, monospace for data. Dense, cold, legible.

## Security model (read this before running)

- **Local-first.** Ventures state lives in `data/ventures.json` on disk. No
  external write path exists.
- **No auth yet.** This dashboard is meant to run on a machine or network
  only you can reach. If it ever goes on a public host, add auth first —
  that's an explicit roadmap item, not an afterthought.
- **Probes are read-only.** The Security vertical performs GETs/TLS handshakes
  against *our own* domains and the public GitHub API. It sends no writes,
  pings no third parties, and does not test external systems.
- **Intel is companies-only.** The API layer strips officer/director fields
  from registry responses before they reach the UI. If you're editing
  `/api/intel` and a person's name starts flowing through, stop — that's the
  guardrail.

## Roadmap

1. Auth + optional tunnel (local-only until then) — Tailscale is the intended
   pattern: reachable from your devices, invisible to the internet.
2. Ventures: swap JSON store for Supabase Postgres when editing outgrows
   single-user (one-file swap behind `/api/ventures`).
3. Intel: add funding-stage + employee-size via paid overlay only if a client
   engagement justifies it (see `/services/STACK.md`).
4. Security: scheduled scans (cron → results into the sheet), alert on
   cert < 30 days, add `X-Frame-Options`/HSTS header checks.
5. OSINT vertical per `TODO.md` — scope first, code second.

## Explicitly NOT on the roadmap

- Anything that profiles, tracks, or builds dossiers on individuals.
- Anything that tests or probes systems we don't own (offensive security).
- Anything that requires violating a third party's terms of service.

If an idea lands here, it goes to the parent repo's guardrails first.
