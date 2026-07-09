// Downloads page JavaScript
let currentView = 'list';
let currentPage = 1;
let allDownloads = [];

async function checkAuthentication() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/pages/auth/login.html';
        return false;
    }
    return true;
}

async function loadDownloads(page = 1) {
    try {
        const token = localStorage.getItem('token');
        currentPage = page;
        
        // Get purchases where download access is still active
        const params = new URLSearchParams({
            page: page,
            limit: 12
        });

        const response = await fetch(`/api/purchases/my-purchases?${params}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to load downloads');

        const data = await response.json();
        
        // Filter only active purchases (not expired)
        const activeDownloads = (data.data || []).filter(p => {
            return p.expiryDate && new Date(p.expiryDate) > new Date();
        });

        allDownloads = activeDownloads;
        displayDownloads(activeDownloads);
        updateDownloadsCount(activeDownloads.length);
    } catch (error) {
        console.error('Error loading downloads:', error);
        document.getElementById('downloadsList').innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-circle"></i>
                <p>Error loading downloads. Please try again.</p>
            </div>
        `;
    }
}

function displayDownloads(downloads) {
    const container = document.getElementById('downloadsList');
    
    if (downloads.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-download"></i>
                <p>No active downloads. Purchase notes in the marketplace to download them here.</p>
            </div>
        `;
        return;
    }

    if (currentView === 'grid') {
        const html = downloads.map(d => `
            <div class="download-card grid-view">
                <div class="file-icon">
                    <i class="fas fa-file-${getFileIcon(d.fileType)}"></i>
                </div>
                <div class="download-info">
                    <h4>${d.noteTitle}</h4>
                    <p class="note-meta">${d.course} - ${d.unit}</p>
                    <p class="seller-meta">by ${d.sellerName}</p>
                </div>
                <div class="download-footer">
                    <button class="btn-download-small" onclick="downloadFile('${d._id}')">
                        <i class="fas fa-download"></i>
                    </button>
                </div>
            </div>
        `).join('');
        container.innerHTML = html;
    } else {
        const html = downloads.map(d => `
            <div class="download-item list-view">
                <div class="item-icon"><i class="fas fa-file-${getFileIcon(d.fileType)}"></i></div>
                <div class="item-content">
                    <div class="item-title">${d.noteTitle}</div>
                    <div class="item-meta">
                        <span><i class="fas fa-book"></i> ${d.course}</span>
                        <span><i class="fas fa-tag"></i> ${d.unit}</span>
                        <span><i class="fas fa-user"></i> ${d.sellerName}</span>
                        <span><i class="fas fa-calendar"></i> ${new Date(d.purchaseDate).toLocaleDateString()}</span>
                    </div>
                </div>
                <button class="btn-download" onclick="downloadFile('${d._id}')">
                    <i class="fas fa-download"></i> Download
                </button>
            </div>
        `).join('');
        container.innerHTML = html;
    }
}

function getFileIcon(fileType) {
    const icons = {
        'pdf': 'pdf',
        'docx': 'word',
        'doc': 'word',
        'txt': 'alt',
        'jpg': 'image',
        'jpeg': 'image',
        'png': 'image'
    };
    return icons[fileType] || 'alt';
}

function changeView(view) {
    currentView = view;
    document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    displayDownloads(allDownloads);
}

async function downloadFile(purchaseId) {
    try {
        const token = localStorage.getItem('token');
        
        const response = await fetch(`/api/purchases/download/${purchaseId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            const error = await response.json();
            alert(error.message || 'Failed to download file');
            return;
        }

        const data = await response.json();
        
        // Create download link
        const link = document.createElement('a');
        link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(data.fullContent || '');
        link.download = `note-${purchaseId}.txt`;
        link.click();
    } catch (error) {
        console.error('Error downloading file:', error);
        alert('Error downloading file');
    }
}

function applyFilters() {
    const courseFilter = document.getElementById('courseFilter')?.value;
    const dateFilter = document.getElementById('dateFilter')?.value;
    const fileTypeFilter = document.getElementById('fileTypeFilter')?.value;
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase();

    let filtered = allDownloads;

    if (courseFilter && courseFilter !== 'all') {
        filtered = filtered.filter(d => d.course === courseFilter);
    }

    if (fileTypeFilter && fileTypeFilter !== 'all') {
        filtered = filtered.filter(d => d.fileType === fileTypeFilter);
    }

    if (searchTerm) {
        filtered = filtered.filter(d => 
            d.noteTitle.toLowerCase().includes(searchTerm) ||
            d.sellerName.toLowerCase().includes(searchTerm)
        );
    }

    if (dateFilter && dateFilter !== 'all') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        filtered = filtered.filter(d => {
            const downloadDate = new Date(d.purchaseDate);
            downloadDate.setHours(0, 0, 0, 0);
            const daysDiff = Math.floor((today - downloadDate) / (1000 * 60 * 60 * 24));

            switch (dateFilter) {
                case 'today':
                    return daysDiff === 0;
                case 'week':
                    return daysDiff <= 7;
                case 'month':
                    return daysDiff <= 30;
                case '3months':
                    return daysDiff <= 90;
                default:
                    return true;
            }
        });
    }

    displayDownloads(filtered);
    updateDownloadsCount(filtered.length);
}

function clearFilters() {
    if (document.getElementById('searchInput')) document.getElementById('searchInput').value = '';
    if (document.getElementById('courseFilter')) document.getElementById('courseFilter').value = 'all';
    if (document.getElementById('dateFilter')) document.getElementById('dateFilter').value = 'all';
    if (document.getElementById('fileTypeFilter')) document.getElementById('fileTypeFilter').value = 'all';
    
    displayDownloads(allDownloads);
    updateDownloadsCount(allDownloads.length);
}

function updateDownloadsCount(count) {
    const element = document.getElementById('downloadsCount');
    if (element) {
        element.textContent = `${count} download${count !== 1 ? 's' : ''}`;
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/pages/auth/login.html';
}

// Event listeners
document.addEventListener('DOMContentLoaded', async () => {
    if (!await checkAuthentication()) return;
    
    loadDownloads(1);
    
    // Load course options
    fetch('/api/notes/courses/list')
        .then(r => r.json())
        .then(data => {
            const courseFilter = document.getElementById('courseFilter');
            if (courseFilter) {
                data.courses?.forEach(course => {
                    const option = document.createElement('option');
                    option.value = course;
                    option.textContent = course;
                    courseFilter.appendChild(option);
                });
            }
        });

    // Setup filter listeners
    document.getElementById('searchInput')?.addEventListener('keyup', applyFilters);
    document.getElementById('courseFilter')?.addEventListener('change', applyFilters);
    document.getElementById('dateFilter')?.addEventListener('change', applyFilters);
    document.getElementById('fileTypeFilter')?.addEventListener('change', applyFilters);
    
    document.getElementById('clearFiltersBtn')?.addEventListener('click', clearFilters);
    document.getElementById('logoutBtn')?.addEventListener('click', logout);
    
    // Setup view toggle
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            changeView(this.dataset.view);
        });
    });
});
