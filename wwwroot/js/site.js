document.addEventListener('DOMContentLoaded', function () {
    // Applies saved theme/font options
    applyUserPreferences();

    // Updates nav bar based on who is logged in --> admin/user
    updateNavBar();

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    if (currentPage === 'events.html') {
        initEventsPage();
    } else if (currentPage === 'event-detail.html' || currentPage.startsWith('event-detail')) {
        initEventDetailPage();
    } else if (currentPage === 'contact.html') {
        initContactPage();
    } else if (currentPage === 'admin.html') {
        initAdminPage();
    } else if (currentPage === 'index.html' || currentPage === '' || currentPage === '/') {
        initHomePage();
    } else if (currentPage === 'bookings.html') {
        initBookingsPage();
    }
});

// Navigation Bar
function updateNavBar() {
    const nav = document.querySelector('.navbar-end ul');
    if (!nav) return;

    const user = API.getUserInfo();
    const isLoggedIn = API.isLoggedIn();
    const isAdmin = API.isAdmin();

    // Nav links
    let links = `
        <li><a href="index.html">HOME</a></li>
        <li><a href="events.html">EVENTS</a></li>
        <li><a href="contact.html">CONTACT</a></li>
    `;

    if (isAdmin) {
        // If admin --> admin panel links
        links += `<li><a href="admin.html">ADMIN</a></li>`;
    }

    if (isLoggedIn) {
        // If logged-in users --> bookings and logout button
        links += `
            <li><a href="bookings.html">MY BOOKINGS</a></li>
            <li><a href="#" onclick="API.logout()">LOGOUT</a></li>
        `;
    } else {
        // If guests --> login link
        links += `<li><a href="login.html">LOGIN</a></li>`;
    }

    nav.innerHTML = links;
}

// User Preferences -> theme/font
function applyUserPreferences() {
    const savedFontSize = localStorage.getItem('fontSize') || '16';
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.style.fontSize = savedFontSize + 'px';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

function changeFontSize(size) {
    localStorage.setItem('fontSize', size);
    document.documentElement.style.fontSize = size + 'px';
}

function changeTheme(theme) {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
}

// HOME PAGE
async function initHomePage() {
    await loadFeaturedEvents();
}

async function loadFeaturedEvents() {
    const container = document.getElementById('featuredEventsContainer');
    if (!container) return;

    try {
        container.innerHTML = '<div class="col-span-full text-center py-8">Loading events.....</div>';
        const events = await API.getEvents();

        if (!events || events.length === 0) {
            container.innerHTML = '<div class="col-span-full text-center py-8">No events available.</div>';
            return;
        }

        const featured = events.slice(0, 3);
        container.innerHTML = '';
        featured.forEach(event => container.appendChild(createFeaturedEventCard(event)));

    } catch (err) {
        container.innerHTML = '<div class="col-span-full text-center py-8 text-error">Failed to load events.</div>';
    }
}

function createFeaturedEventCard(event) {
    const card = document.createElement('div');
    card.className = 'card bg-base-100 border border-gray-200 shadow';

    const imageUrl = getFirstImage(event.images);
    const eventDate = formatDate(event.eventDate);

    card.innerHTML = `
        <figure class="h-48">
            <img src="${imageUrl}" alt="${event.title}" class="w-full h-full object-cover"
                 onerror="this.src='https://via.placeholder.com/400x300?text=Event'"/>
        </figure>
        <div class="card-body items-center text-center">
            <h3 class="card-title">${event.title}</h3>
            <p class="text-sm">${eventDate}</p>
            <p>${event.description.substring(0, 100)}...</p>
            <a href="event-detail.html?id=${event.id}" class="btn btn-primary mt-3">Find Out More</a>
        </div>
    `;
    return card;
}

// EVENTS
async function initEventsPage() {
    await loadEvents();
    setupEventSearch();
}

async function loadEvents(filters = {}) {
    const container = document.getElementById('eventsContainer');
    if (!container) return;

    try {
        container.innerHTML = '<div class="col-span-full text-center py-8">Loading events...</div>';
        const events = await API.getEvents(filters);

        if (events.length === 0) {
            container.innerHTML = '<div class="col-span-full text-center py-8">No events found.</div>';
            return;
        }

        container.innerHTML = '';
        events.forEach(event => container.appendChild(createEventCard(event)));

    } catch (err) {
        container.innerHTML = '<div class="col-span-full text-center py-8 text-error">Failed to load events.</div>';
    }
}

function createEventCard(event) {
    const card = document.createElement('a');
    card.href = `event-detail.html?id=${event.id}`;
    card.className = 'card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow';

    const imageUrl = getFirstImage(event.images);
    const eventDate = formatDate(event.eventDate);

    card.innerHTML = `
        <figure class="h-48">
            <img src="${imageUrl}" alt="${event.title}" class="w-full h-full object-cover"
                 onerror="this.src='https://via.placeholder.com/400x300?text=Event'"/>
        </figure>
        <div class="card-body">
            <h2 class="card-title">${event.title}</h2>
            <p class="text-sm text-base-content/70">${event.location}</p>
            <p class="text-sm text-base-content/70">${eventDate}</p>
            <p>${event.description.substring(0, 100)}...</p>
            <div class="card-actions justify-end mt-6">
                <span class="badge badge-primary">${event.category}</span>
            </div>
        </div>
    `;
    return card;
}

function setupEventSearch() {
    const searchInput = document.getElementById('eventSearch');
    const categoryFilter = document.getElementById('categoryFilter');
    if (!searchInput) return;

    let timeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(timeout);
        timeout = setTimeout(performSearch, 300);
    });

    if (categoryFilter) {
        categoryFilter.addEventListener('change', performSearch);
    }
}

