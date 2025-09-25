/**
 * AutoCal Worker - Phase 1
 * Basic worker that responds with "ok" at /api endpoint
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
      // Basic API endpoint for Phase 1
      if (url.pathname === '/api' || url.pathname === '/api/') {
        return new Response(
          JSON.stringify({ 
            message: 'ok',
            status: 'success',
            phase: 1,
            timestamp: new Date().toISOString()
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
            phase: 1
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

      // Chat endpoint (for Phase 2 preparation)
      if (url.pathname === '/api/chat') {
        if (request.method === 'POST') {
          try {
            const body = await request.json();
            
            return new Response(
              JSON.stringify({
                message: `Echo: ${body.command || 'No command received'}`,
                status: 'success',
                phase: 1,
                note: 'This is a Phase 1 echo response. AI integration coming in Phase 4!'
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
            return new Response(
              JSON.stringify({
                message: 'Invalid JSON in request body',
                status: 'error',
                error: error.message
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
        }

        return new Response(
          JSON.stringify({
            message: 'Method not allowed. Use POST for /api/chat',
            status: 'error'
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

// Export for potential use in tests
export { corsHeaders }; 