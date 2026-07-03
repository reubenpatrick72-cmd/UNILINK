// Marketplace JavaScript
const API_BASE_URL = 'http://localhost:5000/api';
let currentPage = 1;
let currentFilters = {
  course: '',
  unit: '',
  search: '',
  category: '',
  sort: 'newest'
};
let allNotes = [];
let selectedNote = null;

// Initialize marketplace
document.addEventListener('DOMContentLoaded', async () => {
  await checkAuthentication();
  await loadCourses();
  await loadNotes();
  setupEventListeners();
});

// Check if user is authenticated
async function checkAuthentication() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please login first');
    window.location.href = '../auth/login.html';
    return;
  }
}

// Setup event listeners
function setupEventListeners() {
  document.getElementById('applyFiltersBtn').addEventListener('click', applyFilters);
  document.getElementById('clearFiltersBtn').addEventListener('click', clearFilters);
  document.getElementById('courseFilter').addEventListener('change', updateUnits);
  
  // Modal close buttons
  document.querySelectorAll('.close').forEach(btn => {
    btn.addEventListener('click', closeModals);
  });

  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target.id === 'noteModal' || e.target.id === 'sellerModal') {
      closeModals();
    }
  });
}

// Load courses
async function loadCourses() {
  try {
    const response = await fetch(`${API_BASE_URL}/notes/courses/list`);
    const data = await response.json();
    
    if (data.success) {
      const courseSelect = document.getElementById('courseFilter');
      data.data.forEach(course => {
        const option = document.createElement('option');
        option.value = course;
        option.textContent = course;
        courseSelect.appendChild(option);
      });
    }
  } catch (error) {
    console.error('Error loading courses:', error);
  }
}

// Update units based on selected course
async function updateUnits() {
  const course = document.getElementById('courseFilter').value;
  const unitSelect = document.getElementById('unitFilter');
  
  // Clear units
  unitSelect.innerHTML = '<option value="">All Units</option>';
  
  if (!course) return;
  
  try {
    const response = await fetch(`${API_BASE_URL}/notes/courses/${course}/units`);
    const data = await response.json();
    
    if (data.success) {
      data.data.forEach(unit => {
        const option = document.createElement('option');
        option.value = unit;
        option.textContent = unit;
        unitSelect.appendChild(option);
      });
    }
  } catch (error) {
    console.error('Error loading units:', error);
  }
}

// Load notes
async function loadNotes(page = 1) {
  try {
    const params = new URLSearchParams({
      page,
      limit: 12,
      ...currentFilters
    });

    const response = await fetch(`${API_BASE_URL}/notes/all?${params}`);
    const data = await response.json();
    
    if (data.success) {
      allNotes = data.data;
      displayNotes(data.data);
      displayPagination(data.pagination);
      updateResultsCount(data.pagination.total);
    }
  } catch (error) {
    console.error('Error loading notes:', error);
    document.getElementById('notesGrid').innerHTML = '<div class="loading">Error loading notes</div>';
  }
}

// Display notes in grid
function displayNotes(notes) {
  const grid = document.getElementById('notesGrid');
  
  if (notes.length === 0) {
    grid.innerHTML = '<div class="loading">No notes found</div>';
    return;
  }

  grid.innerHTML = notes.map(note => `
    <div class="note-card" onclick="openNoteModal('${note._id}')">
      <div class="note-card-header">
        <div class="note-card-title">${note.title}</div>
        <div class="note-card-meta">${note.category.replace('_', ' ')}</div>
      </div>
      <div class="note-card-body">
        <div class="note-card-info">
          <strong>Course:</strong> ${note.course}
        </div>
        <div class="note-card-info">
          <strong>Unit:</strong> ${note.unit}
        </div>
        <div class="note-card-seller">
          <div class="seller-avatar">${note.sellerName.charAt(0).toUpperCase()}</div>
          <div>${note.sellerName}</div>
        </div>
        <div class="note-card-rating">
          <i class="fas fa-star"></i>
          <span class="rating-value">${note.averageRating.toFixed(1)}</span>
          <span>(${note.totalReviews})</span>
        </div>
        <div class="note-card-footer">
          <div class="note-price">Ksh ${note.price}</div>
          <button class="note-card-btn" onclick="event.stopPropagation(); openNoteModal('${note._id}')">
            View Details
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// Open note detail modal
async function openNoteModal(noteId) {
  try {
    const response = await fetch(`${API_BASE_URL}/notes/${noteId}`);
    const data = await response.json();
    
    if (data.success) {
      selectedNote = data.data;
      populateNoteModal(data.data, data.hasFullAccess);
      loadNoteReviews(noteId);
      document.getElementById('noteModal').classList.add('show');
    }
  } catch (error) {
    console.error('Error loading note:', error);
    alert('Error loading note details');
  }
}

// Populate note modal
function populateNoteModal(note, hasFullAccess) {
  document.getElementById('modalTitle').textContent = note.title;
  document.getElementById('modalSellerName').textContent = note.sellerName;
  document.getElementById('modalSellerRating').textContent = note.sellerRating.toFixed(1);
  document.getElementById('modalCourse').textContent = note.course;
  document.getElementById('modalUnit').textContent = note.unit;
  document.getElementById('modalUniversity').textContent = note.university;
  document.getElementById('modalCategory').textContent = note.category.replace('_', ' ');
  document.getElementById('modalFileType').textContent = note.fileType.toUpperCase();
  document.getElementById('modalDescription').textContent = note.description;
  document.getElementById('modalSampleContent').textContent = note.sampleContent;
  document.getElementById('modalPrice').textContent = `Ksh ${note.price}`;
  document.getElementById('modalDownloads').textContent = note.downloads;
  document.getElementById('modalViews').textContent = note.views;
  document.getElementById('modalReviews').textContent = note.totalReviews;

  // Update purchase button
  const purchaseBtn = document.getElementById('purchaseBtn');
  if (hasFullAccess) {
    purchaseBtn.textContent = '✓ Already Purchased';
    purchaseBtn.disabled = true;
  } else {
    purchaseBtn.textContent = '🛒 Purchase & Download';
    purchaseBtn.disabled = false;
    purchaseBtn.onclick = () => purchaseNote(note._id);
  }

  // Update seller profile button
  document.getElementById('viewSellerProfileBtn').onclick = () => viewSellerProfile(note.sellerId);
}

// Load reviews for note
async function loadNoteReviews(noteId) {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews/note/${noteId}?limit=5`);
    const data = await response.json();
    
    if (data.success) {
      displayReviews(data.data);
      calculateRatingStats(data.data);
      document.getElementById('totalReviewsCount').textContent = data.pagination.total;
    }
  } catch (error) {
    console.error('Error loading reviews:', error);
  }
}