function performSearch() {
    const search = document.getElementById('eventSearch')?.value || '';
    const category = document.getElementById('categoryFilter')?.value || '';
    loadEvents({ search, category });
}

// Manage Events
async function loadManageEvents() {
    const container = document.getElementById('manageEventsContainer');
    if (!container) return;

    try {
        const events = await API.getEvents();
        if (events.length === 0) {
            container.innerHTML = '<p>No events yet.</p>';
            return;
        }

        container.innerHTML = '';
        events.forEach(ev => {
            const el = document.createElement('div');
            el.className = 'bg-base-100 p-4 rounded-lg shadow flex justify-between items-center';
            const safeTitle = ev.title.replace(/'/g, "\\'");
            const safeLocation = ev.location.replace(/'/g, "\\'");
            const safeDesc = ev.description.replace(/'/g, "\\'");
            el.innerHTML = `
                <div>
                    <p class="font-bold">${ev.title}</p>
                    <p class="text-sm text-base-content/70">${ev.category} — ${ev.location}</p>
                </div>
                <div class="flex gap-2">
                    <button onclick="openEditEvent(${ev.id}, '${safeTitle}', '${safeLocation}', '${safeDesc}', '${ev.category}')"
                        class="btn btn-xs btn-info">Edit</button>
                    <button onclick="deleteEvent(${ev.id})"
                        class="btn btn-xs btn-error">Delete</button>
                </div>
            `;
            container.appendChild(el);
        });
    } catch (err) {
        container.innerHTML = '<p class="text-error">Failed to load events.</p>';
    }
}

function openEditEvent(id, title, location, description, category) {
    document.getElementById('editEventId').value = id;
    document.getElementById('editEventTitle').value = title;
    document.getElementById('editEventLocation').value = location;
    document.getElementById('editEventDescription').value = description;
    document.getElementById('editEventCategory').value = category;
    document.getElementById('editEventModal').showModal();
}

async function saveEditEvent() {
    const id = document.getElementById('editEventId').value;
    const data = {
        title: document.getElementById('editEventTitle').value,
        location: document.getElementById('editEventLocation').value,
        description: document.getElementById('editEventDescription').value,
        category: document.getElementById('editEventCategory').value,
        eventDate: new Date().toISOString(),
        organizerId: 1,
        images: ''
    };

    try {
        await API.updateEvent(id, data);
        document.getElementById('editEventModal').close();
        await loadManageEvents();
        alert('Event updated!');
    } catch (err) {
        alert('Failed to update: ' + err.message);
    }
}

async function deleteEvent(id) {
    if (!confirm('Delete this event?')) return;
    try {
        await API.deleteEvent(id);
        await loadManageEvents();
        alert('Event deleted.');
    } catch (err) {
        alert('Failed to delete: ' + err.message);
    }
}


// EVENT DETAILS
async function initEventDetailPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');
    if (!eventId) return;

    await loadEventDetail(eventId);
}

async function loadEventDetail(eventId) {
    try {
        // getEvent loads organizer + comments via include() function
        const event = await API.getEvent(eventId);

        document.title = `${event.title} - Ballers Turf`;

        // Update header
        const header = document.getElementById('eventHeader');
        if (header) {
            header.innerHTML = `
                <h1 class="text-4xl font-bold mb-4">${event.title}</h1>
                <div class="flex flex-wrap gap-4 text-base-content/70">
                    <span>${formatDate(event.eventDate)}</span>
                    <span>${event.location}</span>
                    <span class="badge badge-primary">${event.category}</span>
                </div>
            `;
        }

        // Update image gallery
        if (event.images) {
            const images = event.images.split(',').map(i => i.trim());
            setupImageGalleryWithImages(images);
        }

        // Update description
        const desc = document.getElementById('eventDescription');
        if (desc) {
            desc.innerHTML = `
                <h2 class="text-3xl font-bold mb-4">About This Event</h2>
                <p class="text-lg mb-4">${event.description}</p>
            `;
        }

        // Update organizer --> using eager
        if (event.organizer) {
            const org = document.getElementById('eventOrganizer');
            if (org) {
                org.innerHTML = `
                    <h2 class="text-3xl font-bold mb-4">Event Organizer</h2>
                    <h3 class="text-xl font-semibold mb-2">${event.organizer.fullname}</h3>
                    <p class="mb-3">${event.organizer.description || ''}</p>
                    <p class="text-base-content/70">${event.organizer.email}</p>
                    ${event.organizer.phone ? `<p class="text-base-content/70">${event.organizer.phone}</p>` : ''}
                `;
            }
        }

        // Show booking button only if logged in
        const bookingSection = document.getElementById('bookingSection');
        if (bookingSection) {
            if (API.isLoggedIn()) {
                bookingSection.innerHTML = `
                    <button onclick="bookEvent(${event.id})" class="btn btn-primary btn-lg">
                        Book This Event
                    </button>
                    <div id="bookingMessage" class="mt-4"></div>
                `;
            } else {
                // If not logged in
                bookingSection.innerHTML = `
                    <p class="text-base-content/70">
                        <a href="login.html" class="link link-primary">Log in</a> to book this event.
                    </p>
                `;
            }
        }

        // Load comments
        loadComments(event.comments || [], event.id);

    } catch (err) {
        console.error('Error loading event:', err);
    }
}

// Book event
async function bookEvent(eventId) {
    try {
        const result = await API.createBooking(eventId);
        const msgEl = document.getElementById('bookingMessage');
        if (msgEl) {
            msgEl.className = 'alert alert-success mt-4';
            msgEl.innerHTML = `
                Booking confirmed, Reference: <strong>${result.bookingReference}</strong>
            `;
        }
    } catch (err) {
        const msgEl = document.getElementById('bookingMessage');
        if (msgEl) {
            msgEl.className = 'alert alert-error mt-4';
            msgEl.textContent = err.message;
        }
    }
}


// Loads comments
function loadComments(comments, eventId) {
    const commentsList = document.getElementById('commentsList');
    if (!commentsList) return;

    const isLoggedIn = API.isLoggedIn();
    const currentUser = API.getUserInfo();
    const isAdmin = API.isAdmin();

    // Add comment form --> only for logged in users
    const commentFormSection = document.getElementById('addCommentSection');
    if (commentFormSection) {
        if (isLoggedIn) {
            commentFormSection.innerHTML = `
                <h3 class="text-xl font-bold mb-4">Leave a Comment</h3>
                <form onsubmit="submitComment(event, ${eventId})" class="space-y-4">
                    <textarea id="commentContent" class="textarea bg-base-200 w-full h-24"
                        placeholder="Let us hear from you!" required></textarea>
                    <button type="submit" class="btn btn-primary">Post</button>
                </form>
                <div id="commentFormMessage" class="mt-2"></div>
            `;
        } else {
            // If not logged in
            commentFormSection.innerHTML = `
                <p><a href="login.html" class="link link-primary">Log in</a> to leave a comment.</p>
            `;
        }
    }

    if (comments.length === 0) {
        commentsList.innerHTML = '<p class="text-center text-base-content/70">No comments yet.</p>';
        return;
    }

    commentsList.innerHTML = '';
    comments.forEach(comment => {
        const el = document.createElement('div');
        el.className = 'bg-base-100 p-6 rounded-lg shadow';

        // Show delete button if --> user posted comment or admin
        const canDelete = isAdmin || (currentUser && currentUser.userId === comment.userId);
        const deleteBtn = canDelete
            ? `<button onclick="deleteComment(${eventId}, ${comment.id})" 
                class="btn btn-xs btn-error mt-2">Delete</button>`
            : '';

        el.innerHTML = `
            <p class="font-semibold">${comment.author}</p>
            <p class="mt-1">${comment.content}</p>
            <p class="text-sm text-base-content/70 mt-1">${formatDate(comment.createdAt)}</p>
            ${deleteBtn}
        `;
        commentsList.appendChild(el);
    });
}

// Post comment
async function submitComment(e, eventId) {
    e.preventDefault();
    const content = document.getElementById('commentContent').value.trim();
    const user = API.getUserInfo();
    const msgEl = document.getElementById('commentFormMessage');

    try {
        await API.createComment(eventId, {
            author: user?.fullName || 'User',
            content: content
        });
        // Reloads event to show new comment
        await loadEventDetail(eventId);
    } catch (err) {
        if (msgEl) {
            msgEl.className = 'text-error';
            msgEl.textContent = err.message;
        }
    }
}

// Delete comment
async function deleteComment(eventId, commentId) {
    if (!confirm('Delete this comment?')) return;
    try {
        await API.deleteComment(eventId, commentId);
        await loadEventDetail(eventId);
    } catch (err) {
        alert('Failed to delete comment: ' + err.message);
    }
}

// Image gallery
function setupImageGalleryWithImages(images) {
    const mainImage = document.getElementById('mainImage');
    const thumbnailGallery = document.getElementById('thumbnailGallery');
    if (!mainImage || !thumbnailGallery || images.length === 0) return;

    mainImage.src = images[0];
    thumbnailGallery.innerHTML = '';

    images.forEach((url, i) => {
        const thumb = document.createElement('img');
        thumb.src = url;
        thumb.className = 'w-24 h-24 object-cover rounded cursor-pointer border-2 transition-all';
        thumb.classList.add(i === 0 ? 'border-primary' : 'border-transparent');
        thumb.onclick = () => {
            mainImage.src = url;
            thumbnailGallery.querySelectorAll('img').forEach(t => t.classList.replace('border-primary', 'border-transparent'));
            thumb.classList.replace('border-transparent', 'border-primary');
        };
        thumbnailGallery.appendChild(thumb);
    });
}

// Contact Page
function initContactPage() {
    setupContactForm();
}

function setupContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const message = document.getElementById('message').value.trim();
        const acceptTerms = document.getElementById('acceptTerms').checked;

        if (!firstName || !lastName || !email || !message || !acceptTerms) {
            alert('Please fill in all required fields and accept the terms.');
            return;
        }

        try {
            await API.createMessage({
                fullname: `${firstName} ${lastName}`,
                email,
                phone,
                content: message
            });
            alert('Message sent! We will get back to you as soon as possible.');
            form.reset();
        } catch (err) {
            alert('Failed to send message. Please try again.');
        }
    });
}

