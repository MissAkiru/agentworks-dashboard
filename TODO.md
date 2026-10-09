# Defensive OSINT — Vertical 04 (scaffold, not built)

Scope rule (from the parent brief's guardrails): this vertical watches the
house's own public footprint and public business data on companies. **No
profiling, tracking, or aggregation of named individuals — ever.** Any task
below that drifts toward a person is out of scope by definition.

## Task 0 — Watched-entities file (foundation)

- [ ] `data/watched.json`: the list of things we watch. Domains
      (akirusystems.com, future ones), GitHub org, brand strings
      ("Miss Akiru", "Akiru Systems", "Cart402", product names),
      registrable handles.
- [ ] No PII in this file. No people's names, emails, or handles unless the
      person opted in to being an entity (e.g. a company we partner with).

## Task 1 — Brand-mention watcher (public data only)

- [ ] Weekly job: query public, ToS-legal sources for brand strings —
      Google News RSS (public), public GitHub issues/mentions, public
      Hacker News/Reddit search (public APIs, rate-limit respected).
- [ ] Output: dated list of {source, url, snippet, entity}. Stored locally.
- [ ] Hard rule: results are about *our names and companies*, not about
      people who mention them. Quotes by individuals stay as context of a
      public post, never as a subject profile.

## Task 2 — Domain-footprint monitor

- [ ] Extend the Security vertical: track WHOIS-visible *domain* lifecycle
      (registrant *organization* changes, DNS history) for watched domains
      using public whois/dns history APIs that exist for domains — never
      personal data.
- [ ] Alert on: domain age anomalies on lookalike domains (typosquat
      detection — defensive), ownership/org changes on our domains.

## Task 3 — Public repo & artifact audit

- [ ] Weekly: diff public repos for new secrets (use the existing
      GITHUB_TOKEN scan from `/api/security` as the core), new public
      endpoints, changed dependency manifests.
- [ ] Output: change log, not a firehose.

## Task 4 — Company-intel refresh (companies only)

- [ ] Reuse `/api/intel` as a library: weekly refresh for a watched list of
      companies (partners, programs, competitors). Same stripping rules:
      company data only, no officer fields.

## Task 5 — The digest

- [ ] One weekly digest (markdown, saved + optionally emailed to my own
      address): mentions, domain events, repo changes, company deltas.
- [ ] 30-line hard cap. If the digest is longer, the watcher is doing the
      operator's job — fix the watcher.

## Entry criteria for building any of this

1. Every data source is public and ToS-legal, documented in the task.
2. The output schema contains no field that is about a person.
3. A third party reading the code can see the guardrail, not just hear it.
