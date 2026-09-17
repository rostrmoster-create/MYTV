// Main Application Controller - v13

// Check authentication
function checkAuth() {
    const user = StorageManager.get('currentUser');
    if (!user) {
        window.location.href = 'login.html';
        return false;
    }
    
    // Verify Xtream credentials
    if (!XtreamAPI.isAuthenticated()) {
        window.location.href = 'login.html';
        return false;
    }
    
    return user;
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        XtreamAPI.logout();
        window.location.href = 'login.html';
    }
}

// Section navigation
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });

    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    // Show selected section
    const sectionMap = {
        'home': 'homeSection',
        'livetv': 'livetvSection',
        'movies': 'moviesSection',
        'series': 'seriesSection',
        'favorites': 'favoritesSection',
        'recent': 'recentSection',
        'settings': 'settingsSection'
    };

    const sectionId = sectionMap[sectionName];
    if (sectionId) {
        document.getElementById(sectionId).style.display = 'block';
        
        // Add active class to corresponding nav item
        const navItem = document.querySelector(`[data-section="${sectionName}"]`);
        if (navItem) {
            navItem.classList.add('active');
        }

        // Initialize section-specific content
        initializeSection(sectionName);
    }

    // Close mobile menu
    if (window.innerWidth <= 768) {
        document.getElementById('sidebar').classList.remove('active');
    }
}

// Initialize section content
function initializeSection(sectionName) {
    switch(sectionName) {
        case 'livetv':
            if (window.channelManager && !window.channelManager.initialized) {
                window.channelManager.loadChannels();
            }
            break;
        case 'movies':
            if (typeof window.initMovieManager === 'function') {
                window.initMovieManager();
            }
            break;
        case 'series':
            if (typeof window.initSeriesManager === 'function') {
                window.initSeriesManager();
            }
            break;
        case 'favorites':
            if (typeof window.initFavoritesManager === 'function') {
                window.initFavoritesManager();
            }
            break;
        case 'recent':
            if (typeof window.initRecentlyWatchedManager === 'function') {
                window.initRecentlyWatchedManager();
            }
            break;
        case 'settings':
            if (typeof window.initSettingsManager === 'function') {
                window.initSettingsManager();
            }
            break;
    }
}

// Modal functions
function closeModal() {
    const modal = document.getElementById('detailModal');
    if (modal) {
        modal.style.display = 'none';
        document.getElementById('modalBody').innerHTML = '';
    }
}

// Mobile menu toggle
function toggleMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const user = checkAuth();
    if (!user) return;

    // Display user info
    const userNameEl = document.getElementById('userName');
    if (userNameEl) {
        userNameEl.textContent = user.profileName || user.username || 'User';
    }

    // Setup navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            showSection(section);
        });
    });

    // Setup mobile menu toggle
    const menuToggle = document.getElementById('menuToggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleMobileMenu);
    }

    // Close sidebar when clicking outside on mobile
    document.getElementById('mainContent').addEventListener('click', function() {
        if (window.innerWidth <= 768) {
            document.getElementById('sidebar').classList.remove('active');
        }
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('detailModal');
        if (event.target === modal) {
            closeModal();
        }
    });

    // Initialize global search
    if (typeof window.initGlobalSearch === 'function') {
        window.initGlobalSearch();
    }

    // Initialize player
    if (typeof initPlayer === 'function') {
        initPlayer();
    }

    // Show home section by default
    showSection('home');

    console.log('MYTV App initialized successfully - v13 (Xtream Codes API)');
    console.log('Logged in as:', user.profileName);
    console.log('Server:', user.serverUrl);
});

// Make functions globally available
window.showSection = showSection;
window.closeModal = closeModal;
window.logout = logout;
