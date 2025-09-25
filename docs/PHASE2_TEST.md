# Phase 2 Testing Guide

## Overview
Phase 2 establishes real communication between the frontend and Worker. This guide helps you test all the new functionality.

## Prerequisites
1. Worker running: `cd workers && npm run dev`
2. Frontend served: `cd pages && python3 -m http.server 3000`

## Test Cases

### 1. Basic Command Processing
**Action**: Type `"Book lunch with Sam next Thursday at 1pm"` in the frontend  
**Expected**: 
- Loading spinner appears
- Response shows command analysis with insights
- Timestamp appears with response
- Response includes event type detection ("meal")

### 2. Different Event Types
**Test these commands**:
- `"Schedule meeting with team tomorrow at 2pm"` → Should detect "meeting" type
- `"Doctor appointment Friday at 10am"` → Should detect "appointment" type  
- `"Call mom tonight"` → Should detect "meeting" type
- `"Breakfast with Sarah at 8am"` → Should detect "meal" type

### 3. Error Handling
**Action**: Try invalid inputs to test error handling
- Empty command → Should show "Please enter a command first"
- Very long command (1000+ chars) → Should show validation error
- Stop Worker and try command → Should show connection error

### 4. API Endpoints (via curl)
```bash
# Basic API
curl http://localhost:8787/api

# Health check
curl http://localhost:8787/health

# Chat endpoint
curl -X POST http://localhost:8787/api/chat \
  -H "Content-Type: application/json" \
  -d '{"command": "Test command", "phase": 2}'

# Error case
curl -X POST http://localhost:8787/api/chat \
  -H "Content-Type: application/json" \
  -d '{"wrong": "field"}'
```

### 5. Frontend Features
**Test these interactions**:
- **Theme Toggle**: Click moon/sun icon → Should switch themes instantly
- **Keyboard Shortcuts**: 
  - Ctrl/Cmd+K → Should focus input
  - Ctrl/Cmd+D → Should toggle theme
  - Enter in input → Should submit command
- **Loading States**: Submit command → Button should disable and show "Processing..."
- **Timestamps**: Responses should show time when received

## Expected Responses

### Successful Command
```json
{
  "message": "✓ Command received and processed: [your command]",
  "originalCommand": "[your command]",
  "analysis": {
    "wordCount": 8,
    "hasTime": true,
    "hasDate": true,
    "eventType": "meal"
  },
  "insights": ["Event type detected", "Time detected in command"],
  "phase": 2,
  "nextSteps": "In Phase 3, this will be stored in a Durable Object..."
}
```

### Error Response
```json
{
  "message": "Missing or invalid 'command' field",
  "status": "error", 
  "code": "VALIDATION_ERROR"
}
```

## Success Criteria ✅

- [ ] Frontend successfully sends POST requests to Worker
- [ ] Worker validates and processes commands
- [ ] Real-time command analysis and insights
- [ ] Proper error handling for invalid inputs
- [ ] Loading states work during API calls  
- [ ] No CORS issues between frontend and Worker
- [ ] Theme toggle and keyboard shortcuts functional
- [ ] Timestamps appear on responses
- [ ] Retry logic works for failed requests

## Phase 2 Status: Ready for Phase 3
Once all tests pass, you're ready to implement Durable Object storage in Phase 3! 