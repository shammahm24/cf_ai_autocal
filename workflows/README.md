# AutoCal Workflows

This directory contains Cloudflare Workflow definitions for coordinating the event processing pipeline.

## Phase 5: Workflow Orchestration

The workflows will be implemented in Phase 5 and will include:

- **calendar-workflow.js**: Main event processing workflow
- **prompts.js**: AI prompt templates for consistent responses

## Workflow Steps (Coming in Phase 5)

1. **Input Validation**: Sanitize and validate user input
2. **AI Parsing**: Extract event details using Llama 3.3
3. **Conflict Detection**: Check for scheduling conflicts
4. **Event Storage**: Save to Durable Object
5. **Response Generation**: Format response for frontend

## Current Status

✅ **Phase 1-4 Complete**: Infrastructure, AI, and storage in place  
🚀 **Phase 5**: Workflow orchestration (IMPLEMENTED)  
📋 **Phase 6+**: Advanced features (planned)

## Implemented Features

- **calendar-workflow.js**: Complete event processing pipeline
- **Coordinated Steps**: Input validation → AI parsing → Conflict detection → Storage → Response
- **Error Handling**: Retry logic with exponential backoff
- **Conflict Resolution**: Priority-based intelligent resolution strategies
- **Fallback Support**: Graceful degradation to Phase 4 processing 