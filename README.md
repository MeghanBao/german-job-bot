# German Job Bot 🇩🇪

> AI-powered job application assistant for Germany - describe what you want, it handles the rest.

[English](#english) | [Deutsch](#deutsch)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/MeghanBao/german-job-bot)](https://github.com/MeghanBao/german-job-bot/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/MeghanBao/german-job-bot)](https://github.com/MeghanBao/german-job-bot/network)

---

## English

### Features

- 💬 **Chat Interface** - Natural language conversation like ChatGPT - just tell it what you want
- 🔍 **Natural Language Search** - Just describe the jobs you want (e.g., "Python Jobs in Berlin, Remote")
- 🌐 **Multi-Platform Support** - Works with LinkedIn, Indeed, StepStone, Xing, Jobbörse
- 🤖 **Real Browser Integration** - Uses Playwright for browser automation
- 🔒 **Privacy-First** - All data stored locally on your machine
- 🎯 **Smart Filtering** - Advanced filters (blacklist/whitelist companies, salary, tech stack, visa)
- 📊 **Application Tracking** - Track all submissions in one dashboard
- 📝 **Resume PDF Parsing** - Upload PDF, auto-parse to text for AI
- 📚 **Custom Prompts** - Save and manage different AI prompt templates
- 🧠 **Knowledge Base** - Store Q&A for AI to learn from
- ✉️ **Cover Letter Generation** - AI-generated personalized cover letters
- 📝 **Session Logging** - Detailed logs of AI actions and reasoning
- 🎨 **Modern Web UI** - Beautiful chat-based interface with real-time updates

### Advanced Filtering

Similar to apply-bot, German Job Bot supports detailed filters:

```json
{
  "blacklist": {
    "companies": [],
    "keywords": ["commission only", "must work weekends"]
  },
  "whitelist": {
    "companies": ["SAP", "Bosch", "Siemens"],
    "keywords": ["remote-first", "flexible hours"]
  },
  "salary": { "min": 50000, "max": 120000, "currency": "EUR" },
  "workType": { "remote": true, "hybrid": true, "onsite": true },
  "techStack": {
    "mustHave": ["Python", "JavaScript", "React"],
    "niceToHave": ["Node.js", "AWS", "Docker"]
  }
}
```

### Supported Platforms

| Platform | Status | Description |
|----------|--------|-------------|
| LinkedIn DE | ✅ Ready | Real job search with browser automation |
| Indeed DE | ✅ Ready | Real job search with browser automation |
| StepStone | ✅ Ready | Real job search with browser automation |
| Xing | ✅ Ready | Real job search with browser automation |
| Jobbörse | ✅ Ready | Real job search with browser automation |

### Quick Example

```
You: "Apply to Software Engineer positions in Berlin, Remote, salary > 60k"

Bot: Searches, filters, and applies automatically based on your resume and preferences.
```

### Requirements

- Node.js 21+
- Chrome/Edge browser
- Playwright (run `npm run install-browser`)
- MCP-compatible AI tool (Claude Desktop, Cursor, VSCode, Windsurf, OpenClaw, etc.)

### Quick Start

```bash
# Clone the repo
git clone https://github.com/MeghanBao/german-job-bot.git
cd german-job-bot

# Install dependencies
npm install

# Install Playwright browser (required for job search)
npm run install-browser

# Start the app (Express server + serves React frontend)
npm start
```

Then open **http://localhost:3001** in your browser.

> 💡 **Note:** 
> - `npm start` runs the Express server (port 3001) - USE THIS
> - `npm run dev` runs Vite dev server (port 5173) - for development only

That's it! The web interface includes:
- 💬 Chat interface - talk to the bot naturally
- 📋 Jobs panel - track all your applications  
- 📄 Resume manager - upload and manage your CV

### Configuration

#### 1. Upload Resume

Go to the **Resume** tab and upload your PDF resume. The bot will parse it automatically and extract:
- Name
- Email
- Phone
- Skills
- Work experience

#### 2. Set Filters

Configure your job search preferences in the **Filters** tab:

```json
{
  "keywords": ["Python", "Backend", "Data Science"],
  "locations": ["Berlin", "Remote", "München"],
  "salaryMin": 60000,
  "requireVisa": true,
  "blacklistCompanies": [],
  "whitelistCompanies": ["SAP", "Bosch", "Siemens"]
}
```

#### 3. Advanced Filters

More detailed filters available in `data/job-filters.json`:
- Company blacklist/whitelist
- Tech stack preferences
- Work type (remote/hybrid/onsite)
- Visa requirements
- Benefits preferences

#### 4. Give Commands

Type commands like:
- "Search Python developer jobs in Berlin"
- "Find remote data science positions"
- "Apply to software engineer roles with visa sponsorship"

### Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS + Vite
- **Backend**: Express.js
- **Browser Automation**: Playwright
- **AI**: Any MCP-compatible LLM (OpenAI, Claude, etc.)

### Project Structure

```
german-job-bot/
├── server.js              # Express backend API
├── index.html            # Vite entry point
├── vite.config.ts        # Vite configuration
├── tailwind.config.js    # Tailwind CSS config
├── src/
│   ├── main.tsx          # React entry
│   ├── App.tsx           # Main app component
│   ├── index.css         # Global styles
│   └── lib/
│       └── browser.ts    # Playwright automation
├── data/
│   ├── applied.json      # Application records
│   ├── filters.json      # Search filters
│   ├── job-filters.json # Advanced filter settings
│   ├── resume.json       # Your resume data
│   ├── resume.txt        # Parsed resume text
│   ├── prompts.json      # Prompt templates
│   ├── knowledge.json    # AI memory
│   └── logs.json         # Session logs
└── public/
    └── (static assets)
```

### Data Files

#### applied.json
Tracks all job applications with status:
- `pending` - Application submitted, waiting for response
- `applied` - Application confirmed
- `interview` - Interview scheduled
- `rejected` - Application rejected
- `offered` - Job offer received

#### filters.json
Basic search filters:
- Keywords
- Locations
- Salary range
- Visa requirements

#### job-filters.json
Advanced filters:
- Company blacklist/whitelist
- Tech stack preferences
- Work type preferences
- Visa requirements
- Benefits preferences

#### resume.txt
Parsed text from your PDF resume, used by AI to tailor applications.

#### prompts.json
Prompt templates for:
- Cover letter generation
- Job evaluation
- Application customization

#### logs.json
Session logs showing AI reasoning and actions for debugging.

### Browser Automation

The `src/lib/browser.ts` module provides browser automation using Playwright:

```typescript
import { browserService } from './lib/browser';

// Search jobs on LinkedIn
const jobs = await browserService.searchLinkedIn('Python Developer', 'Berlin');

// Search on Indeed
const indeedJobs = await browserService.searchIndeed('Data Scientist', 'Remote');

// Auto apply to a job
await browserService.autoApply(jobUrl, '/path/to/resume.pdf');
```

### Contributing

PRs welcome! Feel free to submit issues and feature requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### License

MIT License - see [LICENSE](LICENSE) file.

---

## Deutsch

### Funktionen

- 🔍 **Natürliche Sprachsuche** - Beschreibe einfach, welche Jobs du möchtest (z.B. "Python Jobs in Berlin, Remote")
- 🌐 **Multi-Plattform** - Funktioniert mit LinkedIn, Indeed, StepStone, Xing, Jobbörse
- 🤖 **Echte Browser-Integration** - Nutzt Playwright für Browser-Automatisierung
- 🔒 **Datenschutz zuerst** - Alle Daten werden lokal auf deinem Computer gespeichert
- 🎯 **Intelligente Filterung** - Whitelist/Blacklist für Unternehmen, Gehaltsfilter, Visa-Unterstützung
- 📊 **Bewerbungsverfolgung** - Verfolge alle Bewerbungen in einem Dashboard
- 📝 **Lebenslauf-Parsing** - PDF hochladen, automatisch Text extrahieren
- ✉️ **Anschreiben-Generierung** - KI-generierte personalisierte Anschreiben
- 📝 **Sitzungs-Protokollierung** - Detaillierte Logs der KI-Aktionen und Reasoning

### Unterstützte Plattformen

| Plattform | Status | Beschreibung |
|-----------|--------|--------------|
| LinkedIn DE | ✅ Bereit | Echte Jobsuche mit Browser-Automatisierung |
| Indeed DE | ✅ Bereit | Echte Jobsuche mit Browser-Automatisierung |
| StepStone | ✅ Bereit | Echte Jobsuche mit Browser-Automatisierung |
| Xing | ✅ Bereit | Echte Jobsuche mit Browser-Automatisierung |
| Jobbörse | ✅ Bereit | Echte Jobsuche mit Browser-Automatisierung |

### Schnellstart

```bash
# Repository klonen
git clone https://github.com/MeghanBao/german-job-bot.git
cd german-job-bot

# Abhängigkeiten installieren
npm install

# Playwright Browser installieren
npm run install-browser

# Dashboard & Backend starten
npm start
```

Dann **http://localhost:3001** im Browser öffnen.

### Konfiguration

#### 1. Lebenslauf hochladen

Gehe auf den **Resume** Tab und lade deinen PDF-Lebenslauf hoch. Der Bot extrahiert automatisch:
- Name
- E-Mail
- Telefon
- Fähigkeiten
- Berufserfahrung

#### 2. Filter einstellen

Konfiguriere deine Jobsuche im **Filters** Tab:

```json
{
  "keywords": ["Python", "Backend", "Data Science"],
  "locations": ["Berlin", "Remote", "München"],
  "salaryMin": 60000,
  "requireVisa": true
}
```

#### 3. Erweiterte Filter

Detailliertere Filter in `data/job-filters.json`:
- Unternehmen Blacklist/Whitelist
- Tech-Stack-Präferenzen
- Arbeitsart (Remote/Hybrid/Vor-Ort)
- Visa-Anforderungen
- Benefits-Präferenzen

#### 4. Befehle eingeben

Befehle wie:
- "Suche Python Entwickler Jobs in Berlin"
- "Finde Remote Data Science Stellen"
- "Bewirb dich auf Software Engineer Positionen mit Visa-Sponsorship"

### Technologie-Stack

- **Frontend**: React + TypeScript + Tailwind CSS + Vite
- **Backend**: Express.js
- **Browser-Automatisierung**: Playwright
- **KI**: Jeder MCP-kompatible LLM (OpenAI, Claude, etc.)

### Mitmachen

Pull Requests willkommen! Gerne Issues und Feature-Requests einreichen.

1. Repository forken
2. Feature-Branch erstellen (`git checkout -b feature/ tolles-feature`)
3. Änderungen committen (`git commit -m 'Tolles Feature hinzugefügt'`)
4. Branch pushen (`git push origin feature/tolles-feature`)
5. Pull Request öffnen

### Lizenz

MIT Lizenz - see [LICENSE](LICENSE) Datei.

---

## Why German Job Bot?

### vs Other Auto-Apply Tools

| Feature | Typical Tools | German Job Bot |
|---------|-------------|----------------|
| Target Market | US/International | 🇩🇪 Germany |
| Platforms | LinkedIn only | LinkedIn, Indeed, StepStone, Xing, Jobbörse |
| Language | English only | 🇩🇪 German + English |
| Setup | Complex (MCP/API keys) | ⚡ Just run `npm start` |
| Interface | CLI | 💬 Beautiful Web UI |
| Privacy | Cloud-based | 🔒 100% Local |

### What Makes Us Different

1. 🇩🇪 **German Job Market Focus**
   - Native DE platform support (LinkedIn DE, Indeed DE, StepStone, Xing)
   - German company database (SAP, Bosch, Siemens, Volkswagen, etc.)
   - EUR salary standards with German tax brackets

2. 🌐 **Bilingual**
   - Full German + English interface
   - German/English job search
   - Localized cover letter templates

3. 🚀 **Out of the Box**
   - No MCP setup required
   - No API keys needed
   - Built-in web interface
   - Just run `npm start` and go

4. 💬 **Natural Language**
   - Chat like ChatGPT
   - "Find Python jobs in Berlin, Remote"
   - Smart filtering without config files

5. 📱 **Multi-Channel**
   - Web interface
   - OpenClaw/WhatsApp control (optional)

### Supported Platforms

| Platform | Status | Description |
|----------|--------|-------------|
| LinkedIn DE | ✅ Ready | Real job search with browser automation |
| Indeed DE | ✅ Ready | Real job search with browser automation |
| StepStone | ✅ Ready | Real job search with browser automation |
| Xing | ✅ Ready | Real job search with browser automation |
| Jobbörse | ✅ Ready | Real job search with browser automation |

> Note: Real search requires you to be logged into the platforms. The browser runs in non-headless mode so you can log in once.

---

## 🚀 Deployment

### Option 1: Vercel (Frontend only, no browser automation)

```bash
npm run build
npx vercel deploy dist
```

Note: Browser automation won't work on Vercel (serverless limitation).

### Option 2: Render / Railway / Fly.io (Recommended)

```bash
# Deploy with Docker
npx vercel deploy --prod --docker
```

Or connect your GitHub repo to:
- [Render.com](https://render.com) - Free tier available
- [Railway.app](https://railway.app) - Free tier available
- [Fly.io](https://fly.io) - Good for Docker

### Option 3: Docker Local

```bash
# Build
docker build -t german-job-bot .

# Run
docker run -p 3001:3001 german-job-bot
```

### Option 4: Traditional Server

```bash
# Build frontend
npm run build

# Start server
NODE_ENV=production npm start
```

---

**Haftungsausschluss**: Bitte nutze das Tool verantwortungsvoll und beachte die Nutzungsbedingungen der Jobplattformen. Übermäßige Bewerbungen in kurzer Zeit vermeiden.

**Disclaimer**: Use responsibly and comply with platform terms of service. Do not make excessive applications in a short period of time.
