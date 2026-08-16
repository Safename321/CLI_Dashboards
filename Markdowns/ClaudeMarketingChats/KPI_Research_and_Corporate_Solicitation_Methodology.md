# KPI Research & Corporate Solicitation Methodology

*A generalized playbook for two connected disciplines: (1) researching, computing, and presenting comparable KPI data for any industry, and (2) turning that research into credible outbound corporate solicitation — pitches, prospecting letters, and proposals sent to named decision-makers. Written from a real airline KPI build and an accompanying CEO-solicitation letter, abstracted so both halves apply to any industry or target.*

---

## 0. The one principle everything else serves

**A comparison table is only worth building if the numbers in a column are actually comparable to each other.** Every rule below exists to protect that. A column that mixes definitions, fiscal periods, currencies, or reported-vs-computed figures looks like data but cannot be compared — it is worse than an empty column, because it invites false conclusions and collapses trust in the whole sheet the moment one cell is checked against a source.

The discipline is: **one consistent method per column, applied identically to every row, sourced or computed transparently, with gaps left visibly empty rather than filled by guessing.**

---

## 1. First step in a NEW industry: discover its native KPI set

Do not start from a generic financial template. Each industry has its own operating metrics that practitioners, regulators, and analysts actually use, and those are the columns that matter. Getting the *wrong* KPIs produces a technically-correct but useless spreadsheet.

**How to discover the right KPIs (in order):**
1. **Find the sector's standard framework.** Ratings agencies, industry bodies, and equity-research desks publish KPI guides. (Airlines: S&P Global Market Intelligence's airline KPI guide, IATA. Banking: Basel III ratios, FDIC/Fed call-report schedules. Film: MPA, Comscore, Box Office Mojo. Retail: same-store-sales conventions from any 10-K.) Search `"<industry> KPI guide"`, `"<industry> key metrics"`, `"how to analyze <industry> companies"`.
2. **Read one primary filing end to end.** A single company's 10-K / annual report "Management's Discussion & Analysis" section names the metrics that industry lives by — they define them in their own words because they're required to. This is the fastest way to learn what a sector measures.
3. **Read one equity-research or credit note.** Bank analyst decks (e.g. a JPM sector outlook) contain the comp tables that show exactly which 10–20 metrics professionals line carriers/banks/studios up against. If the user holds such research, that is the highest-value starting point (see §7).
4. **Cross-check across 2–3 companies** to confirm a metric is industry-wide, not one firm's idiosyncrasy.

**Worked examples of industry-native KPI sets:**

| Industry | The metrics that actually matter (native KPIs) | Generic financials still included, but secondary |
|---|---|---|
| **Airlines** | ASM/ASK (capacity), RPM/RPK (demand), Load Factor, RASM/RASK & PRASM (unit revenue), CASM & CASM-ex (unit cost), Break-Even Load Factor, Yield, OTP, Completion Factor, Mishandled Bags, Fleet count/age | Revenue, EBITDA, Net Income, Employees |
| **Banking** | Net Interest Margin (NIM), Efficiency Ratio, Return on Assets (ROA), Return on Equity (ROE), Book Value / Tangible Book Value per share, Price/Book, CET1 & Tier 1 capital ratios, Loan-to-Deposit, NPL ratio, Loan-loss provisions/coverage, Assets-to-Liabilities, Net charge-off rate | Revenue (net interest + fee income), Net Income, Headcount |
| **Film / Studios** | Box office gross (domestic/intl/worldwide), Opening weekend, Budget & P&A spend, Multiple (total÷opening), Theater/screen count, Per-theater average, Audience score / CinemaScore, Streaming viewership hours, Subscriber count & churn, Content spend, ARPU | Revenue, Operating margin, Library value |
| **Retail** | Same-store / comparable sales growth, Sales per square foot, Inventory turnover, Gross margin, Store count, Average transaction value, Traffic & conversion, E-commerce % of sales, Days inventory outstanding | Revenue, EBITDA, Net Income |
| **SaaS** | ARR/MRR, Net Revenue Retention (NRR), Gross churn, CAC & CAC payback, LTV/CAC, Magic Number, Rule of 40, Gross margin, ARPU, Logo count | Revenue, Operating margin, FCF |
| **Energy / E&P** | Production (boe/d), Proved reserves, Reserve replacement ratio, Finding & development cost, Lifting cost per boe, Netback, Decline rate, Reserve life index | Revenue, EBITDA, Net Income |
| **Telecom** | ARPU, Subscribers, Churn, Penetration, Capex/revenue, Spectrum holdings, Tower/site count, Data usage per sub | Revenue, EBITDA, FCF |
| **Hotels** | RevPAR, ADR (average daily rate), Occupancy, Rooms available, Pipeline rooms, Fee revenue %, RevPAR index vs comp set | Revenue, EBITDA, Net Income |

