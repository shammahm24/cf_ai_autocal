## Prompt 1
"""
Do not code! We are building a short interactive AI app demo utilizing a Cloudflare centered stack. The app will be an interactive calender called AutoCal. 
The first step will be to create a design doc used throughout the project design. the design doc will be in a plan directory.

Functions:
- Takes text input and creates calendar events
- Auto detects event clashes and recommends adjustments based on priorities
- Determines people to contact or bookings to cancel or if event plans change

Non functional:
- Easy to navigate, single screen design
- Light theme/ dark theme adaptable

The application should satisfy the following conditions:
- LLM (recommend using Llama 3.3 on Workers AI), or an external LLM of your choice
- Workflow / coordination (recommend using Workflows, Workers or Durable Objects)
- User input via chat or voice (recommend using Pages or Realtime)
    Memory or state

Show me your understanding of the instructions before creating initial documents
"""

## Prompt 2
"""
based on documentation, list the steps we need to take to get the project to completion
"""

## Prompt 3
"""
Run phase 1
Setup & Infrastructure
Initialize repository structure - Create directories: pages/, workers/, workflows/, docs/
Create basic HTML interface with:
Text input box for natural language commands
Event display area
Basic styling with theme toggle
Set up basic Worker returning "ok" at /api
Configure Wrangler for local development
Test basic deployment to Cloudflare
"""

## Prompt 4
"""
We are moving to phase 2. State the steps involved first. Do not code
"""

## Prompt 5
"""
phase2 is complete, what are the steps for phase 3. Do not code
"""

## Prompt 6
"""
phase2 is complete, what are the steps for phase 3. Do not code
"""

## Prompt 7
"""
Debugging request timeouts. Identify areas of concern in codebase and configuration
"""
// similar prompts for all phases
## Prompt 8
"""
an addition i need for phase 6 is the chat to be at the bottom and everything else on top for better visibility
"""