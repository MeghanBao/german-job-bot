# German Job Bot 🇩🇪

[English](#english) | [Deutsch](#deutsch)

---

## English

### What is this?

German Job Bot helps you find and apply to jobs in Germany automatically.

---

### Option 1: Web Interface (Recommended)

**For beginners - just open in browser**

```bash
# 1. Clone
git clone https://github.com/MeghanBao/german-job-bot.git
cd german-job-bot

# 2. Install
npm install

# 3. Install browser
npm run install-browser

# 4. Start
npm start
```

Then open **http://localhost:3001**

**How to use:**
1. Type in chat: "Python jobs Berlin"
2. Click "Apply" on a job
3. Track status in Jobs tab

---

### Option 2: MCP (For developers)

**For use with Claude, Cursor, or VSCode**

```bash
# Start MCP server
npm run mcp
```

Then configure in your AI editor:

**For Claude Desktop:**
Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "german-job-bot": {
      "command": "node",
      "args": ["./mcp-server.js"]
    }
  }
}
```

**For Cursor:**
Add to `.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "german-job-bot": {
      "command": "node",
      "args": ["./mcp-server.js"]
    }
  }
}
```

Then just tell your AI:
- "Search for Python jobs in Berlin"
- "Show my job applications"
- "What's my application stats?"

---

### Features

- 🔍 Search 5 German job platforms
- 📄 Upload PDF resume
- ❓ Answer library
- 📊 Track applications

### License

MIT

---

## Deutsch

### Was ist das?

German Job Bot hilft dir, Jobs in Deutschland automatisch zu finden und dich zu bewerben.

---

### Option 1: Web Interface (Empfohlen)

**Für Anfänger - einfach im Browser öffnen**

```bash
# 1. Klonen
git clone https://github.com/MeghanBao/german-job-bot.git
cd german-job-bot

# 2. Installieren
npm install

# 3. Browser installieren
npm run install-browser

# 4. Starten
npm start
```

Dann **http://localhost:3001** im Browser öffnen.

**So funktioniert's:**
1. Tippe im Chat: "Python Jobs Berlin"
2. Klicke "Apply" bei einem Job
3. Verfolge den Status im Jobs Tab

---

### Option 2: MCP (Für Entwickler)

**Für Nutzung mit Claude, Cursor oder VSCode**

```bash
# MCP Server starten
npm run mcp
```

Dann in deinem AI-Editor konfigurieren:

**Für Claude Desktop:**
In `~/Library/Application Support/Claude/claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "german-job-bot": {
      "command": "node",
      "args": ["./mcp-server.js"]
    }
  }
}
```

**Für Cursor:**
In `.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "german-job-bot": {
      "command": "node",
      "args": ["./mcp-server.js"]
    }
  }
}
```

Dann sage deinem AI:
- "Suche Python Jobs in Berlin"
- "Zeige meine Bewerbungen"
- "Was ist mein Bewerbungsstatus?"

---

### Funktionen

- 🔍 5 deutsche Jobplattformen durchsuchen
- 📄 PDF-Lebenslauf hochladen
- ❓ Antwortbibliothek
- 📊 Bewerbungen verfolgen

### Lizenz

MIT
