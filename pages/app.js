// AutoCal Frontend JavaScript - Phase 6
class AutoCalApp {
    constructor() {
        this.workerUrl = 'http://localhost:8787'; // Local development URL
        this.sessionId = this.getOrCreateSessionId();
        this.currentView = 'list'; // 'list' or 'calendar'
        this.currentPeriod = new Date();
        this.events = [];
        this.chatExpanded = true;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadTheme();
        this.setupKeyboardShortcuts();
        this.loadStoredEvents();
        this.updateStatusDisplay();
        this.initializeChatInterface();
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
        themeToggle?.addEventListener('click', () => this.toggleTheme());

        // View toggle
        const viewToggle = document.getElementById('viewToggle');
        viewToggle?.addEventListener('click', () => this.toggleView());

        // Calendar controls
        const todayBtn = document.getElementById('todayBtn');
        const weekBtn = document.getElementById('weekBtn');
        const monthBtn = document.getElementById('monthBtn');
        
        todayBtn?.addEventListener('click', () => this.switchToPeriod('today'));
        weekBtn?.addEventListener('click', () => this.switchToPeriod('week'));
        monthBtn?.addEventListener('click', () => this.switchToPeriod('month'));

        // Calendar navigation
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        prevBtn?.addEventListener('click', () => this.navigatePeriod(-1));
        nextBtn?.addEventListener('click', () => this.navigatePeriod(1));

        // Chat interface
        const submitBtn = document.getElementById('submitBtn');
        const commandInput = document.getElementById('commandInput');
        const chatToggle = document.getElementById('chatToggle');
        
        submitBtn?.addEventListener('click', () => this.handleSubmit());
        commandInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSubmit();
            }
        });
        
        chatToggle?.addEventListener('click', () => this.toggleChat());

        // Conflict resolution
        const dismissConflicts = document.getElementById('dismissConflicts');
        dismissConflicts?.addEventListener('click', () => this.dismissConflicts());

        // Auto-resize input
        commandInput?.addEventListener('input', this.adjustInputHeight);
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K to focus input
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                document.getElementById('commandInput')?.focus();
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

            // Ctrl/Cmd + V to toggle view
            if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
                e.preventDefault();
                this.toggleView();
            }

            // Escape to close conflicts
            if (e.key === 'Escape') {
                this.dismissConflicts();
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
        if (themeIcon) {
            themeIcon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        }
        
        this.announceToScreenReader(`Switched to ${newTheme} theme`);
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('autocal-theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = savedTheme || (prefersDark ? 'dark' : 'light');
        
        document.documentElement.setAttribute('data-theme', theme);
        
        // Update theme toggle icon
        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
    }

    toggleView() {
        this.currentView = this.currentView === 'list' ? 'calendar' : 'list';
        
        const calendarGrid = document.getElementById('calendarGrid');
        const eventsList = document.getElementById('eventsList');
        const viewToggle = document.getElementById('viewToggle');
        
        if (this.currentView === 'calendar') {
            calendarGrid.style.display = 'block';
            eventsList.style.display = 'none';
            if (viewToggle) {
                viewToggle.querySelector('.view-icon').textContent = '📋';
                viewToggle.querySelector('.view-text').textContent = 'List';
            }
            this.renderCalendarView();
        } else {
            calendarGrid.style.display = 'none';
            eventsList.style.display = 'block';
            if (viewToggle) {
                viewToggle.querySelector('.view-icon').textContent = '📅';
                viewToggle.querySelector('.view-text').textContent = 'Calendar';
            }
            this.renderEventsList();
        }
    }

    switchToPeriod(period) {
        const today = new Date();
        
        switch (period) {
            case 'today':
                this.currentPeriod = new Date(today);
                break;
            case 'week':
                // Start of week (Sunday)
                this.currentPeriod = new Date(today);
                this.currentPeriod.setDate(today.getDate() - today.getDay());
                break;
            case 'month':
                this.currentPeriod = new Date(today.getFullYear(), today.getMonth(), 1);
                break;
        }
        
        this.updatePeriodDisplay();
        if (this.currentView === 'calendar') {
            this.renderCalendarView();
        }
    }

    navigatePeriod(direction) {
        // Simple navigation - add/subtract days for now
        const newDate = new Date(this.currentPeriod);
        newDate.setDate(newDate.getDate() + (direction * 7)); // Navigate by weeks
        this.currentPeriod = newDate;
        
        this.updatePeriodDisplay();
        if (this.currentView === 'calendar') {
            this.renderCalendarView();
        }
    }

    updatePeriodDisplay() {
        const currentPeriodEl = document.getElementById('currentPeriod');
        if (currentPeriodEl) {
            currentPeriodEl.textContent = this.currentPeriod.toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
                day: 'numeric'
            });
        }
    }

    initializeChatInterface() {
        const chatHistory = document.getElementById('chatHistory');
        if (chatHistory) {
            // Initial welcome message is already in HTML
            this.scrollChatToBottom();
        }
    }

    toggleChat() {
        const chatHistory = document.getElementById('chatHistory');
        const chatToggle = document.getElementById('chatToggle');
        
        this.chatExpanded = !this.chatExpanded;
        
        if (chatHistory) {
            chatHistory.style.display = this.chatExpanded ? 'block' : 'none';
        }
        
        if (chatToggle) {
            chatToggle.style.transform = this.chatExpanded ? 'translateY(-2px)' : 'translateY(0)';
        }
    }

    addChatMessage(content, isUser = false, timestamp = new Date()) {
        const chatHistory = document.getElementById('chatHistory');
        if (!chatHistory) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${isUser ? 'user-message' : 'assistant-message'}`;
        
        messageDiv.innerHTML = `
            <div class="message-content">${content}</div>
            <div class="message-time">${timestamp.toLocaleTimeString()}</div>
        `;
        
        chatHistory.appendChild(messageDiv);
        this.scrollChatToBottom();
    }

    scrollChatToBottom() {
        const chatHistory = document.getElementById('chatHistory');
        if (chatHistory) {
            chatHistory.scrollTop = chatHistory.scrollHeight;
        }
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
                this.events = data.events || [];
                this.renderEventsList();
                this.updateStatusDisplay();
                
                if (this.currentView === 'calendar') {
                    this.renderCalendarView();
                }
            }
        } catch (error) {
            console.error('Error loading events:', error);
            this.updateStatusDisplay(false);
        }
    }

    renderEventsList() {
        const eventsList = document.getElementById('eventsList');
        if (!eventsList) return;

        if (this.events.length === 0) {
            eventsList.innerHTML = '<div class="no-events">No events yet. Use the chat below to create your first event!</div>';
            return;
        }

        eventsList.innerHTML = this.events.map(event => `
            <div class="event-item" data-event-id="${event.id}">
                <div class="event-title">${this.escapeHtml(event.title)}</div>
                <div class="event-details">
                    <div class="event-time">
                        🕐 ${new Date(event.datetime).toLocaleString()}
                    </div>
                    ${event.participants && event.participants.length > 0 ? 
                        `<div class="event-participants">👥 ${event.participants.join(', ')}</div>` : ''
                    }
                    ${event.location ? 
                        `<div class="event-location">📍 ${this.escapeHtml(event.location)}</div>` : ''
                    }
                </div>
                <div class="event-meta">
                    <span class="event-priority priority-${event.priority || 'medium'}">${event.priority || 'medium'}</span>
                    ${event.duration ? `<span class="event-duration">${event.duration}min</span>` : ''}
                </div>
            </div>
        `).join('');
    }

    renderCalendarView() {
        const calendarView = document.getElementById('calendarView');
        if (!calendarView) return;

        // Simple calendar grid for Phase 6
        const startDate = new Date(this.currentPeriod);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 7); // Show week view

        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        let calendarHtml = '<div class="calendar-grid-view">';
        
        // Header row
        calendarHtml += '<div class="calendar-row calendar-header-row">';
        daysOfWeek.forEach(day => {
            calendarHtml += `<div class="calendar-cell calendar-header-cell">${day}</div>`;
        });
        calendarHtml += '</div>';

        // Calendar days
        const currentDate = new Date(startDate);
        calendarHtml += '<div class="calendar-row">';
        
        for (let i = 0; i < 7; i++) {
            const dayEvents = this.events.filter(event => {
                const eventDate = new Date(event.datetime);
                return eventDate.toDateString() === currentDate.toDateString();
            });

            calendarHtml += `
                <div class="calendar-cell calendar-day-cell" data-date="${currentDate.toISOString()}">
                    <div class="day-number">${currentDate.getDate()}</div>
                    <div class="day-events">
                        ${dayEvents.map(event => `
                            <div class="calendar-event" title="${this.escapeHtml(event.title)}">
                                ${this.escapeHtml(event.title)}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        calendarHtml += '</div></div>';
        calendarView.innerHTML = calendarHtml;
    }

    updateStatusDisplay(aiOnline = true) {
        const phaseStatus = document.getElementById('phaseStatus');
        const eventCount = document.getElementById('eventCount');
        const aiStatus = document.getElementById('aiStatus');

        if (phaseStatus) phaseStatus.textContent = '6';
        if (eventCount) eventCount.textContent = this.events.length.toString();
        if (aiStatus) {
            aiStatus.textContent = aiOnline ? 'Online' : 'Offline';
            aiStatus.className = `status-value ${aiOnline ? 'status-online' : 'status-offline'}`;
        }
    }

    async handleSubmit() {
        const commandInput = document.getElementById('commandInput');
        const submitBtn = document.getElementById('submitBtn');
        const loading = document.getElementById('loading');
        
        if (!commandInput) return;

        const command = commandInput.value.trim();
        if (!command) return;

        // Add user message to chat
        this.addChatMessage(command, true);
        
        // Clear input and show loading
        commandInput.value = '';
        if (submitBtn) submitBtn.disabled = true;
        if (loading) loading.style.display = 'flex';

        try {
            const response = await fetch(`${this.workerUrl}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Session-ID': this.sessionId
                },
                body: JSON.stringify({ command })
            });

            const data = await response.json();

            if (response.ok) {
                // Add assistant response to chat
                this.addChatMessage(data.message || 'Processing completed successfully');
                
                // Handle conflicts if present
                if (data.conflicts && data.conflicts.length > 0) {
                    this.showConflicts(data.conflicts, data.suggestions);
                }
                
                // Refresh events list
                await this.loadStoredEvents();
                this.updateStatusDisplay(true);
            } else {
                this.addChatMessage(`Error: ${data.message || 'Something went wrong'}`, false);
                this.updateStatusDisplay(false);
            }

        } catch (error) {
            console.error('Error submitting command:', error);
            this.addChatMessage('Error: Unable to connect to the server. Please try again.', false);
            this.updateStatusDisplay(false);
        } finally {
            if (submitBtn) submitBtn.disabled = false;
            if (loading) loading.style.display = 'none';
        }
    }

    showConflicts(conflicts, suggestions = []) {
        const conflictsSection = document.getElementById('conflictsSection');
        const conflictsList = document.getElementById('conflictsList');
        
        if (!conflictsSection || !conflictsList) return;

        conflictsList.innerHTML = conflicts.map(conflict => `
            <div class="conflict-item">
                <div class="conflict-title">Conflict with: ${this.escapeHtml(conflict.title)}</div>
                <div class="conflict-details">
                    Time: ${new Date(conflict.datetime).toLocaleString()}
                </div>
                <div class="conflict-suggestions">
                    ${suggestions.map(suggestion => `
                        <button class="suggestion-btn" data-suggestion="${this.escapeHtml(suggestion)}">
                            ${this.escapeHtml(suggestion)}
                        </button>
                    `).join('')}
                </div>
            </div>
        `).join('');

        // Add event listeners to suggestion buttons
        conflictsList.querySelectorAll('.suggestion-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const suggestion = e.target.dataset.suggestion;
                this.applySuggestion(suggestion);
            });
        });

        conflictsSection.style.display = 'block';
    }

    dismissConflicts() {
        const conflictsSection = document.getElementById('conflictsSection');
        if (conflictsSection) {
            conflictsSection.style.display = 'none';
        }
    }

    applySuggestion(suggestion) {
        const commandInput = document.getElementById('commandInput');
        if (commandInput) {
            commandInput.value = suggestion;
            commandInput.focus();
        }
        this.dismissConflicts();
    }

    adjustInputHeight(event) {
        const input = event.target;
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 120) + 'px';
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
        announcement.className = 'sr-only';
        announcement.style.cssText = 'position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0)';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        setTimeout(() => document.body.removeChild(announcement), 1000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AutoCalApp();
});

// Add calendar grid styles dynamically
const calendarStyles = `
.calendar-grid-view {
    display: flex;
    flex-direction: column;
    gap: 1px;
    background: var(--border-color);
}

.calendar-row {
    display: flex;
    gap: 1px;
}

.calendar-cell {
    background: var(--bg-primary);
    padding: 0.75rem;
    min-height: 80px;
    flex: 1;
}

.calendar-header-cell {
    background: var(--bg-secondary);
    min-height: auto;
    padding: 0.5rem 0.75rem;
    font-weight: 600;
    text-align: center;
}

.day-number {
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: var(--text-primary);
}

.day-events {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.calendar-event {
    background: var(--accent-primary);
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: pointer;
}

.calendar-event:hover {
    background: var(--accent-hover);
}

.priority-low .calendar-event {
    background: var(--text-muted);
}

.priority-high .calendar-event {
    background: var(--error-color);
}

.status-offline {
    color: var(--error-color);
}
`;

// Inject calendar styles
const styleSheet = document.createElement('style');
styleSheet.textContent = calendarStyles;
document.head.appendChild(styleSheet); 