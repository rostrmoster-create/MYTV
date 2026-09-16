/**
 * MYTV Main Application
 * Handles navigation, page loading, and app state
 */

class App {
    constructor() {
        this.storage = new Storage();
        this.currentPage = 'home';
        
        // DOM elements
        this.sidebar = document.getElementById('sidebar');
        this.contentContainer = document.getElementById('contentContainer');
        this.pageTitle = document.getElementById('pageTitle');
        this.mobileMenuBtn = document.getElementById('mobileMenuBtn');
        this.mobileClose = document.getElementById('mobileClose');
        this.mobileOverlay = document.getElementById('mobileOverlay');
        this.logoutBtn = document.getElementById('logoutBtn');
        this.userName = document.getElementById('userName');
        this.searchInput = document.getElementById('searchInput');
        
        this.init();
    }

    /**
     * Initialize application
     */
    init() {
        // Check if user is logged in
        if (!this.storage.isLoggedIn()) {
            window.location.href = 'login.html';
            return;
        }

        // Load user data
        this.loadUserData();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Load initial page
        this.loadPage('home');
        
        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.page) {
                this.loadPage(e.state.page, false);
            }
        });
    }

    /**
     * Load user data
     */
    loadUserData() {
        const user = this.storage.getUser();
        if (user) {
            this.userName.textContent = user.profileName || 'User';
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Navigation items
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.getAttribute('data-page');
                this.loadPage(page);
                this.closeMobileMenu();
            });
        });

        // Mobile menu toggle
        this.mobileMenuBtn.addEventListener('click', () => this.openMobileMenu());
        this.mobileClose.addEventListener('click', () => this.closeMobileMenu());
        this.mobileOverlay.addEventListener('click', () => this.closeMobileMenu());

        // Logout
        this.logoutBtn.addEventListener('click', () => this.logout());

        // Search
        this.searchInput.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });
    }

    /**
     * Load page content
     */
    loadPage(pageName, pushState = true) {
        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-page') === pageName) {
                item.classList.add('active');
            }
        });

        // Update page title
        const titles = {
            'home': 'Home',
            'livetv': 'Live TV',
            'movies': 'Movies',
            'series': 'Series',
            'favorites': 'Favorites',
            'recent': 'Recently Watched',
            'settings': 'Settings'
        };
        this.pageTitle.textContent = titles[pageName] || 'MYTV';

        // Load page content
        this.currentPage = pageName;
        this.renderPage(pageName);

        // Update browser history
        if (pushState) {
            history.pushState({ page: pageName }, '', `#${pageName}`);
        }
    }

    /**
     * Render page content
     */
    renderPage(pageName) {
        let content = '';

        switch (pageName) {
            case 'home':
                content = this.renderHomePage();
                break;
            case 'livetv':
                content = this.renderLiveTVPage();
                break;
            case 'movies':
                content = this.renderMoviesPage();
                break;
            case 'series':
                content = this.renderSeriesPage();
                break;
            case 'favorites':
                content = this.renderFavoritesPage();
                break;
            case 'recent':
                content = this.renderRecentPage();
                break;
            case 'settings':
                content = this.renderSettingsPage();
                break;
            default:
                content = this.renderHomePage();
        }

        this.contentContainer.innerHTML = content;
    }

    /**
     * Render Home Page
     */
    renderHomePage() {
        const user = this.storage.getUser();
        const userName = user ? user.profileName : 'there';

        return `
            <div class="welcome-hero">
                <div class="welcome-content">
                    <h1 class="welcome-title">Welcome back, ${userName}! 👋</h1>
                    <p class="welcome-text">
                        Ready to continue your entertainment journey? Browse thousands of channels, 
                        movies, and series from around the world.
                    </p>
                    <div class="quick-actions">
                        <button class="action-btn" onclick="app.loadPage('livetv')">
                            Watch Live TV
                        </button>
                        <button class="action-btn secondary" onclick="app.loadPage('movies')">
                            Browse Movies
                        </button>
                        <button class="action-btn secondary" onclick="app.loadPage('series')">
                            Explore Series
                        </button>
                    </div>
                </div>
            </div>

            <div class="page-section">
                <div class="section-header">
                    <div>
                        <h2 class="section-title">Continue Watching</h2>
                        <p class="section-subtitle">Pick up where you left off</p>
                    </div>
                </div>
                <p style="color: var(--color-text-secondary); padding: 2rem; text-align: center; background: var(--color-surface); border-radius: var(--radius-lg); border: 1px solid var(--color-border-light);">
                    Your recently watched content will appear here.<br>
                    <strong>Coming in Stage 3: Live TV</strong>
                </p>
            </div>

            <div class="page-section">
                <div class="section-header">
                    <div>
                        <h2 class="section-title">Your Favorites</h2>
                        <p class="section-subtitle">Quick access to your saved content</p>
                    </div>
                </div>
                <p style="color: var(--color-text-secondary); padding: 2rem; text-align: center; background: var(--color-surface); border-radius: var(--radius-lg); border: 1px solid var(--color-border-light);">
                    Your favorite channels, movies, and series will appear here.<br>
                    <strong>Coming in Stage 8: Favorites</strong>
                </p>
            </div>
        `;
    }

    /**
     * Render Live TV Page
     */
    renderLiveTVPage() {
        return `
            <div class="page-section">
                <div class="section-header">
                    <div>
                        <h2 class="section-title">Live TV</h2>
                        <p class="section-subtitle">Watch live channels from around the world</p>
                    </div>
                </div>
                <p style="color: var(--color-text-secondary); padding: 3rem; text-align: center; background: var(--color-surface); border-radius: var(--radius-lg); border: 1px solid var(--color-border-light);">
                    📺 <strong>Live TV feature coming in Stage 3</strong><br><br>
                    Browse and watch thousands of live channels organized by category:<br>
                    News • Sports • Entertainment • Movies • Documentary • Kids • and more
                </p>
            </div>
        `;
    }

    /**
     * Render Movies Page
     */
    renderMoviesPage() {
        return `
            <div class="page-section">
                <div class="section-header">
                    <div>
                        <h2 class="section-title">Movies</h2>
                        <p class="section-subtitle">Unlimited movies at your fingertips</p>
                    </div>
                </div>
                <p style="color: var(--color-text-secondary); padding: 3rem; text-align: center; background: var(--color-surface); border-radius: var(--radius-lg); border: 1px solid var(--color-border-light);">
                    🎬 <strong>Movies feature coming in Stage 5</strong><br><br>
                    Browse thousands of movies by genre:<br>
                    Action • Comedy • Drama • Horror • Sci-Fi • Romance • Thriller • and more
                </p>
            </div>
        `;
    }

    /**
     * Render Series Page
     */
    renderSeriesPage() {
        return `
            <div class="page-section">
                <div class="section-header">
                    <div>
                        <h2 class="section-title">Series</h2>
                        <p class="section-subtitle">Binge-worthy series and shows</p>
                    </div>
                </div>
                <p style="color: var(--color-text-secondary); padding: 3rem; text-align: center; background: var(--color-surface); border-radius: var(--radius-lg); border: 1px solid var(--color-border-light);">
                    📺 <strong>Series feature coming in Stage 6</strong><br><br>
                    Watch complete seasons and episodes of your favorite shows
                </p>
            </div>
        `;
    }

    /**
     * Render Favorites Page
     */
    renderFavoritesPage() {
        const favorites = this.storage.getFavorites();

        if (favorites.length === 0) {
            return `
                <div class="page-section">
                    <div class="section-header">
                        <div>
                            <h2 class="section-title">Favorites</h2>
                            <p class="section-subtitle">Your saved channels, movies, and series</p>
                        </div>
                    </div>
                    <p style="color: var(--color-text-secondary); padding: 3rem; text-align: center; background: var(--color-surface); border-radius: var(--radius-lg); border: 1px solid var(--color-border-light);">
                        ⭐ <strong>No favorites yet</strong><br><br>
                        Start adding your favorite content to quickly access it here<br>
                        <em>Favorites feature coming in Stage 8</em>
                    </p>
                </div>
            `;
        }

        return `
            <div class="page-section">
                <div class="section-header">
                    <div>
                        <h2 class="section-title">Favorites</h2>
                        <p class="section-subtitle">${favorites.length} saved items</p>
                    </div>
                </div>
                <!-- Favorites grid will be added in Stage 8 -->
            </div>
        `;
    }

    /**
     * Render Recent Page
     */
    renderRecentPage() {
        const recent = this.storage.getRecent();

        if (recent.length === 0) {
            return `
                <div class="page-section">
                    <div class="section-header">
                        <div>
                            <h2 class="section-title">Recently Watched</h2>
                            <p class="section-subtitle">Continue where you left off</p>
                        </div>
                    </div>
                    <p style="color: var(--color-text-secondary); padding: 3rem; text-align: center; background: var(--color-surface); border-radius: var(--radius-lg); border: 1px solid var(--color-border-light);">
                        🕐 <strong>No watch history yet</strong><br><br>
                        Your recently watched content will appear here<br>
                        <em>Watch history feature coming in Stage 9</em>
                    </p>
                </div>
            `;
        }

        return `
            <div class="page-section">
                <div class="section-header">
                    <div>
                        <h2 class="section-title">Recently Watched</h2>
                        <p class="section-subtitle">${recent.length} items</p>
                    </div>
                </div>
                <!-- Recent grid will be added in Stage 9 -->
            </div>
        `;
    }

    /**
     * Render Settings Page
     */
    renderSettingsPage() {
        const user = this.storage.getUser();
        const settings = this.storage.getSettings();

        return `
            <div class="page-section">
                <div class="section-header">
                    <div>
                        <h2 class="section-title">Settings</h2>
                        <p class="section-subtitle">Manage your account and preferences</p>
                    </div>
                </div>

                <div class="card" style="margin-bottom: var(--spacing-lg);">
                    <h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: var(--spacing-md);">Account Information</h3>
                    <div style="display: grid; gap: var(--spacing-md);">
                        <div>
                            <label style="display: block; font-size: 0.875rem; color: var(--color-text-secondary); margin-bottom: var(--spacing-xs);">Profile Name</label>
                            <p style="font-weight: 500;">${user?.profileName || 'Not set'}</p>
                        </div>
                        <div>
                            <label style="display: block; font-size: 0.875rem; color: var(--color-text-secondary); margin-bottom: var(--spacing-xs);">Server URL</label>
                            <p style="font-weight: 500;">${user?.serverUrl || 'Not set'}</p>
                        </div>
                        <div>
                            <label style="display: block; font-size: 0.875rem; color: var(--color-text-secondary); margin-bottom: var(--spacing-xs);">Username</label>
                            <p style="font-weight: 500;">${user?.username || 'Not set'}</p>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: var(--spacing-md);">Playback Settings</h3>
                    <p style="color: var(--color-text-secondary);">
                        Detailed settings will be available in <strong>Stage 10: Settings</strong>
                    </p>
                </div>
            </div>
        `;
    }

    /**
     * Handle search
     */
    handleSearch(query) {
        if (query.length < 2) return;
        
        console.log('Searching for:', query);
        // Search functionality will be added in Stage 7
    }

    /**
     * Open mobile menu
     */
    openMobileMenu() {
        this.sidebar.classList.add('active');
        this.mobileOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    /**
     * Close mobile menu
     */
    closeMobileMenu() {
        this.sidebar.classList.remove('active');
        this.mobileOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    /**
     * Logout user
     */
    logout() {
        if (confirm('Are you sure you want to logout?')) {
            this.storage.logout();
            window.location.href = 'login.html';
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
