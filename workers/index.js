/**
 * AutoCal Worker - Phase 3
 * Enhanced worker with Durable Object integration for persistent storage
 */

import { CalendarDO } from './calendar-do.js';

export { CalendarDO };

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Enable CORS for all requests
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Session-ID',
    };

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    try {
      // Extract or generate session ID
      const sessionId = getSessionId(request);
      
      // Basic API endpoint for Phase 1-2 compatibility
      if (url.pathname === '/api' || url.pathname === '/api/') {
        return new Response(
          JSON.stringify({ 
            message: 'ok',
            status: 'success',
            phase: 3,
            timestamp: new Date().toISOString(),
            sessionId: sessionId,
            note: 'Use /api/chat for commands, /api/events/* for event management'
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );
      }

      // Health check endpoint
      if (url.pathname === '/health') {
        return new Response(
          JSON.stringify({ 
            status: 'healthy',
            version: '1.0.0',
            phase: 3,
            uptime: Date.now(),
            features: ['cors', 'chat-api', 'durable-objects', 'event-storage', 'conflict-detection']
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );
      }

      // Enhanced Chat endpoint with event creation
      if (url.pathname === '/api/chat') {
        if (request.method === 'POST') {
          try {
            const body = await request.json();
            const validationResult = validateChatRequest(body);
            
            if (!validationResult.valid) {
              return new Response(
                JSON.stringify({
                  message: validationResult.error,
                  status: 'error',
                  code: 'VALIDATION_ERROR'
                }),
                {
                  status: 400,
                  headers: {
                    'Content-Type': 'application/json',
                    ...corsHeaders,
                  },
                }
              );
            }

            // Process the command and potentially create an event
            const response = await processCommandWithStorage(body.command, body, sessionId, env);
            
            return new Response(
              JSON.stringify({
                ...response,
                status: 'success',
                phase: 3,
                timestamp: new Date().toISOString(),
                sessionId: sessionId,
                requestId: generateRequestId()
              }),
              {
                status: 200,
                headers: {
                  'Content-Type': 'application/json',
                  ...corsHeaders,
                },
              }
            );

          } catch (error) {
            console.error('Chat API error:', error);
            
            if (error instanceof SyntaxError) {
              return new Response(
                JSON.stringify({
                  message: 'Invalid JSON in request body',
                  status: 'error',
                  code: 'INVALID_JSON'
                }),
                {
                  status: 400,
                  headers: {
                    'Content-Type': 'application/json',
                    ...corsHeaders,
                  },
                }
              );
            }
            
            return new Response(
              JSON.stringify({
                message: 'Internal server error processing chat request',
                status: 'error',
                code: 'INTERNAL_ERROR',
                error: error.message
              }),
              {
                status: 500,
                headers: {
                  'Content-Type': 'application/json',
                  ...corsHeaders,
                },
              }
            );
          }
        }

        return new Response(
          JSON.stringify({
            message: 'Method not allowed. Use POST for /api/chat',
            status: 'error',
            code: 'METHOD_NOT_ALLOWED',
            allowedMethods: ['POST']
          }),
          {
            status: 405,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );
      }

      // Event management endpoints - proxy to Durable Object
      if (url.pathname.startsWith('/api/events')) {
        return await handleEventRequest(request, sessionId, env, corsHeaders);
      }

      // 404 for unknown endpoints
      return new Response(
        JSON.stringify({
          message: 'Endpoint not found',
          status: 'error',
          code: 'NOT_FOUND',
          availableEndpoints: ['/api', '/health', '/api/chat', '/api/events/*']
        }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );

    } catch (error) {
      // Global error handler
      console.error('Worker error:', error);
      
      return new Response(
        JSON.stringify({
          message: 'Internal server error',
          status: 'error',
          code: 'GLOBAL_ERROR',
          error: error.message
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }
  },
};

/**
 * Handle event-related requests by proxying to Durable Object
 */
async function handleEventRequest(request, sessionId, env, corsHeaders) {
  try {
    const calendarDO = getCalendarDO(sessionId, env);
    const url = new URL(request.url);
    
    // Map API routes to DO routes
    let doPath = url.pathname.replace('/api/events', '');
    if (doPath === '' || doPath === '/') {
      doPath = '/list';
    }
    
    // Create new request for DO
    const doUrl = new URL(`https://fake-host${doPath}`);
    doUrl.search = url.search;
    
    const doRequest = new Request(doUrl.toString(), {
      method: request.method,
      headers: request.headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : null,
    });

    return await calendarDO.fetch(doRequest);
    
  } catch (error) {
    console.error('Event request error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to process event request',
        details: error.message
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
}

/**
 * Process command with various event-related capabilities
 */
async function processCommandWithStorage(command, requestData, sessionId, env) {
  const trimmedCommand = command.trim().toLowerCase();
  
  // Enhanced command analysis from Phase 2
  const analysis = analyzeCommand(trimmedCommand);
  
  // Base response
  const response = {
    message: `💬 Processing: "${command}"`,
    originalCommand: command,
    commandLength: command.length,
    analysis: analysis,
    phase: 3,
    conversationType: determineConversationType(trimmedCommand)
  };

  // Get calendar DO for all operations that might need event data
  const calendarDO = getCalendarDO(sessionId, env);

  try {
    // Handle different types of conversations
    switch (response.conversationType) {
      case 'create':
        return await handleEventCreation(command, analysis, calendarDO, response);
      
      case 'query':
        return await handleEventQuery(trimmedCommand, calendarDO, response);
      
      case 'modify':
        return await handleEventModification(trimmedCommand, calendarDO, response);
      
      case 'delete':
        return await handleEventDeletion(trimmedCommand, calendarDO, response);
      
      case 'conflict_check':
        return await handleConflictCheck(trimmedCommand, calendarDO, response);
      
      case 'general':
        return await handleGeneralConversation(trimmedCommand, calendarDO, response);
      
      default:
        response.message = `🤔 I understand you said "${command}" but I'm not sure how to help. Try asking about your events or creating new ones.`;
        response.suggestions = [
          "Ask: 'What's my schedule today?'",
          "Create: 'Book lunch tomorrow at 1pm'",
          "Check: 'Do I have any conflicts?'"
        ];
        return response;
    }
  } catch (error) {
    console.error('Command processing error:', error);
    response.message = `❌ Error processing your request: ${error.message}`;
    response.error = error.message;
    return response;
  }
}

/**
 * Determine the type of conversation/request
 */
function determineConversationType(command) {
  // Event creation keywords
  if (/\b(book|schedule|add|create|set up|plan|make)\b/.test(command) && 
      (/\b(at|on|for|next|this|tomorrow|today)\b/.test(command) || /\d{1,2}:\d{2}|\d{1,2}\s*(am|pm)/.test(command))) {
    return 'create';
  }
  
  // Query keywords
  if (/\b(what|when|where|who|how|show|list|find|search|tell me|what's)\b/.test(command)) {
    return 'query';
  }
  
  // Modification keywords
  if (/\b(change|update|modify|move|reschedule|edit)\b/.test(command)) {
    return 'modify';
  }
  
  // Deletion keywords
  if (/\b(delete|remove|cancel|clear)\b/.test(command)) {
    return 'delete';
  }
  
  // Conflict checking
  if (/\b(conflicts?|clash|overlap|busy|free|available)\b/.test(command)) {
    return 'conflict_check';
  }
  
  // General calendar conversation
  if (/\b(calendar|schedule|event|appointment|meeting|plan)\b/.test(command)) {
    return 'general';
  }
  
  return 'unknown';
}

/**
 * Handle event creation
 */
async function handleEventCreation(command, analysis, calendarDO, response) {
  if (shouldCreateEvent(analysis, command.toLowerCase())) {
    const eventData = extractEventFromCommand(command, analysis);
    
    if (eventData) {
      const doRequest = new Request('https://fake-host/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      });
      
      const doResponse = await calendarDO.fetch(doRequest);
      const result = await doResponse.json();
      
      if (result.success) {
        response.message = `✅ Great! I've created "${eventData.title}" for ${formatDateTime(eventData.datetime)}`;
        response.eventCreated = result.event;
        response.conflicts = result.conflicts || [];
        
        if (result.conflicts && result.conflicts.length > 0) {
          response.message += `\n⚠️ Note: This conflicts with ${result.conflicts.length} other event${result.conflicts.length > 1 ? 's' : ''}. You can still keep it or let me suggest alternatives.`;
        }
      } else if (result.hasConflicts) {
        response.message = `🤔 I can create "${eventData.title}" but it conflicts with existing events. Would you like me to suggest alternative times?`;
        response.eventData = eventData;
        response.conflicts = result.conflicts;
        response.canForceAdd = true;
      } else {
        response.message = `❌ I couldn't create the event: ${result.error}`;
      }
    } else {
      response.message = `🤔 I understand you want to create an event, but I need more details. Can you specify a time and date?`;
      response.suggestions = [
        "Try: 'Book lunch tomorrow at 1pm'",
        "Or: 'Schedule meeting with team Friday at 2pm'"
      ];
    }
  } else {
    response.message = `🤔 It sounds like you want to create something, but I need more information. What would you like to schedule?`;
    response.suggestions = [
      "Include a time: 'at 2pm' or 'tomorrow'",
      "Be specific: 'Book lunch with Sam Friday at noon'"
    ];
  }
  
  return response;
}

/**
 * Handle event queries
 */
async function handleEventQuery(command, calendarDO, response) {
  const doRequest = new Request('https://fake-host/list', { method: 'GET' });
  const doResponse = await calendarDO.fetch(doRequest);
  const result = await doResponse.json();
  
  if (!result.success) {
    response.message = "❌ I couldn't retrieve your events right now.";
    return response;
  }
  
  const events = result.events || [];
  
  // Handle different types of queries
  if (/\b(today|today's)\b/.test(command)) {
    const todayEvents = filterEventsByDate(events, new Date());
    response.message = formatEventsResponse(todayEvents, "today");
  } else if (/\b(tomorrow|tomorrow's)\b/.test(command)) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowEvents = filterEventsByDate(events, tomorrow);
    response.message = formatEventsResponse(tomorrowEvents, "tomorrow");
  } else if (/\b(week|this week)\b/.test(command)) {
    const weekEvents = filterEventsThisWeek(events);
    response.message = formatEventsResponse(weekEvents, "this week");
  } else if (/\b(next|upcoming)\b/.test(command)) {
    const upcomingEvents = events.slice(0, 5); // Next 5 events
    response.message = formatEventsResponse(upcomingEvents, "upcoming");
  } else if (/\b(all|everything|schedule)\b/.test(command)) {
    response.message = formatEventsResponse(events, "all your events");
  } else if (/\b(with|participant)\b/.test(command)) {
    const participant = extractParticipantFromQuery(command);
    const participantEvents = filterEventsByParticipant(events, participant);
    response.message = formatEventsResponse(participantEvents, `events with ${participant}`);
  } else if (/\b(count|how many)\b/.test(command)) {
    response.message = `📊 You have ${events.length} event${events.length !== 1 ? 's' : ''} scheduled total.`;
  } else {
    // General schedule query
    response.message = formatEventsResponse(events, "your schedule");
  }
  
  response.events = events;
  return response;
}

/**
 * Handle event modifications
 */
async function handleEventModification(command, calendarDO, response) {
  // For Phase 3, provide guidance on modification capabilities
  response.message = `🔧 I can help you modify events! However, the full modification feature will be enhanced in Phase 4 with AI. For now, you can:`;
  response.suggestions = [
    "Delete the event and create a new one",
    "Tell me which event to change and I'll guide you",
    "Use the delete button (🗑️) in the events list"
  ];
  
  // Check if they're trying to modify a specific event
  if (/\b(lunch|meeting|appointment|dinner)\b/.test(command)) {
    const doRequest = new Request('https://fake-host/list', { method: 'GET' });
    const doResponse = await calendarDO.fetch(doRequest);
    const result = await doResponse.json();
    
    if (result.success && result.events.length > 0) {
      response.message += `\n\n📅 Here are your current events that might match:`;
      response.events = result.events;
    }
  }
  
  return response;
}

/**
 * Handle event deletion
 */
async function handleEventDeletion(command, calendarDO, response) {
  // For Phase 3, guide users to use the UI or be more specific
  response.message = `🗑️ I can help you delete events! You can:`;
  response.suggestions = [
    "Use the trash button (🗑️) next to any event in the list",
    "Tell me specifically which event to delete",
    "Say 'delete my lunch meeting' for example"
  ];
  
  // Show current events for reference
  const doRequest = new Request('https://fake-host/list', { method: 'GET' });
  const doResponse = await calendarDO.fetch(doRequest);
  const result = await doResponse.json();
  
  if (result.success && result.events.length > 0) {
    response.message += `\n\n📅 Your current events:`;
    response.events = result.events;
  } else {
    response.message = `🤷 You don't have any events to delete right now.`;
  }
  
  return response;
}

/**
 * Handle conflict checking
 */
async function handleConflictCheck(command, calendarDO, response) {
  const doRequest = new Request('https://fake-host/list', { method: 'GET' });
  const doResponse = await calendarDO.fetch(doRequest);
  const result = await doResponse.json();
  
  if (!result.success) {
    response.message = "❌ I couldn't check for conflicts right now.";
    return response;
  }
  
  const events = result.events || [];
  const conflicts = findExistingConflicts(events);
  
  if (conflicts.length === 0) {
    response.message = "✅ Great news! You don't have any scheduling conflicts.";
  } else {
    response.message = `⚠️ I found ${conflicts.length} scheduling conflict${conflicts.length > 1 ? 's' : ''}:`;
    response.conflicts = conflicts;
  }
  
  response.events = events;
  return response;
}

/**
 * Handle general calendar conversation
 */
async function handleGeneralConversation(command, calendarDO, response) {
  const doRequest = new Request('https://fake-host/list', { method: 'GET' });
  const doResponse = await calendarDO.fetch(doRequest);
  const result = await doResponse.json();
  
  const events = result.success ? result.events || [] : [];
  
  // Provide helpful overview and suggestions
  response.message = `📅 I'm here to help with your calendar! You have ${events.length} event${events.length !== 1 ? 's' : ''} scheduled.`;
  
  if (events.length === 0) {
    response.message += ` Let's start by creating your first event!`;
    response.suggestions = [
      "Try: 'Book lunch tomorrow at 1pm'",
      "Or: 'Schedule meeting with team Friday'",
      "Ask: 'What can you help me with?'"
    ];
  } else {
    response.suggestions = [
      "Ask: 'What's my schedule today?'",
      "Create: 'Book dinner with friends Saturday'",
      "Check: 'Do I have any conflicts?'",
      "Query: 'Show me all my meetings'"
    ];
  }
  
  response.events = events;
  response.capabilities = [
    "Create events from natural language",
    "Check your schedule for any time period",
    "Detect and warn about conflicts",
    "Help manage your calendar efficiently"
  ];
  
  return response;
}

// Helper functions for event queries
function filterEventsByDate(events, targetDate) {
  const targetDateStr = targetDate.toDateString();
  return events.filter(event => {
    const eventDate = new Date(event.datetime);
    return eventDate.toDateString() === targetDateStr;
  });
}

function filterEventsThisWeek(events) {
  const now = new Date();
  const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  
  return events.filter(event => {
    const eventDate = new Date(event.datetime);
    return eventDate >= weekStart && eventDate < weekEnd;
  });
}

function filterEventsByParticipant(events, participant) {
  if (!participant) return [];
  return events.filter(event => 
    event.participants && event.participants.some(p => 
      p.toLowerCase().includes(participant.toLowerCase())
    )
  );
}

function extractParticipantFromQuery(command) {
  const withMatch = command.match(/with\s+([a-zA-Z]+)/);
  return withMatch ? withMatch[1] : '';
}

function formatEventsResponse(events, timeframe) {
  if (events.length === 0) {
    return `📅 You don't have any events ${timeframe}.`;
  }
  
  let message = `📅 Here's ${timeframe} (${events.length} event${events.length !== 1 ? 's' : ''}):\n\n`;
  
  events.forEach(event => {
    const date = new Date(event.datetime);
    const timeStr = date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    message += `• ${event.title} - ${timeStr}`;
    if (event.participants && event.participants.length > 0) {
      message += ` (with ${event.participants.join(', ')})`;
    }
    message += '\n';
  });
  
  return message.trim();
}

function findExistingConflicts(events) {
  const conflicts = [];
  
  for (let i = 0; i < events.length; i++) {
    for (let j = i + 1; j < events.length; j++) {
      const event1 = events[i];
      const event2 = events[j];
      
      const start1 = new Date(event1.datetime);
      const end1 = new Date(start1.getTime() + (event1.duration || 60) * 60000);
      const start2 = new Date(event2.datetime);
      const end2 = new Date(start2.getTime() + (event2.duration || 60) * 60000);
      
      if (start1 < end2 && start2 < end1) {
        conflicts.push({
          event1: event1,
          event2: event2,
          overlapStart: new Date(Math.max(start1, start2)).toISOString(),
          overlapEnd: new Date(Math.min(end1, end2)).toISOString()
        });
      }
    }
  }
  
  return conflicts;
}

function formatDateTime(datetime) {
  return new Date(datetime).toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Determine if command should create an event
 */
function shouldCreateEvent(analysis, command) {
  const creationKeywords = ['book', 'schedule', 'add', 'create', 'set up', 'plan'];
  const hasCreationKeyword = creationKeywords.some(keyword => command.includes(keyword));
  
  return hasCreationKeyword && (analysis.hasTime || analysis.hasDate) && analysis.eventType !== 'unknown';
}

/**
 * Extract basic event data from command (Phase 3 - simple parsing)
 */
function extractEventFromCommand(command, analysis) {
  try {
    const title = extractTitle(command);
    const datetime = extractDateTime(command);
    
    if (!title || !datetime) {
      return null;
    }
    
    return {
      title: title,
      datetime: datetime,
      priority: 'medium',
      duration: analysis.eventType === 'meal' ? 60 : 30,
      participants: extractParticipants(command)
    };
  } catch (error) {
    console.error('Event extraction error:', error);
    return null;
  }
}

/**
 * Basic title extraction
 */
function extractTitle(command) {
  // Remove common prefixes
  let title = command
    .replace(/^(book|schedule|add|create|set up|plan)\s+/i, '')
    .replace(/\s+(at|on|for|with|next|this|tomorrow|today)\s+.*$/i, '')
    .trim();
  
  if (title.length === 0) {
    // Fallback: use event type
    if (command.includes('lunch')) return 'Lunch';
    if (command.includes('meeting')) return 'Meeting';
    if (command.includes('call')) return 'Call';
    if (command.includes('appointment')) return 'Appointment';
    return 'Event';
  }
  
  return title.charAt(0).toUpperCase() + title.slice(1);
}

/**
 * Basic datetime extraction (Phase 3 - simple patterns)
 */
function extractDateTime(command) {
  const now = new Date();
  
  // Look for time patterns
  const timeMatch = command.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)/i) || command.match(/(\d{1,2})\s*(am|pm)/i);
  
  let hour = 12;
  let minute = 0;
  
  if (timeMatch) {
    hour = parseInt(timeMatch[1]);
    minute = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
    
    if (timeMatch[3] && timeMatch[3].toLowerCase() === 'pm' && hour !== 12) {
      hour += 12;
    } else if (timeMatch[3] && timeMatch[3].toLowerCase() === 'am' && hour === 12) {
      hour = 0;
    }
  }
  
  // Look for date patterns
  let targetDate = new Date(now);
  
  if (command.includes('tomorrow')) {
    targetDate.setDate(targetDate.getDate() + 1);
  } else if (command.includes('next thursday') || command.includes('thursday')) {
    // Simple: assume next Thursday
    const daysUntilThursday = (4 - targetDate.getDay() + 7) % 7 || 7;
    targetDate.setDate(targetDate.getDate() + daysUntilThursday);
  } else if (command.includes('friday')) {
    const daysUntilFriday = (5 - targetDate.getDay() + 7) % 7 || 7;
    targetDate.setDate(targetDate.getDate() + daysUntilFriday);
  }
  // Add more day patterns as needed
  
  targetDate.setHours(hour, minute, 0, 0);
  
  return targetDate.toISOString();
}

/**
 * Extract participants from command
 */
function extractParticipants(command) {
  const participants = [];
  const withMatch = command.match(/with\s+([^at|on|for|next|this|tomorrow|today]+)/i);
  
  if (withMatch) {
    const names = withMatch[1].trim().split(/\s+and\s+|\s*,\s*/);
    participants.push(...names.filter(name => name.length > 0));
  }
  
  return participants;
}

/**
 * Get or create Calendar Durable Object instance
 */
function getCalendarDO(sessionId, env) {
  const doId = env.CALENDAR_DO.idFromName(sessionId);
  return env.CALENDAR_DO.get(doId);
}

/**
 * Extract session ID from request
 */
function getSessionId(request) {
  // Try to get session ID from header
  let sessionId = request.headers.get('X-Session-ID');
  
  if (!sessionId) {
    // Generate new session ID
    sessionId = generateSessionId();
  }
  
  return sessionId;
}

/**
 * Generate session ID
 */
function generateSessionId() {
  return 'session_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Validate incoming chat request
 */
function validateChatRequest(body) {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be a JSON object' };
  }
  
  if (!body.command || typeof body.command !== 'string') {
    return { valid: false, error: 'Missing or invalid "command" field' };
  }
  
  if (body.command.trim().length === 0) {
    return { valid: false, error: 'Command cannot be empty' };
  }
  
  if (body.command.length > 1000) {
    return { valid: false, error: 'Command too long (max 1000 characters)' };
  }
  
  return { valid: true };
}

/**
 * Basic command analysis (from Phase 2)
 */
function analyzeCommand(command) {
  const analysis = {
    wordCount: command.split(/\s+/).length,
    hasTime: /\d{1,2}:?\d{0,2}\s*(am|pm)|\d{1,2}:\d{2}/.test(command),
    hasDate: /(monday|tuesday|wednesday|thursday|friday|saturday|sunday|today|tomorrow|next|this)/.test(command),
    eventType: 'unknown'
  };
  
  // Simple event type detection
  if (command.includes('lunch') || command.includes('dinner') || command.includes('breakfast')) {
    analysis.eventType = 'meal';
  } else if (command.includes('meeting') || command.includes('call')) {
    analysis.eventType = 'meeting';
  } else if (command.includes('appointment')) {
    analysis.eventType = 'appointment';
  } else if (command.includes('book') || command.includes('schedule')) {
    analysis.eventType = 'booking';
  }
  
  return analysis;
}

/**
 * Generate a simple request ID
 */
function generateRequestId() {
  return Math.random().toString(36).substr(2, 9);
} 