// Configuration
const API_URL = 'http://localhost:5000/api';
let currentUser = null;
let authToken = localStorage.getItem('token');

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Exam Portal Frontend Loaded');
    
    // Check authentication status
    if (authToken) {
        fetchCurrentUser();
    } else {
        showLogin();
    }
    
    // Initialize event listeners
    initializeEventListeners();
});

// Initialize Event Listeners
function initializeEventListeners() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Upload form
    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', handleUpload);
    }
    
    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(loadMaterials, 500));
    }
    
    // Chat form
    const chatForm = document.getElementById('chatForm');
    if (chatForm) {
        chatForm.addEventListener('submit', handleChatSubmit);
    }
}

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Authentication Functions
async function fetchCurrentUser() {
    try {
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: { 
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            currentUser = await response.json();
            console.log('✅ User loaded:', currentUser.email);
            showDashboard();
            updateUIForUserRole();
        } else {
            throw new Error('Failed to fetch user');
        }
    } catch (error) {
        console.error('Error fetching current user:', error);
        logout();
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorElement = document.getElementById('loginError');

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            localStorage.setItem('token', authToken);
            currentUser = data.user;
            console.log('✅ Login successful');
            showDashboard();
            hideError(errorElement);
        } else {
            showError(errorElement, data.error || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError(errorElement, 'Network error. Please try again.');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const userData = {
        name: document.getElementById('registerName').value,
        email: document.getElementById('registerEmail').value,
        password: document.getElementById('registerPassword').value,
        role: document.getElementById('registerRole').value,
        department: document.getElementById('registerDepartment').value,
        semester: parseInt(document.getElementById('registerSemester').value)
    };
    
    const errorElement = document.getElementById('registerError');

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            localStorage.setItem('token', authToken);
            currentUser = data.user;
            console.log('✅ Registration successful');
            showDashboard();
            hideError(errorElement);
        } else {
            showError(errorElement, data.error || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showError(errorElement, 'Network error. Please try again.');
    }
}

function logout() {
    localStorage.removeItem('token');
    authToken = null;
    currentUser = null;
    console.log('👋 User logged out');
    showLogin();
}

// Page Navigation Functions
function showLogin() {
    hideAllPages();
    document.getElementById('loginPage').classList.remove('hidden');
    document.querySelector('.navbar').classList.add('hidden');
}

function showRegister() {
    hideAllPages();
    document.getElementById('registerPage').classList.remove('hidden');
    document.querySelector('.navbar').classList.add('hidden');
}

function showDashboard() {
    hideAllPages();
    document.getElementById('dashboardPage').classList.remove('hidden');
    document.querySelector('.navbar').classList.remove('hidden');
    loadDashboardData();
}

function showMaterials() {
    hideAllPages();
    document.getElementById('materialsPage').classList.remove('hidden');
    document.querySelector('.navbar').classList.remove('hidden');
    loadMaterials();
}

function handleChatSubmit(event) {
    event.preventDefault();
    sendMessage();
}

function showUpload() {
    if (currentUser && currentUser.role === 'faculty') {
        hideAllPages();
        document.getElementById('uploadPage').classList.remove('hidden');
        document.querySelector('.navbar').classList.remove('hidden');
    } else {
        alert('⚠️ Only faculty members can upload materials.');
    }
}

function hideAllPages() {
    const pages = [
        'loginPage', 
        'registerPage', 
        'dashboardPage', 
        'materialsPage', 
        'uploadPage'
    ];
    
    pages.forEach(page => {
        const element = document.getElementById(page);
        if (element) {
            element.classList.add('hidden');
        }
    });
}

function updateUIForUserRole() {
    const uploadNavItem = document.getElementById('uploadNavItem');
    if (uploadNavItem) {
        if (currentUser && currentUser.role === 'faculty') {
            uploadNavItem.classList.remove('hidden');
        } else {
            uploadNavItem.classList.add('hidden');
        }
    }
}

// Dashboard Functions - Backend handles all processing
async function loadDashboardData() {
    try {
        const response = await fetch(`${API_URL}/dashboard`, {
            headers: { 
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) throw new Error('Failed to fetch dashboard data');
        
        const data = await response.json();
        
        // Display pre-processed stats from backend
        document.getElementById('totalMaterials').textContent = data.stats.totalMaterials;
        document.getElementById('totalPYQs').textContent = data.stats.totalPYQs;
        document.getElementById('totalDownloads').textContent = data.stats.totalDownloads;
        document.getElementById('totalUsers').textContent = data.stats.totalStudents + data.stats.totalFaculty;
        
        // Display pre-processed recent materials from backend
        updateRecentMaterials(data.recentMaterials);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

function updateRecentMaterials(recentMaterials) {
    const recentMaterialsContainer = document.getElementById('recentMaterials');
    
    if (recentMaterials.length === 0) {
        recentMaterialsContainer.innerHTML = '<p class="text-muted">No materials available yet. Faculty can upload materials!</p>';
        return;
    }
    
    const html = recentMaterials.map(material => `
        <div class="border-bottom py-2">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <strong>${escapeHtml(material.title)}</strong> - ${escapeHtml(material.subject)}
                    <span class="badge bg-primary ms-2">${material.type.toUpperCase()}</span>
                </div>
                <small class="text-muted">${formatDate(material.createdAt)}</small>
            </div>
        </div>
    `).join('');
    
    recentMaterialsContainer.innerHTML = html;
}

// Materials Functions - Backend handles filtering
async function loadMaterials() {
    try {
        let url = `${API_URL}/materials?`;
        const dept = document.getElementById('filterDepartment')?.value;
        const sem = document.getElementById('filterSemester')?.value;
        const type = document.getElementById('filterType')?.value;
        const search = document.getElementById('searchInput')?.value;

        if (dept) url += `department=${encodeURIComponent(dept)}&`;
        if (sem) url += `semester=${encodeURIComponent(sem)}&`;
        if (type) url += `type=${encodeURIComponent(type)}&`;
        if (search) url += `search=${encodeURIComponent(search)}&`;

        const response = await fetch(url, {
            headers: { 
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) throw new Error('Failed to fetch materials');
        
        // Backend returns pre-filtered and sorted materials
        const materials = await response.json();
        displayMaterials(materials);
    } catch (error) {
        console.error('Error loading materials:', error);
        document.getElementById('materialsList').innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle"></i> Error loading materials: ${error.message}
            </div>
        `;
    }
}

function displayMaterials(materials) {
    const container = document.getElementById('materialsList');
    
    if (!materials || materials.length === 0) {
        container.innerHTML = `
            <div class="alert alert-info text-center">
                <i class="fas fa-info-circle"></i> No materials found matching your criteria.
                ${currentUser?.role === 'faculty' ? '<br><br>Click on "Upload" to add new materials!' : ''}
            </div>
        `;
        return;
    }

    // Simply display the materials returned from backend (already processed)
    const html = materials.map(material => `
        <div class="material-card">
            <div class="row align-items-center">
                <div class="col-md-8">
                    <h5 class="mb-2">
                        <i class="fas fa-file-${getFileIcon(material.type)} text-primary"></i>
                        ${escapeHtml(material.title)}
                    </h5>
                    <p class="text-muted mb-2">${escapeHtml(material.description || 'No description available')}</p>
                    <div class="mb-2">
                        <span class="badge bg-primary">${material.type.toUpperCase()}</span>
                        <span class="badge bg-secondary ms-2">${escapeHtml(material.department)}</span>
                        <span class="badge bg-info ms-2">Sem ${material.semester}</span>
                        ${material.year ? `<span class="badge bg-warning ms-2">Year ${material.year}</span>` : ''}
                    </div>
                    <small class="text-muted">
                        <i class="fas fa-user"></i> ${escapeHtml(material.uploadedByName || 'Faculty')}
                        <i class="fas fa-calendar ms-3"></i> ${formatDate(material.createdAt)}
                        <i class="fas fa-download ms-3"></i> ${material.downloads || 0} downloads
                        <i class="fas fa-heart ms-3"></i> ${material.likes ? material.likes.length : 0} likes
                    </small>
                </div>
                <div class="col-md-4 text-end mt-3 mt-md-0">
                    <button class="btn btn-success btn-sm" onclick="downloadMaterial('${material.id}', '${material.fileUrl}', '${escapeHtml(material.fileName)}')">
                        <i class="fas fa-download"></i> Download
                    </button>
                    <button class="icon-btn ms-2" onclick="likeMaterial('${material.id}')" title="Like this material">
                        <i class="fas fa-heart"></i> ${material.likes ? material.likes.length : 0}
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

function getFileIcon(type) {
    const icons = {
        'notes': 'alt',
        'pyq': 'pdf',
        'syllabus': 'invoice',
        'reference': 'text'
    };
    return icons[type] || 'alt';
}

function applyFilters() {
    loadMaterials();
}

// Material Actions
async function downloadMaterial(id, fileUrl, fileName) {
    try {
        await fetch(`${API_URL}/materials/${id}/download`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        window.open(`http://localhost:5000${fileUrl}`, '_blank');
        showNotification('📥 Download started!', 'success');
        
        setTimeout(loadMaterials, 1000);
    } catch (error) {
        console.error('Error downloading material:', error);
        showNotification('❌ Error downloading file', 'danger');
    }
}

async function likeMaterial(id) {
    try {
        const response = await fetch(`${API_URL}/materials/${id}/like`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            loadMaterials();
            showNotification('❤️ Like updated!', 'success');
        } else {
            throw new Error('Failed to like material');
        }
    } catch (error) {
        console.error('Error liking material:', error);
        showNotification('❌ Error updating like', 'danger');
    }
}

// Upload Functions
async function handleUpload(e) {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('title', document.getElementById('uploadTitle').value);
    formData.append('subject', document.getElementById('uploadSubject').value);
    formData.append('department', document.getElementById('uploadDepartment').value);
    formData.append('semester', document.getElementById('uploadSemester').value);
    formData.append('type', document.getElementById('uploadType').value);
    formData.append('description', document.getElementById('uploadDescription').value);
    formData.append('year', document.getElementById('uploadYear').value);
    
    const fileInput = document.getElementById('uploadFile');
    if (fileInput.files.length > 0) {
        formData.append('file', fileInput.files[0]);
    } else {
        showNotification('⚠️ Please select a file to upload', 'warning');
        return;
    }

    const errorElement = document.getElementById('uploadError');
    const successElement = document.getElementById('uploadSuccess');

    try {
        const response = await fetch(`${API_URL}/materials`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${authToken}`
            },
            body: formData
        });

        const data = await response.json();
        
        if (response.ok) {
            showSuccess(successElement, '✅ Material uploaded successfully!');
            hideError(errorElement);
            document.getElementById('uploadForm').reset();
            showNotification('✅ Material uploaded successfully!', 'success');
            
            setTimeout(() => {
                hideSuccess(successElement);
                showMaterials();
            }, 2000);
        } else {
            showError(errorElement, data.error || 'Upload failed');
        }
    } catch (error) {
        console.error('Upload error:', error);
        showError(errorElement, 'Network error. Please try again.');
    }
}

// Chatbot Functions
function toggleChatbot() {
    const chatWindow = document.getElementById('chatbotWindow');
    chatWindow.classList.toggle('active');
    
    if (chatWindow.classList.contains('active')) {
        document.getElementById('chatInput').focus();
    }
}

function addChatMessage(message, sender) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    if (sender === 'bot') {
        let formattedMessage = escapeHtml(message)
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`([^`]+)`/g, '<code class="bg-gray-200 text-sm px-1 py-0.5 rounded">$1</code>')
            .replace(/\n/g, '<br>');
        
        messageDiv.innerHTML = formattedMessage;
    } else {
        messageDiv.textContent = message;
    }
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

async function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    const submitBtn = document.getElementById('chatSubmitBtn');
    const chatLoader = document.getElementById('chatLoader');
    
    if (!message) return;
    
    addChatMessage(message, 'user');
    input.value = '';
    
    input.disabled = true;
    submitBtn.disabled = true;
    chatLoader.classList.remove('hidden');
    
    try {
        const response = await fetch(`${API_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ message })
        });
        
        if (!response.ok) {
            throw new Error('Chat request failed');
        }
        
        const data = await response.json();
        
        chatLoader.classList.add('hidden');
        addChatMessage(data.response, 'bot');
    } catch (error) {
        console.error('Chat error:', error);
        chatLoader.classList.add('hidden');
        addChatMessage(
            "I'm having trouble connecting right now. Please check your internet connection and try again.",
            'bot'
        );
    } finally {
        input.disabled = false;
        submitBtn.disabled = false;
        input.focus();
    }
}

// Utility Functions
function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return unsafe;
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function showError(element, message) {
    if (element) {
        element.textContent = message;
        element.classList.remove('hidden');
    }
}

function hideError(element) {
    if (element) {
        element.classList.add('hidden');
    }
}

function showSuccess(element, message) {
    if (element) {
        element.textContent = message;
        element.classList.remove('hidden');
    }
}

function hideSuccess(element) {
    if (element) {
        element.classList.add('hidden');
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} position-fixed`;
    notification.style.cssText = `
        top: 80px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideInRight 0.3s ease;
    `;
    notification.innerHTML = `
        <strong>${message}</strong>
        <button type="button" class="btn-close" onclick="this.parentElement.remove()" style="float: right;"></button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Global error handler
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
});

// Make functions globally available
window.showLogin = showLogin;
window.showRegister = showRegister;
window.showDashboard = showDashboard;
window.showMaterials = showMaterials;
window.showUpload = showUpload;
window.logout = logout;
window.applyFilters = applyFilters;
window.downloadMaterial = downloadMaterial;
window.likeMaterial = likeMaterial;
window.toggleChatbot = toggleChatbot;
window.sendMessage = sendMessage;

console.log('✅ All functions loaded and ready!');
