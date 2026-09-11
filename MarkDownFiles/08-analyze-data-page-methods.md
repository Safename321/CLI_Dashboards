# Analyze Data Page — Build & Modification Methods

Reference for building, deploying, and extending the **Analyze Data** admin page on the
CLI assessment platform. Written so a future maintainer (human or AI) can pick up the work
without rediscovering the environment.

> **Secrets policy:** no passwords, tokens, or connection strings appear in this file.
> All credentials live in the NAS "Working Local Folder" as `Creds <Endpoint>.txt` files
> (e.g. `Creds CLIRC SQL Server.txt`, `Creds CLIRCPBlumen.txt`, `Creds Anthropic cli-dashboard-prod.txt`).
> Read them from there when needed.

---

## 1. What the page does

A social-science exploration tool for the ~46k assessment population. The admin picks:

- a **primary dimension** to group by,
- an optional **secondary dimension** (cross-tab),
- an **instrument** filter (All / ASI / OASI / A-ASI / A-OASI / 360 / A-360),
- a **minimum group size** (hides small cells).

It returns, per group: headcount, % of the filtered population, and the mean of all nine
Achieving Styles plus the Cumulative Mean, against an **Overall population** baseline row.
An **Interpret with AI** button sends the aggregate table to the Anthropic API for a written
reading.

**Design principle — aggregate only.** Only group-level counts and averages are ever computed
or sent to the AI. No individual records leave the server. This is both a privacy guarantee and
what keeps the AI payload small.

---

## 2. Where everything lives

| Item | Location |
|------|----------|
| Live URL | `https://assess.connectiveleadership.com/admin/reports_analyze_data.asp` |
| Page file | `C:\inetpub\wwwroot\admin\reports_analyze_data.asp` |
| Reports page link | `C:\inetpub\wwwroot\admin\reports.asp` (link above "Inventory Databases Summary") |
| Left-nav menu | `C:\inetpub\wwwroot\admin\nav.asp` ("Analyze Data" under "Reports") |
| DB connection include | `C:\inetpub\wwwroot\ssi\dbconn.asp` |
| Admin banner/footer includes | `C:\inetpub\wwwroot\ssi\banner_admin.asp`, `footer_admin.asp` |
| Anthropic API key | `C:\inetpub\cli_secrets\anthropic_key.txt` (**outside** the webroot, ACL-locked) |

**Server:** Contabo Windows VPS, IIS "Default Web Site" (physical path `C:\inetpub\wwwroot`),
classic ASP, app pool `DefaultAppPool`. SQL Server 2017 on the same box (`localhost,1433`).
Public IP is in `Creds CLIRC SQL Server.txt`.

---

## 3. Access & deployment channel

Three distinct channels exist on the VPS; each has different powers:

1. **SQL login** (sysadmin) — reads/writes *data* and can read webroot files via
   `OPENROWSET(BULK ..., SINGLE_CLOB)`. Runs `xp_cmdshell`, **but** that shell executes as a
   locked-down service account with **no write access anywhere** — so it cannot deploy files.
2. **Windows `Administrator`** over **WinRM/HTTPS, port 5986, `-Authentication Basic`** — the
   working deploy channel (Negotiate/HTTP fail with Access Denied). Administrator has Full
   Control on `C:\inetpub\wwwroot`.
3. RDP 3389 is open (interactive only); SMB 445 is open but `net use` fails (error 64).

### Deploy recipe (PowerShell, from a workstation)

Edit the file locally, then transfer byte-exact via base64 to avoid encoding/CRLF surprises:

```powershell
# 1) base64-encode the local .asp
base64 -w0 reports_analyze_data.asp > page.b64   # (git-bash) or [Convert]::ToBase64String on Windows

# 2) push via WinRM Basic as Administrator (creds: Creds CLIRC SQL Server.txt)
$b64  = Get-Content page.b64 -Raw
$cred = Get-Credential Administrator      # or build a PSCredential
$so   = New-PSSessionOption -SkipCACheck -SkipCNCheck -SkipRevocationCheck
Invoke-Command -ComputerName <VPS-IP> -UseSSL -Port 5986 -Authentication Basic `
  -Credential $cred -SessionOption $so -ArgumentList $b64 -ScriptBlock {
    param($b64)
    $t = 'C:\inetpub\wwwroot\admin\reports_analyze_data.asp'
    Copy-Item $t "$t.bak_$(Get-Date -Format yyyyMMdd_HHmmss)"          # always back up first
    [System.IO.File]::WriteAllText($t,
      [System.Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($b64)),
      (New-Object System.Text.UTF8Encoding($false)))                   # UTF-8, no BOM
  }
