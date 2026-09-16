// app.js - Main Application Logic

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
                // Will implement in next stage
                console.log('Series section - coming soon');
                break;
            case 'favorites':
                this.showFavorites();
                break;
            case 'recent':
                this.showRecentlyWatched();
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

    showFavorites() {
        console.log('Showing favorites...');
        // Will be implemented when we enhance favorites
    }

    showRecentlyWatched() {
        console.log('Showing recently watched...');
        const recent = StorageManager.getRecentlyWatched();
        console.log('Recently watched items:', recent);
        // Will be implemented when we enhance recently watched
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