// ADMIN PAGE
async function initAdminPage() {
    // Redirect non-admins away from this page
    if (!API.isAdmin()) {
        alert('You must be an admin to have access to this page.');
        window.location.href = 'login.html';
        return;
    }

    setupOrganizerForm();
    setupEventForm();
    setupCommentForm();
    await loadContactMessages();
    await loadAdminBookings();
    await loadManageEvents();
    await loadManageOrganizers();
}

// Load messages in admin panel
async function loadContactMessages() {
    const container = document.getElementById('messagesContainer');
    if (!container) return;

    try {
        const messages = await API.getMessages();
        if (messages.length === 0) {
            container.innerHTML = '<p>No messages yet.</p>';
            return;
        }

        container.innerHTML = '';
        messages.forEach(msg => {
            const el = document.createElement('div');
            el.className = 'bg-base-100 p-4 rounded-lg shadow';
            el.innerHTML = `
                <div class="flex justify-between items-start">
                    <div>
                        <h4 class="font-bold">${msg.fullname}</h4>
                        <p class="text-sm text-base-content/70">${msg.email} ${msg.phone ? '• ' + msg.phone : ''}</p>
                        <p class="mt-2">${msg.content}</p>
                    </div>
                    <button onclick="deleteMessage(${msg.id})" class="btn btn-xs btn-error ml-4">Delete</button>
                </div>
            `;
            container.appendChild(el);
        });
    } catch (err) {
        container.innerHTML = '<p class="text-error">Failed to load messages.</p>';
    }
}

