/**
 * Calendar Durable Object - Phase 3
 * Handles persistent event storage and conflict detection
 */

export class CalendarDO {
  constructor(state, env) {
    this.state = state;
    this.storage = state.storage;
    this.env = env;
  }

  async fetch(request) {
    const url = new URL(request.url);
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    try {
      // Route handling for DO endpoints
      if (url.pathname === '/add' && request.method === 'POST') {
        return await this.handleAddEvent(request, corsHeaders);
      }
      
      if (url.pathname === '/list' && request.method === 'GET') {
        return await this.handleListEvents(corsHeaders);
      }
      
      if (url.pathname.startsWith('/delete/') && request.method === 'DELETE') {
        const eventId = url.pathname.split('/')[2];
        return await this.handleDeleteEvent(eventId, corsHeaders);
      }
      
      if (url.pathname.startsWith('/update/') && request.method === 'PUT') {
        const eventId = url.pathname.split('/')[2];
        return await this.handleUpdateEvent(eventId, request, corsHeaders);
      }

      if (url.pathname === '/conflicts' && request.method === 'POST') {
        return await this.handleCheckConflicts(request, corsHeaders);
      }

      return new Response(
        JSON.stringify({
          error: 'Unknown DO endpoint',
          availableEndpoints: ['/add', '/list', '/delete/:id', '/update/:id', '/conflicts']
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );

    } catch (error) {
      console.error('DO Error:', error);
      return new Response(
        JSON.stringify({
          error: 'Internal DO error',
          message: error.message
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }
  }

  async handleAddEvent(request, corsHeaders) {
    try {
      const eventData = await request.json();
      const validationResult = this.validateEvent(eventData);
      
      if (!validationResult.valid) {
        return new Response(
          JSON.stringify({
            success: false,
            error: validationResult.error
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          }
        );
      }

      // Create event with metadata
      const event = {
        id: this.generateEventId(),
        title: eventData.title,
        datetime: eventData.datetime,
        priority: eventData.priority || 'medium',
        participants: eventData.participants || [],
        duration: eventData.duration || 60,
        location: eventData.location || null,
        description: eventData.description || null,
        created: new Date().toISOString(),
        updated: new Date().toISOString()
      };

      // Check for conflicts before adding
      const conflicts = await this.checkConflicts(event);
      
      if (conflicts.length > 0 && !eventData.forceAdd) {
        return new Response(
          JSON.stringify({
            success: false,
            hasConflicts: true,
            conflicts: conflicts,
            event: event,
            message: 'Event conflicts detected. Add forceAdd: true to override.'
          }),
          {
            status: 409,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          }
        );
      }

      // Store the event
      await this.storage.put(`event:${event.id}`, event);
      
      // Update event count
      const count = await this.getEventCount();
      await this.storage.put('eventCount', count + 1);

      return new Response(
        JSON.stringify({
          success: true,
          event: event,
          conflicts: conflicts,
          message: conflicts.length > 0 ? 'Event added despite conflicts' : 'Event added successfully'
        }),
        {
          status: 201,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );

    } catch (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to add event',
          details: error.message
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }
  }

  async handleListEvents(corsHeaders) {
    try {
      const events = await this.getAllEvents();
      const count = await this.getEventCount();
      
      return new Response(
        JSON.stringify({
          success: true,
          events: events,
          count: count,
          totalEvents: events.length
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to retrieve events',
          details: error.message
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }
  }

  async handleDeleteEvent(eventId, corsHeaders) {
    try {
      const event = await this.storage.get(`event:${eventId}`);
      
      if (!event) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Event not found'
          }),
          {
            status: 404,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          }
        );
      }

      await this.storage.delete(`event:${eventId}`);
      
      // Update event count
      const count = await this.getEventCount();
      await this.storage.put('eventCount', Math.max(0, count - 1));

      return new Response(
        JSON.stringify({
          success: true,
          deletedEvent: event,
          message: 'Event deleted successfully'
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to delete event',
          details: error.message
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }
  }

  async handleUpdateEvent(eventId, request, corsHeaders) {
    try {
      const updates = await request.json();
      const existingEvent = await this.storage.get(`event:${eventId}`);
      
      if (!existingEvent) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Event not found'
          }),
          {
            status: 404,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          }
        );
      }

      // Merge updates with existing event
      const updatedEvent = {
        ...existingEvent,
        ...updates,
        id: eventId, // Preserve ID
        created: existingEvent.created, // Preserve creation time
        updated: new Date().toISOString()
      };

      // Validate updated event
      const validationResult = this.validateEvent(updatedEvent);
      if (!validationResult.valid) {
        return new Response(
          JSON.stringify({
            success: false,
            error: validationResult.error
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          }
        );
      }

      await this.storage.put(`event:${eventId}`, updatedEvent);

      return new Response(
        JSON.stringify({
          success: true,
          event: updatedEvent,
          message: 'Event updated successfully'
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to update event',
          details: error.message
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }
  }

  async handleCheckConflicts(request, corsHeaders) {
    try {
      const eventData = await request.json();
      const conflicts = await this.checkConflicts(eventData);
      
      return new Response(
        JSON.stringify({
          success: true,
          hasConflicts: conflicts.length > 0,
          conflicts: conflicts
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to check conflicts',
          details: error.message
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }
  }

  async getAllEvents() {
    const events = [];
    const list = await this.storage.list({ prefix: 'event:' });
    
    for (const [key, value] of list) {
      events.push(value);
    }
    
    // Sort by datetime
    return events.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
  }

  async checkConflicts(newEvent) {
    const existingEvents = await this.getAllEvents();
    const conflicts = [];
    
    const newStart = new Date(newEvent.datetime);
    const newEnd = new Date(newStart.getTime() + (newEvent.duration || 60) * 60000);
    
    for (const event of existingEvents) {
      // Skip self when updating
      if (event.id === newEvent.id) continue;
      
      const eventStart = new Date(event.datetime);
      const eventEnd = new Date(eventStart.getTime() + (event.duration || 60) * 60000);
      
      // Check for overlap
      if (newStart < eventEnd && newEnd > eventStart) {
        conflicts.push({
          conflictingEvent: event,
          overlapStart: new Date(Math.max(newStart, eventStart)).toISOString(),
          overlapEnd: new Date(Math.min(newEnd, eventEnd)).toISOString(),
          suggestion: this.generateConflictSuggestion(newEvent, event)
        });
      }
    }
    
    return conflicts;
  }

  generateConflictSuggestion(newEvent, conflictingEvent) {
    const suggestions = [];
    const conflictEnd = new Date(new Date(conflictingEvent.datetime).getTime() + (conflictingEvent.duration || 60) * 60000);
    
    // Suggest time after conflicting event
    const afterTime = new Date(conflictEnd.getTime() + 15 * 60000); // 15 min buffer
    suggestions.push(`Consider scheduling at ${afterTime.toLocaleTimeString()} instead`);
    
    // Suggest day before/after if same day
    const newDate = new Date(newEvent.datetime);
    const conflictDate = new Date(conflictingEvent.datetime);
    
    if (newDate.toDateString() === conflictDate.toDateString()) {
      const nextDay = new Date(newDate);
      nextDay.setDate(nextDay.getDate() + 1);
      suggestions.push(`Consider moving to ${nextDay.toLocaleDateString()}`);
    }
    
    return suggestions;
  }

  validateEvent(event) {
    if (!event.title || typeof event.title !== 'string') {
      return { valid: false, error: 'Event title is required and must be a string' };
    }
    
    if (!event.datetime) {
      return { valid: false, error: 'Event datetime is required' };
    }
    
    const date = new Date(event.datetime);
    if (isNaN(date.getTime())) {
      return { valid: false, error: 'Invalid datetime format' };
    }
    
    if (event.title.length > 200) {
      return { valid: false, error: 'Event title too long (max 200 characters)' };
    }
    
    if (event.duration && (typeof event.duration !== 'number' || event.duration <= 0 || event.duration > 1440)) {
      return { valid: false, error: 'Duration must be a positive number <= 1440 minutes' };
    }
    
    return { valid: true };
  }

  async getEventCount() {
    const count = await this.storage.get('eventCount');
    return count || 0;
  }

  generateEventId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
} 