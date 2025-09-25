// AutoCal Frontend JavaScript
class AutoCalApp {
    constructor() {
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
            
            // Make API call to worker
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
            this.showAssistantResponse('Sorry, there was an error processing your request. Please try again.');
        } finally {
            this.setLoading(false);
        }
    }

    async callWorkerAPI(command) {
        // For Phase 1, we'll just simulate an API call
        // In Phase 2, this will make actual requests to the Worker
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Return mock response for now
        return {
            message: `Received command: "${command}". Worker integration coming in Phase 2!`,
            success: true
        };
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