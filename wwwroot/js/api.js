const API = {
    baseURL: '/api/v2',

    //TOKENS

    // Save token after user login
    saveToken(token) {
        localStorage.setItem('jwt_token', token);
    },

    // Retrieve saved token
    getToken() {
        return localStorage.getItem('jwt_token');
    },

    // Remove token when logout
    clearToken() {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_info');
    },

    // Check if someone is logged in
    isLoggedIn() {
        return !!this.getToken();
    },

    // Retrieve saved user info (e.g. role, name etc)
    getUserInfo() {
        const info = localStorage.getItem('user_info');
        return info ? JSON.parse(info) : null;
    },

    // Check if logged in user is admin
    isAdmin() {
        const user = this.getUserInfo();
        return user && user.roles && user.roles.includes('admin');
    },

    // Build headers - add Authorization header if the token exists
    getHeaders(requiresAuth = false) {
        const headers = { 'Content-Type': 'application/json' };
        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    },

    // AUTHENTICATION

    // Register user
    async register(fullName, email, password, phone, dateOfBirth) {
        const res = await fetch(`${this.baseURL}/auth/register`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ fullName, email, password, phone, dateOfBirth })
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(Array.isArray(err) ? err.join(', ') : err.message || 'Registration failed');
        }
        return await res.json();
    },

    // Login and save token
    async login(email, password) {
        const res = await fetch(`${this.baseURL}/auth/login`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ email, password })
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || 'Login failed');
        }
        const data = await res.json();
        // Save token and user info for use across all pages
        this.saveToken(data.token);
        localStorage.setItem('user_info', JSON.stringify(data));
        return data;
    },

    // Logout - clears token
    logout() {
        this.clearToken();
        window.location.href = 'index.html';
    },

    // EVENTS

    // Retrieve all events
    async getEvents(filters = {}) {
        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        if (filters.category) params.append('category', filters.category);
        if (filters.location) params.append('location', filters.location);

        const url = `${this.baseURL}/events${params.toString() ? '?' + params.toString() : ''}`;
        const res = await fetch(url, { headers: this.getHeaders() });
        if (!res.ok) throw new Error('Failed to load events');
        return await res.json();
    },

    // Retrieve event by ID
    async getEvent(id) {
        const res = await fetch(`${this.baseURL}/events/${id}`, {
            headers: this.getHeaders()
        });
        if (!res.ok) throw new Error('Event not found');
        return await res.json();
    },

    // Create event --> admin only
    async createEvent(data) {
        const res = await fetch(`${this.baseURL}/events`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to create event');
        return await res.json();
    },

    // Update event --> admin only
    async updateEvent(id, data) {
        const res = await fetch(`${this.baseURL}/events/${id}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to update event');
        return await res.json();
    },

    // Delete event --> admin only
    async deleteEvent(id) {
        const res = await fetch(`${this.baseURL}/events/${id}`, {
            method: 'DELETE',
            headers: this.getHeaders()
        });
        if (!res.ok) throw new Error('Failed to delete event');
        return await res.json();
    },

    // ORGANIZERS

    async getOrganizers() {
        const res = await fetch(`${this.baseURL}/organizers`, {
            headers: this.getHeaders()
        });
        if (!res.ok) throw new Error('Failed to load organizers');
        return await res.json();
    },

    async getOrganizer(id) {
        const res = await fetch(`${this.baseURL}/organizers/${id}`, {
            headers: this.getHeaders()
        });
        if (!res.ok) throw new Error('Organizer not found');
        return await res.json();
    },

    async createOrganizer(data) {
        const res = await fetch(`${this.baseURL}/organizers`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to create organizer');
        return await res.json();
    },

    async updateOrganizer(id, data) {
        const res = await fetch(`${this.baseURL}/organizers/${id}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to update organizer');
        return await res.json();
    },

    async deleteOrganizer(id) {
        const res = await fetch(`${this.baseURL}/organizers/${id}`, {
            method: 'DELETE',
            headers: this.getHeaders()
        });
        if (!res.ok) throw new Error('Failed to delete organizer');
        return await res.json();
    },

    // COMMENTS

    async getCommentsByEvent(eventId) {
        const res = await fetch(`${this.baseURL}/comments/${eventId}`, {
            headers: this.getHeaders()
        });
        if (!res.ok) throw new Error('Failed to load comments');
        return await res.json();
    },

    async createComment(eventId, data) {
        const res = await fetch(`${this.baseURL}/comments/${eventId}`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to post comment');
        return await res.json();
    },

    async deleteComment(eventId, commentId) {
        const res = await fetch(`${this.baseURL}/comments/${eventId}/${commentId}`, {
            method: 'DELETE',
            headers: this.getHeaders()
        });
        if (!res.ok) throw new Error('Failed to delete comment');
        return await res.json();
    },

    // MESSAGES

    async getMessages() {
        const res = await fetch(`${this.baseURL}/messages`, {
            headers: this.getHeaders()
        });
        if (!res.ok) throw new Error('Failed to load messages');
        return await res.json();
    },

    async createMessage(data) {
        const res = await fetch(`${this.baseURL}/messages`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to send message');
        return await res.json();
    },

    async deleteMessage(id) {
        const res = await fetch(`${this.baseURL}/messages/${id}`, {
            method: 'DELETE',
            headers: this.getHeaders()
        });
        if (!res.ok) throw new Error('Failed to delete message');
        return await res.json();
    },

    // BOOKINGS

    // Retrieve bookings 
    async getBookings() {
        const res = await fetch(`${this.baseURL}/bookings`, {
            headers: this.getHeaders()
        });
        if (!res.ok) throw new Error('Failed to load bookings');
        return await res.json();
    },

    // Book event
    async createBooking(eventId) {
        const res = await fetch(`${this.baseURL}/bookings`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ eventId })
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || 'Failed to book event');
        }
        return await res.json();
    },

    // Cancel booking
    async cancelBooking(bookingId) {
        const res = await fetch(`${this.baseURL}/bookings/${bookingId}`, {
            method: 'DELETE',
            headers: this.getHeaders()
        });
        if (!res.ok) throw new Error('Failed to cancel booking');
        return await res.json();
    }
};
