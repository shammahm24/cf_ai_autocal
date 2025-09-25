/**
 * AutoCal Worker - Phase 2
 * Enhanced worker with real frontend-backend communication
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Enable CORS for all requests
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    try {
      // Basic API endpoint for Phase 1 compatibility
      if (url.pathname === '/api' || url.pathname === '/api/') {
        return new Response(
          JSON.stringify({ 
            message: 'ok',
            status: 'success',
            phase: 2,
            timestamp: new Date().toISOString(),
            note: 'Use /api/chat for interactive commands'
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
            phase: 2,
            uptime: Date.now(),
            features: ['cors', 'chat-api', 'error-handling']
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

      // Enhanced Chat endpoint for Phase 2
      if (url.pathname === '/api/chat') {
        if (request.method === 'POST') {
          try {
            // Parse and validate request body
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

            // Process the command
            const response = await processCommand(body.command, body);
            
            return new Response(
              JSON.stringify({
                ...response,
                status: 'success',
                phase: 2,
                timestamp: new Date().toISOString(),
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

      // 404 for unknown endpoints
      return new Response(
        JSON.stringify({
          message: 'Endpoint not found',
          status: 'error',
          code: 'NOT_FOUND',
          availableEndpoints: ['/api', '/health', '/api/chat']
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
 * Process command and generate response
 */
async function processCommand(command, requestData) {
  const trimmedCommand = command.trim().toLowerCase();
  
  // Phase 2: Enhanced echo with command analysis
  const response = {
    message: `✓ Command received and processed: "${command}"`,
    originalCommand: command,
    commandLength: command.length,
    analysis: analyzeCommand(trimmedCommand),
    phase: 2,
    nextSteps: "In Phase 3, this will be stored in a Durable Object. In Phase 4, AI will parse this command into structured events."
  };
  
  // Add some mock insights
  if (trimmedCommand.includes('lunch') || trimmedCommand.includes('dinner') || trimmedCommand.includes('breakfast')) {
    response.insights = ['This appears to be a meal-related event', 'Consider setting a reminder 15 minutes before'];
  }
  
  if (trimmedCommand.includes('meeting') || trimmedCommand.includes('call')) {
    response.insights = ['This appears to be a meeting event', 'You might want to add attendees', 'Consider blocking time for preparation'];
  }
  
  if (trimmedCommand.match(/\d{1,2}:\d{2}|\d{1,2}\s*(am|pm)/)) {
    response.insights = response.insights || [];
    response.insights.push('Time detected in command');
  }
  
  return response;
}

/**
 * Basic command analysis for Phase 2
 */
function analyzeCommand(command) {
  const analysis = {
    wordCount: command.split(/\s+/).length,
    hasTime: /\d{1,2}:\d{2}|\d{1,2}\s*(am|pm)/.test(command),
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

//export { corsHeaders }; 