```

Always `Copy-Item` a timestamped `.bak_<stamp>` before overwriting. To read a server file
without a session, use the SQL channel: `SELECT BulkColumn FROM OPENROWSET(BULK N'<path>', SINGLE_CLOB) AS x`.

---

## 4. Data model

All demographic + score data is in the **`instruments`** database (schema name also
`instruments`, so tables are `instruments.instruments.<table>` in 3-part naming). One row per
person, keyed by `ID`, joinable across:

- **`contact`** — identity + `lblVersion` (instrument type), `activeRecord`, dates.
- **`userinfo`** — `style1`…`style9` (the nine Achieving Styles), `cMean` (Cumulative Mean),
  plus `state`, `country` (int code), `zip`.
- **`demog`** — `sex`, `age`, `marital_status`, `highest_degree`, `degree_field`,
  `level_within_work`, `employer_type`, `student_status`, `naicsCode` (industry),
  `children`, `[ORDER]` (birth order; reserved word — always bracket it), etc.

**Achieving Styles order** (from `ssi/display_style_scores.asp`):

| Col | Style | Set |
|-----|-------|-----|
| style1 | Intrinsic | Direct |
| style2 | Competitive | Direct |
| style3 | Power | Direct |
| style4 | Personal | Instrumental |
| style5 | Social | Instrumental |
| style6 | Entrusting | Instrumental |
| style7 | Collaborative | Relational |
| style8 | Contributory | Relational |
| style9 | Vicarious | Relational |

Scores are on a 1–7 scale; a few rows carry out-of-range junk, so every average is guarded
with `AVG(CASE WHEN style_i BETWEEN 1 AND 7 THEN style_i END)`.

**Lookup (`codes`) tables** (3-part: `codes.codes.<table>`): `demog_sex`,
`demog_marital_status`, `demog_highest_degree`, `demog_level_within_work`,
`demog_employer_type`, `demog_student_status`, `degree_field` (join on `fieldCode`),
`countries` (join `countryCode` = `userinfo.country`), `naics`. State names come from
`records.records.states` (`stateAbbr`, `stateName`).

**Instrument codes** (`contact.lblVersion`): `13R`=ASI, `13O`=OASI, `13AR`=A-ASI,
`13AO`=A-OASI, `13EM`/`13EF`=360, `13AEM`/`13AEF`=A-360. (ASSET-family instruments live in a
separate `asset` DB with no `demog` table, so they are intentionally out of scope here.)

Cross-database joins work in a single query because everything is on one SQL Server instance.
Watch for **collation conflicts** when joining across DBs (e.g. `instruments` ↔ `records`):
force `COLLATE DATABASE_DEFAULT` on both sides of the string comparison.

---

## 5. Page architecture (classic ASP / VBScript)

Mirrors the existing admin pages so it drops into the app cleanly:

```asp
<% Response.Buffer = True
   If Not Session("passAccess") Then Response.Redirect("login.asp?task=logout")
   On Error Resume Next %>
<!--#include virtual='/ssi/dbconn.asp'-->      ' gives instConn, codesConn, ... connection strings
...
<!--#include virtual='/ssi/banner_admin.asp'-->
...
<!--#include virtual='/ssi/footer_admin.asp'-->
```

- Auth: the `Session("passAccess")` guard is the standard admin gate.
- DB: open ADO recordsets against **`instConn`** (Database=instruments); reference other DBs
  with 3-part names in the SQL text.
- No dependency on `functions_extras.asp` — number formatting is done inline
  (`FormatNumber`, plus `Fmt2`/`FmtInt`/`Pct`/`EncHTML` helpers defined in-page).

### Dimension engine

Each selectable dimension is described by `DimSpec(key, slot)` which returns
`Array(labelExpr, sortExpr, joinSql, validSql, isOrdinal)`:

- **labelExpr** — SQL producing the human label (used in both SELECT and GROUP BY).
- **sortExpr** — numeric/text expression for ordering ordinal dimensions.
- **joinSql** — any `LEFT JOIN` to a `codes`/lookup table, aliased `c&slot` (`cA`/`cB`) so a
  cross-tab that uses two lookup dimensions doesn't collide.
- **validSql** — WHERE filter that keeps only valid values for that dimension.
- **isOrdinal** — order by `MIN(sortExpr)` when true, else by `COUNT(*) DESC`.

The query is assembled from base FROM (`userinfo` ⋈ `demog` ⋈ `contact`), the dimension
join(s), the WHERE (validity + instrument filter), GROUP BY the label expr(s), and
`HAVING COUNT(*) >= minN`. A second, ungrouped query computes the Overall baseline / grand total.

### To add a new dimension

1. Add a `dimLabel.Add "<key>", "<Menu label>"` entry and include `<key>` in the `dimKeys` array.
2. Add a `Case "<key>"` to `DimSpec` returning the 5-element array.
   - Use a `codes` join for coded values, or a `CASE` for banded/derived values (see `age`, `industry`).
   - Remember `[ORDER]` must be bracketed; cross-DB string joins need `COLLATE DATABASE_DEFAULT`.
3. Deploy + verify (Section 8). No other code changes needed — the render loop is generic.

---

## 6. Instrument filter

A **filter**, not a group-by. `inst` is validated against a fixed whitelist
(`instLabel`/`instKeys`) and mapped to a WHERE fragment via a `Select Case` that emits a
`ct.lblVersion IN (...)` clause appended to `whereSql` (which also feeds the baseline query).
Because the values are hard-coded, there is no SQL-injection surface.

**To add another instrument option:** add a `instLabel.Add` entry, extend `instKeys`, and add a
`Case` producing the right `lblVersion` predicate.

---

## 7. State normalization

Raw `userinfo.state` is free text ("CA", "California", "calif", …). The `state` dimension
`LEFT JOIN`s `records.records.states` matching the trimmed/uppercased raw value against **either**
`stateAbbr` **or** `stateName` (both `COLLATE DATABASE_DEFAULT`), then collapses to the canonical
`stateName` via `ISNULL(...)`. Unrecognized values pass through unchanged rather than being dropped.

---

## 8. AI integration

The **Interpret with AI** button POSTs `task=ai` with the current parameters; the page rebuilds
the aggregate table as compact text and calls the Anthropic Messages API.

- The call is isolated in a server-side **JScript** `<script runat="server" language="JScript">`
  block (`aiInterpret`), invoked from VBScript.
- **Gotcha:** the classic-ASP JScript engine is pre-ES5 — **there is no native `JSON` object.**
  Build the request body as a hand-escaped string (`jsEsc` escapes `\`, `"`, and control chars
  to `\uXXXX`) and parse the response with `eval("(" + responseText + ")")`. Do **not** use
  `JSON.stringify`/`JSON.parse` here.
