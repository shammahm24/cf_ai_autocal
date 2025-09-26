/**
 * AutoCal Calendar Workflow - Phase 5
 * Orchestrates the complete event processing pipeline
 */

import { WorkflowEntrypoint } from "cloudflare:workers";

// Import prompt templates
import { WORKFLOW_PROMPTS } from './prompts.js';

/**
 * Main Calendar Workflow
 * Coordinates: Input Validation → AI Parsing → Conflict Detection → Event Storage → Response Generation
 */
export default class CalendarWorkflow extends WorkflowEntrypoint {
  async run(event, step) {
    const { userInput, sessionId, currentDate = new Date().toISOString() } = event.payload;
    
    console.log(`[Workflow] Starting calendar workflow for session: ${sessionId}`);
    
    try {
      // Step 1: Input Validation
      const validationResult = await step.do("validate-input", async () => {
        return await this.validateInput(userInput);
      });

      if (!validationResult.valid) {
        return {
          success: false,
          error: "Invalid input",
          details: validationResult.errors,
          step: "validation"
        };
      }

      // Step 2: AI Parsing with retry logic
      const parseResult = await step.do("ai-parsing", {
        retries: 3,
        backoff: "exponential"
      }, async () => {
        return await this.parseWithAI(userInput, currentDate);
      });

      if (!parseResult.success) {
        return {
          success: false,
          error: "Failed to parse event details",
          details: parseResult.error,
          step: "ai-parsing"
        };
      }

      // Step 3: Conflict Detection
      const conflictResult = await step.do("conflict-detection", async () => {
        return await this.checkConflicts(parseResult.event, sessionId);
      });

      // Step 4: Priority-based Conflict Resolution
      let resolutionResult = null;
      if (conflictResult.hasConflicts) {
        resolutionResult = await step.do("conflict-resolution", async () => {
          return await this.resolveConflicts(
            parseResult.event, 
            conflictResult.conflicts,
            sessionId
          );
        });
      }

      // Step 5: Event Storage
      const storageResult = await step.do("event-storage", {
        retries: 2,
        backoff: "linear"
      }, async () => {
        // Apply resolution if conflicts were resolved
        const finalEvent = resolutionResult?.resolvedEvent || parseResult.event;
        return await this.storeEvent(finalEvent, sessionId);
      });

      if (!storageResult.success) {
        return {
          success: false,
          error: "Failed to store event",
          details: storageResult.error,
          step: "storage"
        };
      }

      // Step 6: Response Generation
      const response = await step.do("response-generation", async () => {
        return await this.generateResponse({
          event: storageResult.event,
          conflicts: conflictResult,
          resolution: resolutionResult,
          userInput
        });
      });

      // Step 7: Notifications (if needed)
      if (conflictResult.hasConflicts || resolutionResult) {
        await step.do("send-notifications", async () => {
          return await this.sendNotifications({
            sessionId,
            event: storageResult.event,
            conflicts: conflictResult,
            resolution: resolutionResult
          });
        });
      }

      console.log(`[Workflow] Successfully completed for session: ${sessionId}`);
      
      return {
        success: true,
        result: response,
        metadata: {
          hadConflicts: conflictResult.hasConflicts,
          wasResolved: !!resolutionResult,
          eventId: storageResult.event.id,
          processingTime: Date.now() - new Date(currentDate).getTime()
        }
      };

    } catch (error) {
      console.error(`[Workflow] Fatal error for session ${sessionId}:`, error);
      
      return {
        success: false,
        error: "Workflow execution failed",
        details: error.message,
        step: "workflow-error"
      };
    }
  }

