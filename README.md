# German Job Bot 🇩🇪

> AI-powered job application assistant for Germany - describe what you want, it handles the rest.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[GitHub](https://github.com/MeghanBao/german-job-bot)

---

## Features

- 🔍 **Natural Language Control** - Just describe the jobs you want (e.g., "Python Jobs in Berlin, Remote")
- 🌐 **Multi-Platform** - Works with LinkedIn, Indeed, StepStone, Xing, Jobbörse
- 🤖 **Real Browser Integration** - Uses Playwright for browser automation
- 🔒 **Privacy-First** - All data stored locally on your machine
- 🎯 **Smart Filtering** - Whitelist/blacklist companies, salary filters, visa support
- 📊 **Application Tracking** - Track all submissions in one dashboard
- 📝 **Resume Parsing** - Upload PDF, auto-parse to text
- ✉️ **Cover Letter Generation** - AI-generated personalized cover letters
- 📝 **Session Logging** - Detailed logs of AI actions and reasoning

## Quick Example

```
You: "Apply to Software Engineer positions in Berlin, Remote, salary > 60k"

Bot: Searches, filters, and applies automatically based on your resume and preferences.
```

## Supported Platforms

| Platform | Status |
|----------|--------|
| LinkedIn | 🚧 Coming soon |
| Indeed | 🚧 Coming soon |
| StepStone | 🚧 Coming soon |
| Xing | 🚧 Coming soon |
| Jobbörse | 🚧 Coming soon |

## Requirements

- Node.js 21+
- Chrome/Edge browser
- Playwright (run `npm run install-browser`)
- MCP-compatible AI tool (Claude Desktop, Cursor, VSCode, Windsurf, OpenClaw, etc.)

## Quick Start

```bash
# Clone the repo
git clone https://github.com/MeghanBao/german-job-bot.git
cd german-job-bot

# Install dependencies
npm install

# Install Playwright browser
npm run install-browser

# Start the dashboard & backend service
npm run start
```

Then open **http://localhost:5173** in your browser.

## Configuration

### 1. Upload Resume

Go to the **Resume** tab and upload your PDF resume. The bot will parse it automatically.

### 2. Set Filters

Configure your job search preferences in the **Filters** tab:

```json
{
  "keywords": ["Python", "Backend", "Data Science"],
  "locations": ["Berlin", "Remote", "München"],
  "salaryMin": 60000,
  "requireVisa": true,
  "blacklistCompanies": []
}
```

### 3. Give Commands

Type commands like:
- "Search Python developer jobs in Berlin"
- "Find remote data science positions"
- "Apply to software engineer roles with visa sponsorship"

## Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS + Vite
- **Backend**: Express.js
- **Browser Automation**: Playwright
- **AI**: Any MCP-compatible LLM (OpenAI, Claude, etc.)

## Project Structure

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
│   ├── job-filters.json  # Advanced filter settings
│   ├── resume.json       # Your resume data
│   ├── resume.txt       # Parsed resume text
│   ├── prompts.json      # Prompt templates
│   ├── knowledge.json   # AI memory
│   └── logs.json        # Session logs
└── public/
    └── (static assets)
```

## Data Files

### applied.json
Tracks all job applications with status (applied, interview, rejected, offered).

### filters.json
Basic search filters - keywords, locations, salary range.

### job-filters.json
Advanced filters - company blacklist/whitelist, tech stack preferences, work type, visa requirements, benefits, and more.

### resume.txt
Parsed text from your PDF resume, used by AI to tailor applications.

### prompts.json
Prompt templates for AI to generate cover letters and evaluate jobs.

### logs.json
Session logs showing AI reasoning and actions.

## Browser Automation

The `src/lib/browser.ts` module provides browser automation using Playwright:

```typescript
import { browserService } from './lib/browser';

// Search jobs on LinkedIn
const jobs = await browserService.searchLinkedIn('Python Developer', 'Berlin');

// Auto apply to a job
await browserService.autoApply(jobUrl, '/path/to/resume.pdf');
```

## Contributing

PRs welcome! Feel free to submit issues and feature requests.

## License

MIT - see [LICENSE](LICENSE)

---

**Disclaimer**: Use responsibly and comply with platform terms of service. Do not make excessive applications in a short period of time.
