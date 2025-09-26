/**
 * AI Prompt Templates for AutoCal - Phase 5
 * Structured prompts for Llama 3.3 on Workers AI - Workflow Edition
 */

export const WORKFLOW_PROMPTS = {
  eventExtraction: {
    version: "1.0",
    model: "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
    maxTokens: 512,
    temperature: 0.1,
    
    buildPrompt: (userInput, currentDate = new Date()) => {
      return `You are an expert calendar assistant. Extract structured event information from natural language.

Current date/time: ${currentDate.toISOString()}
User input: "${userInput}"

Extract the following information and respond ONLY with valid JSON:
{
  "success": true/false,
  "confidence": 0.0-1.0,
  "event": {
    "title": "brief descriptive title",
    "description": "optional longer description",
    "datetime": "ISO 8601 datetime string",
    "duration": minutes as number,
    "participants": ["name1", "name2"],
    "location": "location or null",
    "priority": "low/medium/high",
    "type": "meeting/appointment/meal/event/call",
    "urgency": "low/normal/high"
  },
  "ambiguities": ["list of unclear aspects"],
  "suggestions": ["alternative interpretations"]
}

Rules:
- For relative times like "tomorrow", "next Tuesday", calculate actual dates
- Default duration: meetings=30min, meals=60min, appointments=30min
- If time is ambiguous, suggest business hours (9am-5pm)
- Extract all mentioned people as participants
- Determine urgency from words like "urgent", "ASAP", "important"
- If information is missing or unclear, note in ambiguities

Examples:
Input: "Book lunch with Sarah tomorrow at 1pm"
Output: {"success":true,"confidence":0.95,"event":{"title":"Lunch with Sarah","datetime":"2024-09-26T13:00:00.000Z","duration":60,"participants":["Sarah"],"location":null,"priority":"medium","type":"meal","urgency":"normal"},"ambiguities":[],"suggestions":[]}

Input: "Meeting next week"
Output: {"success":false,"confidence":0.3,"event":null,"ambiguities":["No specific time","No participants","Vague date"],"suggestions":["Specify day and time","Add participants","Clarify meeting purpose"]}

Now extract from: "${userInput}"`
    }
  },

  conversationClassification: {
    version: "1.0",
    model: "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
    maxTokens: 256,
    temperature: 0.1,

    buildPrompt: (userInput) => {
      return `Classify the user's intent for this calendar-related request.

User input: "${userInput}"

Respond ONLY with valid JSON:
{
  "intent": "create/query/modify/delete/conflict_check/general/help",
  "confidence": 0.0-1.0,
  "subtype": "specific action type",
  "entities": {
    "timeframe": "today/tomorrow/next week/specific date/null",
    "people": ["mentioned names"],
    "event_types": ["meeting/appointment/etc"],
    "keywords": ["important words"]
  },
  "requires_clarification": true/false,
  "suggested_response_type": "conversational/action/question"
}

Intent categories:
- create: wants to schedule/book/add/plan new event (MUST include action words like book/schedule/add)
- query: asking about schedule/events (what/when/show/list/my schedule - ALWAYS query, never create)
- modify: change/update/move/reschedule existing event
- delete: cancel/remove/clear events
- conflict_check: check for overlaps/conflicts/availability
- general: help/capabilities/general calendar discussion
- help: unclear intent or needs assistance

KEY RULE: If input contains "what", "show", "list", "my schedule", "tell me" → ALWAYS "query", never "create"

Examples:
"Book lunch tomorrow" → {"intent":"create","confidence":0.9}
"What's my schedule today?" → {"intent":"query","confidence":0.95}
"What my schedule next week" → {"intent":"query","confidence":0.95}
"Show me my calendar" → {"intent":"query","confidence":0.95}
"Do I have conflicts?" → {"intent":"conflict_check","confidence":0.9}
"Help me" → {"intent":"help","confidence":0.8}

Classify: "${userInput}"`
    }
  },

  conflictResolution: {
    version: "1.0",
    model: "@cf/meta/llama-3.3-70b-instruct",
    maxTokens: 384,
    temperature: 0.3,

    buildPrompt: (newEvent, conflictingEvents, userSchedule) => {
      return `You are a scheduling expert. Suggest solutions for this calendar conflict.

New event: ${JSON.stringify(newEvent)}
Conflicting with: ${JSON.stringify(conflictingEvents)}
User's schedule context: ${JSON.stringify(userSchedule)}

Respond ONLY with valid JSON:
{
  "analysis": "brief conflict description",
  "severity": "minor/moderate/major",
  "recommendations": [
    {
      "type": "reschedule_new/reschedule_existing/shorten_duration/change_location",
      "description": "user-friendly explanation",
      "new_datetime": "ISO datetime if applicable",
      "reasoning": "why this is a good solution",
      "impact": "what changes for user"
    }
  ],
  "questions": ["clarifying questions for user"],
  "alternatives": ["other options to consider"]
}

Consider:
- Meeting importance and priorities
- Travel time between locations
- Participant availability patterns
- Buffer time around meetings
- User's typical schedule preferences

Generate helpful, actionable suggestions that minimize disruption.`
    }
  },

  naturalLanguageQuery: {
    version: "1.0",
    model: "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
    maxTokens: 512,
    temperature: 0.2,

    buildPrompt: (userQuery, events, currentDate) => {
      return `You are a helpful calendar assistant. Answer the user's question about their schedule.

Current date: ${currentDate.toISOString()}
User question: "${userQuery}"
User's events: ${JSON.stringify(events)}

Respond ONLY with valid JSON:
{
  "answer": "natural language response",
  "relevant_events": ["array of event IDs that match the query"],
  "summary": {
    "count": number,
    "timeframe": "description of time period",
    "highlights": ["key points about the schedule"]
  },
  "suggestions": ["helpful follow-up actions"],
  "confidence": 0.0-1.0
}

Query types to handle:
- Schedule overview: "What's my day like?"
- Specific searches: "Meetings with John"
- Time availability: "Am I free tomorrow afternoon?"
- Event details: "When is my next appointment?"
- Pattern analysis: "How busy am I this week?"

Be conversational, helpful, and specific. Include relevant details like times, participants, and locations.

Answer: "${userQuery}"`
    }
  },

  contextualConversation: {
    version: "1.0",
    model: "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
    maxTokens: 384,
    temperature: 0.4,

    buildPrompt: (currentMessage, conversationHistory, userEvents) => {
      return `You are AutoCal, a friendly AI calendar assistant. Continue this conversation naturally.

Conversation history: ${JSON.stringify(conversationHistory)}
Current message: "${currentMessage}"
User's events: ${JSON.stringify(userEvents)}

Respond ONLY with valid JSON:
{
  "response": "natural, helpful response",
  "action_needed": "none/create_event/modify_event/query_schedule/clarify",
  "follow_up_questions": ["questions to better help the user"],
  "context_maintained": {
    "previous_topic": "what we were discussing",
    "user_preferences": "learned preferences",
    "pending_actions": "incomplete tasks"
  },
  "suggestions": ["helpful next steps"],
  "tone": "friendly/professional/casual"
}

Guidelines:
- Maintain conversation context and remember previous exchanges
- Be helpful and proactive in offering assistance
- Ask clarifying questions when needed
- Acknowledge previous interactions
- Offer relevant suggestions based on their calendar
- Use a warm, professional tone

Continue the conversation for: "${currentMessage}"`
    }
  }
};

// Prompt utility functions
export function validateAIResponse(response, expectedSchema) {
  try {
    const parsed = JSON.parse(response);
    return { valid: true, data: parsed };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

export function buildFallbackResponse(userInput, errorMessage) {
  return {
    success: false,
    confidence: 0.0,
    error: "AI_PARSING_FAILED",
    fallback: "PHASE_3_PARSING",
    message: `AI processing failed: ${errorMessage}. Using basic parsing.`,
    userInput: userInput
  };
}

export function optimizePromptForTokens(prompt, maxTokens = 2048) {
  if (prompt.length <= maxTokens) return prompt;
  
  // Truncate while preserving structure
  const lines = prompt.split('\n');
  let result = '';
  
  for (const line of lines) {
    if ((result + line).length > maxTokens - 100) break;
    result += line + '\n';
  }
  
  return result + '\n\nNote: Input truncated due to length.';
} 