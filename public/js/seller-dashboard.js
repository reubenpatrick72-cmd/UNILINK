const API_BASE_URL = 'http://localhost:5000/api';

// Initialize seller dashboard
window.addEventListener('DOMContentLoaded', async () => {
  await checkAuthentication();
  await loadSellerDashboard();
  await loadSellerNotes();
  setupSellerEvents();
});

function setupSellerEvents() {
  document.getElementById('uploadNoteForm').addEventListener('submit', handleUploadNote);
  document.getElementById('editNoteForm').addEventListener('submit', handleEditNote);
  document.querySelectorAll('.close').forEach(btn => btn.addEventListener('click', closeModals));
  window.addEventListener('click', (e) => {
    if (e.target.id === 'editNoteModal') closeModals();
  });
}

async function checkAuthentication() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please login first');
    window.location.href = '../auth/login.html';
    return;
  }
}

async function loadSellerDashboard() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/seller/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message || 'Failed to load dashboard');

    document.getElementById('sellerTotalNotes').textContent = data.data.notesCount;
    document.getElementById('sellerSalesCount').textContent = data.data.salesCount;
    document.getElementById('sellerRevenue').textContent = `Ksh ${data.data.totalRevenue}`;
    document.getElementById('sellerAvgRating').textContent = data.data.averageRating.toFixed(1);
  } catch (error) {
    console.error(error);
    alert('Unable to load seller dashboard');
  }
}

async function loadSellerNotes(page = 1) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/seller/notes?page=${page}&limit=20`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message || 'Unable to load notes');

    const grid = document.getElementById('sellerNotesGrid');
    if (!data.data.length) {
      grid.innerHTML = '<div class="loading">No seller notes found. Upload your first note above.</div>';
      return;
    }

    grid.innerHTML = data.data.map(note => `
      <div class="note-card">
        <div class="note-card-header">
          <div class="note-card-title">${note.title}</div>
          <div class="note-card-meta">${note.category.replace('_', ' ')}</div>
        </div>
        <div class="note-card-body">
          <div class="note-card-info"><strong>Course:</strong> ${note.course}</div>
          <div class="note-card-info"><strong>Unit:</strong> ${note.unit}</div>
          <div class="note-card-info"><strong>Price:</strong> Ksh ${note.price}</div>
          <div class="note-card-info"><strong>Downloads:</strong> ${note.downloads}</div>
          <div class="note-card-info"><strong>Status:</strong> ${note.isActive ? 'Active' : 'Inactive'}</div>
          <div class="note-card-footer">
            <button class="note-card-btn" onclick="openEditModal('${note._id}')">Edit</button>
            <button class="note-card-btn" style="background:#dc3545;" onclick="deleteNote('${note._id}')">Remove</button>
          </div>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error(error);
    document.getElementById('sellerNotesGrid').innerHTML = '<div class="loading">Unable to load your notes.</div>';
  }
}

async function handleUploadNote(event) {
  event.preventDefault();
  const token = localStorage.getItem('token');
  const form = event.target;
  const body = {
    title: form.title.value,
    description: form.description.value,
    course: form.course.value,
    unit: form.unit.value,
    university: form.university.value,
    category: form.category.value,
    fileType: form.fileType.value,
    price: Number(form.price.value),
    sampleContent: form.sampleContent.value,
    fullContent: form.fullContent.value
  };

  try {
    const response = await fetch(`${API_BASE_URL}/seller/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message || 'Upload failed');

    alert('Note uploaded successfully');
    form.reset();
    loadSellerDashboard();
    loadSellerNotes();
  } catch (error) {
    console.error(error);
    alert('Unable to upload note');
  }
}

function openEditModal(noteId) {
  const token = localStorage.getItem('token');
  fetch(`${API_BASE_URL}/seller/notes?page=1&limit=50`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => {
      if (!data.success) throw new Error('Unable to load notes');
      const note = data.data.find(item => item._id === noteId);
      if (!note) throw new Error('Note not found');

      document.getElementById('editNoteId').value = note._id;
      document.getElementById('editNoteTitle').value = note.title;
      document.getElementById('editNoteDescription').value = note.description;
      document.getElementById('editNoteCourse').value = note.course;
      document.getElementById('editNoteUnit').value = note.unit;
      document.getElementById('editNoteCategory').value = note.category;
      document.getElementById('editNotePrice').value = note.price;
      document.getElementById('editNoteSample').value = note.sampleContent;
      document.getElementById('editNoteFull').value = note.fullContent;
      document.getElementById('editNoteActive').checked = note.isActive;

      document.getElementById('editNoteModal').classList.add('show');
    })
    .catch(error => {
      console.error(error);
      alert('Unable to open edit modal');
    });
}

async function handleEditNote(event) {
  event.preventDefault();
  const token = localStorage.getItem('token');
  const noteId = document.getElementById('editNoteId').value;
  const body = {
    title: document.getElementById('editNoteTitle').value,
    description: document.getElementById('editNoteDescription').value,
    course: document.getElementById('editNoteCourse').value,
    unit: document.getElementById('editNoteUnit').value,
    category: document.getElementById('editNoteCategory').value,
    price: Number(document.getElementById('editNotePrice').value),
    sampleContent: document.getElementById('editNoteSample').value,
    fullContent: document.getElementById('editNoteFull').value,
    isActive: document.getElementById('editNoteActive').checked
  };

  try {
    const response = await fetch(`${API_BASE_URL}/seller/notes/${noteId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message || 'Update failed');

    alert('Note updated successfully');
    closeModals();
    loadSellerDashboard();
    loadSellerNotes();
  } catch (error) {
    console.error(error);
    alert('Unable to update note');
  }
}

async function deleteNote(noteId) {
  if (!confirm('Remove this note from your marketplace?')) return;
  const token = localStorage.getItem('token');

  try {
    const response = await fetch(`${API_BASE_URL}/seller/notes/${noteId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message || 'Delete failed');

    alert('Note removed successfully');
    loadSellerDashboard();
    loadSellerNotes();
  } catch (error) {
    console.error(error);
    alert('Unable to remove note');
  }
}

function closeModals() {
  document.getElementById('editNoteModal').classList.remove('show');
}

function logout() {
  localStorage.removeItem('token');
  window.location.href = '../auth/login.html';
}
