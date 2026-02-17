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
- 🎯 **Smart Filtering** - Whitelist/blacklist companies, salary filters, visa support
- 📊 **Application Tracking** - Track all submissions in one dashboard
- 📝 **Resume Parsing** - Upload PDF, auto-parse to text
- ✉️ **Cover Letter Generation** - AI-generated personalized cover letters
- 📝 **Session Logging** - Detailed logs of AI actions and reasoning
- 🎨 **Modern Web UI** - Beautiful chat-based interface with real-time updates

### Supported Platforms

| Platform | URL | Status |
|----------|-----|--------|
| LinkedIn | linkedin.com | 🚧 Coming soon |
| Indeed | indeed.de | 🚧 Coming soon |
| StepStone | stepstone.de | 🚧 Coming soon |
| Xing | xing.de | 🚧 Coming soon |
| Jobbörse | jobboerse.arbeitsagentur.de | 🚧 Coming soon |

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

# Start the app (frontend + backend)
npm start
```

Then open **http://localhost:3001** in your browser.

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

| Plattform | URL | Status |
|-----------|-----|--------|
| LinkedIn | linkedin.com | 🚧 Bald verfügbar |
| Indeed | indeed.de | 🚧 Bald verfügbar |
| StepStone | stepstone.de | 🚧 Bald verfügbar |
| Xing | xing.de | 🚧 Bald verfügbar |
| Jobbörse | jobboerse.arbeitsagentur.de | 🚧 Bald verfügbar |

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

Dann **http://localhost:5173** im Browser öffnen.

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

## What's Different from apply-bot?

### Comparison

| Feature | apply-bot | German Job Bot |
|---------|-----------|----------------|
| Target Market | US/Canada | Germany (DE) |
| Platforms | LinkedIn, Indeed US | LinkedIn DE, Indeed DE, StepStone, Xing, Jobbörse |
| Interface | CLI + MCP required | Built-in Web UI |
| Language | English only | German + English |
| Company Lists | US companies | German companies (SAP, Bosch, Siemens, etc.) |
| Currency | USD | EUR |
| OpenClaw Integration | No | Yes (WhatsApp control) |

### Can apply-bot be used for German jobs?

**Limited** - You can manually search, but:
- ❌ No German platform integration (StepStone, Xing, Jobbörse)
- ❌ No German company whitelist
- ❌ No EUR salary conventions
- ❌ No German/English bilingual support
- ❌ Requires MCP setup

### Innovations of German Job Bot

1. 🇩🇪 **German Job Market Focus** - Native support for DE platforms
2. 🎯 **German Company Database** - Pre-configured whitelist (SAP, Bosch, Siemens, Volkswagen, etc.)
3. 💶 **EUR Salary Standards** - German salary ranges
4. 🌐 **Bilingual** - Full DE/EN support
5. 📱 **OpenClaw Integration** - Control via WhatsApp
6. 🚀 **Out of the Box** - No MCP setup required - just run and use
7. 💬 **Chat Interface** - Natural language like apply-bot but standalone

### Supported German Platforms

| Platform | Status |
|----------|--------|
| LinkedIn DE | ✅ Search |
| Indeed DE | ✅ Search |
| StepStone | 🚧 Coming |
| Xing | 🚧 Coming |
| Jobbörse | 🚧 Coming |

### 🌟 Latest Features

- **Real-time Job Search** - Search jobs directly from the web interface
- **One-Click Apply** - Apply to jobs with a single click
- **Application Tracking** - Track status of all applications (pending → applied → interview → rejected/offered)
- **Resume Upload** - Upload PDF resumes directly
- **Profile Management** - Save your profile info for quick applications
- **Responsive Design** - Works on desktop and mobile

### 🚀 Quick Start (Web Version)

```bash
# No installation needed - just run!
npm install
npm start
```

Then open **http://localhost:3001** in your browser.

### 📱 Web Interface

The web interface includes:

1. **Search Tab** - Search for jobs by keywords, location
2. **Jobs Tab** - View and track all your applications
3. **Resume Tab** - Upload resume and manage profile
4. **Settings** - App info and configuration

### 🔧 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/jobs` | GET | Get all jobs |
| `/api/jobs` | POST | Add new job |
| `/api/search` | POST | Search for jobs |
| `/api/resume` | GET/POST | Get/save resume |
| `/api/filters` | GET/POST | Get/save filters |

### 🌍 Deployment

#### Vercel (Recommended)

```bash
# Build the project
npm run build

# Deploy the dist folder to Vercel
npx vercel deploy dist
```

#### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
EXPOSE 3001
CMD ["node", "server.js"]
```

### 📊 Stats

- Total jobs tracked
- Application success rate
- Response time tracking

---

**Haftungsausschluss**: Bitte nutze das Tool verantwortungsvoll und beachte die Nutzungsbedingungen der Jobplattformen. Übermäßige Bewerbungen in kurzer Zeit vermeiden.

**Disclaimer**: Use responsibly and comply with platform terms of service. Do not make excessive applications in a short period of time.