  /**
   * Step 1: Input Validation
   */
  async validateInput(userInput) {
    if (!userInput || typeof userInput !== 'string') {
      return {
        valid: false,
        errors: ['Input must be a non-empty string']
      };
    }

    const trimmed = userInput.trim();
    if (trimmed.length < 3) {
      return {
        valid: false,
        errors: ['Input too short - please provide more details']
      };
    }

    if (trimmed.length > 500) {
      return {
        valid: false,
        errors: ['Input too long - please keep under 500 characters']
      };
    }

    // Basic content validation
    const hasTimeIndicator = /\b(at|on|tomorrow|today|next|this|am|pm|\d{1,2}:\d{2}|\d{1,2}(am|pm))/i.test(trimmed);
    const hasActionIndicator = /\b(book|schedule|add|create|plan|meet|call|lunch|dinner|appointment)/i.test(trimmed);

    if (!hasTimeIndicator && !hasActionIndicator) {
      return {
        valid: false,
        errors: ['Please include time information and/or scheduling keywords']
      };
    }

    return {
      valid: true,
      sanitized: trimmed
    };
  }

  /**
   * Step 2: AI Parsing
   */
  async parseWithAI(userInput, currentDate) {
    try {
      const prompt = WORKFLOW_PROMPTS.eventExtraction.buildPrompt(userInput, new Date(currentDate));
      
      const response = await this.env.AI.run(
        WORKFLOW_PROMPTS.eventExtraction.model,
        {
          messages: [{ role: "user", content: prompt }],
          max_tokens: WORKFLOW_PROMPTS.eventExtraction.maxTokens,
          temperature: WORKFLOW_PROMPTS.eventExtraction.temperature
        }
      );

      let parsed;
      try {
        parsed = JSON.parse(response.response);
      } catch (parseError) {
        throw new Error(`AI response not valid JSON: ${response.response}`);
      }

      if (!parsed.success || !parsed.event) {
        return {
          success: false,
          error: "AI could not extract event details",
          ambiguities: parsed.ambiguities || [],
          suggestions: parsed.suggestions || []
        };
      }

      // Validate required fields
      const event = parsed.event;
      if (!event.title || !event.datetime) {
        return {
          success: false,
          error: "Missing required event details (title or datetime)",
          ambiguities: parsed.ambiguities || []
        };
      }

      // Add metadata
      event.id = crypto.randomUUID();
      event.createdAt = new Date().toISOString();
      event.source = 'ai-parsed';
      event.originalInput = userInput;

      return {
        success: true,
        event,
        confidence: parsed.confidence || 0.8,
        ambiguities: parsed.ambiguities || [],
        suggestions: parsed.suggestions || []
      };

    } catch (error) {
      console.error('[Workflow] AI parsing error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Step 3: Conflict Detection
   */
  async checkConflicts(event, sessionId) {
    try {
      const doId = this.env.CALENDAR_DO.idFromName(sessionId);
      const doStub = this.env.CALENDAR_DO.get(doId);
      
      const response = await doStub.fetch(new Request('https://do/conflicts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event })
      }));

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Conflict detection failed');
      }

      return {
        hasConflicts: result.hasConflicts || false,
        conflicts: result.conflicts || [],
        severity: result.severity || 'none'
      };

    } catch (error) {
      console.error('[Workflow] Conflict detection error:', error);
      // Non-fatal - proceed without conflict detection
      return {
        hasConflicts: false,
        conflicts: [],
        severity: 'unknown',
        error: error.message
      };
    }
  }

  /**
   * Step 4: Priority-based Conflict Resolution
   */
  async resolveConflicts(event, conflicts, sessionId) {
    try {
      const resolutionStrategy = this.determineResolutionStrategy(event, conflicts);
      
      switch (resolutionStrategy.action) {
        case 'reschedule':
          return await this.suggestReschedule(event, conflicts, sessionId);
          
        case 'cancel_existing':
          return await this.suggestCancellation(event, conflicts, sessionId);
          
        case 'contact_participants':
          return await this.suggestContact(event, conflicts);
          
        case 'proceed_anyway':
          return {
            action: 'proceed',
            resolvedEvent: event,
            message: 'Proceeding despite conflicts as requested',
            warnings: conflicts.map(c => `Conflicts with: ${c.title}`)
          };
          
        default:
          return {
            action: 'manual_review',
            message: 'Manual review required for complex conflicts',
            conflicts,
            suggestions: resolutionStrategy.suggestions
          };
      }

    } catch (error) {
      console.error('[Workflow] Conflict resolution error:', error);
      return {
        action: 'error',
        error: error.message,
        fallback: 'manual_review'
      };
    }
  }

  /**
   * Determine the best resolution strategy based on event priority and conflict severity
   */
  determineResolutionStrategy(event, conflicts) {
    const eventPriority = event.priority || 'medium';
    const hasHighPriorityConflicts = conflicts.some(c => c.priority === 'high');
    const hasUrgentEvent = event.urgency === 'high';
    
    if (hasUrgentEvent && !hasHighPriorityConflicts) {
      return { action: 'reschedule', reason: 'urgent_event_priority' };
    }
    
    if (eventPriority === 'low' && hasHighPriorityConflicts) {
      return { action: 'reschedule', reason: 'existing_priority_higher' };
    }
    
    if (conflicts.length === 1 && eventPriority === 'high') {
      return { action: 'contact_participants', reason: 'single_conflict_high_priority' };
    }
    
    if (conflicts.length > 2) {
      return { action: 'manual_review', reason: 'multiple_conflicts' };
    }
    
    return { action: 'reschedule', reason: 'default_strategy' };
  }

  /**
   * Step 5: Event Storage
   */
  async storeEvent(event, sessionId) {
    try {
      const doId = this.env.CALENDAR_DO.idFromName(sessionId);
      const doStub = this.env.CALENDAR_DO.get(doId);
      
      const response = await doStub.fetch(new Request('https://do/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event })
      }));

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Storage failed');
      }

      return {
        success: true,
        event: result.event
      };

    } catch (error) {
      console.error('[Workflow] Storage error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Step 6: Response Generation
   */
  async generateResponse({ event, conflicts, resolution, userInput }) {
    const response = {
      message: '',
      event,
      type: 'success'
    };

    if (!conflicts.hasConflicts) {
      response.message = `✅ Successfully scheduled "${event.title}" for ${new Date(event.datetime).toLocaleDateString()} at ${new Date(event.datetime).toLocaleTimeString()}.`;
    } else if (resolution && resolution.action === 'proceed') {
      response.message = `⚠️ Scheduled "${event.title}" with conflicts. ${resolution.message}`;
      response.type = 'warning';
      response.warnings = resolution.warnings;
    } else if (resolution && resolution.action === 'reschedule') {
      response.message = `🔄 Conflict detected. ${resolution.message}`;
      response.type = 'conflict';
      response.suggestions = resolution.suggestions;
    } else {
      response.message = `❌ Unable to schedule due to conflicts. Please review manually.`;
      response.type = 'error';
      response.conflicts = conflicts.conflicts;
    }

    return response;
  }

  /**
   * Step 7: Notifications
   */
  async sendNotifications({ sessionId, event, conflicts, resolution }) {
    // For now, just log notifications
    // In a real implementation, this could send emails, SMS, etc.
    console.log(`[Workflow] Notification for ${sessionId}:`, {
      event: event.title,
      conflicts: conflicts.hasConflicts,
      resolution: resolution?.action || 'none'
    });

    return {
      sent: true,
      type: 'log',
      recipients: ['console']
    };
  }

  // Helper methods for conflict resolution
  async suggestReschedule(event, conflicts, sessionId) {
    // Implementation for rescheduling suggestions
    return {
      action: 'reschedule',
      message: 'Suggesting alternative times to avoid conflicts',
      suggestions: ['Try 1 hour later', 'Try tomorrow at the same time'],
      resolvedEvent: event
    };
  }

  async suggestCancellation(event, conflicts, sessionId) {
    return {
      action: 'cancel_existing',
      message: 'Consider canceling lower-priority conflicting events',
      candidates: conflicts.filter(c => c.priority !== 'high'),
      resolvedEvent: event
    };
  }

  async suggestContact(event, conflicts) {
    const participants = conflicts.flatMap(c => c.participants || []);
    return {
      action: 'contact_participants',
      message: 'Contact participants to resolve scheduling conflict',
      contacts: [...new Set(participants)],
      resolvedEvent: event
    };
  }
} 