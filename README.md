# cf_ai_autocal

An AI-powered calendar / todo list built on **Cloudflare Workers AI**, **Workers**, **Workflows**, **Durable Objects**, and **Pages**.  
This project lets you type natural language commands like:

> "Book lunch with Sam next Thursday at 1pm"

and automatically parses, saves, and checks for scheduling conflicts.  
If there’s a clash, the app will warn you before saving.

---

## Features
- **Natural language input** → Llama 3.3 on Workers AI extracts event title and datetime.  
- **Stateful event storage** → Durable Object stores all events per user session.  
- **Conflict detection** → Checks for overlapping appointments.  
- **Frontend** → Cloudflare Pages text-based UI.  
- **Workflow orchestration** → Workers Workflow coordinates parsing → validation → storage.  

---

## Architecture
1. **Frontend (Pages)**:  
   - Simple HTML + JS with a text box for commands and a list to show events.  

2. **Backend (Workers)**:  
   - Endpoint `/api/chat` to handle user input.  
   - Invokes **Workflow** that:  
     1. Parses input with Llama 3.3  
     2. Sends structured event to Durable Object  
     3. Returns result (saved or conflict).  

3. **Durable Object**:  
   - Manages per-session state.  
   - Stores `{title, datetime}` events.  
   - Implements clash detection logic.  

---

## Project Structure

```
cf_ai_autocal/
├── plan/                    # Project documentation
│   ├── PROJECT_PLAN.md     # This document
│   ├── ARCHITECTURE.md     # Technical deep-dive
│   └── USER_FLOWS.md       # UX specifications
├── pages/                  # Frontend (Cloudflare Pages)
│   ├── index.html          # Main interface
│   ├── app.js              # Frontend logic
│   └── style.css           # Styling with theme support
├── workers/                # Backend (Workers + DO)
│   ├── index.js            # Main Worker
│   ├── calendar-do.js      # Calendar Durable Object
│   └── wrangler.toml       # Configuration
├── workflows/              # Workflow definitions
│   ├── calendar-workflow.js # Event processing workflow
│   └── prompts.js          # AI prompt templates
└── docs/                   # Additional documentation
    ├── API.md              # API specifications
    └── DEPLOYMENT.md       # Deployment guide
```

## Prerequisites
- Node.js 18+
- Cloudflare account
- npm/wrangler CLI

## Setup Steps

1. **Install Wrangler**:
   ```bash
   npm install -g wrangler
   ```

2. **Setup Worker**:
   ```bash
   cd workers
   npm install
   wrangler login
   npx wrangler dev --local --port 8787
   ```

3. **Test Frontend**:
   ```bash
   cd pages
   python3 -m http.server 3000
   ```

## Testing
- Worker: `http://localhost:8787/api` 
- Frontend: `http://localhost:3000`
- Test theme toggle and input form