# German Job Bot 🇩🇪

> AI-powered automated job application assistant for Germany

[English](#english) | [Deutsch](#deutsch)

---

## English

### Features

- 🔍 **Smart Search** - Natural language job search
- 🤖 **Auto Apply** - Automatic application submission  
- 📊 **Tracking** - Track all applications in one dashboard
- ✉️ **Cover Letter** - AI-generated personalized cover letters
- 🔒 **Privacy** - All data stored locally on your machine
- 🌐 **Multi-platform** - LinkedIn, Indeed, StepStone, Xing, Jobbörse

### Supported Platforms

| Platform | Website | Status |
|----------|---------|--------|
| LinkedIn | linkedin.com | 🚧 Coming soon |
| Indeed | indeed.de | 🚧 Coming soon |
| StepStone | stepstone.de | 🚧 Coming soon |
| Xing | xing.de | 🚧 Coming soon |
| Jobbörse | jobboerse.arbeitsagentur.de | 🚧 Coming soon |

### Quick Start

```bash
# Clone the repository
git clone https://github.com/MeghanBao/german-job-bot.git
cd german-job-bot

# Install dependencies
npm install

# Start the application
npm start
```

Then open **http://localhost:3001** in your browser.

### How to Use

1. **Configure Filters** - Set your job search criteria (keywords, location, salary)
2. **Upload Resume** - Fill in your profile information
3. **Give Commands** - Type something like:
   - "Search Python developer jobs in Berlin"
   - "Find remote data science positions"
   - "Apply to software engineer roles with visa sponsorship"

4. **Track Applications** - View all your applications in the dashboard

### Configuration Options

```json
{
  "keywords": ["Python", "Backend", "Data Science"],
  "locations": ["Berlin", "Remote", "München"],
  "salaryMin": 60000,
  "requireVisa": true,
  "blacklistCompanies": []
}
```

### Tech Stack

- **Frontend:** React + Tailwind CSS
- **Backend:** Express.js (Node.js)
- **Browser:** Playwright (for automation)

### Project Structure

```
german-job-bot/
├── server.js          # Express backend API
├── public/
│   └── index.html    # React frontend
├── data/
│   ├── applied.json  # Job applications
│   ├── filters.json  # Search filters
│   ├── resume.json   # Your resume data
│   └── logs.json     # Activity logs
└── src/              # Source files (optional)
```

### License

MIT License - see [LICENSE](LICENSE) file.

---

## Deutsch

### Funktionen

- 🔍 **Intelligente Suche** - Natürliche Sprachsuche für Jobs
- 🤖 **Auto-Bewerbung** - Automatische Bewerbungsabsendung
- 📊 **Verfolgung** - Alle Bewerbungen im Dashboard verfolgen
- ✉️ **Anschreiben** - KI-gestützte personalisierte Anschreiben
- 🔒 **Datenschutz** - Alle Daten lokal gespeichert
- 🌐 **Multi-Plattform** - LinkedIn, Indeed, StepStone, Xing, Jobbörse

### Unterstützte Plattformen

| Plattform | Website | Status |
|-----------|---------|--------|
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

# Anwendung starten
npm start
```

Dann **http://localhost:3001** im Browser öffnen.

### Verwendung

1. **Filter konfigurieren** - Suchkriterien festlegen (Stichworte, Ort, Gehalt)
2. **Lebenslauf hochladen** - Profilinformationen ausfüllen
3. **Befehle eingeben** - z.B.:
   - "Suche Python Entwickler Jobs in Berlin"
   - "Finde Remote Data Science Stellen"
   - "Bewirb dich auf Software Engineer Positionen mit Visa-Sponsorship"

4. **Bewerbungen verfolgen** - Alle Bewerbungen im Dashboard ansehen

### Lizenz

MIT Lizenz - see [LICENSE](LICENSE) Datei.

---

## ⚠️ Disclaimer

This tool is for educational purposes. Please comply with the Terms of Service of the job platforms you use. Do not make excessive applications in a short period of time.

Dieses Tool dient Bildungszwecken. Bitte beachten Sie die Nutzungsbedingungen der verwendeten Jobportale. Übermäßige Bewerbungen in kurzer Zeit vermeiden.
