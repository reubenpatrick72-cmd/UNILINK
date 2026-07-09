// Seller uploads.js - Upload new notes

async function checkAuthentication() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/pages/auth/login.html';
        return false;
    }
    return true;
}

// Load course dropdown
async function loadCourses() {
    try {
        const response = await fetch('/api/notes/courses/list');
        const data = await response.json();
        
        const courseSelect = document.getElementById('course');
        if (courseSelect && data.courses) {
            data.courses.forEach(course => {
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

// Load units for selected course
async function loadUnits(course) {
    try {
        const response = await fetch(`/api/notes/courses/${course}/units`);
        const data = await response.json();
        
        const unitSelect = document.getElementById('unit');
        if (unitSelect) {
            unitSelect.innerHTML = '<option value="">Select Unit</option>';
            if (data.units) {
                data.units.forEach(unit => {
                    const option = document.createElement('option');
                    option.value = unit;
                    option.textContent = unit;
                    unitSelect.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error('Error loading units:', error);
    }
}

// Update estimated earnings
function updateEarningsDisplay() {
    const price = parseInt(document.getElementById('price')?.value) || 0;
    const earnings = Math.round(price * 0.8);
    const commission = Math.round(price * 0.2);
    
    const display = document.getElementById('estimatedEarnings');
    if (display) {
        display.innerHTML = `
            <div class="earnings-breakdown">
                <div class="earnings-item">
                    <span>Your Earnings:</span>
                    <strong>${earnings} KES</strong>
                </div>
                <div class="earnings-item">
                    <span>Platform Commission:</span>
                    <strong style="color: #e74c3c;">${commission} KES</strong>
                </div>
            </div>
        `;
    }
}

// Form submission
document.addEventListener('DOMContentLoaded', async () => {
    if (!await checkAuthentication()) return;
    
    // Load initial data
    loadCourses();
    
    // Course change listener
    document.getElementById('course')?.addEventListener('change', (e) => {
        if (e.target.value) {
            loadUnits(e.target.value);
        }
    });

    // Price listener
    document.getElementById('price')?.addEventListener('input', updateEarningsDisplay);

    // Form submission
    document.getElementById('uploadForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please login first');
            return;
        }

        const formData = {
            title: document.getElementById('title').value,
            description: document.getElementById('description').value,
            course: document.getElementById('course').value,
            unit: document.getElementById('unit').value,
            university: document.getElementById('university').value,
            category: document.getElementById('category').value,
            price: parseInt(document.getElementById('price').value),
            sampleContent: document.getElementById('sampleContent').value,
            fullContent: document.getElementById('fullContent').value,
            fileType: document.getElementById('fileType').value
        };

        // Validate required fields
        if (!formData.title || !formData.course || !formData.unit) {
            alert('Please fill in all required fields');
            return;
        }

        try {
            const submitBtn = e.target.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';

            const response = await fetch('/api/seller/notes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Upload failed');
            }

            const data = await response.json();
            
            // Show success message
            const successMsg = document.getElementById('successMessage');
            if (successMsg) {
                successMsg.style.display = 'block';
                successMsg.innerHTML = `
                    <i class="fas fa-check-circle"></i> 
                    Note uploaded successfully! Redirecting to your notes...
                `;
            }

            // Reset form
            e.target.reset();
            updateEarningsDisplay();

            // Redirect after 2 seconds
            setTimeout(() => {
                window.location.href = 'my-notes.html';
            }, 2000);

        } catch (error) {
            console.error('Error uploading note:', error);
            const errorMsg = document.getElementById('errorMessage');
            if (errorMsg) {
                errorMsg.style.display = 'block';
                errorMsg.textContent = error.message || 'Error uploading note. Please try again.';
            }
        } finally {
            const submitBtn = e.target.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Upload Note';
        }
    });

    // Reset button
    document.getElementById('resetBtn')?.addEventListener('click', () => {
        document.getElementById('uploadForm').reset();
        updateEarningsDisplay();
    });

    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/pages/auth/login.html';
    });

    // Initialize earnings display
    updateEarningsDisplay();
});
