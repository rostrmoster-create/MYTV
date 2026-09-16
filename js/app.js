```javascript
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

        if (user && this.userName) {
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
        if (this.mobileMenuBtn) {
            this.mobileMenuBtn.addEventListener('click', () => {
                this.openMobileMenu();
            });
        }

        if (this.mobileClose) {
            this.mobileClose.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        }

        if (this.mobileOverlay) {
            this.mobileOverlay.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        }

        // Logout
        if (this.logoutBtn) {
            this.logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }

        // Search
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }
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
            home: 'Home',
            livetv: 'Live TV',
            movies: 'Movies',
            series: 'Series',
            favorites: 'Favorites',
            recent: 'Recently Watched',
            settings: 'Settings'
        };

        if (this.pageTitle) {
            this.pageTitle.textContent = titles[pageName] || 'MYTV';
        }

        // Load page content
        this.currentPage = pageName;
        this.renderPage(pageName);

        // Update browser history
        if (pushState) {
            history.pushState(
                { page: pageName },
                '',
                `#${pageName}`
            );
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

        if (this.contentContainer) {
            this.contentContainer.innerHTML = content;
        }
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
                    <h1 class="welcome-title">
                        Welcome back, ${userName}! 👋
                    </h1>

                    <p class="welcome-text">
                        Ready to continue your entertainment journey?
                        Browse thousands of channels, movies, and series
                        from around the world.
                    </p>

                    <div class="quick-actions">
                        <button
                            class="action-btn"
                            onclick="app.loadPage('livetv')">
                            Watch Live TV
                        </button>

                        <button
                            class="action-btn secondary"
                            onclick="app.loadPage('movies')">
                            Browse Movies
                        </button>

                        <button
                            class="action-btn secondary"
                            onclick="app.loadPage('series')">
                            Explore Series
                        </button>
                    </div>
                </div>
            </div>

            <div class="page-section">
                <div class="section-header">
                    <div>
                        <h2 class="section-title">
                            Continue Watching
                        </h2>

                        <p class="section-subtitle">
                            Pick up where you left off
                        </p>
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
                        <h2 class="section-title">
                            Your Favorites
                        </h2>

                        <p class="section-subtitle">
                            Quick access to your saved content
                        </p>
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
        // Initialize channels if not already done
        if (!window.channelsManager) {
            window.channelsManager = new Channels();
        }

        if (!window.videoPlayer) {
            window.videoPlayer = new Player();
        }

        const categories =
            window.channelsManager.getCategories();

        const currentCategory =
            window.channelsManager.currentCategory || 'All';

        setTimeout(() => {
            this.initializeLiveTV();
        }, 100);

        return `
            <!-- Video Player -->
            <div class="player-container">

                <div class="video-wrapper">

                    <div class="video-player">
                        <video
                            id="playerVideo"
                            controls>
                        </video>
                    </div>

                    <!-- Placeholder -->
                    <div
                        class="player-placeholder"
                        id="playerPlaceholder">

                        <svg viewBox="0 0 24 24" fill="none">
                            <rect
                                x="2"
                                y="4"
                                width="20"
                                height="14"
                                rx="2"
                                stroke="currentColor"
                                stroke-width="2"/>

                            <path
                                d="M8 21H16M12 17V21M6 4L10 1L14 4"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"/>
                        </svg>

                        <h3>
                            Select a channel to start watching
                        </h3>

                        <p>
                            Choose from thousands of live channels below
                        </p>
                    </div>

                    <!-- Loading -->
                    <div
                        class="player-loading"
                        id="playerLoading"
                        style="display: none;">

                        <div class="loading-spinner"></div>

                        <p>
                            Loading stream...
                        </p>
                    </div>

                    <!-- Error -->
                    <div
                        class="player-error"
                        id="playerError"
                        style="display: none;">

                        <svg viewBox="0 0 24 24" fill="none">
                            <circle
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                stroke-width="2"/>

                            <path
                                d="M12 8V12M12 16H12.01"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"/>
                        </svg>

                        <h4>
                            Unable to Play Stream
                        </h4>

                        <p id="playerErrorText">
                            An error occurred while loading the stream
                        </p>

                        <button
                            class="retry-btn"
                            onclick="window.videoPlayer.retry()">
                            Try Again
                        </button>
                    </div>
                </div>

                <!-- Now Playing Info -->
                <div
                    class="now-playing"
                    id="nowPlaying"
                    style="display: none;">

                    <div class="now-playing-header">

                        <div
                            class="now-playing-logo"
                            id="nowPlayingLogo">
                            CNN
                        </div>

                        <div class="now-playing-info">

                            <h3
                                class="now-playing-title"
                                id="nowPlayingTitle">
                                CNN International
                            </h3>

                            <div class="now-playing-meta">

                                <span class="meta-item live">
                                    <span class="live-dot"></span>
                                    LIVE
                                </span>

                                <span
                                    class="meta-item"
                                    id="nowPlayingCategory">
                                    News
                                </span>

                            </div>
                        </div>

                        <div class="now-playing-actions">

                            <button
                                class="action-btn-large"
                                id="nowPlayingFavorite">

                                <svg
                                    viewBox="0 0 20 20"
                                    fill="none">

                                    <path
                                        d="M10 3L12.163 7.38L17 8.045L13.5 11.455L14.326 16.27L10 14.005L5.674 16.27L6.5 11.455L3 8.045L7.837 7.38L10 3Z"
                                        stroke="currentColor"
                                        stroke-width="1.5"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"/>
                                </svg>

                                <span>
                                    Favorite
                                </span>
                            </button>

                        </div>
                    </div>
                </div>
            </div>

            <!-- Channels Section -->
            <div class="page-section">

                <div class="channels-header">

                    <div
                        class="category-filters"
                        id="categoryFilters">

                        ${categories.map(cat => `
                            <button
                                class="category-btn ${cat === currentCategory ? 'active' : ''}"
                                data-category="${cat}">
                                ${cat}
                            </button>
                        `).join('')}

                    </div>

                    <div class="channel-search">

                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 20 20"
                            fill="none">

                            <circle
                                cx="9"
                                cy="9"
                                r="6"
                                stroke="currentColor"
                                stroke-width="1.5"/>

                            <path
                                d="M14 14L18 18"
                                stroke="currentColor"
                                stroke-width="1.5"
                                stroke-linecap="round"/>
                        </svg>

                        <input
                            type="text"
                            id="channelSearch"
                            placeholder="Search channels...">

                    </div>
                </div>

                <div
                    class="channels-grid"
                    id="channelsGrid">
                    <!-- Channels will be rendered here -->
                </div>

            </div>
        `;
    }

    /**
     * Initialize Live TV functionality
     */
    initializeLiveTV() {
        // Render initial channels
        this.renderChannels();

        // Category filter listeners
        const categoryBtns =
            document.querySelectorAll('.category-btn');

        categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => {

                const category =
                    btn.getAttribute('data-category');

                // Update active state
                categoryBtns.forEach(b => {
                    b.classList.remove('active');
                });

                btn.classList.add('active');

                // Update filter
                window.channelsManager.setCategory(category);

                this.renderChannels();
            });
        });

        // Search listener
        const searchInput =
            document.getElementById('channelSearch');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {

                window.channelsManager.setSearchQuery(
                    e.target.value
                );

                this.renderChannels();
            });
        }
    }

    /**
     * Render channels grid
     */
    renderChannels() {
        const channelsGrid =
            document.getElementById('channelsGrid');

        if (!channelsGrid) return;

        const channels =
            window.channelsManager.getFilteredChannels();

        if (channels.length === 0) {

            channelsGrid.innerHTML = `
                <div
                    class="empty-state"
                    style="grid-column: 1 / -1;">

                    <svg
                        viewBox="0 0 24 24"
                        fill="none">

                        <rect
                            x="2"
                            y="4"
                            width="20"
                            height="14"
                            rx="2"
                            stroke="currentColor"
                            stroke-width="2"/>

                        <path
                            d="M8 21H16M12 17V21"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"/>
                    </svg>

                    <h3>
                        No channels found
                    </h3>

                    <p>
                        Try adjusting your filters or search query
                    </p>
                </div>
            `;

            return;
        }

        channelsGrid.innerHTML = channels.map(channel => {

            const isFavorited =
                window.channelsManager.isFavorited(channel.id);

            const currentChannel =
                window.videoPlayer.getCurrentChannel();

            const isActive =
                currentChannel &&
                currentChannel.id === channel.id;

            return `
                <div
                    class="channel-card ${isActive ? 'active' : ''}"
                    data-channel-id="${channel.id}">

                    <div class="channel-logo-container">

                        ${channel.is_live ? `
                            <div class="live-indicator">
                                <span class="live-dot"></span>
                                LIVE
                            </div>
                        ` : ''}

                        <div class="channel-logo">
                            ${channel.logo}
                        </div>

                    </div>

                    <div class="channel-info">

                        <h3 class="channel-name">
                            ${channel.name}
                        </h3>

                        <p class="channel-category">
                            ${channel.category}
                        </p>

                        <div class="channel-actions">

                            <button
                                class="channel-action-btn play-btn"
                                data-channel-id="${channel.id}">

                                <svg
                                    viewBox="0 0 20 20"
                                    fill="none">

                                    <path
                                        d="M6 4L15 10L6 16V4Z"
                                        fill="currentColor"/>
                                </svg>

                                Watch
                            </button>

                            <button
                                class="channel-action-btn favorite-btn ${isFavorited ? 'favorited' : ''}"
                                data-channel-id="${channel.id}">

                                <svg
                                    viewBox="0 0 20 20"
                                    fill="${isFavorited ? 'currentColor' : 'none'}">

                                    <path
                                        d="M10 3L12.163 7.38L17 8.045L13.5 11.455L14.326 16.27L10 14.005L5.674 16.27L6.5 11.455L3 8.045L7.837 7.38L10 3Z"
                                        stroke="currentColor"
                                        stroke-width="1.5"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"/>
                                </svg>

                            </button>

                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Add event listeners
        this.attachChannelListeners();
    }

    /**
     * Attach event listeners to channel cards
     */
    attachChannelListeners() {

        // Play buttons
        const playBtns =
            document.querySelectorAll('.play-btn');

        playBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {

                e.stopPropagation();

                const channelId =
                    parseInt(
                        btn.getAttribute('data-channel-id')
                    );

                this.playChannel(channelId);
            });
        });

        // Favorite buttons
        const favBtns =
            document.querySelectorAll('.favorite-btn');

        favBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {

                e.stopPropagation();

                const channelId =
                    parseInt(
                        btn.getAttribute('data-channel-id')
                    );

                this.toggleChannelFavorite(channelId);
            });
        });

        // Channel cards
        const channelCards =
            document.querySelectorAll('.channel-card');

        channelCards.forEach(card => {
            card.addEventListener('click', () => {

                const channelId =
                    parseInt(
                        card.getAttribute('data-channel-id')
                    );

                this.playChannel(channelId);
            });
        });
    }

    /**
     * Play selected channel
     */
    playChannel(channelId) {

        const channel =
            window.channelsManager.getChannelById(channelId);

        if (!channel) return;

        // Play channel
        window.videoPlayer.playChannel(channel);

        // Update now playing info
        this.updateNowPlaying(channel);

        // Add to recently watched
        window.channelsManager.addToRecent(channelId);

        // Update active state
        this.renderChannels();

        // Scroll to player
        const playerContainer =
            document.querySelector('.player-container');

        if (playerContainer) {
            playerContainer.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    /**
     * Update now playing section
     */
    updateNowPlaying(channel) {

        const nowPlaying =
            document.getElementById('nowPlaying');

        const nowPlayingLogo =
            document.getElementById('nowPlayingLogo');

        const nowPlayingTitle =
            document.getElementById('nowPlayingTitle');

        const nowPlayingCategory =
            document.getElementById('nowPlayingCategory');

        const nowPlayingFavorite =
            document.getElementById('nowPlayingFavorite');

        if (nowPlaying) {
            nowPlaying.style.display = 'block';
        }

        if (nowPlayingLogo) {
            nowPlayingLogo.textContent = channel.logo;
        }

        if (nowPlayingTitle) {
            nowPlayingTitle.textContent = channel.name;
        }

        if (nowPlayingCategory) {
            nowPlayingCategory.textContent =
                channel.category;
        }

        // Update favorite button
        const isFavorited =
            window.channelsManager.isFavorited(channel.id);

        if (nowPlayingFavorite) {

            nowPlayingFavorite.className =
                `action-btn-large ${isFavorited ? 'favorited' : ''}`;

            const favoriteText =
                nowPlayingFavorite.querySelector('span');

            if (favoriteText) {
                favoriteText.textContent =
                    isFavorited
                        ? 'Favorited'
                        : 'Favorite';
            }

            // Remove old listener and add new one
            const newBtn =
                nowPlayingFavorite.cloneNode(true);

            nowPlayingFavorite.parentNode.replaceChild(
                newBtn,
                nowPlayingFavorite
            );

            newBtn.addEventListener('click', () => {
                this.toggleChannelFavorite(channel.id);
            });
        }
    }

    /**
     * Toggle channel favorite
     */
    toggleChannelFavorite(channelId) {

        window.channelsManager.toggleFavorite(channelId);

        // Re-render to update UI
        this.renderChannels();

        // Update now playing if this is the current channel
        const currentChannel =
            window.videoPlayer.getCurrentChannel();

        if (
            currentChannel &&
            currentChannel.id === channelId
        ) {
            this.updateNowPlaying(currentChannel);
        }
    }

    /**
     * Render Movies Page
     */
    renderMoviesPage() {
        return `
            <div class="page-section">
                <div class="section-header">
                    <div>
                        <h2 class="section-title">
                            Movies
                        </h2>

                        <p class="section-subtitle">
                            Unlimited movies at your fingertips
                        </p>
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
                        <h2 class="section-title">
                            Series
                        </h2>

                        <p class="section-subtitle">
                            Binge-worthy series and shows
                        </p>
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
        const favorites =
            this.storage.getFavorites();

        if (favorites.length === 0) {
            return `
                <div class="page-section">

                    <div class="section-header">
                        <div>
                            <h2 class="section-title">
                                Favorites
                            </h2>

                            <p class="section-subtitle">
                                Your saved channels, movies, and series
                            </p>
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
                        <h2 class="section-title">
                            Favorites
                        </h2>

                        <p class="section-subtitle">
                            ${favorites.length} saved items
                        </p>
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
        const recent =
            this.storage.getRecent();

        if (recent.length === 0) {
            return `
                <div class="page-section">

                    <div class="section-header">
                        <div>
                            <h2 class="section-title">
                                Recently Watched
                            </h2>

                            <p class="section-subtitle">
                                Continue where you left off
                            </p>
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
                        <h2 class="section-title">
                            Recently Watched
                        </h2>

                        <p class="section-subtitle">
                            ${recent.length} items
                        </p>
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
        const user =
            this.storage.getUser();

        const settings =
            this.storage.getSettings();

        return `
            <div class="page-section">

                <div class="section-header">
                    <div>
                        <h2 class="section-title">
                            Settings
                        </h2>

                        <p class="section-subtitle">
                            Manage your account and preferences
                        </p>
                    </div>
                </div>

                <div
                    class="card"
                    style="margin-bottom: var(--spacing-lg);">

                    <h3
                        style="font-size: 1.125rem; font-weight: 600; margin-bottom: var(--spacing-md);">
                        Account Information
                    </h3>

                    <div
                        style="display: grid; gap: var(--spacing-md);">

                        <div>
                            <label style="display: block; font-size: 0.875rem; color: var(--color-text-secondary); margin-bottom: var(--spacing-xs);">
                                Profile Name
                            </label>

                            <p style="font-weight: 500;">
                                ${user?.profileName || 'Not set'}
                            </p>
                        </div>

                        <div>
                            <label style="display: block; font-size: 0.875rem; color: var(--color-text-secondary); margin-bottom: var(--spacing-xs);">
                                Server URL
                            </label>

                            <p style="font-weight: 500;">
                                ${user?.serverUrl || 'Not set'}
                            </p>
                        </div>

                        <div>
                            <label style="display: block; font-size: 0.875rem; color: var(--color-text-secondary); margin-bottom: var(--spacing-xs);">
                                Username
                            </label>

                            <p style="font-weight: 500;">
                                ${user?.username || 'Not set'}
                            </p>
                        </div>

                    </div>
                </div>

                <div class="card">

                    <h3
                        style="font-size: 1.125rem; font-weight: 600; margin-bottom: var(--spacing-md);">
                        Playback Settings
                    </h3>

                    <p style="color: var(--color-text-secondary);">
                        Detailed settings will be available in
                        <strong>Stage 10: Settings</strong>
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
```