async function deleteMessage(id) {
    if (!confirm('Delete this message?')) return;
    try {
        await API.deleteMessage(id);
        await loadContactMessages();
    } catch (err) {
        alert('Failed to delete: ' + err.message);
    }
}

// Loads bookings in admin panel
async function loadAdminBookings() {
    const container = document.getElementById('adminBookingsContainer');
    if (!container) return;

    try {
        const bookings = await API.getBookings();
        if (bookings.length === 0) {
            container.innerHTML = '<p>No bookings yet.</p>';
            return;
        }

        container.innerHTML = '';
        bookings.forEach(b => {
            const el = document.createElement('div');
            el.className = 'bg-base-100 p-4 rounded-lg shadow';
            el.innerHTML = `
                <div class="flex justify-between items-center">
                    <div>
                        <p class="font-bold">${b.event?.title || 'Unknown Event'}</p>
                        <p class="text-sm text-base-content/70">Ref: ${b.bookingReference}</p>
                        <p class="text-sm text-base-content/70">User: ${b.user?.email || b.userId}</p>
                        <p class="text-sm text-base-content/70">Booked: ${formatDate(b.bookedAt)}</p>
                    </div>
                    <button onclick="cancelBooking(${b.id})" class="btn btn-xs btn-error">Cancel</button>
                </div>
            `;
            container.appendChild(el);
        });
    } catch (err) {
        container.innerHTML = '<p class="text-error">Failed to load bookings.</p>';
    }
}

