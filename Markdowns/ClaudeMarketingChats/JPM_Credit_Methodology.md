# How J.P. Morgan Derives Its Airline Credit Views — Read from the Deck

*Source: J.P. Morgan Aviation Credit (HG/HY) & Equity 2026 Mid-Year Outlook, 291 pages, July 2026. Every point below is drawn from the report's own text; page numbers cited.*

---

## 1. The stated methodology (verbatim basis, page 286)

JPM's own "Explanation of Credit Research Valuation Methodology" is on page 286. It is a **bond-level rating system with two inputs combined**:

1. **Relative value (valuation)** — where the bond trades versus its index/sector/benchmark.
2. **Fundamental credit view of the issuer** — JPM's opinion on whether the issuer can service its debt when due.

The fundamental view is built from, in their words, the company's **underlying credit trends, overall creditworthiness, and ability to service debt**. The specific analytical inputs they name:
- **Cash flow capacity and trends**
- **Standard credit ratios: gross and net leverage, interest coverage, liquidity ratios**
- **Profitability, capitalization, and asset quality**

The rating scale is a **3-month relative call**, not an absolute grade:
- **Overweight** — expected to outperform the index/sector/benchmark over the next 3 months
- **Neutral** — expected to perform in line
- **Underweight** — expected to underperform
- For **CDS**: Long Risk / Neutral / Short Risk on the same 3-month relative basis

**Key inference:** JPM's "view" is *not* a credit rating in the S&P/Moody's/Fitch sense. It is a **relative-value trade recommendation over a 3-month horizon** that blends fundamentals with where the paper is currently priced. That is why it was correct to remove the "JPM Credit View" column from a KPI comparison sheet — it is a time-stamped trading call, not a durable creditworthiness metric, and it goes stale in months. The agency ratings and the leverage/CDS columns that remain are the durable, comparable measures.

The issuer recommendation applies to **all bonds at the same level of the capital structure** unless a specific security is called out separately (p286).

## 2. Ratings distribution — the base rates (page 286)

As of 4-July-2026, JPM's global credit research universe was distributed:
- **Overweight (buy): 26%**
- **Neutral (hold): 58%**
- **Underweight (sell): 16%**

**Inference:** the modal call is Neutral by a wide margin (58%). An Overweight or Underweight is therefore a meaningful deviation from JPM's own baseline, not a coin-flip. When they rate an airline OW or UW, that is a deliberate relative bet against a book that is majority "hold."

## 3. The fundamental credit factors, as actually applied (pages 3–4, 7)

Reading how JPM reasons about specific airlines reveals the fundamental factors that move their view, in practice:

**Balance-sheet trajectory / deleveraging execution** is the dominant theme:
- **DAL**: "ascended to mid BBB status, we still see potential upside to high BBB" — rewarded for consistent balance-sheet improvement.
- **UAL**: "back on track for IG after the American merger speculation detour" — upgraded to OW HY unsecured on 17-Jun-26 specifically as deleveraging resumed.
- **AAL**: "current management team has exceeded debt reduction goals despite some self-inflicted wounds… lagging margins vs. the two best-in-class network peers (DAL/UAL)" — held at Neutral because leverage is still high (~4x) and margins lag, even though debt reduction is real.

**Liquidity runway and unencumbered assets** (a recovery/downside factor):
- **JBLU**: "will need to tap the ~$6bn unencumbered asset hoard to raise incremental capital in 2H26" — the size of the unencumbered asset base is what keeps them out of an Underweight/Ch.11 base case.
- **SAVE (Spirit)**: "merger or failure is the base case… it was the latter" — ran out of liquidity runway; the fuel spike was "the dagger in the heart of the Spirit restructuring."

**Margin quality and business-model position:**
- **LUV (Southwest)**: "Regained margin parity with leaders more quickly than expected… balance sheet parameters establish a low/mid BBB floor" — upgraded from UW to N on 17-Jun-26 as margins recovered.
- **ULCC model**: "still an unprofitable airline running… a profitable aircraft finance/trading business with aggressive maintenance accounting" — flagged for low earnings quality.

**Inference — the applied fundamental hierarchy:** (1) leverage trend and deleveraging execution, (2) liquidity runway / unencumbered collateral, (3) margin quality vs. best-in-class peers (DAL/UAL are the benchmark), (4) earnings quality / accounting aggressiveness. These map directly onto the "cash flow, leverage, coverage, liquidity, profitability, asset quality" list on p286 — the deck practises what the methodology page states.

## 4. Recovery analysis — the collateral hierarchy (page 13)

For downside/default scenarios, JPM ranks collateral by expected recovery value. Their explicit ranking, best to worst:

**Young aircraft > network airline loyalty > spare parts/engines > network brand IP > routes/slots/gates (RSG) > old aircraft > LMA (low-margin airline) loyalty/brand**

