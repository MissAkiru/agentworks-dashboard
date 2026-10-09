import { NextResponse } from "next/server";
import tls from "node:tls";
import dns from "node:dns";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const REPO_OWNER = "MissAkiru";
const EXPOSED_PATHS = ["/.env", "/.env.local", "/.git/config", "/.DS_Store", "/wp-config.php"];
const CONFIG_SMELL = /(NODE_ENV|PRIVATE_KEY|DB_PASSWORD|<\?php|password\s*=|BEGIN (RSA |EC )?PRIVATE)/i;

/* ------------------------------ checks ------------------------------ */

function sslCheck(domain) {
  return new Promise((resolve) => {
    const out = { id: "ssl", label: "SSL/TLS certificate", status: "fail", detail: "" };
    const socket = tls.connect(
      { host: domain, port: 443, servername: domain, rejectUnauthorized: false, timeout: 10000 },
      () => {
        const cert = socket.getPeerCertificate();
        const validTo = cert?.valid_to ? new Date(cert.valid_to) : null;
        const days = validTo ? Math.floor((validTo - Date.now()) / 86400000) : null;
        const issuer = cert?.issuer?.O || "unknown issuer";
        if (!socket.authorized) {
          out.status = "fail";
          out.detail = `certificate chain invalid (${socket.authorizationError || "unknown reason"})`;
        } else if (days === null) {
          out.status = "fail";
          out.detail = "no certificate presented";
        } else if (days < 14) {
          out.status = "fail";
          out.detail = `EXPIRING — ${days} days left (${validTo.toISOString().slice(0, 10)}, ${issuer})`;
        } else if (days < 45) {
          out.status = "warn";
          out.detail = `${days} days left (${validTo.toISOString().slice(0, 10)}, ${issuer})`;
        } else {
          out.status = "pass";
          out.detail = `valid ${days} days — ${issuer}`;
        }
        socket.end();
        resolve(out);
      }
    );
    socket.on("error", (e) => {
      out.status = "fail";
      out.detail =
        e.code === "ENOTFOUND" || e.code === "EAI_AGAIN"
          ? "domain did not resolve — check DNS first"
          : `TLS probe failed: ${e.code || e.message}`;
      resolve(out);
    });
    socket.on("timeout", () => {
      socket.destroy();
      out.status = "fail";
      out.detail = "TLS handshake timed out";
      resolve(out);
    });
  });
}

async function dnsChecks(domain) {
  const out = [];

  // Apex A record
  try {
    const ips = await dns.promises.resolve4(domain);
    out.push({
      id: "dns-apex",
      label: "DNS — apex A record",
      status: "pass",
      detail: `resolves to ${ips.join(", ")}`,
    });
  } catch (e) {
    out.push({
      id: "dns-apex",
      label: "DNS — apex A record",
      status: "fail",
      detail: `no A record for ${domain} (${e.code || e.message})`,
    });
  }

  // www alignment
  let wwwIps = null;
  try {
    wwwIps = await dns.promises.resolve4(`www.${domain}`);
  } catch {
    try {
      const cn = await dns.promises.resolveCname(`www.${domain}`);
      wwwIps = cn.map((c) => `CNAME → ${c}`);
    } catch {
      wwwIps = null;
    }
  }
  if (wwwIps === null) {
    out.push({
      id: "dns-www",
      label: "DNS — www alignment",
      status: "warn",
      detail: `www.${domain} not configured — most traffic arrives on www; add a CNAME to the apex`,
    });
  } else {
    out.push({
      id: "dns-www",
      label: "DNS — www alignment",
      status: "pass",
      detail: `www resolves (${wwwIps.join(", ")})`,
    });
  }

  // MX (only meaningful if we claim email at the domain)
  let hasMx = false;
  try {
    const mx = await dns.promises.resolveMx(domain);
    hasMx = mx.length > 0;
    out.push({
      id: "dns-mx",
      label: "DNS — MX records",
      status: "pass",
      detail: `${mx.length} MX record(s): ${mx.map((m) => m.exchange).join(", ")}`,
    });
  } catch {
    out.push({
      id: "dns-mx",
      label: "DNS — MX records",
      status: "warn",
      detail: "no MX records — email addressed to @domain will not deliver; if that's intended, note it",
    });
  }

  // SPF
  if (hasMx) {
    try {
      const txt = await dns.promises.resolveTxt(domain);
      const flat = txt.flat();
      const hasSpf = flat.some((r) => r.startsWith("v=spf1"));
      out.push(
        hasSpf
          ? { id: "dns-spf", label: "DNS — SPF", status: "pass", detail: flat.find((r) => r.startsWith("v=spf1")) }
          : { id: "dns-spf", label: "DNS — SPF", status: "warn", detail: "email service present but no SPF record — spoofing risk on inbound mail" }
      );
    } catch {
      out.push({ id: "dns-spf", label: "DNS — SPF", status: "warn", detail: "could not read TXT records" });
    }
    // DMARC
    try {
      const dmarc = await dns.promises.resolveTxt(`_dmarc.${domain}`);
      const flat = dmarc.flat();
      const rec = flat.find((r) => r.startsWith("v=DMARC1"));
      out.push(
        rec
          ? { id: "dns-dmarc", label: "DNS — DMARC", status: "pass", detail: rec }
          : { id: "dns-dmarc", label: "DNS — DMARC", status: "warn", detail: "no DMARC record — add v=DMARC1; p=quarantine at least" }
      );
    } catch {
      out.push({ id: "dns-dmarc", label: "DNS — DMARC", status: "warn", detail: "no DMARC record found" });
    }
  }

  return out;
}