- HTTP via `MSXML2.ServerXMLHTTP.6.0`, headers `x-api-key`, `anthropic-version: 2023-06-01`.
  The VPS is allowed outbound to `api.anthropic.com`.
- **Model** is a constant near the top of the file (`AI_MODEL`). Change it there.
- **Key** is read from `C:\inetpub\cli_secrets\anthropic_key.txt` (one line), outside the webroot.
  If the file is missing the button degrades gracefully with on-screen instructions.
  To rotate: overwrite that file (via the WinRM channel) with the new key from
  `Creds Anthropic cli-dashboard-prod.txt`. Keep the folder ACL restricted to SYSTEM /
  Administrators / the app-pool identity.

**Editing-tool caveat:** when editing the JScript regex, write the control-char class explicitly
as `[\x00-\x1f]`. Some editors will inject literal control bytes if you paste the raw range.

---

## 9. Left-nav integration

`admin/nav.asp` is a frameset menu (`target="main"`) with an expandable-topic system driven by
`session("menuTree")` and `?ni=<id>` / `?ri=<id>` toggles (topic ids 1–5 already used). "Analyze
Data" is an **always-visible** indented row directly under the "Reports" link (deeper
`<td colspan="2"></td>` indent, no toggle). "Reports" itself remains a plain link to `reports.asp`.

---

## 10. Verifying a deployment

An unauthenticated GET returns **302** (redirect to login) — that alone proves the page compiled
(a syntax error would be 500). For a full check, log in and fetch with the session cookie:

```powershell
$b='https://assess.connectiveleadership.com'
Invoke-WebRequest "$b/admin/login.asp" -SessionVariable s -UseBasicParsing | Out-Null
# admin creds: Creds CLIRCPBlumen.txt ; form fields: check=true, refererPath, userName, passWord, submit
Invoke-WebRequest "$b/admin/login.asp" -Method Post -WebSession $s -UseBasicParsing `
  -Body @{check='true';refererPath='';userName='<user>';passWord='<pass>';submit='Login'} | Out-Null
(Invoke-WebRequest "$b/admin/reports_analyze_data.asp?dimA=industry&inst=oasi&minN=50" `
  -WebSession $s -UseBasicParsing -MaximumRedirection 0).Content   # inspect for 'Query error', real numbers
```

Sanity checks used during build: OASI ⇒ ~5.5k records; 360 (13EM+13EF) ⇒ ~1.1k; A-360 ⇒ ~29;
"CA" and "California" collapse to a single California group.

---

## 11. Backups & rollback

Every server-side edit first copies the target to `<file>.bak_<yyyyMMdd_HHmmss>` in place. To roll
back, copy the desired `.bak_*` over the live file via the WinRM channel. Files with dated backups
so far: `admin/reports.asp`, `admin/nav.asp`, `admin/reports_analyze_data.asp`.

---

## 12. Change history

| Date | Change |
|------|--------|
| 2026-09-11 | Initial page (dimensions, cross-tab, baseline, AI button); link added to `reports.asp`. |
| 2026-09-11 | AI enabled (key deployed outside webroot); fixed JScript no-`JSON` issue. |
| 2026-09-11 | State normalization via `records.states`. |
| 2026-09-11 | Left-nav "Analyze Data" item (always visible under Reports). |
| 2026-09-11 | Added **instrument** filter (ASI / OASI / A-ASI / A-OASI / 360 / A-360). |
