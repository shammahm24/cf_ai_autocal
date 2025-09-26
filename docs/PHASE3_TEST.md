# Phase 3 Testing Guide - Durable Object Storage

## Overview
Phase 3 adds persistent event storage using Cloudflare Durable Objects. Events now persist across sessions and include conflict detection.

## Prerequisites
1. Worker running: `cd workers && npm run dev`
2. Frontend served: `cd pages && python3 -m http.server 3000`

## Test Cases

### 1. Event Creation and Storage
**Action**: Type `"Book lunch with Sam next Thursday at 1pm"` in the frontend  
**Expected**: 
- Event gets created and stored in Durable Object
- Response shows "✓ Event created: [title]"
- Events list updates automatically with new event
- Event count appears in subtitle

### 2. Event Persistence
**Action**: Refresh the browser page  
**Expected**: 
- Previously created events still appear in the list
- Session ID maintained in localStorage
- Event count persists in subtitle

### 3. Conflict Detection
**Action**: Create two overlapping events
1. `"Book lunch with Sam Thursday at 1pm"`
2. `"Schedule meeting with team Thursday at 1pm"`  
**Expected**: 
- First event creates successfully
- Second event shows conflict warning with suggestions
- Conflicting event details displayed
- Option to force add despite conflicts

### 4. Event Deletion
**Action**: Click the 🗑️ button on any event  
**Expected**: 
- Event removed from storage
- Events list refreshes automatically
- Success message in Assistant section
- Event count decreases

### 5. Session Isolation
**Action**: Open incognito/private browsing window  
**Expected**: 
- Different session ID generated
- No events from other session visible
- Each session maintains separate calendar

### 6. Manual Event Management via API

#### Create Event
```bash
curl -X POST http://localhost:8787/api/events/add \
  -H "Content-Type: application/json" \
  -H "X-Session-ID: test-session" \
  -d '{
    "title": "Doctor Appointment",
    "datetime": "2024-09-26T10:00:00Z",
    "duration": 30,
    "priority": "high"
  }'
```

#### List Events
```bash
curl -X GET http://localhost:8787/api/events \
  -H "X-Session-ID: test-session"
```

#### Delete Event
```bash
curl -X DELETE http://localhost:8787/api/events/delete/[event-id] \
  -H "X-Session-ID: test-session"
```

### 7. Event Parsing Capabilities
**Test these commands**:
- `"Book lunch with Sarah tomorrow at 12pm"` → Creates "Lunch" event
- `"Schedule meeting with team Friday at 2pm"` → Creates "Meeting" event  
- `"Doctor appointment next Monday at 10am"` → Creates "Appointment" event
- `"Plan dinner with family Saturday at 7pm"` → Creates "Dinner" event

### 8. Command Analysis
**Verify these features work**:
- **Time Detection**: Commands with "1pm", "2:30pm", "10am" are parsed
- **Date Detection**: "tomorrow", "Friday", "next Monday" work
- **Participant Extraction**: "with Sarah", "with team" populates participants
- **Event Type Classification**: Meals, meetings, appointments detected

### 9. Error Handling
**Test invalid scenarios**:
- Empty command → "Please enter a command first"
- Invalid event data → Validation error message
- Durable Object errors → Graceful error handling
- Network issues → Retry logic with exponential backoff

## Expected Data Structure

### Event Object
```json
{
  "id": "mg02idy2ua9t8qrg7ar",
  "title": "Lunch",
  "datetime": "2025-09-25T17:00:00.000Z",
  "priority": "medium",
  "participants": ["Sam"],
  "duration": 60,
  "location": null,
  "description": null,
  "created": "2025-09-25T23:52:24.602Z",
  "updated": "2025-09-25T23:52:24.602Z"
}
```

### Conflict Response
```json
{
  "conflicts": [{
    "conflictingEvent": {...},
    "overlapStart": "2025-09-25T17:00:00.000Z",
    "overlapEnd": "2025-09-25T17:30:00.000Z",
    "suggestion": ["Consider scheduling at 2:15:00 PM instead"]
  }]
}
```

## Frontend Features

### Enhanced Event Display
- **Event Header**: Title with delete button
- **Event Details**: Date/time, participants, location
- **Event Meta**: Duration, priority badge, event ID
- **Priority Colors**: Low (blue), Medium (yellow), High (red)

### User Experience
- **Session Management**: Automatic session ID generation and storage
- **Event Count**: Shows number of stored events in subtitle
- **Conflict Warnings**: Visual warning boxes for scheduling conflicts
- **Auto-refresh**: Events list updates after creation/deletion
- **Keyboard Shortcuts**: Ctrl/Cmd+R to refresh events manually

## Success Criteria ✅

- [ ] Events persist across page refreshes
- [ ] Multiple events can be stored and retrieved  
- [ ] Basic conflict detection identifies overlapping times
- [ ] Manual event creation works end-to-end
- [ ] Each user session has isolated event storage
- [ ] CRUD operations work reliably
- [ ] Frontend displays real stored events with metadata
- [ ] Conflict warnings appear for overlapping events
- [ ] Event deletion works from frontend
- [ ] Session management maintains separate calendars

## Performance Notes

### Durable Object Behavior
- **Cold Starts**: First request to new session may be slower
- **Storage Limits**: 128KB per object (hundreds of events)
- **Consistency**: Strong consistency within single DO instance
- **Isolation**: Perfect isolation between different sessions

### Error Recovery
- **Network Issues**: Automatic retry with exponential backoff
- **DO Errors**: Graceful degradation with user feedback
- **Invalid Data**: Client-side and server-side validation
- **Session Loss**: Automatic session regeneration

## Phase 3 Status: Ready for Phase 4
Once all tests pass, you're ready to implement AI-powered natural language processing with Workers AI in Phase 4! 