---
Timestamp: 2026-08-16, 3:27 PM ET (user-stated anchor)
Host status: status.claude.com checked live at time of writing — All Systems Operational. No incidents reported Aug 16, 2026. (Recent history: isolated model-specific incidents Aug 3–15, all resolved; none active.)
---

# Session Handoff — CLI Airline KPI / KLM Letter Project

**Instruction for the next chat: read every .md listed in §1 in full before doing any work.** They are not background reading — they are the operating rules and the source data for this project. Do not summarize-skip them; open and read each one.

---

## 1. Files to read, in this order, before proceeding

| # | File | Why it matters |
|---|---|---|
| 1 | `Stop lying, Stop moralizing.md` | **Standing behavioral rules, Parts I–XII.** Execution mode, honesty discipline, no moralizing, no posturing/hedging language ("honestly," "to be frank," etc. — banned), no lecturing, resourcefulness before reporting a gap, don't conflate separate requests, don't minimize a specific correction to one instance — generalize it, answer anticipated follow-ups without being asked twice, stop technicality dodges. **This file governs tone and behavior for the whole relationship, not just this project.** |
| 2 | `KPI_Research_and_Corporate_Solicitation_Methodology.md` | Two-part playbook: (1) building a comparable, sourced, industry-agnostic KPI spreadsheet — source hierarchy, consistency rules, computation discipline, disclosure standards; (2) turning research into a corporate solicitation letter — source discipline for interviews, selection/framing rules, falsifiable-claim standard, the actual editing sequence that worked. |
| 3 | `CEO_Intro_Letter_Methodology.md` | Narrower and more recent: the specific decisions behind the KLM letter — evidence hierarchy (third-party validation beats scale beats generic numbers beats nothing), stating complicating evidence rather than suppressing it, organization-level framing vs. personal-risk framing, the 10-item editing checklist (fragments, subject-verb agreement on product names, repeated words, dash consistency, list-item consistency, paragraph density, stray metaphors). |
| 4 | `JPM_Credit_Methodology.md` | How J.P. Morgan's Aviation Credit deck actually derives its OW/N/UW views (3-month relative bond call, not an absolute rating) — read in full from the primary source. Explains why "JPM Credit View" was removed from the KPI sheet and what replaced it (agency ratings + net leverage + CDS as durable measures). |
| 5 | `CLI_Credit_Outlook_Methodology.md` | CLI's own proprietary methodology spec (written for possible IP protection): composite score `S = 0.80×F + 0.20×E` — 80% fundamental credit score, 20% probability-weighted near-term event calendar (ratings reviews, earnings, dividends incl. a P(pay) sub-model, maturities, covenants, idiosyncratic events), mapped to a Moody's-style Aaa–C scale. |
| 6 | `Airline_Research_Notes.md` (+ matching `.pdf`) | The primary-source research base: ~9 rounds of dated, linked, verbatim-quoted material — CEO interviews, the departure-wave analysis (7 CEOs, causes traced to source, official reason vs. real trigger), the Air France/KLM culture research (2017 works-council study, the honest multi-causal read on the 2025–26 margin swing). Every factual claim used in the KLM letter traces back to something in this file. |
| 7 | `Airline_KPI_Comparison.xlsx` | The working dataset: 24 airlines, consistent per-ASM USD unit economics, credit block, OASI/A-OASI 9-vector estimates (clearly flagged as estimated, brown font), IR page directory. Reference for any airline-KPI question. |

**Also useful but secondary:** `CLI_Communications_Style_Guide.md`, `Claude_Honesty_Rules.md`, `The-Future-Pitch-Development-Notes.md`, `Timestamping_Reference.md` (defines the time-anchor convention used in this file's header) — read if the next task touches brand voice, prior honesty-rule history, or timestamp formatting specifically.

---

## 2. Who this is for

**Peter Blumen**, CEO, Connective Leadership Institute (CLI). Three Ivy League degrees (business + CS). Assume top-tier competence — see Part VII of the behavior file. CLI's product is **The Future**: 22 dashboards, 7 instruments (the ASI — Achieving Styles Inventory — framework: Direct/Instrumental/Relational clusters, 9 sub-styles), a mobile Employee Feedback App, and (separately, user-owned) a Financial Outlook product. CLI contact: PBlumen@ConnectiveLeadership.com. Brand colors: red #D93A3A, navy #1F3864.

---

## 3. State of the two live deliverables

### `Airline_KPI_Comparison.xlsx`
24 airlines, primary-sourced unit economics (US majors + AF-KLM, Lufthansa, IAG, Ryanair, easyJet, Wizz, Finnair, Norwegian, Singapore, IndiGo computed on a consistent per-ASM USD basis). CLI Credit Outlook column added (composite score, Moody's-scale grade) with a breakdown tab. OASI/A-OASI 9-vector estimates added for 12 carriers with interview-quote sourcing — explicitly flagged as estimated (brown font), not instrument output. **Outstanding, stated plainly rather than hidden:** Turkish's exact RASK/CASK need the 4Q'25 IR deck (reports natively in US cents); Gulf/Chinese state carriers structurally don't disclose unit cost, so those cells stay em-dashed by design, not by omission.

### `CLI_KLM_Letter_Reframed.docx`
One-page cold introduction letter to Marjan Rintel (CEO, KLM). Went through roughly a dozen revision rounds — see `CEO_Intro_Letter_Methodology.md` §8 for the checklist that emerged. **Current settled text, as of this handoff:**
- Opens on product mechanism, not a rhetorical hook.
- Leads proof with the International Leadership Association's 2010 Lifetime Achievement Award (third-party validation) + 45,000 leaders / ~2,000 orgs + 550 certified CLI Associates + airline-industry/comparable-scale relevance.
- States the AF/KLM organizational-friction history as fact, then the honest complication that the current margin swing is mostly Schiphol costs/network mix, not management — used as the reason the product is needed, not suppressed.
- Names three CLI products explicitly (bold): **CLI 7 Personal and Organizational Inventories**, **CLI's Employee Feedback App**, **CLI Financial Outlook**.
- Closes with a dated, falsifiable commitment (ninety-day baseline achieving-style assessment for the top 200 leaders, refreshed quarterly) rather than a meeting request.
- **The Future** appears in red/bold/italic consistently everywhere it's named.
- **Standing gap, stated honestly across every review pass:** no named client outcome/result, only scale and third-party validation. This is the one thing further editing cannot fix — it needs a real result from CLI's side (a testimonial, held in reserve for follow-up, is one option per the methodology doc).

---

## 4. Operating instructions carried forward (do not relitigate these)

- Execute directly; don't hedge, don't narrate carefulness, don't use "honestly/to be frank" register.
- Don't second-guess or lecture — the user has the domain expertise here, repeatedly and explicitly stated.
- **Do** still flag factual or grammatical errors before sending output back — this was tested explicitly and held: the user wants Claude catching grammar/inconsistency issues proactively, not deferring that to the user, and separately does not want factual claims about the letter's content self-censored into silence. These are two different things — keep them distinct (see Part XI, the "technicality dodge" rule).
- One instruction, one action — don't bundle unrelated changes into a single edit unless asked.
- When correcting a specific instance, generalize the correction going forward rather than treating it as scoped to that one instance (Part X.2).
- Timestamp convention: user states time once, Claude anchors and increments; format `≈ H:MM PM EST` (see `Timestamping_Reference.md`).

---

*Prepared as a standalone handoff — everything above should be sufficient to resume this project in a fresh conversation without re-deriving context.*