**The transferable move:** the airline sheet's "RASM ÷ load factor ÷ CASM" logic is the *same shape* as banking's "NIM / efficiency ratio / ROE" or film's "opening / multiple / per-theater." Every industry has (a) a **capacity/scale** metric, (b) a **utilization** metric, (c) a **unit economics** metric, and (d) **quality/reliability** metrics. Map the new industry onto those four buckets and the column set falls out.

---

## 2. Source hierarchy (best to worst) — same for every industry

Fill each cell from the highest tier available; note the tier in-cell or in a Sources tab.

1. **Primary regulatory filing** — 10-K / 20-F / annual report, bank call reports, filings to the national securities commission. Authoritative; this is what survives a challenge. (US: SEC EDGAR. EU: company IR + national registers. Every public company on earth files *somewhere*.)
2. **Company's own investor materials** — earnings releases (8-K), results presentations, IR fact sheets, monthly traffic/production statistics. Same numbers, easier to read.
3. **The user's own held research** — paywalled bank/analyst decks, credit reports, subscription databases the user already possesses (see §7). Often the *only* public-adjacent source for computed comps and unit figures.
4. **Reputable aggregators** — Yahoo/Google Finance, StockAnalysis, MacroTrends for financials; industry-specific trackers (Comscore, Cirium, STR, Sensor Tower). Good for cross-check; watch definitional drift.
5. **Workforce/alt-data trackers** (Revelio, LinkedIn-scraped) — directional only; systematically **undercount non-US and private entities** (they scrape English-language profiles). Never use as sole source for a foreign or private company.
6. **News articles / secondary summaries** — acceptable for a single figure with attribution; never reconstruct a whole column from these.

**Rule:** if two tiers conflict, prefer the higher tier and note the discrepancy rather than silently picking one. Surprising-but-sourced beats tidy-but-unverified.

---

## 3. Consistency rules (the heart of it)

### 3a. One basis per column, declared in the header
Decide the basis and put it *in the column header*, then hold it for all rows:
- Headcount vs. FTE vs. active-employees → pick one (e.g. "Employees (headcount, FY25)").
- Group vs. parent-entity vs. segment → pick one (e.g. bank holding co. vs. lead bank; studio vs. parent conglomerate).
- Per-mile vs. per-kilometer, per-share vs. absolute, gross vs. net.
- When group and segment differ materially, show **both** in the cell rather than choosing silently (e.g. "139k group / 103k mainline").

### 3b. Fiscal-period alignment
Companies have different fiscal year-ends. State the period per row (an "FY" column) and prefer the most recent *comparable* full year. Note stub/9-month figures explicitly as such — never annualize silently. A trailing-twelve-months (TTM) column is often the cleanest way to force alignment when year-ends scatter.

### 3c. Currency normalization
Convert everything to one reporting currency. **State the rate, the date, and the method** on the sheet. Two valid methods, and they differ:
- **Snapshot rate** (one date, all rows) — correct for a *comparison* sheet; keeps every carrier on the same FX basis. Preferred default.
- **Period-average rate** (each figure at its fiscal-year average) — correct for reconstructing historical performance.
- Quantify the difference so the reader knows the noise floor: in the airline build, snapshot-vs-FY-average diverged **~3.4% on average**, but one outlier (INR, −9.9%) mattered. Always preserve the **original-currency figure** in a notes cell so nothing is lost.

