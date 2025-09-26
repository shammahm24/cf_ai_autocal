# AutoCal Conversation Examples

## Overview
AutoCal is now a conversational AI calendar assistant that can handle various types of event-related discussions, not just event creation.

## Conversation Types

### 1. Event Creation 📝

**User**: "Book lunch with Sam next Thursday at 1pm"  
**AutoCal**: "✅ Great! I've created 'Lunch' for Thursday, September 26, 2024 at 01:00 PM"

**User**: "Schedule meeting with team Friday at 2pm"  
**AutoCal**: "✅ Great! I've created 'Meeting' for Friday, September 27, 2024 at 02:00 PM"

**User**: "Plan dinner with family Saturday at 7pm"  
**AutoCal**: "✅ Great! I've created 'Dinner' for Saturday, September 28, 2024 at 07:00 PM"

### 2. Schedule Queries 📅

**User**: "What's my schedule today?"  
**AutoCal**: "📅 Here's today (2 events):

• Lunch - Thu, Sep 26, 01:00 PM (with Sam)
• Meeting - Thu, Sep 26, 02:00 PM (with team)"

**User**: "What do I have tomorrow?"  
**AutoCal**: "📅 You don't have any events tomorrow."

**User**: "Show me this week's events"  
**AutoCal**: "📅 Here's this week (3 events):

• Lunch - Thu, Sep 26, 01:00 PM (with Sam)
• Meeting - Fri, Sep 27, 02:00 PM (with team)  
• Dinner - Sat, Sep 28, 07:00 PM (with family)"

**User**: "What's my next appointment?"  
**AutoCal**: "📅 Here's upcoming (5 events):

• Lunch - Thu, Sep 26, 01:00 PM (with Sam)
• Meeting - Fri, Sep 27, 02:00 PM"

**User**: "How many events do I have?"  
**AutoCal**: "📊 You have 3 events scheduled total."

### 3. Conflict Management ⚠️

**User**: "Do I have any conflicts?"  
**AutoCal**: "✅ Great news! You don't have any scheduling conflicts."

**User**: "Book another meeting Thursday at 1pm"  
**AutoCal**: "🤔 I can create 'Meeting' but it conflicts with existing events. Would you like me to suggest alternative times?
⚠️ Note: This conflicts with 1 other event. You can still keep it or let me suggest alternatives."

**User**: "Am I free Thursday afternoon?"  
**AutoCal**: "⚠️ I found 1 scheduling conflict: Your lunch with Sam conflicts with the meeting at 1 PM."

### 4. Event Modification 🔧

**User**: "Change my lunch meeting to 2pm"  
**AutoCal**: "🔧 I can help you modify events! However, the full modification feature will be enhanced in Phase 4 with AI. For now, you can:
- Delete the event and create a new one
- Tell me which event to change and I'll guide you
- Use the delete button (🗑️) in the events list"

**User**: "Move my Friday meeting to Monday"  
**AutoCal**: "🔧 I can help you modify events! For now, you can delete the Friday meeting and create a new one for Monday."

### 5. Event Deletion 🗑️

**User**: "Delete my lunch meeting"  
**AutoCal**: "🗑️ I can help you delete events! You can:
- Use the trash button (🗑️) next to any event in the list
- Tell me specifically which event to delete
- Say 'delete my lunch meeting' for example

📅 Your current events:
• Lunch - Thu, Sep 26, 01:00 PM (with Sam)
• Meeting - Fri, Sep 27, 02:00 PM (with team)"

**User**: "Cancel all my meetings"  
**AutoCal**: "🗑️ I can help you delete events! You can use the trash button (🗑️) next to each meeting in the list."

### 6. General Calendar Chat 💬

**User**: "Help me with my calendar"  
**AutoCal**: "📅 I'm here to help with your calendar! You have 3 events scheduled.
- Ask: 'What's my schedule today?'
- Create: 'Book dinner with friends Saturday'
- Check: 'Do I have any conflicts?'
- Query: 'Show me all my meetings'"

**User**: "What can you do?"  
**AutoCal**: "📅 I'm here to help with your calendar! You have 3 events scheduled.
I can help you with:
- Create events from natural language
- Check your schedule for any time period  
- Detect and warn about conflicts
- Help manage your calendar efficiently"

**User**: "I'm busy this week"  
**AutoCal**: "📅 I can see you have some events scheduled! You have 3 events this week. Would you like me to show you your schedule or help you manage anything?"

### 7. Participant-Specific Queries 👥

**User**: "What meetings do I have with Sam?"  
**AutoCal**: "📅 Here's events with Sam (1 event):
• Lunch - Thu, Sep 26, 01:00 PM (with Sam)"

**User**: "When am I meeting with the team?"  
**AutoCal**: "📅 Here's events with team (1 event):
• Meeting - Fri, Sep 27, 02:00 PM (with team)"

### 8. Vague or Unclear Requests 🤔

**User**: "Something tomorrow"  
**AutoCal**: "🤔 I understand you want to create something, but I need more information. What would you like to schedule?
- Include a time: 'at 2pm' or 'tomorrow'
- Be specific: 'Book lunch with Sam Friday at noon'"

**User**: "Meeting"  
**AutoCal**: "🤔 It sounds like you want to create something, but I need more information. What would you like to schedule?
- Include a time: 'at 2pm' or 'tomorrow'  
- Be specific: 'Book lunch with Sam Friday at noon'"

**User**: "Random question about weather"  
**AutoCal**: "🤔 I understand you said 'Random question about weather' but I'm not sure how to help. Try asking about your events or creating new ones.
- Ask: 'What's my schedule today?'
- Create: 'Book lunch tomorrow at 1pm'
- Check: 'Do I have any conflicts?'"

## Smart Conversation Features

### Context Awareness
- Understands time references (today, tomorrow, next week)
- Recognizes event types (lunch, meeting, appointment)
- Extracts participants from "with [name]" patterns
- Detects time formats (1pm, 2:30pm, 10am)

### Helpful Responses
- Provides suggestions when requests are unclear
- Shows relevant events when discussing modifications
- Offers alternatives during conflicts
- Gives capabilities overview for general questions

### Natural Language Understanding
- **Creation keywords**: book, schedule, add, create, set up, plan
- **Query keywords**: what, when, where, show, list, tell me
- **Modification keywords**: change, update, modify, move, reschedule
- **Deletion keywords**: delete, remove, cancel, clear
- **Conflict keywords**: conflict, clash, overlap, busy, free

## Try These Examples!

Copy and paste these into your AutoCal chat:

1. `"What's my schedule today?"`
2. `"Book lunch with Sarah tomorrow at 1pm"`
3. `"Do I have any conflicts?"`
4. `"Schedule meeting with team Friday at 1pm"` (will conflict!)
5. `"Show me all my events"`
6. `"What can you help me with?"`
7. `"How many events do I have?"`
8. `"When am I meeting with Sarah?"`
9. `"Help me with my calendar"`
10. `"Change my lunch to 2pm"` 