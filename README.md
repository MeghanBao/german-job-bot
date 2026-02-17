# German Job Bot 🇩🇪

> AI-powered automated job application assistant for Germany.

[English](#english) | [Deutsch](#deutsch)

---

## English

### What’s New

- Added a more practical **automation cockpit** flow inspired by apply-bot style workflows.
- New backend command endpoint: `POST /api/command`.
- Commands now trigger actionable behavior:
  - `search ...` → generate/save matching jobs
  - `apply top N ...` → move found jobs to applied
  - `status` → return current pipeline stats
  - `help` → show quick command examples
- Improved jobs list with extra metadata (location + salary + found/applied status).

### Features

- 🔍 **Smart Search Commands** - Natural language style commands for search/apply/status.
- 🤖 **Automation Command Bar** - One input for workflow execution.
- ⚡ **Quick Actions** - Prebuilt command chips for common actions.
- 🌍 **Bilingual UI (EN/DE)** - Instant switch between English and German.
- 📊 **Pipeline Tracking** - Track found/applied/interview/rejected counts.
- ✍️ **Profile + Filters** - Save resume data and reusable search filters.
- 🔒 **Local Data** - Data stored locally in `data/*.json`.

### Quick Start

```bash
git clone https://github.com/MeghanBao/german-job-bot.git
cd german-job-bot
npm install
npm start
```

Open **http://localhost:3001**.

### Example Commands

- `search python backend jobs in berlin`
- `apply top 2 jobs`
- `status`
- `help`

### API (Core)

- `POST /api/command`
  - body: `{ "command": "search python jobs", "lang": "en" }`
  - response includes: `intent`, `message`, and optional job/stat payload.

### Redirect Handling Strategy (StepStone/Xing/Indeed/LinkedIn)

Some listings redirect to external pages (for example company career sites).

Proposed solution:

1. **Two-URL model**
   - Store both `sourceUrl` (platform listing URL) and `targetUrl` (final destination after redirects).
2. **Redirect resolver step**
   - Open listing with Playwright, wait for navigation/network idle, capture final `page.url()`.
   - Detect patterns like meta-refresh, JS redirects, and short-link jump pages.
3. **Domain trust + scoring**
   - Classify destination domain: platform domain / ATS domain / company domain / unknown.
   - Only auto-apply when destination passes trust rules; otherwise mark for manual review.
4. **Canonical job fingerprint**
   - Build dedup key from normalized `title + company + location + targetDomain`.
   - Prevent duplicate applications across platforms pointing to the same external job.
5. **Fallback flow**
   - If page blocks automation (captcha/login/anti-bot), record as `needs_manual` and keep deep link for user click-through.

This strategy keeps automation stable while reducing duplicate or unsafe submissions.

### Project Structure

```
german-job-bot/
├── server.js          # Express API + command engine
├── public/
│   └── index.html     # React frontend (CDN runtime)
├── data/
│   ├── applied.json   # Job pipeline data
│   ├── filters.json   # Search filters
│   ├── resume.json    # Resume/profile data
│   └── logs.json      # Activity logs
└── package.json
```

---

## Deutsch

### Neu in dieser Version

- Ein praktischerer **Automation-Cockpit** Ablauf (inspiriert von Apply-Bot-Workflows).
- Neuer Backend-Endpunkt: `POST /api/command`.
- Befehle führen jetzt konkrete Aktionen aus:
  - `suche ...` / `search ...` → passende Jobs erzeugen/speichern
  - `bewirb ...` / `apply ...` → gefundene Jobs auf beworben setzen
  - `status` → aktuelle Pipeline-Statistik
  - `hilfe` / `help` → Beispielbefehle
- Verbesserte Jobliste mit zusätzlichen Infos (Standort, Gehalt, Status).

### Funktionen

- 🔍 **Intelligente Suchbefehle** - Natürliche Befehle für Suche/Bewerbung/Status.
- 🤖 **Automations-Befehlsleiste** - Ein Eingabefeld für den Workflow.
- ⚡ **Schnellaktionen** - Vorgefertigte Befehl-Buttons.
- 🌍 **Zweisprachige UI (EN/DE)** - Sofort zwischen Englisch und Deutsch wechseln.
- 📊 **Pipeline-Tracking** - Gefunden/Beworben/Interview/Abgelehnt verfolgen.
- ✍️ **Profil + Filter** - Lebenslaufdaten und Suchfilter speichern.
- 🔒 **Lokale Speicherung** - Daten in `data/*.json`.

### Schnellstart

```bash
git clone https://github.com/MeghanBao/german-job-bot.git
cd german-job-bot
npm install
npm start
```

Dann **http://localhost:3001** öffnen.

### Beispielbefehle

- `suche python backend jobs in berlin`
- `bewirb dich auf 2 jobs`
- `status`
- `hilfe`

### Redirect-Strategie (StepStone/Xing/Indeed/LinkedIn)

Einige Stellenanzeigen leiten auf externe Seiten weiter (z. B. Karriere-Seiten von Unternehmen).

Vorgeschlagene Lösung:

1. **Zwei-URL-Modell**
   - Speichere `sourceUrl` (Plattform-Link) und `targetUrl` (finales Ziel nach Weiterleitung).
2. **Redirect-Resolver**
   - Anzeige mit Playwright öffnen, auf Navigation/Network-Idle warten, finale `page.url()` speichern.
   - Muster wie Meta-Refresh, JS-Redirects und Short-Link-Sprünge erkennen.
3. **Domain-Trust + Scoring**
   - Ziel-Domain klassifizieren: Plattform / ATS / Unternehmensseite / unbekannt.
   - Auto-Apply nur bei vertrauenswürdigen Regeln; sonst als manuellen Schritt markieren.
4. **Kanonischer Job-Fingerprint**
   - Dedup-Key aus normalisiertem `title + company + location + targetDomain`.
   - Verhindert doppelte Bewerbungen, wenn mehrere Plattformen auf dieselbe Stelle zeigen.
5. **Fallback-Flow**
   - Bei Captcha/Login/Anti-Bot Status `needs_manual` setzen und Deep-Link für manuellen Klick speichern.

So bleibt die Automatisierung robust und vermeidet doppelte bzw. riskante Bewerbungen.

### Lizenz

MIT License - siehe [LICENSE](LICENSE).
