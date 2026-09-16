// app.js - Main Application Logic v8

class App {
    constructor() {
        this.currentSection = 'home';
        this.init();
    }

    init() {
        console.log('App initializing...');
        this.setupNavigation();
        this.showSection('home');
        this.displayUserInfo();
    }

    setupNavigation() {
        // Mobile menu toggle
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');
        
        if (menuToggle && sidebar) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
            });
        }

        // Navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                this.showSection(section);
                
                // Close mobile menu
                if (sidebar) {
                    sidebar.classList.remove('active');
                }
            });
        });

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to logout?')) {
                    logout();
                }
            });
        }
    }

    showSection(sectionName) {
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.section === sectionName) {
                link.classList.add('active');
            }
        });

        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.style.display = 'none';
        });

        // Show selected section
        const targetSection = document.getElementById(`${sectionName}Section`);
        if (targetSection) {
            targetSection.style.display = 'block';
            this.currentSection = sectionName;
        }

        // Update page title
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) {
            const titles = {
                'home': 'Home',
                'channels': 'Live TV',
                'movies': 'Movies',
                'series': 'TV Series',
                'favorites': 'My Favorites',
                'recent': 'Recently Watched',
                'settings': 'Settings'
            };
            pageTitle.textContent = titles[sectionName] || 'MYTV';
        }

        // Initialize section-specific managers
        this.initializeSection(sectionName);
    }

    initializeSection(sectionName) {
        switch(sectionName) {
            case 'channels':
                if (!window.channelsManager) {
                    window.channelsManager = new ChannelsManager();
                }
                break;
            case 'movies':
                if (!window.moviesManager) {
                    window.moviesManager = new MoviesManager();
                }
                break;
            case 'series':
                if (!window.seriesManager) {
                    window.seriesManager = new SeriesManager();
                }
                break;
            case 'favorites':
                // Initialize or refresh favorites
                if (typeof window.initFavoritesManager === 'function') {
                    window.initFavoritesManager();
                }
                break;
            case 'recent':
                this.showRecentlyWatched();
                break;
            case 'settings':
                this.showSettings();
                break;
        }
    }

    displayUserInfo() {
        const user = StorageManager.getUserCredentials();
        const userNameElement = document.getElementById('userName');
        
        if (user && userNameElement) {
            userNameElement.textContent = user.username;
        }
    }

    showRecentlyWatched() {
        console.log('Showing recently watched...');
        const recent = StorageManager.getRecentlyWatched();
        console.log('Recently watched items:', recent);
        // Will be implemented in Stage 9
    }

    showSettings() {
        console.log('Showing settings...');
        // Will be implemented in Stage 10
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.app = new App();
    });
} else {
    window.app = new App();
}
