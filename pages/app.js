// AutoCal Frontend JavaScript
class AutoCalApp {
    constructor() {
        this.workerUrl = 'http://localhost:8787'; // Local development URL
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadTheme();
        this.setupKeyboardShortcuts();
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
            
            // If events are returned, update the display
            if (response.events) {
                this.updateEventsList(response.events);
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
                    },
                    body: JSON.stringify({
                        command: command,
                        timestamp: new Date().toISOString(),
                        phase: 2
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
            submitBtn.textContent = 'Processing...';
        } else {
            loading.style.display = 'none';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Add Event';
        }
    }

    showAssistantResponse(message) {
        const responseElement = document.getElementById('assistantResponse');
        responseElement.textContent = message;
        responseElement.style.fontStyle = message.includes('Welcome') ? 'italic' : 'normal';
        
        // Add timestamp for API responses
        if (!message.includes('Welcome') && !message.includes('Please enter')) {
            const timestamp = new Date().toLocaleTimeString();
            responseElement.innerHTML = `${this.escapeHtml(message)} <small style="color: var(--text-muted); font-size: 0.8em;">(${timestamp})</small>`;
        }
        
        // Announce to screen readers
        this.announceToScreenReader(message);
    }

    updateEventsList(events) {
        const eventsContainer = document.getElementById('eventsList');
        
        if (!events || events.length === 0) {
            eventsContainer.innerHTML = '<div class="no-events">No events yet. Create your first event above!</div>';
            return;
        }

        const eventsHTML = events.map(event => `
            <div class="event-item">
                <div class="event-title">${this.escapeHtml(event.title)}</div>
                <div class="event-datetime">${this.formatDateTime(event.datetime)}</div>
            </div>
        `).join('');

        eventsContainer.innerHTML = eventsHTML;
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
    new AutoCalApp();
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