// Display reviews
function displayReviews(reviews) {
  const reviewsList = document.getElementById('reviewsList');
  
  if (reviews.length === 0) {
    reviewsList.innerHTML = '<p style="text-align: center; color: #999; margin: 20px 0;">No reviews yet</p>';
    return;
  }

  reviewsList.innerHTML = reviews.map(review => `
    <div class="review-item">
      <div class="review-header">
        <span>${review.reviewerName}</span>
        <span class="review-rating">${'⭐'.repeat(review.rating)}</span>
      </div>
      <div style="font-weight: 600; margin-bottom: 4px;">${review.title}</div>
      <div class="review-text">${review.comment}</div>
      <div class="review-verified">✓ Verified Purchase</div>
    </div>
  `).join('');
}

// Calculate rating statistics
function calculateRatingStats(reviews) {
  const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => counts[r.rating]++);
  const total = reviews.length || 1;

  for (let i = 5; i >= 1; i--) {
    const percentage = (counts[i] / total) * 100;
    document.getElementById(`rating${i}`).style.width = percentage + '%';
  }
}

// Purchase note
async function purchaseNote(noteId) {
  try {
    const token = localStorage.getItem('token');
    
    // In real implementation, this would open payment modal
    const transactionId = 'TXN_' + Date.now();
    const paymentMethod = 'mpesa'; // or whatever method

    const response = await fetch(`${API_BASE_URL}/purchases/buy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        noteId,
        transactionId,
        paymentMethod
      })
    });

    const data = await response.json();
    
    if (data.success) {
      alert('Purchase successful! You can now download the full notes.');
      closeModals();
      loadNotes(currentPage);
    } else {
      alert(data.message || 'Purchase failed');
    }
  } catch (error) {
    console.error('Error purchasing note:', error);
    alert('Error processing purchase');
  }
}

// View seller profile
async function viewSellerProfile(sellerId) {
  try {
    const response = await fetch(`${API_BASE_URL}/notes/seller/${sellerId}/info`);
    const data = await response.json();
    
    if (data.success) {
      document.getElementById('sellerName').textContent = data.data.seller.username || data.data.seller.email;
      document.getElementById('sellerNotesCount').textContent = data.data.notesCount;
      document.getElementById('sellerDownloadsCount').textContent = data.data.totalDownloads;
      document.getElementById('sellerRatingInfo').textContent = data.data.seller.sellerRating || '0';
      document.getElementById('sellerBio').textContent = data.data.seller.bio || 'No bio available';
      
      document.getElementById('sellerModal').classList.add('show');
    }
  } catch (error) {
    console.error('Error loading seller profile:', error);
  }
}

// Apply filters
function applyFilters() {
  currentFilters = {
    course: document.getElementById('courseFilter').value,
    unit: document.getElementById('unitFilter').value,
    search: document.getElementById('searchInput').value,
    category: document.getElementById('categoryFilter').value,
    sort: document.getElementById('sortFilter').value
  };
  
  currentPage = 1;
  loadNotes(1);
}

// Clear filters
function clearFilters() {
  document.getElementById('courseFilter').value = '';
  document.getElementById('unitFilter').value = '';
  document.getElementById('searchInput').value = '';
  document.getElementById('categoryFilter').value = '';
  document.getElementById('sortFilter').value = 'newest';
  
  currentFilters = {
    course: '',
    unit: '',
    search: '',
    category: '',
    sort: 'newest'
  };
  
  currentPage = 1;
  loadNotes(1);
}

// Display pagination
function displayPagination(pagination) {
  const container = document.getElementById('paginationContainer');
  
  if (pagination.pages <= 1) {
    container.innerHTML = '';
    return;
  }

  let html = '';
  
  if (pagination.page > 1) {
    html += `<button onclick="changePage(${pagination.page - 1})">← Previous</button>`;
  }

  for (let i = 1; i <= pagination.pages; i++) {
    if (i === pagination.page) {
      html += `<span class="active">${i}</span>`;
    } else {
      html += `<button onclick="changePage(${i})">${i}</button>`;
    }
  }

  if (pagination.page < pagination.pages) {
    html += `<button onclick="changePage(${pagination.page + 1})">Next →</button>`;
  }

  container.innerHTML = html;
}

// Change page
function changePage(page) {
  currentPage = page;
  loadNotes(page);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Update results count
function updateResultsCount(total) {
  document.getElementById('resultsCount').textContent = `Found ${total} notes`;
}

// Close modals
function closeModals() {
  document.getElementById('noteModal').classList.remove('show');
  document.getElementById('sellerModal').classList.remove('show');
}

// Logout
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '../auth/login.html';
}
