# AutoCal Setup Guide - Phase 1

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
   npm run dev
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

## Phase 1 Status: ✅ Complete
Ready for Phase 2: Frontend-Backend Connection 