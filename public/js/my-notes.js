// Seller my-notes.js - Manage uploaded notes

let currentPage = 1;
let currentFilters = {
    search: '',
    status: 'all',
    sort: 'newest'
};

async function checkAuthentication() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/pages/auth/login.html';
        return false;
    }
    return true;
}

async function loadNotes(page = 1) {
    try {
        const token = localStorage.getItem('token');
        currentPage = page;

        const params = new URLSearchParams({
            page: page,
            limit: 10,
            status: currentFilters.status === 'all' ? '' : currentFilters.status
        });

        const response = await fetch(`/api/seller/notes?${params}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to load notes');

        const data = await response.json();
        displayNotes(data.data || []);
        displayPagination(data.pagination || {});
        updateNotesCount(data.pagination?.total || 0);
    } catch (error) {
        console.error('Error loading notes:', error);
        document.getElementById('notesList').innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-circle"></i>
                <p>Error loading notes. Please try again.</p>
            </div>
        `;
    }
}

function displayNotes(notes) {
    const container = document.getElementById('notesList');

    if (notes.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-book"></i>
                <p>No notes yet. Start uploading notes to earn!</p>
                <a href="uploads.html" class="btn btn-primary">
                    <i class="fas fa-cloud-upload-alt"></i> Upload Note
                </a>
            </div>
        `;
        return;
    }

    // Apply search filter
    let filtered = notes;
    if (currentFilters.search) {
        const term = currentFilters.search.toLowerCase();
        filtered = notes.filter(n => 
            n.title.toLowerCase().includes(term) || 
            n.unit.toLowerCase().includes(term)
        );
    }

    const html = filtered.map(note => `
        <div class="note-item">
            <div class="note-content">
                <div class="note-header">
                    <h3 class="note-title">${note.title}</h3>
                    <span class="note-status ${note.isActive ? 'status-active' : 'status-inactive'}">
                        ${note.isActive ? 'Published' : 'Draft'}
                    </span>
                </div>
                <p class="note-description">${note.description || 'No description'}</p>
                <div class="note-meta">
                    <span><i class="fas fa-tag"></i> ${note.category}</span>
                    <span><i class="fas fa-book"></i> ${note.course} - ${note.unit}</span>
                    <span><i class="fas fa-university"></i> ${note.university}</span>
                </div>
                <div class="note-stats">
                    <div class="stat-item">
                        <i class="fas fa-dollar-sign"></i>
                        <span>${note.price} KES</span>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-download"></i>
                        <span>${note.downloads || 0} Downloads</span>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-star"></i>
                        <span>${note.averageRating ? note.averageRating.toFixed(1) : 'No'} Rating</span>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-comment"></i>
                        <span>${note.totalReviews || 0} Reviews</span>
                    </div>
                </div>
            </div>
            <div class="note-actions">
                <button class="btn-action btn-edit" onclick="editNote('${note._id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn-action ${note.isActive ? 'btn-hide' : 'btn-show'}" 
                    onclick="toggleActive('${note._id}', ${!note.isActive})">
                    <i class="fas fa-${note.isActive ? 'eye-slash' : 'eye'}"></i> 
                    ${note.isActive ? 'Hide' : 'Show'}
                </button>
                <button class="btn-action btn-delete" onclick="deleteNote('${note._id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');

    container.innerHTML = html;
}

function displayPagination(pagination) {
    const container = document.getElementById('pagination');
    if (!pagination || pagination.pages <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = '<button onclick="loadNotes(1)">← Previous</button>';
    
    for (let i = 1; i <= pagination.pages; i++) {
        html += `<button onclick="loadNotes(${i})" ${i === currentPage ? 'class="active"' : ''}>${i}</button>`;
    }
    
    html += `<button onclick="loadNotes(${pagination.pages})">Next →</button>`;
    container.innerHTML = html;
}

function updateNotesCount(total) {
    const element = document.getElementById('notesCount');
    if (element) {
        element.textContent = `${total} note${total !== 1 ? 's' : ''}`;
    }
}

function editNote(noteId) {
    // Load note data and open edit modal
    const token = localStorage.getItem('token');
    fetch(`/api/seller/notes/${noteId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(r => r.json())
    .then(data => {
        document.getElementById('editTitle').value = data.title;
        document.getElementById('editDescription').value = data.description;
        document.getElementById('editCourse').value = data.course;
        document.getElementById('editUnit').value = data.unit;
        document.getElementById('editPrice').value = data.price;
        document.getElementById('editActive').checked = data.isActive;
        
        document.getElementById('editModal').classList.add('show');
        document.getElementById('editModal').dataset.noteId = noteId;
    })
    .catch(err => console.error('Error loading note:', err));
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

async function saveEdit() {
    const token = localStorage.getItem('token');
    const modal = document.getElementById('editModal');
    const noteId = modal.dataset.noteId;

    const updateData = {
        title: document.getElementById('editTitle').value,
        description: document.getElementById('editDescription').value,
        course: document.getElementById('editCourse').value,
        unit: document.getElementById('editUnit').value,
        price: parseInt(document.getElementById('editPrice').value),
        isActive: document.getElementById('editActive').checked
    };

    try {
        const response = await fetch(`/api/seller/notes/${noteId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updateData)
        });

        if (!response.ok) throw new Error('Update failed');

        alert('Note updated successfully!');
        closeModal('editModal');
        loadNotes(currentPage);
    } catch (error) {
        console.error('Error updating note:', error);
        alert('Error updating note');
    }
}

async function deleteNote(noteId) {
    if (!confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/seller/notes/${noteId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Delete failed');

        alert('Note deleted successfully!');
        loadNotes(currentPage);
    } catch (error) {
        console.error('Error deleting note:', error);
        alert('Error deleting note');
    }
}

async function toggleActive(noteId, newStatus) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/seller/notes/${noteId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ isActive: newStatus })
        });

        if (!response.ok) throw new Error('Update failed');

        loadNotes(currentPage);
    } catch (error) {
        console.error('Error updating note status:', error);
        alert('Error updating note');
    }
}

