// AutoCal Frontend JavaScript - Phase 3
class AutoCalApp {
    constructor() {
        this.workerUrl = 'http://localhost:8787'; // Local development URL
        this.sessionId = this.getOrCreateSessionId();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadTheme();
        this.setupKeyboardShortcuts();
        this.loadStoredEvents(); // Load events on page load
    }

    getOrCreateSessionId() {
        let sessionId = localStorage.getItem('autocal-session-id');
        if (!sessionId) {
            sessionId = 'session_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
            localStorage.setItem('autocal-session-id', sessionId);
        }
        return sessionId;
    }

    setupEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        themeToggle.addEventListener('click', () => this.toggleTheme());

        // Form submission
        const submitBtn = document.getElementById('submitBtn');
        const commandInput = document.getElementById('commandInput');
        
        submitBtn.addEventListener('click', () => this.handleSubmit());
        commandInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSubmit();
            }
        });

        // Auto-resize input on mobile
        commandInput.addEventListener('input', this.adjustInputHeight);
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K to focus input
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                document.getElementById('commandInput').focus();
            }
            
            // Ctrl/Cmd + D to toggle theme
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                e.preventDefault();
                this.toggleTheme();
            }

            // Ctrl/Cmd + R to refresh events
            if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                e.preventDefault();
                this.loadStoredEvents();
            }
        });
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('autocal-theme', newTheme);
        
        // Update theme toggle icon
        const themeIcon = document.querySelector('.theme-icon');
        themeIcon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        
        // Announce theme change for screen readers
        this.announceToScreenReader(`Switched to ${newTheme} theme`);
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('autocal-theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = savedTheme || (prefersDark ? 'dark' : 'light');
        
        document.documentElement.setAttribute('data-theme', theme);
        
        // Update theme toggle icon
        const themeIcon = document.querySelector('.theme-icon');
        themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }

    async loadStoredEvents() {
        try {
            const response = await fetch(`${this.workerUrl}/api/events`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Session-ID': this.sessionId
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.events) {
                    this.updateEventsList(data.events);
                    this.updateEventCount(data.totalEvents || 0);
                } else {
                    console.warn('Failed to load events:', data.error);
                }
            }
        } catch (error) {
            console.error('Error loading stored events:', error);
            // Don't show error to user on page load - events list will show "no events"
        }
    }

    async handleSubmit() {
        const input = document.getElementById('commandInput');
        const command = input.value.trim();
        
        if (!command) {
            this.showAssistantResponse('Please enter a command first.');
            return;
        }

        try {
            this.setLoading(true);
            this.showAssistantResponse('Processing your request...');
            
            // Make real API call to worker
            const response = await this.callWorkerAPI(command);
            
            this.showAssistantResponse(response.message || 'Command processed successfully!');
            
            // Clear input on success
            input.value = '';
            
            // If an event was created, refresh the events list
            if (response.eventCreated) {
                setTimeout(() => this.loadStoredEvents(), 500); // Small delay to ensure storage is complete
            }
            
            // Show conflicts if any
            if (response.conflicts && response.conflicts.length > 0) {
                this.showConflicts(response.conflicts);
            }
            
        } catch (error) {
            console.error('Error:', error);
            this.handleApiError(error);
        } finally {
            this.setLoading(false);
        }
    }

    async callWorkerAPI(command) {
        const maxRetries = 3;
        let lastError;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

                const response = await fetch(`${this.workerUrl}/api/chat`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Session-ID': this.sessionId
                    },
                    body: JSON.stringify({
                        command: command,
                        timestamp: new Date().toISOString(),
                        phase: 3,
                        sessionId: this.sessionId
                    }),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(`HTTP ${response.status}: ${errorData.message || 'Unknown error'}`);
                }

                const data = await response.json();
                
                // Validate response structure
                if (typeof data !== 'object' || !data.hasOwnProperty('message')) {
                    throw new Error('Invalid response format from server');
                }

                return data;

            } catch (error) {
                lastError = error;
                
                if (error.name === 'AbortError') {
                    throw new Error('Request timed out. Please try again.');
                }
                
                if (attempt === maxRetries) {
                    break;
                }
                
                // Wait before retry (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            }
        }

        throw lastError;
    }

    async deleteEvent(eventId) {
        try {
            const response = await fetch(`${this.workerUrl}/api/events/delete/${eventId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Session-ID': this.sessionId
                }
            });

            const data = await response.json();
            
            if (data.success) {
                this.showAssistantResponse(`Event "${data.deletedEvent.title}" deleted successfully.`);
                this.loadStoredEvents(); // Refresh events list
            } else {
                this.showAssistantResponse(`Failed to delete event: ${data.error}`);
            }
        } catch (error) {
            console.error('Delete error:', error);
            this.showAssistantResponse('Error deleting event. Please try again.');
        }
    }

    handleApiError(error) {
        let message = 'Sorry, there was an error processing your request.';
        
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            message = 'Unable to connect to the server. Please check if the Worker is running and try again.';
        } else if (error.message.includes('timed out')) {
            message = 'Request timed out. Please try again.';
        } else if (error.message.includes('HTTP 4')) {
            message = 'There was an issue with your request. Please try a different command.';
        } else if (error.message.includes('HTTP 5')) {
            message = 'Server error occurred. Please try again in a moment.';
        } else if (error.message) {
            message = `Error: ${error.message}`;
        }
        
        this.showAssistantResponse(message);
    }

    setLoading(isLoading) {
        const loading = document.getElementById('loading');
        const submitBtn = document.getElementById('submitBtn');
        
        if (isLoading) {
            loading.style.display = 'flex';
            submitBtn.disabled = true;
            submitBtn.textContent = 'Thinking...';
        } else {
            loading.style.display = 'none';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send';
        }
    }

    showAssistantResponse(message) {
        const responseElement = document.getElementById('assistantResponse');
        responseElement.textContent = message;
        responseElement.style.fontStyle = message.includes('Hi! I\'m your') ? 'italic' : 'normal';
        
        // Add timestamp for API responses
        if (!message.includes('Hi! I\'m your') && !message.includes('Please enter')) {
            const timestamp = new Date().toLocaleTimeString();
            responseElement.innerHTML = `${this.escapeHtml(message)} <small style="color: var(--text-muted); font-size: 0.8em;">(${timestamp})</small>`;
        }
        
        // Announce to screen readers
        this.announceToScreenReader(message);
    }

    showConflicts(conflicts) {
        if (!conflicts || conflicts.length === 0) return;
        
        const responseElement = document.getElementById('assistantResponse');
        let conflictHtml = `<div style="margin-top: 10px; padding: 10px; background: var(--warning-color); color: white; border-radius: 5px;">`;
        conflictHtml += `<strong>⚠️ Scheduling Conflicts:</strong><br>`;
        
        conflicts.forEach(conflict => {
            conflictHtml += `• Conflicts with "${conflict.conflictingEvent.title}" at ${this.formatDateTime(conflict.conflictingEvent.datetime)}<br>`;
            if (conflict.suggestion && conflict.suggestion.length > 0) {
                conflictHtml += `  Suggestion: ${conflict.suggestion[0]}<br>`;
            }
        });
        
        conflictHtml += `</div>`;
        responseElement.innerHTML += conflictHtml;
    }

    updateEventsList(events) {
        const eventsContainer = document.getElementById('eventsList');
        
        if (!events || events.length === 0) {
            eventsContainer.innerHTML = '<div class="no-events">No events yet. Ask me to create your first event!</div>';
            return;
        }

        const eventsHTML = events.map(event => `
            <div class="event-item" data-event-id="${event.id}">
                <div class="event-header">
                    <div class="event-title">${this.escapeHtml(event.title)}</div>
                    <button class="delete-btn" onclick="window.autoCalApp.deleteEvent('${event.id}')" aria-label="Delete event">
                        🗑️
                    </button>
                </div>
                <div class="event-datetime">${this.formatDateTime(event.datetime)}</div>
                ${event.participants && event.participants.length > 0 ? 
                    `<div class="event-participants">👥 ${event.participants.join(', ')}</div>` : ''}
                ${event.location ? `<div class="event-location">📍 ${this.escapeHtml(event.location)}</div>` : ''}
                <div class="event-meta">
                    <span class="event-duration">${event.duration || 60} min</span>
                    <span class="event-priority priority-${event.priority || 'medium'}">${event.priority || 'medium'}</span>
                    <span class="event-id">ID: ${event.id.slice(-6)}</span>
                </div>
            </div>
        `).join('');

        eventsContainer.innerHTML = eventsHTML;
    }

    updateEventCount(count) {
        const subtitle = document.querySelector('.subtitle');
        if (count > 0) {
            subtitle.textContent = `Your AI calendar assistant (${count} events)`;
        } else {
            subtitle.textContent = 'Your AI calendar assistant';
        }
    }

    formatDateTime(datetime) {
        try {
            const date = new Date(datetime);
            return date.toLocaleString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return datetime; // fallback to raw string
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.style.position = 'absolute';
        announcement.style.left = '-10000px';
        announcement.style.width = '1px';
        announcement.style.height = '1px';
        announcement.style.overflow = 'hidden';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        
        // Remove after announcement
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    adjustInputHeight(event) {
        // Auto-resize functionality for mobile
        const input = event.target;
        input.style.height = 'auto';
        input.style.height = input.scrollHeight + 'px';
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.autoCalApp = new AutoCalApp();
});

// Handle system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const savedTheme = localStorage.getItem('autocal-theme');
    if (!savedTheme) {
        // Only auto-switch if user hasn't manually set a theme
        const newTheme = e.matches ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        const themeIcon = document.querySelector('.theme-icon');
        themeIcon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    }
});

// Export for potential use in other modules
window.AutoCalApp = AutoCalApp; 