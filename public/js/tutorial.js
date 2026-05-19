// Tutorial JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    if (!isLoggedIn()) {
        window.location.href = '../auth/login.html';
        return;
    }

    // Get tutorial ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const tutorialId = urlParams.get('id');

    if (!tutorialId) {
        window.location.href = 'dashboard.html';
        return;
    }

    // Load tutorial data
    loadTutorial(tutorialId);

    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
});

async function loadTutorial(tutorialId) {
    try {
        // For now, we'll load all tutorials and find the one we need
        // In a real app, you'd have an endpoint to get a single tutorial
        const response = await apiRequest('/api/tutorials');

        if (response.tutorials) {
            const tutorial = response.tutorials.find(t => t._id === tutorialId);

            if (tutorial) {
                displayTutorial(tutorial);
            } else {
                showTutorialNotFound();
            }
        }
    } catch (error) {
        console.error('Error loading tutorial:', error);
        showTutorialNotFound();
    }
}

function displayTutorial(tutorial) {
    // Update page title
    document.title = `${tutorial.title} - UniLink`;

    // Display tutorial header
    const headerHtml = `
        <div style="text-align: center; margin-bottom: 30px;">
            <h1>${tutorial.title}</h1>
            <p style="font-size: 1.1rem; color: var(--text-muted); margin: 10px 0;">${tutorial.description}</p>
            <div style="display: flex; justify-content: center; gap: 20px; margin-top: 15px;">
                <span class="tutorial-level ${tutorial.level.toLowerCase()}">${tutorial.level}</span>
                <span><i class="fas fa-clock"></i> ${tutorial.duration} minutes</span>
                <span><i class="fas fa-tag"></i> ${tutorial.category}</span>
            </div>
        </div>
    `;

    document.getElementById('tutorialHeader').innerHTML = headerHtml;

    // Display tutorial content
    // Convert markdown-like content to HTML
    const contentHtml = convertContentToHtml(tutorial.content);
    document.getElementById('tutorialContent').innerHTML = contentHtml;

    // Display video links if available
    if (tutorial.videos && tutorial.videos.length > 0) {
        displayVideoLinks(tutorial.videos);
    } else {
        // Hide video section if no videos
        document.getElementById('videoSection').style.display = 'none';
    }

    // Display templates if available
    if (tutorial.templates && tutorial.templates.length > 0) {
        displayTemplates(tutorial.templates, tutorial._id);
    } else {
        // Hide templates section if no templates
        document.getElementById('templatesSection').style.display = 'none';
    }
}

function convertContentToHtml(content) {
    if (!content) return '';

    // Simple markdown-like conversion
    let html = content
        // Bold text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Headers
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Bullet points
        .replace(/^- (.*)$/gm, '<li>$1</li>')
        // Wrap lists
        .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
        // Line breaks
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>');

    // Wrap in paragraphs
    if (!html.includes('<p>')) {
        html = '<p>' + html + '</p>';
    }

    return html;
}

function displayVideoLinks(videos) {
    const videoLinksContainer = document.getElementById('videoLinks');

    videos.forEach(video => {
                const videoLink = document.createElement('a');
                videoLink.className = 'video-link';
                videoLink.href = video.url;
                videoLink.target = '_blank';
                videoLink.innerHTML = `
            <div class="video-icon">
                <i class="fas fa-play"></i>
            </div>
            <div class="video-info">
                <h4>${video.title}</h4>
                <div class="video-meta">
                    <span><i class="fas fa-clock"></i> ${video.duration}</span>
                    ${video.description ? `<span style="margin-left: 15px;">${video.description}</span>` : ''}
                </div>
            </div>
        `;

        videoLinksContainer.appendChild(videoLink);
    });
}

function showTutorialNotFound() {
    document.getElementById('tutorialHeader').innerHTML = `
        <div style="text-align: center; margin-bottom: 30px;">
            <h1><i class="fas fa-exclamation-triangle"></i> Tutorial Not Found</h1>
            <p style="font-size: 1.1rem; color: var(--text-muted); margin: 10px 0;">The tutorial you're looking for doesn't exist or you don't have access to it.</p>
            <a href="dashboard.html" class="btn btn-primary" style="margin-top: 20px;">Back to Dashboard</a>
        </div>
    `;

    document.getElementById('tutorialContent').innerHTML = '';
    document.getElementById('videoSection').style.display = 'none';
    document.getElementById('templatesSection').style.display = 'none';
}

function displayTemplates(templates, tutorialId) {
    const templateGrid = document.getElementById('templateGrid');

    templates.forEach(template => {
        const templateCard = document.createElement('div');
        templateCard.className = `template-card ${template.type === 'premium' ? 'premium' : ''}`;

        const featuresList = template.features.map(feature => `<li>${feature}</li>`).join('');

        templateCard.innerHTML = `
            <div class="template-header">
                <div class="template-icon">
                    <i class="fas fa-file-${template.type === 'premium' ? 'star' : 'download'}"></i>
                </div>
                <div class="template-info">
                    <h4>${template.name}</h4>
                </div>
            </div>
            <div class="template-description">${template.description}</div>
            <div class="template-features">
                <h5>Features:</h5>
                <ul>${featuresList}</ul>
            </div>
            <div class="template-price">
                <span class="price-tag ${template.type === 'free' ? 'free' : ''}">
                    ${template.type === 'free' ? 'FREE' : `$${template.price}`}
                </span>
            </div>
            <div class="template-actions">
                ${template.previewUrl ? `<a href="${template.previewUrl}" target="_blank" class="btn-template preview">Preview</a>` : ''}
                <button class="btn-template ${template.type === 'free' ? 'download' : 'purchase'}"
                        onclick="${template.type === 'free' ? `downloadTemplate('${template.downloadUrl}')` : `purchaseTemplate('${tutorialId}', '${template.name}')`}">
                    ${template.type === 'free' ? 'Download' : 'Purchase & Download'}
                </button>
            </div>
        `;

        templateGrid.appendChild(templateCard);
    });
}

function downloadTemplate(url) {
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = url.split('/').pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

async function purchaseTemplate(tutorialId, templateName) {
    if (!confirm(`This premium template costs KES 100. Do you want to proceed with the purchase?`)) {
        return;
    }

    try {
        const response = await apiRequest('/api/tutorials/purchase-template', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tutorialId, templateName })
        });

        if (response.message) {
            alert('Purchase successful! Your template is now available for download.');
            // Reload the page to update the template status
            location.reload();
        }
    } catch (error) {
        console.error('Purchase error:', error);
        alert('Purchase failed. Please check your balance and try again.');
    }
}