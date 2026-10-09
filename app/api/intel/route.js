import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const UA = "Akiru-Systems-Dashboard/0.1 (akirusystems.com; public-data lookups only)";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("company") || "").trim();
  if (!q) {
    return NextResponse.json({ error: "query param 'company' is required" }, { status: 400 });
  }

  const ocKey = process.env.OPEN_CORPORATES_API_KEY;
  const chKey = process.env.COMPANIES_HOUSE_API_KEY;
  const newsKey = process.env.GNEWS_API_KEY;

  const sources = {};
  const missing = [];

  /* ---- OpenCorporates (free token; global registries) ---- */
  if (ocKey) {
    try {
      const r = await fetch(
        `https://api.opencorporates.com/v0.4/companies/search?q=${encodeURIComponent(q)}&limit=5`,
        { headers: { Authorization: `Token token=${ocKey}`, "User-Agent": UA } }
      );
      if (r.ok) {
        const j = await r.json();
        const hits = j?.result?.hits || [];
        sources.opencorporates = hits.slice(0, 5).map((h) => ({
          name: h.name,
          company_number: h.company_number,
          jurisdiction: h.jurisdiction_name || h.jurisdiction_code,
          status: h.status_label || h.status || null,
          type: h.type || null,
          incorporated: h.incorporation_date || null,
          website: h.raw_data?.website_url || h.fields?.website_url || null,
          company_url: h.company_url || null,
          // officer/director fields intentionally omitted — companies only
        }));
      } else {
        missing.push(`OPEN_CORPORATES_API_KEY (API returned ${r.status})`);
      }
    } catch (e) {
      missing.push(`OPEN_CORPORATES_API_KEY (network error: ${e.message})`);
    }
  } else {
    missing.push("OPEN_CORPORATES_API_KEY");
  }

  /* ---- Companies House (free key; UK) ---- */
  if (chKey) {
    try {
      const r = await fetch(
        `https://api.companyinformation.service.gov.uk/search/companies?q=${encodeURIComponent(q)}`,
        { headers: { Authorization: `Bearer ${chKey}`, "User-Agent": UA } }
      );
      if (r.ok) {
        const j = await r.json();
        const items = j?.items || [];
        const enriched = [];
        for (const it of items.slice(0, 3)) {
          let detail = null;
          try {
            const d = await fetch(
              `https://api.companyinformation.service.gov.uk/company/${it.company_number}`,
              { headers: { Authorization: `Bearer ${chKey}`, "User-Agent": UA } }
            );
            if (d.ok) detail = await d.json();
          } catch {
            /* detail is optional */
          }
          enriched.push({
            name: detail?.company_name || it.title,
            company_number: it.company_number,
            status: detail?.company_status || (it.date_of_closure ? "closed" : null),
            type: detail?.company_type || it.type || null,
            incorporated: detail?.incorporation_date || null,
            sic_codes: (detail?.sic_codes || []).slice(0, 5),
            locality: detail?.registered_office_address?.locality || null,
            website: detail?.website_address || null,
            page: it.link ? `https://find-and-update.company-information.service.gov.uk${it.link}` : null,
          });
        }
        sources.companies_house = enriched;
      } else {
        missing.push(`COMPANIES_HOUSE_API_KEY (API returned ${r.status})`);
      }
    } catch (e) {
      missing.push(`COMPANIES_HOUSE_API_KEY (network error: ${e.message})`);
    }
  } else {
    missing.push("COMPANIES_HOUSE_API_KEY");
  }

  /* ---- Public news mentions (optional free tier) ---- */
  if (newsKey) {
    try {
      const r = await fetch(
        `https://gnews.io/api/v4/search?q=${encodeURIComponent(`"${q}" company`)}&max=5&sortby=pubDate&apikey=${newsKey}`,
        { headers: { "User-Agent": UA } }
      );
      if (r.ok) {
        const j = await r.json();
        sources.news = (j?.articles || []).slice(0, 5).map((a) => ({
          title: a.title,
          source: a.source?.name || null,
          date: a.publishedAt,
          url: a.url,
        }));
      } else {
        missing.push(`GNEWS_API_KEY (API returned ${r.status})`);
      }
    } catch (e) {
      missing.push(`GNEWS_API_KEY (network error: ${e.message})`);
    }
  } else {
    missing.push("GNEWS_API_KEY (optional)");
  }

  return NextResponse.json({
    query: q,
    checked_at: new Date().toISOString(),
    sources,
    missing: missing.length ? missing : null,
    setup: {
      OPEN_CORPORATES_API_KEY: "Free API token — register at api.opencorporates.com, copy the token, set it in dashboard/.env.local",
      COMPANIES_HOUSE_API_KEY: "Free API key — register at developer.company-information.service.gov.uk, set it in dashboard/.env.local",
      GNEWS_API_KEY: "Optional — free tier at gnews.io, set it in dashboard/.env.local",
    },
    note: "Companies only. Officer/director/individual fields are intentionally excluded from every response — guardrail: no profiling of individuals.",
  });
}
