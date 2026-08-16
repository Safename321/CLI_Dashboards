# CLI Credit Outlook™ — Methodology Specification

**A composite airline-credit scoring method combining fundamental credit analysis with a probability-weighted near-term event calendar.**

*Connective Leadership Institute — Proprietary and Confidential. Prepared as a methodology specification suitable for intellectual-property protection. Version 1.0.*

---

## Notice of proprietary rights

This document describes an original method for scoring issuer credit. It is prepared as a complete, enabling written description of the method for the purpose of establishing authorship, priority of invention, and a basis for patent and/or trade-secret protection. The specific weighting scheme (80/20), the event-calendar probability model, the notch-adjustment mechanism, and the mapping function described herein are the claimed inventive elements. All rights reserved.

---

## 1. Field and problem addressed

Existing credit assessments fall into two camps, each with a structural blind spot:

- **Agency ratings (Moody's, S&P, Fitch)** are absolute and durable but *slow-moving*. They are reviewed on the agency's schedule, lag events, and do not price the probability of an imminent, discrete credit-affecting event.
- **Bank credit-research views (e.g., J.P. Morgan's Overweight/Neutral/Underweight)** are a **3-month relative-value bond-trading call** blending fundamentals with where paper trades. They are timely but relative, security-level, and go stale in months (see accompanying analysis of JPM's stated methodology, page 286 of the JPM Aviation Credit deck).

**Neither systematically prices the near-term event calendar** — the specific, dated, knowable events over the next 3–12 months that can move a rating: scheduled agency reviews, earnings announcements, dividend declarations (and the probability the dividend is actually paid), debt maturities, refinancing dates, and covenant test dates.

The CLI Credit Outlook™ closes that gap. It takes a fundamental credit assessment (the durable, agency-style base) and **adjusts it by a probability-weighted score of the near-term event calendar**, producing a single forward-looking grade on the familiar alphabetic scale.

## 2. The composite: 80 / 20

The CLI Credit Outlook score `S` is a weighted composite of two sub-scores, each expressed on a common 0–100 numeric scale (100 = strongest credit):

```
S  =  0.80 × F   +   0.20 × E
```

where:
- **F = Fundamental Credit Score (0–100)** — the durable, issuer-level creditworthiness, weighted 80%.
- **E = Event Calendar Score (0–100)** — the probability-weighted near-term (3–12 month) event outlook, weighted 20%.

The 80/20 split is deliberate and is a claimed element of the method: fundamentals dominate (a credit is not remade by one quarter's calendar), but the near-term event calendar is given **material, explicit, standing weight** — enough to move the composite by up to roughly two-to-three notches in the extreme, which is the empirically observed magnitude of a surprise rating action or a suspended dividend.

## 3. Component F — Fundamental Credit Score (80%)

F adopts the fundamental factors that credit desks and agencies already use — the same six named in JPM's methodology (cash flow capacity, gross/net leverage, interest coverage, liquidity, profitability, capitalization/asset quality) — plus the airline-specific overlay. F is constructed as a weighted sub-composite:

| Fundamental factor | Weight within F | Primary inputs |
|---|---|---|
| Net leverage (ND/EBITDAR) & trend | 25% | Net debt / EBITDAR; year-over-year direction |
| Liquidity runway & unencumbered assets | 20% | Cash + undrawn facilities ÷ near-term obligations; unencumbered asset base |
| Profitability / margin quality | 20% | Operating margin, CASM-ex vs. peer benchmark, EBITDAR margin |
| Interest coverage & cash-flow capacity | 15% | EBITDAR / interest; free cash flow trend |
| Capitalization & asset quality | 10% | Fleet age/ownership, collateral quality (per the recovery hierarchy) |
| Business-model resilience | 10% | Break-even load factor cushion, network position, cost structure |

Each factor is scored 0–100 against the peer set and weighted. The anchor is the current agency rating: F is calibrated so that a mid-investment-grade issuer with stable metrics scores in the band that maps back to its agency notch, then the sub-factors move it within and across bands. **F is the 80% ballast — it is intentionally close to a durable agency-style view.**

## 4. Component E — Event Calendar Score (20%) — the inventive core

E scores the **near-term (3–12 month) credit-event calendar** on a probability-weighted basis. This is the element existing methods omit. E is built by enumerating every scheduled or expected credit-affecting event in the window, assigning each an **impact** (notch-equivalent effect on the credit if it resolves adversely) and a **probability** (likelihood of the adverse resolution), and netting the probability-weighted impacts into a 0–100 score.

### 4.1 Event types tracked

For each issuer, the calendar enumerates, over the forward 3–12 months:

1. **Scheduled rating reviews** — known/expected Moody's, S&P, Fitch review or outlook-update dates. Impact scaled by current outlook (a Negative outlook approaching a review is a high-impact, elevated-probability event).
2. **Earnings announcements** — dated; impact scaled by the consensus trajectory and guidance risk. A carrier guiding down into a print carries negative expected impact.
3. **Dividend events** — the declaration/ex-date, AND **the probability the dividend is actually paid** (see 4.2). A dividend cut or suspension is a first-order credit signal; a maintained dividend into strength is a positive.
4. **Debt maturities & refinancing dates** — near-term maturities that must be refinanced; impact scaled by size relative to liquidity and by prevailing spread/market access.
5. **Covenant test dates** — where applicable, quarterly covenant tests with limited headroom.
6. **Known idiosyncratic catalysts** — labor contract resolutions, regulatory decisions (e.g., DGCA/DOT actions), merger/anti-trust milestones, litigation dates, fleet-grounding resolution (e.g., GTF), CEO/governance transitions with credit implications.

### 4.2 The dividend-payment probability sub-model

A distinctive element: rather than treat a scheduled dividend as binary, CLI assigns **P(pay)** — the probability the declared/expected dividend is paid in full, on schedule — from:
- payout ratio vs. free cash flow,
- liquidity headroom after the payment,
- management's stated commitment and track record,
- covenant/restricted-payment capacity,
- the fuel/demand macro overlay for the payment window.

`P(pay)` enters E two ways: a **high P(pay) into a strong balance sheet** is credit-positive (signals confidence, discipline); a **dividend maintained despite thin liquidity** is credit-negative (cash leaving a stretched balance sheet); a **rising probability of a cut/suspension** is a negative catalyst weighted by its notch-impact.

### 4.3 Netting to the E score

For each event *i* with adverse-impact `I_i` (in notch-equivalents, signed) and probability `p_i`:

```
Net expected event impact  =  Σ ( p_i × I_i )
```

This net expected impact (a signed notch-equivalent) is mapped to the 0–100 E scale around a neutral midpoint (50 = a benign calendar with no material pending catalysts). A calendar dominated by adverse, probable, high-impact events scores well below 50; a calendar of positive catalysts (dividend initiation into strength, expected upgrade review, refinancing already completed) scores above 50.

## 5. Mapping the composite S to the alphabetic scale

The composite `S` (0–100) is mapped to the **Moody's-style 21-notch alphabetic scale** so it reads directly against the agency rating already tracked. The mapping is monotonic and banded:

| S (0–100) | CLI Outlook grade | Moody's-equivalent band |
|---|---|---|
| 97–100 | Aaa | Prime |
| 90–96 | Aa1 / Aa2 / Aa3 | High grade |
| 80–89 | A1 / A2 / A3 | Upper-medium grade |
| 70–79 | Baa1 / Baa2 / Baa3 | Lower-medium grade (IG floor) |
| 60–69 | Ba1 / Ba2 / Ba3 | Speculative |
| 45–59 | B1 / B2 / B3 | Highly speculative |
| 30–44 | Caa1 / Caa2 / Caa3 | Substantial risk |
| 15–29 | Ca | Near default |
| 0–14 | C | Default / lowest |

Within each multi-notch band the sub-score selects the specific notch (e.g., S = 84 → A2). The output column in the KPI sheet carries this single grade (Aaa–C). Because the scale matches Moody's, the CLI grade can be read **alongside** the agency rating: where CLI diverges from the agency notch, the divergence is the signal — it means the near-term event calendar (the 20%) is pulling the forward view above or below where the slow-moving agency currently sits.

## 6. Worked logic (illustrative)

- **A carrier at agency Baa2, stable metrics (F ≈ 74), a benign calendar (E ≈ 55):** S = 0.8×74 + 0.2×55 = 70.2 → **Baa3** area. The mild positive-neutral calendar holds it at the IG floor.
- **Same carrier, but a Negative S&P outlook with a review in 4 months and a dividend of questionable coverage (E ≈ 30):** S = 0.8×74 + 0.2×30 = 65.2 → **Ba1**. The adverse calendar pulls the forward grade one band below the current agency mark — a leading signal of downgrade risk the agency hasn't yet acted on.
- **A carrier initiating its first dividend into a deleveraging balance sheet with an expected upgrade review (E ≈ 72):** the calendar pushes S *above* the current agency notch — a leading signal of upgrade potential.

## 7. What the method claims (summary of inventive elements)

1. The **80/20 composite** of a fundamental credit score with a probability-weighted near-term event-calendar score.
2. The **event-calendar scoring model** that enumerates dated credit catalysts (reviews, earnings, dividends, maturities, covenants, idiosyncratic events) and nets them as `Σ(p_i × I_i)` in notch-equivalents.
3. The **dividend-payment probability sub-model** `P(pay)` and its dual (positive/negative) entry into the score.
4. The **mapping** of the composite onto the Moody's-style 21-notch alphabetic scale so the forward view is read directly against the agency rating, with divergence as the actionable signal.

## 8. Relationship to prior methods

The method **adds to**, rather than replaces, the JPM-style fundamental approach: it takes the same fundamental inputs (leverage, coverage, liquidity, profitability, cash flow, asset quality) as its 80% base, and layers the dated, probability-weighted event calendar as a standing 20% — something neither the agencies (too slow) nor the bank desks (3-month relative bond call) do systematically. The output is an *absolute, forward-looking issuer grade*, not a relative bond-trading recommendation.

---

*CLI Credit Outlook™ is a methodology of the Connective Leadership Institute. This specification is proprietary and confidential.*