### 3d. Reported vs. computed — and when internal consistency beats official numbers
This is the subtle one. Companies "dress up" the same metric with different inclusions (one airline's RASK uses passenger-revenue÷passenger-ASK; another includes cargo). Their official numbers are therefore **not comparable to each other**.

**Resolution:** if you compute a metric yourself from raw line items (e.g. total revenue ÷ total capacity), applying the **identical formula to every row**, the result IS internally comparable — which is the whole point of a comparison — *even though it will not match any single company's officially-reported version.* That mismatch is acceptable and correct, provided you:
- **Label the column "computed, <formula>"** so no one expects it to tie to a company's headline number.
- Apply the formula from the **same line items** for every row (same numerator definition, same denominator).
- **Only compute where you hold the genuine raw inputs.** Computing from a fabricated or annualized-guess denominator produces numbers that *look* consistent but rest on invention — worse than leaving the cell empty. (In the airline build: computed US Big-3 + AF-KLM + IAG + Lufthansa cleanly because full-year revenue AND capacity were in hand; left Turkish/Cathay/Korean/China empty because only partial-year or growth-rate capacity was available — the denominator would have been a guess.)

The judgment: **internal consistency is the correct standard; but it is only *credible* where the inputs are real.** Apply the method fully where you have the data, and stop honestly where you don't.

---

## 4. Computation patterns (transferable arithmetic)

- **Unit metric = aggregate ÷ volume**, both full-period, same definitions across rows. (Airline RASM = revenue÷ASM; bank NIM = net interest income÷avg earning assets; hotel RevPAR = room revenue÷available rooms; SaaS ARPU = revenue÷users.)
- **Derived ratio from two computed columns** — e.g. airline Break-Even Load Factor = CASM ÷ PRASM × actual LF. Once the input columns exist, the derived one is a formula, not a search. (Analogue: bank efficiency ratio = noninterest expense ÷ revenue; retail sell-through = units sold ÷ units received.) Put these as **live spreadsheet formulas** on a "Derived" tab referencing the sourced inputs, so they recompute if an input is corrected, and flag them "derived, not filed."
- **Unit conversion factors:** km→mi ×0.621371; normalize per-share by share count; per-square-foot by store area. State the factor.
- **EBITDA when only EBIT is given:** EBITDA = operating income + D&A, from the same statement, labeled "(computed)." Many firms report EBIT, EBITDAR (adds rent — standard in airlines/retail leasing), or adjusted variants instead of clean EBITDA; note which basis each cell uses.

---

## 5. What to disclose, and how to present it

- **Empty is a valid, honest answer.** Use a consistent marker (em-dash) for "not sourced this session." Never fill a cell with a guess to avoid a blank. A column that is 40% filled with sourced data and 60% honest blanks is more valuable than 100% filled with mixed-credibility numbers.
- **Distinguish "structurally unavailable" from "not yet found."** Some metrics are genuinely not public (most carriers don't disclose Break-Even Load Factor or NPS; private/state firms don't file). Say so, so the user stops chasing data that doesn't exist. Others just need another search — flag those as outstanding, not impossible.
- **Every non-obvious number traces to a source.** Maintain a Sources tab with dated, linked references. A figure you can't attribute, omit — never invent an attribution.
- **Definitions tab.** Define every column, its basis, and its computation. This is what lets a third party trust and reuse the sheet.
- **Notes/vintage column.** Per-row context: the fiscal period, one-offs, why a figure looks odd, the original-currency amount.
- **Flag data-quality tiers visibly** where they differ (e.g. "(10-K)" vs "(Revelio, undercounts)").
- **Formatting for scannability:** consistent units, wrap text, two-line rows, freeze header/first column, color-code source tiers or computed-vs-reported if helpful. Function over decoration.

---

## 6. Cross-checking and error discipline

- **Sanity-check every computed figure** against any reported analogue and against peers — an outlier usually means a unit error (km vs mi), a period mismatch (9-mo vs FY), or a scale error (thousands vs millions), not a real finding.
- **Believe surprising-but-sourced numbers** (a genuine loss, a CEO departure) but be **skeptical on aggregator figures** and anything that can't be traced to a filing.
- **Recompute after every edit** if the sheet has formulas; a structural insert (adding a column) can silently shift every downstream cell — re-verify alignment against headers after any insert/delete.
- **When corrected, don't overcorrect** into the opposite confident claim; re-source and state what's actually known.

---

## 7. Mining the user's own held research (high-value, often decisive)

The user frequently already holds the single best source: paywalled analyst/credit decks, subscription-database exports, internal reports — sitting in their email or files. These often contain the **comp tables** that fill an entire block of columns at once (a bank-research airline deck may have one page with ASK, RASK, CASK, load factor, and credit spreads for 20+ carriers).

**Method:**
- **Ask the user directly** what proprietary research they hold and can share — name the specific missing inputs (see the standing ask below), because the user can often find in one PDF what would take dozens of searches to assemble piecemeal, or what isn't public at all.
- **Programmatically mine it:** an email/file miner that (a) locates messages/attachments by keyword, (b) extracts text from PDF/xlsx/docx attachments, and (c) routes that text through an LLM for structured KPI extraction keyed to the exact column labels. Regex alone is too brittle for dense research PDFs; LLM extraction reads the tables. (Implemented for this project as `emclient_airline_miner.py --llm`.)
- **Treat extracted figures at their true source tier:** a JPM/Fitch/S&P figure is tier-3 (held research) — strong, but cite it as such, and where possible confirm the load-bearing ones against the primary filing.
- **Extraction ≠ comprehension:** pulling text from a PDF is not understanding it. Have the model actually read and interpret the tables/charts (including rendering chart pages as images when the data is only in a graphic), not just string-match.

**The generalizable point:** before grinding through public search for hard-to-find metrics, ask "does the user already own the answer?" For paywalled unit-economics, credit, and viewership data, they very often do.

---

## Appendix — Standing ask to the user (fill from your held research / email)

For the current airline sheet, these specific inputs would let the consistent, computed unit-economics block extend to the carriers currently left empty. If any sit in your JPM / Fitch / S&P PDFs or mailbox:

1. **Full-year 2025 ASK** (available seat-km) for: Turkish, Singapore, Cathay, Korean, Air China, China Southern, China Eastern, IndiGo, Emirates, Qatar. *(This is the missing denominator — revenue is in hand, capacity is not.)*
2. **Full-year 2025 total operating cost** for those same carriers. *(The CASM numerator.)*
3. **Any airline comp / benchmarking table** in a bank-research deck — these typically carry ASK, RASK, CASK, load factor, and credit spreads for many carriers on one page, filling several columns at once.

*Generalize this appendix per industry: for banking, ask for the analyst comp sheet with NIM/efficiency/CET1; for film, the Comscore/studio grosses export; for SaaS, the board deck with ARR/NRR/CAC.*

---

*This methodology covers two connected halves. §§1–7 are industry-agnostic by design for the KPI research — swap the KPI set (§1), keep the sourcing hierarchy (§2), consistency rules (§3), computation discipline (§4), disclosure standards (§5), and the held-research mining (§7) unchanged. §8 is target-agnostic for the solicitation half — swap the industry and recipient, keep the source discipline (§8a), the selection and framing rules (§8b), the estimate-labeling and falsifiable-claim disciplines (§8c–d), and the editing sequence (§8e–f) unchanged.*

---

## 8. From KPI research to a corporate solicitation letter — the full method

Everything above builds a trustworthy dataset. This section covers the second half: turning that research into outbound material — a pitch, prospecting letter, or solicitation — sent to a specific, named decision-maker, without it collapsing into either (a) unsupported sales claims or (b) research so generic it could go to anyone.

### 8a. Source primary interviews and statements the same way as financial data
Apply the source hierarchy from §2 to *behavioral and strategic* material, not just numbers:
- **Primary interviews and earnings-call transcripts** (the CEO's own words, dated, attributed) rank above secondary paraphrase — a direct quote from an earnings call or a trade-press interview is tier-1; a listicle summarizing "what CEOs think" is tier-3 at best.
- **Verbatim quotes, not paraphrase.** Pull the exact words, with outlet and date, into a standing research file (this project used `Airline_Research_Notes.md`) before drafting any outbound copy. Paraphrasing at the research stage loses the specificity that makes a quote usable and checkable later.
- **Round-based collection.** Work through the target list in batches (this project ran 9 rounds), searching 2–3 sources per person, cross-checking for departures/role changes, and logging what's still missing rather than silently skipping gaps.
- **Track departures and status changes explicitly.** A CEO's stated position is only current until it isn't — verify present-tense claims (their employer, their peers' names, their events) against the solicitation date, not the date research began.

### 8b. Choosing which KPIs/findings to lead with — the selection discipline
Not every sourced fact belongs in the letter. The selection process that worked:
1. **Draft a version that includes the sharpest, most attention-getting finding available** (in this project: a pattern of CEO departures with causes that didn't match official statements). Look at it cold.
2. **Pressure-test the frame, not just the facts.** A finding can be perfectly sourced and still be the wrong thing to lead with if it reads as a threat, an accusation, or research performed *at* the recipient rather than *for* them. The test: does this finding serve the recipient's own curiosity, or does it serve the sender's need to create urgency? If the latter, demote or cut it even though it's true.
3. **Prefer findings that are about the recipient's own organization or peer set over findings about the recipient personally.** A pattern across an industry is a shared observation; a pattern that points at one person's tenure reads as a threat, however accurate.
4. **State complicating evidence, don't suppress it.** If the sourced material contains a finding that *cuts against* the simple version of the pitch (in this project: a detailed account showing a margin swing was mostly non-management-driven), include that complication rather than the cleaner but less honest story. It costs a little punch and buys credibility that survives a knowledgeable reader's second look.
5. **Match KPI choice to what the recipient already tracks.** Frame new/unfamiliar metrics (a culture score, a behavioral index) in the vocabulary of metrics they already manage by (RASK, load factor, unit cost) so the pitch reads as an extension of their existing dashboard, not an import from a foreign discipline.

### 8c. Building estimates transparently when the real instrument can't run yet
Sometimes the pitch wants to show the product's *output*, not just describe it, before the client has supplied real data. Two options, and the choice matters for credibility:
- **Label an estimate as an estimate, visibly, everywhere it appears** — in the deliverable file (this project used brown font + "(est.)" tags in the spreadsheet) and in any prose that quotes it. Never let a modeled or inferred number sit next to real data with no visual or textual distinction.
- **Prefer omitting a self-generated estimate from the solicitation letter itself over including a hedged one.** An estimate with enough caveats to be honest ("a modest but real gap, built from public statements, not instrument data") often reads as weaker than no number at all, and can create an internal contradiction if the surrounding prose also argues "nobody can currently measure this." When in doubt, cut the estimate from outbound copy and keep it in the internal backing file for reference.

### 8d. The falsifiable-claim rule for solicitation copy specifically
This is the discipline that most separates a credible pitch from vendor noise:
- **Every claim of capability needs either a citation or a falsifiable commitment — not confident language alone.** "Our instruments are built to answer this with real data" is a claim with no proof and no way to check it. "Within the first ninety days we will give you X specific number, measured against your own data" is a commitment the recipient can hold the sender to.
- **Define the deliverable in the recipient's terms.** "Results you can see for yourself" is vague; "a baseline score for your top two hundred leaders, refreshed quarterly, tracked against the negotiations and hires you already watch" is a specific artifact with a cadence.
- **Read every claim as the specific skeptical recipient would**, not as the sender wants it to land. The single highest-value edit in this project came from an explicit devil's-advocate pass — reading the draft as a time-poor, skeptical CEO under board pressure — which surfaced an unsupported claim and a vague deliverable that a friendlier read had missed entirely.

### 8e. Iterative tightening — the actual editing sequence that worked
1. Draft with the sharpest available hook.
2. Get direct feedback that the hook is wrong in *register* even if right in *fact* ("too jugular," "too threatening and presumptuous").
3. Replace the hook with a curiosity-first opening that states the product's core mechanism in the first sentences, in the recipient's own vocabulary.
4. Rebuild the body around sourced material that is about the recipient's *organization* (not their tenure), stating complications honestly.
5. Add and then **remove** a self-generated estimate once it created an internal contradiction — a real backtrack, kept rather than smoothed over.
6. Cut a scheduling ask in favor of a capability-and-terms statement (what we can do, on what timeline, at what cost to you) — removes friction for a time-poor reader.
7. Run an explicit adversarial read from the recipient's seat. Fix exactly what that read surfaces: unsupported claims → falsifiable commitments; vague deliverables → named, dated ones; residual friction (budget asks, meeting requests) → removed if they don't serve the recipient's actual problem.
8. Enforce a hard length/format constraint (one page, ~350–400 words) *after* the content is right, not before — cutting for length before the substance is sound tends to cut the wrong things.

### 8f. What never belongs in solicitation copy, regardless of how it improves the pitch
- A number with no source and no future-tense commitment behind it.
- A finding framed around what could happen *to* the recipient personally (job security, personal risk) rather than what the sender can do *for* the organization.
- Any claim the sender cannot point to real backing for if the recipient asks "how do you know that." (This applies to both sourced facts and product capability claims equally.)
- Language that performs carefulness or honesty ("we want to be careful here") instead of just being careful. A skeptical, time-poor reader spends their attention span on this kind of throat-clearing and reads the rest with less patience, not more trust.

---