function applyFilters() {
    currentFilters.search = document.getElementById('searchInput')?.value || '';
    currentFilters.status = document.getElementById('statusFilter')?.value || 'all';
    currentFilters.sort = document.querySelector('[data-sort].active')?.dataset.sort || 'newest';
    
    currentPage = 1;
    loadNotes(1);
}

function clearFilters() {
    if (document.getElementById('searchInput')) document.getElementById('searchInput').value = '';
    if (document.getElementById('statusFilter')) document.getElementById('statusFilter').value = 'all';
    
    document.querySelectorAll('[data-sort]').forEach(btn => btn.classList.remove('active'));
    document.querySelector('[data-sort="newest"]').classList.add('active');
    
    currentFilters = { search: '', status: 'all', sort: 'newest' };
    loadNotes(1);
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/pages/auth/login.html';
}

// Event listeners
document.addEventListener('DOMContentLoaded', async () => {
    if (!await checkAuthentication()) return;
    
    loadNotes(1);
    
    // Setup filter listeners
    document.getElementById('searchInput')?.addEventListener('keyup', applyFilters);
    document.getElementById('statusFilter')?.addEventListener('change', applyFilters);
    
    document.querySelectorAll('[data-sort]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('[data-sort]').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            applyFilters();
        });
    });

    document.getElementById('clearFiltersBtn')?.addEventListener('click', clearFilters);
    document.getElementById('logoutBtn')?.addEventListener('click', logout);
    
    // Modal controls
    document.getElementById('saveEditBtn')?.addEventListener('click', saveEdit);
    document.getElementById('cancelEditBtn')?.addEventListener('click', () => closeModal('editModal'));
});