async function cancelBooking(bookingId) {
    if (!confirm('Cancel this booking?')) return;
    try {
        await API.cancelBooking(bookingId);
        await loadAdminBookings();
    } catch (err) {
        alert('Failed to cancel: ' + err.message);
    }
}

// Organizer Form --> updated with new API
function setupOrganizerForm() {
    const form = document.getElementById('organizerForm');
    if (!form) return;

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const data = {
            fullname: document.getElementById('organizerName').value.trim(),
            email: document.getElementById('organizerEmail').value.trim(),
            phone: document.getElementById('organizerPhone').value.trim(),
            description: document.getElementById('organizerDescription').value.trim()
        };

        try {
            const result = await API.createOrganizer(data);
            showAdminResponse('organizerResponse', 'Organizer created! ID: ' + result.id, 'success');
            form.reset();
        } catch (err) {
            showAdminResponse('organizerResponse', 'Error: ' + err.message, 'error');
        }
    });
}

// Manage Organizers
async function loadManageOrganizers() {
    const container = document.getElementById('manageOrganizersContainer');
    if (!container) return;

    try {
        const organizers = await API.getOrganizers();
        if (organizers.length === 0) {
            container.innerHTML = '<p>No organizers yet.</p>';
            return;
        }

        container.innerHTML = '';
        organizers.forEach(org => {
            const el = document.createElement('div');
            el.className = 'bg-base-100 p-4 rounded-lg shadow flex justify-between items-center';
            el.innerHTML = `
                <div>
                    <p class="font-bold">${org.fullname}</p>
                    <p class="text-sm text-base-content/70">${org.email}</p>
                </div>
                <div class="flex gap-2">
                    <button onclick="openEditOrganizer(${org.id}, '${org.fullname.replace(/'/g, "\\'")}', '${org.email}', '${(org.phone || '').replace(/'/g, "\\'")}', '${(org.description || '').replace(/'/g, "\\'")}'"
                        class="btn btn-xs btn-info">Edit</button>
                    <button onclick="deleteOrganizer(${org.id})" 
                        class="btn btn-xs btn-error">Delete</button>
                </div>
            `;
            container.appendChild(el);
        });
    } catch (err) {
        container.innerHTML = '<p class="text-error">Failed to load organizers.</p>';
    }
}

// Opens the edit organizer modal
function openEditOrganizer(id, fullname, email, phone, description) {
    document.getElementById('editOrganizerId').value = id;
    document.getElementById('editOrganizerName').value = fullname;
    document.getElementById('editOrganizerEmail').value = email;
    document.getElementById('editOrganizerPhone').value = phone;
    document.getElementById('editOrganizerDescription').value = description;
    document.getElementById('editOrganizerModal').showModal();
}

