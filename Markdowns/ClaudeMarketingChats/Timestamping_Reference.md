# Timestamping & Live-Status Reference

The convention for stamping every deliverable and every chat reply with a trusted time and the live status of CLI's web properties. Supersedes the ad-hoc versions in `CLI_Marketing_Playbook_v1.06/1.07` Part 1 — those remain the historical record; this file is the current format.

---

## The rule

Every document, file, PDF, image, saved artifact, **and chat reply** carries a timestamp. On files it is a footer line; in chat it closes the reply.

---

## The footer format (current)

Two bold lines. Line 1 is the trusted time; line 2 is per-host live status with a colored dot and each host's own version.

```
**HH:MM EDT · Day, Mon DD YYYY**
**🟢 CLI · 🟢 Vercel vX.Y.Zx · 🟢 GitHub vX.Y.Zx · 🟢 Droplet vX.Y.Zx**
```

- **🟢 = LIVE** (host returned/rendered), **🔴 = dead** (unreachable or error).
- **Each host shows its own version** — never a single shared version — because deploys drift between hosts and a lagging host must be visible at a glance. (First observed drift: 2026-08-16, Vercel one build behind Pages/Droplet.)
- **CLI** = connectiveleadership.com, the marketing site. It has no build string, so it carries a dot only, no version.
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
- Status alone (LIVE/dead, no version) can fall back to the sanctioned web-fetch tool.
- Version unreadable → print `v?`, never guess.

Endpoints:

| Host | URL | Version |
|------|-----|---------|
| CLI (marketing) | https://connectiveleadership.com | none (dot only) |
| Vercel (primary) | https://cli-dashboards-gamma.vercel.app/ | in-page footer |
| GitHub Pages | https://safename321.github.io/CLI_Dashboards/ | in-page footer |
| Droplet | http://161.35.118.231:8000/CLI_Dashboards/ | in-page footer (Chrome bridge only) |

---

## Auto re-probe

A 30-minute re-probe cycle runs via `send_later`: it re-reads time.is and all four hosts through the Chrome bridge, prints the two-line footer, and re-arms itself for another 30 minutes. If the bridge is unavailable it says so in one line and prints `v?` rather than guessing.

---

*Current stamping reference. When the footer format changes, update this file and leave the playbook Part 1 entries as history.*
