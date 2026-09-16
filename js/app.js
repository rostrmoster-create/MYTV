// Main Application Controller - v9
let currentSection = 'home';

// Initialize application
document.addEventListener('DOMContentLoaded', async function() {
    // Check authentication
    const user = await StorageManager.get('currentUser');
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    // Display username
    const userNameEl = document.getElementById('userName');
    if (userNameEl && user.username) {
        userNameEl.textContent = user.username;
    }

    // Initialize global search
    if (typeof window.initGlobalSearch === 'function') {
        window.initGlobalSearch();
    }

    // Initialize menu toggle
    initMenuToggle();

    // Initialize user menu
    initUserMenu();

    // Load initial section
    navigateTo('home');
});

// Navigation function
window.navigateTo = function(section) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(s => {
        s.style.display = 'none';
        s.classList.remove('active');
    });

    // Remove active class from all nav items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));

    // Show selected section
    const sectionId = section + 'Section';
    const sectionEl = document.getElementById(sectionId);
    if (sectionEl) {
        sectionEl.style.display = 'block';
        sectionEl.classList.add('active');
    }

    // Set active nav item
    const navItem = document.querySelector(`[data-section="${section}"]`);
    if (navItem) {
        navItem.classList.add('active');
    }

    // Initialize section-specific functionality
    initializeSection(section);

    // Update current section
    currentSection = section;

    // Close sidebar on mobile
    if (window.innerWidth <= 768) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.remove('active');
        }
    }
};

// Initialize section-specific managers
function initializeSection(section) {
    switch(section) {
        case 'liveTV':
            if (typeof window.initChannelManager === 'function') {
                window.initChannelManager();
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
        case 'recentlyWatched':
            if (typeof window.initRecentlyWatchedManager === 'function') {
                window.initRecentlyWatchedManager();
            }
            break;
    }
}

// Menu toggle for mobile
function initMenuToggle() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });

        // Close sidebar when clicking outside on mobile
        if (mainContent) {
            mainContent.addEventListener('click', function() {
                if (window.innerWidth <= 768 && sidebar.classList.contains('active')) {
                    sidebar.classList.remove('active');
                }
            });
        }
    }
}

// User menu dropdown
function initUserMenu() {
    const userBtn = document.getElementById('userBtn');
    const userDropdown = document.getElementById('userDropdown');

    if (userBtn && userDropdown) {
        userBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            userDropdown.classList.toggle('active');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function() {
            userDropdown.classList.remove('active');
        });

        userDropdown.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
}

// Logout function
window.logout = async function() {
    if (confirm('Are you sure you want to logout?')) {
        await StorageManager.remove('currentUser');
        window.location.href = 'login.html';
    }
};

// Modal functions
window.closeModal = function() {
    const modal = document.getElementById('detailModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
};

// Close modal when clicking outside
window.addEventListener('click', function(e) {
    const modal = document.getElementById('detailModal');
    if (e.target === modal) {
        closeModal();
    }
});

// Handle escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
});