// Saves the edited organizer
async function saveEditOrganizer() {
    const id = document.getElementById('editOrganizerId').value;
    const data = {
        fullname: document.getElementById('editOrganizerName').value,
        email: document.getElementById('editOrganizerEmail').value,
        phone: document.getElementById('editOrganizerPhone').value,
        description: document.getElementById('editOrganizerDescription').value
    };

    try {
        await API.updateOrganizer(id, data);
        document.getElementById('editOrganizerModal').close();
        await loadManageOrganizers();
        alert('Organizer updated successfully!');
    } catch (err) {
        alert('Failed to update: ' + err.message);
    }
}

// Deletes organizer
async function deleteOrganizer(id) {
    if (!confirm('Delete this organizer?')) return;
    try {
        await API.deleteOrganizer(id);
        await loadManageOrganizers();
        alert('Organizer deleted.');
    } catch (err) {
        alert('Failed to delete: ' + err.message);
    }
}

// Event Form
function setupEventForm() {
    const form = document.getElementById('eventForm');
    if (!form) return;

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const data = {
            title: document.getElementById('eventTitle').value.trim(),
            description: document.getElementById('eventDescription').value.trim(),
            location: document.getElementById('eventLocation').value.trim(),
            eventDate: document.getElementById('eventDate').value + 'T' + document.getElementById('eventTime').value,
            category: document.getElementById('eventCategory').value,
            organizerId: parseInt(document.getElementById('eventOrganizerId').value),
            images: document.getElementById('eventImage').value.trim()
        };

        try {
            const result = await API.createEvent(data);
            showAdminResponse('eventResponse', 'Event created! ID: ' + result.id, 'success');
            form.reset();
        } catch (err) {
            showAdminResponse('eventResponse', 'Error: ' + err.message, 'error');
        }
    });
}

// Comment Form
function setupCommentForm() {
    const form = document.getElementById('commentForm');
    if (!form) return;

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const eventId = document.getElementById('commentEventId').value;
        const data = {
            author: document.getElementById('commenterName').value.trim(),
            content: document.getElementById('commentText').value.trim()
        };

        try {
            await API.createComment(eventId, data);
            showAdminResponse('commentResponse', 'Comment added!', 'success');
            form.reset();
        } catch (err) {
            showAdminResponse('commentResponse', 'Error: ' + err.message, 'error');
        }
    });
}

function showAdminResponse(elementId, message, type) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.textContent = message;
    el.className = type === 'success' ? 'alert alert-success mt-4' : 'alert alert-error mt-4';
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 5000);
}

// BOOKINGS PAGE
async function initBookingsPage() {
    // RedirectS if user not logged in
    if (!API.isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }

    const container = document.getElementById('bookingsContainer');
    if (!container) return;

    try {
        const bookings = await API.getBookings();
        if (bookings.length === 0) {
            container.innerHTML = '<p class="text-center py-8">You have no bookings yet. <a href="events.html" class="link link-primary">Browse events</a></p>';
            return;
        }

        container.innerHTML = '';
        bookings.forEach(b => {
            const el = document.createElement('div');
            el.className = 'bg-base-100 p-6 rounded-lg shadow mb-4';
            el.innerHTML = `
                <div class="flex justify-between items-center">
                    <div>
                        <h3 class="text-xl font-bold">${b.event?.title || 'Event'}</h3>
                        <p class="text-base-content/70">${formatDate(b.event?.eventDate)}</p>
                        <p class="text-base-content/70">${b.event?.location || ''}</p>
                        <p class="mt-2">Booking reference: <strong>${b.bookingReference}</strong></p>
                        <p class="text-sm text-base-content/70">Booked on ${formatDate(b.bookedAt)}</p>
                    </div>
                    <button onclick="cancelMyBooking(${b.id})" class="btn btn-error btn-sm">Cancel</button>
                </div>
            `;
            container.appendChild(el);
        });
    } catch (err) {
        container.innerHTML = '<p class="text-error text-center">Failed to load bookings.</p>';
    }
}

async function cancelMyBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
        await API.cancelBooking(bookingId);
        await initBookingsPage();
    } catch (err) {
        alert('Failed to cancel: ' + err.message);
    }
}

// MISCELLANEOUS HELPERS

// Retrieves first image from a comma-separated images string
function getFirstImage(images) {
    if (!images) return 'https://via.placeholder.com/400x300?text=Event';
    const first = images.split(',')[0].trim();
    return first || 'https://via.placeholder.com/400x300?text=Event';
}

// Formats the date
function formatDate(dateStr) {
    if (!dateStr) return 'Date TBA';
    return new Date(dateStr).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric'
    });
}