async function exposedFiles(domain) {
  const out = [];
  const host = `https://${domain}`;
  for (const p of EXPOSED_PATHS) {
    const check = { id: `exp-${p}`, label: `Exposed file ${p}`, status: "pass", detail: "" };
    try {
      const r = await fetch(host + p, { redirect: "follow", signal: AbortSignal.timeout(10000) });
      if (r.status === 200) {
        const text = (await r.text()).slice(0, 4000);
        if (text && CONFIG_SMELL.test(text)) {
          check.status = "fail";
          check.detail = "EXPOSED — server returned config-looking content for a protected path";
        } else if ((text || "").trim().length > 0) {
          check.status = "warn";
          check.detail = "HTTP 200 with content — verify manually what is being served";
        } else {
          check.status = "pass";
          check.detail = "200 but empty (parked-page catch-all is acceptable)";
        }
      } else {
        check.status = "pass";
        check.detail = `${r.status} — not exposed`;
      }
    } catch (e) {
      check.status = "warn";
      check.detail = `probe failed: ${e.name === "TimeoutError" ? "timeout" : e.message} (see SSL/DNS checks)`;
    }
    out.push(check);
  }
  return out;
}

async function githubExposure() {
  const out = [];
  const headers = { "User-Agent": "Akiru-Systems-Dashboard", Accept: "application/vnd.github+json" };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const r = await fetch(`https://api.github.com/users/${REPO_OWNER}/repos?per_page=100`, { headers });
    if (!r.ok) {
      out.push({
        id: "gh-repos",
        label: "GitHub — public repos",
        status: "warn",
        detail: `GitHub API returned ${r.status} (rate limit or private profile?)`,
      });
    } else {
      const repos = await r.json();
      if (repos.length === 0) {
        out.push({ id: "gh-repos", label: "GitHub — public repos", status: "pass", detail: "no public repos under this account" });
      } else {
        out.push({
          id: "gh-repos",
          label: "GitHub — public repos",
          status: "pass",
          detail: `${repos.length} public repo(s): ${repos.map((x) => x.name).join(", ")}`,
        });
      }
    }
  } catch (e) {
    out.push({ id: "gh-repos", label: "GitHub — public repos", status: "warn", detail: `GitHub unreachable: ${e.message}` });
  }

  if (token) {
    // Deep scan: token-authenticated code search across the account's public
    // repos. Code search uses repo:owner/name qualifiers (org: only matches
    // organizations), so we search each repo with all patterns OR-combined.
    let hits = 0;
    const found = [];
    const PATTERNS = ['"PRIVATE KEY"', '"aws_secret_access_key"', '"sk-ant-"', '"api_key="'];
    const q = PATTERNS.join(" OR ");
    let repos = [];
    try {
      const rr = await fetch(`https://api.github.com/users/${REPO_OWNER}/repos?per_page=100`, { headers });
      if (rr.ok) repos = await rr.json();
    } catch {
      /* repo list is non-fatal */
    }
    for (const repo of repos.slice(0, 20)) {
      try {
        const s = await fetch(
          `https://api.github.com/search/code?q=${encodeURIComponent(`repo:${REPO_OWNER}/${repo.name} ${q}`)}`,
          { headers }
        );
        if (s.ok) {
          const j = await s.json();
          if (j.total_count > 0) {
            hits += j.total_count;
            const sample = (j.items || [])[0];
            found.push(
              `${repo.name}: ${j.total_count} match${j.total_count > 1 ? "es" : ""}${sample?.path ? ` (e.g. ${sample.path})` : ""}`
            );
          }
        } else if (s.status === 403 || s.status === 429) {
          found.push(`${repo.name}: rate-limited this run`);
        }
      } catch {
        /* per-repo failures are non-fatal */
      }
      await new Promise((res) => setTimeout(res, 1000)); // search API: 30 req/min
    }
    out.push(
      hits > 0
        ? { id: "gh-secrets", label: "GitHub — secret scan", status: "fail", detail: `possible secrets in public code — ${found.join("; ")}` }
        : { id: "gh-secrets", label: "GitHub — secret scan", status: "pass", detail: `no matches across ${PATTERNS.length} patterns in ${repos.length} public repo(s) (token-authenticated)` }
    );
  } else {
    out.push({
      id: "gh-secrets",
      label: "GitHub — secret scan",
      status: "skip",
      detail: "set GITHUB_TOKEN in .env.local to enable deep code search across public repos",
    });
  }
  return out;
}

/* ------------------------------- route ------------------------------- */

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const domain = (searchParams.get("domain") || "akirusystems.com").trim().toLowerCase();
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain)) {
    return NextResponse.json({ error: "invalid domain" }, { status: 400 });
  }

  const [ssl, dnsOut, exposed, github] = await Promise.all([
    sslCheck(domain),
    dnsChecks(domain),
    exposedFiles(domain),
    githubExposure(),
  ]);

  const checks = [ssl, ...dnsOut, ...exposed, ...github];
  const fails = checks.filter((c) => c.status === "fail").length;
  const warns = checks.filter((c) => c.status === "warn").length;
  const overall = fails > 0 ? "fail" : warns > 0 ? "warn" : "pass";

  return NextResponse.json({
    domain,
    checked_at: new Date().toISOString(),
    overall,
    summary: `${checks.length} checks · ${fails} fail · ${warns} warn`,
    checks,
  });
}