Observations they draw:
- "Loyalty is the new 'Crown Jewel' but the structures are untested" — SAVE's loyalty/brand collateral "did little to improve recovery in liquidation."
- Spare parts/engines are "a favorite… but these pools are best kept unencumbered."
- RSG collateral is "battle-tested but… too big NOT to be challenged in any restructuring."
- They now **break out network-airline loyalty from LMA loyalty** — "a clear difference, as evidenced by SAVE ch11 and subsequent liquidation."

**Inference:** JPM's credit view on a *secured* instrument (like an EETC) is driven heavily by **what backs it and how that collateral behaves in a restructuring** — not just issuer creditworthiness. Hence their rule (p14): "underwrite airline credit FIRST and the aircraft SECOND." The LTV (loan-to-value) ratio and collateral type drive the secured-bond call; issuer fundamentals drive the unsecured call.

## 5. EETC / secured-bond mechanics (page 14)

For Enhanced Equipment Trust Certificates, the specific drivers of their view:
- **LTV ratios** — "improved significantly y/y given further amortization… coupled with continued appraised value uplift." Junior AAL tranches now have "LTVs inside 100%." They cite exact figures: "AAL 25-1 1L A 64.0%, 2L B 78.6%."
- **Structural protections** — tighter substitution rights (single-aisle for single-aisle), prohibition of stalking-horse fees, UCC creditor rights. AAL's four changes to its 21-1 EETC "which favor investors are now market standard."
- **Trading pick-up (spread)** — they track the 1L-to-2L spread differential vs. new issue (e.g., "AAL 26-1 1L to 2L… now 80bp in from ~90bp at new issue").

**Inference:** for asset-backed airline paper, the view = LTV + collateral quality (from the p13 hierarchy) + structural/legal protections + current spread vs. history. This is a genuinely different framework from the unsecured issuer view.

## 6. Proprietary data inputs feeding the fundamental view

JPM has data sources a rating agency doesn't, which feed their demand/revenue assumptions:
- **Chase card-spend data** (p61): "Chase Card Spend – Travel indexed to Jan 2019," broken out by income cohort ("Higher Income Spend Remains Up HSD"). This is JPMorgan Chase Bank transaction data — a direct read on travel demand by consumer segment, feeding revenue/traffic forecasts.
- **IATA sector forecasts** (p3, p276) — global traffic and profit forecasts, which they explicitly *disagree with when warranted* ("Given the timing of the IATA revision (6-Jun), we take the 'over' on global traffic (fuel is already ~15% lower)").
- **Aircraft appraisal values** (p13–14) — "we know how to value aircraft… and how courts treat aircraft globally," feeding EETC LTVs.

**Inference:** the fundamental view is forward-looking and data-rich — card spend for demand, appraisals for collateral, IATA as a baseline they adjust. It is not purely backward-looking ratio analysis.

## 7. Macro / sector overlay (pages 3, 15)

The sector call (Neutral for both HG and HY Aviation as of this report) sets the backdrop every issuer view is relative to:
- **Fuel** as the dominant swing factor: "Jet fuel spiked 164% from $1.92 (7-Jan) to $5.13 (27-Mar)"; fuel spikes "often lead to industry rationalization" (Spirit failure, possible JBLU/M&A).
- **Capacity discipline**: "domestic capacity growth is the lowest in a decade (3Q flat y/y)," driven by Spirit liquidation + OEM/supply-chain/MRO delays.
- **Traffic-to-GDP correlation**: traffic "still strongly correlated to GDP"; IATA cut 2026 global growth from 4.9% to 2.1%.
- HY Transportation spread 301bp vs. HY index 300bp; yield 7.38% vs. 7.23% (p15) — the relative-value anchor.

**Inference:** because every rating is a 3-month *relative* call, the sector recommendation and current spread levels are the benchmark. An OW means "outperform this Neutral sector"; the fuel path and capacity discipline are the swing factors that would move the whole sector and thus every issuer view with it.

---

## Bottom line — why this was removed from the KPI sheet

JPM's "credit view" is a **3-month, relative-value bond-trading recommendation** (OW/N/UW), combining (a) where the paper trades vs. benchmark and (b) a fundamental issuer view built from leverage, coverage, liquidity, cash flow, profitability, and asset/collateral quality. For secured paper it adds LTV, collateral type, and legal structure. It is powered by proprietary inputs (Chase card spend, aircraft appraisals) and is explicitly a short-horizon call against a sector benchmark.

That makes it the wrong kind of field for a cross-carrier KPI comparison: it is time-stamped, relative, and about *bonds* rather than the *airline's* durable creditworthiness. The **agency ratings** (absolute, slow-moving), **net leverage** (a fundamental ratio JPM itself uses), and **CDS/spread** (market-priced default risk) that remain in the sheet are the comparable, durable measures. The JPM view is best used as *color* — read from the deck when you want the current trade thesis — not as a column.
