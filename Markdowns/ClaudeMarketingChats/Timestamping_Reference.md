# Timestamping & Live-Status Reference

The convention for stamping every deliverable and every chat reply with a trusted time and the live status of CLI's web properties. Supersedes the ad-hoc versions in `CLI_Marketing_Playbook_v1.06/1.07` Part 1 — those remain the historical record; this file is the current format.

---

## The rule

**Every chat reply** — the prompt back to the user — closes with the timestamp. Files, documents, PDFs, images, and saved artifacts do NOT get a footer stamped into their content — a file already carries its own save/modified time, so inserting a duplicate timestamp into the file itself is redundant. The timestamp lives in the chat, not in the deliverable.

**Any time this file is edited, the update must be posted to GitHub immediately as part of the same task — not batched, not left for later.** If a session cannot push (no GitHub write access available), it must say so explicitly rather than silently leaving the edit unposted.

---

## The footer format (current)

Two bold lines. Line 1 is the trusted time; line 2 is per-host live status with a colored marker and each host's own version.

```
**HH:MM EDT · Day, Mon DD YYYY**
**🟢 CLI · 🟢 Vercel-gamma vX.Y.Zx · 🔴 Vercel-v200n vX.Y.Zx · ⬜ GitHub vX.Y.Zx · ⬜ Droplet vX.Y.Zx**
```

- **🟢 = ONLINE** (host returned/rendered).
- **🔴 = OFFLINE** (checked and unreachable or erroring).
- **⬜ (blank) = didn't or couldn't check** — no probe was made, or the probe tool wasn't available. Never guess; a blank marker is always honest about "unknown," not a stand-in for green.
- **Each host shows its own version** — never a single shared version — because deploys drift between hosts and a lagging host must be visible at a glance. (First observed drift: 2026-08-16, Vercel one build behind Pages/Droplet.)
- **CLI** = connectiveleadership.com, the marketing site. It has no build string, so it carries a marker only, no version.
- Two lines, tight spacing — do not let line 2 wrap to a third line. Shorten labels before adding a wrap.

---

## Where the time comes from

There is no reliable clock tied to the user's timezone, and the cloud sandbox clock drifts. Sources, best to worst:

1. **time.is/EDT via the Chrome bridge (preferred).** Navigate a tab to `https://time.is/EDT`, read the atomic-clock time, close the tab. This is a real external clock and needs no anchor from the user.
2. **Anchor-increment (fallback).** The user states the real time once — that becomes the anchor — and every later stamp is an estimate incremented from it, labeled as an estimate. Drift accumulates; re-anchor whenever a fresh time is given.

Direct `curl` to a time source from the sandbox is blocked (returns `000` / exit 56), so the Chrome bridge is the working path for a trusted clock. An estimated stamp is always labeled as one.

---

## Where the status + version come from

Per host: **render the page and read the in-page footer**, `vX.Y.Zs · For authorized prospects only`, where the trailing letter tags the host build. The string is client-rendered by JavaScript, so plain HTML fetchers (sandbox `curl`, web-fetch) do **not** see it — the page must be rendered.

- **Preferred:** the Chrome bridge. Navigate a tab to each host and read the footer version with the find tool. This is the only way to reach the **Droplet** (raw IP, TLS/robots block the sandbox fetcher) from a cloud session.
- Status alone (ONLINE/OFFLINE, no version) can fall back to the sanctioned web-fetch tool.
- Version unreadable → print `v?`, never guess.
- Couldn't check a host at all (bridge unavailable, tool missing, ran out of time) → leave that host's marker **blank**, don't mark it red or green.

Endpoints:

| Host | URL | Version |
|------|-----|---------|
| CLI (marketing) | https://connectiveleadership.com | none (dot only) |
| Vercel (gamma) | https://cli-dashboards-gamma.vercel.app/ | in-page footer |
| Vercel (v200n) | https://cli-dashboards-v200n.vercel.app/ | in-page footer |
| GitHub Pages | https://safename321.github.io/CLI_Dashboards/ | in-page footer |
| Droplet | http://161.35.118.231:8000/CLI_Dashboards/ | in-page footer (Chrome bridge only) |

---

## Auto re-probe

A 30-minute re-probe cycle runs via `send_later`: it re-reads time.is and all five hosts through the Chrome bridge, prints the two-line footer, and re-arms itself for another 30 minutes. If the bridge is unavailable it says so in one line and leaves the affected hosts' markers blank rather than guessing.

**This is a specification, not a status report.** Reading the paragraph above does not make it true. A session that reads this file should check whether the cycle is actually running right now (list the account's scheduled tasks/Routines and look for it) before describing it as active, and say plainly if it isn't running rather than assuming it from having read that it should be. Restarting it is a normal thing to do when asked, or as part of whatever task is already at hand — it is not something to stand up unprompted purely because this file was read; creating recurring scheduled infrastructure gets a quick confirmation first, not silent autopilot.

The same standard applies to every other mechanism this file describes as existing: a present-tense description here ("the footer format is X," "the rule is Y") is something to verify on this read, not a fact already settled by a previous read.

---

*Current stamping reference. When the footer format changes, update this file, post the update to GitHub, and leave the playbook Part 1 entries as history.*
