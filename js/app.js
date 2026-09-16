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

    init() {
        if (!this.storage.isLoggedIn()) {
            window.location.href = 'login.html';
            return;
        }

        this.loadUserData();
        this.setupEventListeners();
        this.loadPage('home');

        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.page) {
                this.loadPage(e.state.page, false);
            }
        });
    }

    loadUserData() {
        const user = this.storage.getUser();

        if (user && this.userName) {
            this.userName.textContent = user.profileName || 'User';
        }
    }

    setupEventListeners() {
        const navItems = document.querySelectorAll('.nav-item');

        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();

                const page = item.getAttribute('data-page');

                this.loadPage(page);
                this.closeMobileMenu();
            });
        });

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

        if (this.logoutBtn) {
            this.logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }

        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }
    }

    loadPage(pageName, pushState = true) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');

            if (item.getAttribute('data-page') === pageName) {
                item.classList.add('active');
            }
        });

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

        this.currentPage = pageName;
        this.renderPage(pageName);

        if (pushState) {
            history.pushState(
                { page: pageName },
                '',
                `#${pageName}`
            );
        }
    }

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

    renderLiveTVPage() {
        if (!window.channelsManager) {
            window.channelsManager = new Channels();
        }

        if (!window.videoPlayer) {
            window.videoPlayer = new Player();
        }

        const categories = window.channelsManager.getCategories();
        const currentCategory = window.channelsManager.currentCategory || 'All';

        setTimeout(() => {
            this.initializeLiveTV();
        }, 100);

        return `
            <div class="player-container">
                <div class="video-wrapper">
                    <div class="video-player">
                        <video id="playerVideo" controls></video>
                    </div>

                    <div class="player-placeholder" id="playerPlaceholder">
                        <svg viewBox="0 0 24 24" fill="none">
                            <rect x="2" y="4" width="20" height="14" rx="2"
                                stroke="currentColor" stroke-width="2"/>
                            <path d="M8 21H16M12 17V21M6 4L10 1L14 4"
                                stroke="currentColor" stroke-width="2"
                                stroke-linecap="round"/>
                        </svg>

                        <h3>Select a channel to start watching</h3>
                        <p>Choose from thousands of live channels below</p>
                    </div>

                    <div class="player-loading" id="playerLoading" style="display: none;">
                        <div class="loading-spinner"></div>
                        <p>Loading stream...</p>
                    </div>

                    <div class="player-error" id="playerError" style="display: none;">
                        <svg viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10"
                                stroke="currentColor" stroke-width="2"/>
                            <path d="M12 8V12M12 16H12.01"
                                stroke="currentColor" stroke-width="2"
                                stroke-linecap="round"/>
                        </svg>

                        <h4>Unable to Play Stream</h4>

                        <p id="playerErrorText">
                            An error occurred while loading the stream
                        </p>

                        <button class="retry-btn" onclick="window.videoPlayer.retry()">
                            Try Again
                        </button>
                    </div>
                </div>

                <div class="now-playing" id="nowPlaying" style="display: none;">
                    <div class="now-playing-header">

                        <div class="now-playing-logo" id="nowPlayingLogo">
                            CNN
                        </div>

                        <div class="now-playing-info">
                            <h3 class="now-playing-title" id="nowPlayingTitle">
                                CNN International
                            </h3>

                            <div class="now-playing-meta">
                                <span class="meta-item live">
                                    <span class="live-dot"></span>
                                    LIVE
                                </span>

                                <span class="meta-item" id="nowPlayingCategory">
                                    News
                                </span>
                            </div>
                        </div>

                        <div class="now-playing-actions">
                            <button class="action-btn-large" id="nowPlayingFavorite">
                                <svg viewBox="0 0 20 20" fill="none">
                                    <path
                                        d="M10 3L12.163 7.38L17 8.045L13.5 11.455L14.326 16.27L10 14.005L5.674 16.27L6.5 11.455L3 8.045L7.837 7.38L10 3Z"
                                        stroke="currentColor"
                                        stroke-width="1.5"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"/>
                                </svg>

                                <span>Favorite</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="page-section">
                <div class="channels-header">

                    <div class="category-filters" id="categoryFilters">
                        ${categories.map(cat => `
                            <button
                                class="category-btn ${cat === currentCategory ? 'active' : ''}"
                                data-category="${cat}">
                                ${cat}
                            </button>
                        `).join('')}
                    </div>

                    <div class="channel-search">
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                            <circle cx="9" cy="9" r="6"
                                stroke="currentColor" stroke-width="1.5"/>
                            <path d="M14 14L18 18"
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

                <div class="channels-grid" id="channelsGrid">
                    <!-- Channels will be rendered here -->
                </div>
            </div>
        `;
    }

    initializeLiveTV() {
        this.renderChannels();

        const categoryBtns = document.querySelectorAll('.category-btn');

        categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const category = btn.getAttribute('data-category');

                categoryBtns.forEach(b => {
                    b.classList.remove('active');
                });

                btn.classList.add('active');

                window.channelsManager.setCategory(category);
                this.renderChannels();
            });
        });

        const searchInput = document.getElementById('channelSearch');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                window.channelsManager.setSearchQuery(e.target.value);
                this.renderChannels();
            });
        }
    }

    renderChannels() {
        const channelsGrid = document.getElementById('channelsGrid');

        if (!channelsGrid) return;

        const channels = window.channelsManager.getFilteredChannels();

        if (channels.length === 0) {
            channelsGrid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <svg viewBox="0 0 24 24" fill="none">
                        <rect x="2" y="4" width="20" height="14" rx="2"
                            stroke="currentColor" stroke-width="2"/>
                        <path d="M8 21H16M12 17V21"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"/>
                    </svg>

                    <h3>No channels found</h3>
                    <p>Try adjusting your filters or search query</p>
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
                <div class="channel-card ${isActive ? 'active' : ''}"
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

                                <svg viewBox="0 0 20 20" fill="none">
                                    <path d="M6 4L15 10L6 16V4Z"
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
                                        d="M10 3L12.163 7.38L17 8.045L13.5 11.455L14.326 16.27L10 14.005L5.674 16.27L6.5 11.455L7.837 7.38L10 3Z"
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

        this.attachChannelListeners();
    }

    attachChannelListeners() {
        const playBtns = document.querySelectorAll('.play-btn');

        playBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();

                const channelId =
                    parseInt(btn.getAttribute('data-channel-id'));

                this.playChannel(channelId);
            });
        });

        const favBtns = document.querySelectorAll('.favorite-btn');

        favBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();

                const channelId =
                    parseInt(btn.getAttribute('data-channel-id'));

                this.toggleChannelFavorite(channelId);
            });
        });

        const channelCards =
            document.querySelectorAll('.channel-card');

        channelCards.forEach(card => {
            card.addEventListener('click', () => {
                const channelId =
                    parseInt(card.getAttribute('data-channel-id'));

                this.playChannel(channelId);
            });
        });
    }

    playChannel(channelId) {
        const channel =
            window.channelsManager.getChannelById(channelId);

        if (!channel) return;

        window.videoPlayer.playChannel(channel);
        this.updateNowPlaying(channel);
        window.channelsManager.addToRecent(channelId);

        this.renderChannels();

        const playerContainer =
            document.querySelector('.player-container');

        if (playerContainer) {
            playerContainer.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

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
            nowPlayingCategory.textContent = channel.category;
        }

        const isFavorited =
            window.channelsManager.isFavorited(channel.id);

        if (nowPlayingFavorite) {
            nowPlayingFavorite.className =
                `action-btn-large ${isFavorited ? 'favorited' : ''}`;

            const favoriteText =
                nowPlayingFavorite.querySelector('span');

            if (favoriteText) {
                favoriteText.textContent =
                    isFavorited ? 'Favorited' : 'Favorite';
            }

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

    toggleChannelFavorite(channelId) {
        window.channelsManager.toggleFavorite(channelId);

        this.renderChannels();

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
        // Initialize movies if not already done
        if (!window.moviesManager) {
            window.moviesManager = new Movies();
        }

        const genres = window.moviesManager.getGenres();
        const currentGenre = window.moviesManager.currentGenre;

        setTimeout(() => {
            this.initializeMovies();
        }, 100);

        return `
            <div class="page-section">
                <div class="movies-header">
                    <div class="genre-filters" id="genreFilters">
                        ${genres.map(genre => `
                            <button
                                class="genre-btn ${genre === currentGenre ? 'active' : ''}"
                                data-genre="${genre}">
                                ${genre}
                            </button>
                        `).join('')}
                    </div>

                    <div class="movie-search">
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                            <circle cx="9" cy="9" r="6"
                                stroke="currentColor"
                                stroke-width="1.5"/>
                            <path d="M14 14L18 18"
                                stroke="currentColor"
                                stroke-width="1.5"
                                stroke-linecap="round"/>
                        </svg>

                        <input
                            type="text"
                            id="movieSearch"
                            placeholder="Search movies...">
                    </div>
                </div>

                <div class="movies-grid" id="moviesGrid">
                    <!-- Movies will be rendered here -->
                </div>
            </div>

            <div id="movieModal" style="display: none;"></div>
        `;
    }

    /**
     * Initialize Movies functionality
     */
    initializeMovies() {
        this.renderMovies();

        const genreBtns =
            document.querySelectorAll('.genre-btn');

        genreBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const genre =
                    btn.getAttribute('data-genre');

                genreBtns.forEach(b =>
                    b.classList.remove('active')
                );

                btn.classList.add('active');

                window.moviesManager.setGenre(genre);
                this.renderMovies();
            });
        });

        const searchInput =
            document.getElementById('movieSearch');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                window.moviesManager.setSearchQuery(
                    e.target.value
                );

                this.renderMovies();
            });
        }
    }

    /**
     * Render movies grid
     */
    renderMovies() {
        const moviesGrid =
            document.getElementById('moviesGrid');

        if (!moviesGrid) return;

        const movies =
            window.moviesManager.getFilteredMovies();

        if (movies.length === 0) {
            moviesGrid.innerHTML = `
                <div
                    class="empty-state"
                    style="grid-column: 1 / -1;">

                    <svg viewBox="0 0 24 24" fill="none">
                        <rect
                            x="2"
                            y="4"
                            width="20"
                            height="12"
                            rx="2"
                            stroke="currentColor"
                            stroke-width="2"/>

                        <path
                            d="M2 8H22M6 4V8M10 4V8M14 4V8M18 4V8"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"/>
                    </svg>

                    <h3>No movies found</h3>

                    <p>
                        Try adjusting your filters or search query
                    </p>
                </div>
            `;

            return;
        }

        moviesGrid.innerHTML = movies.map(movie => {
            const isFavorited =
                window.moviesManager.isFavorited(movie.id);

            return `
                <div
                    class="movie-card"
                    data-movie-id="${movie.id}">

                    <div class="movie-poster">

                        <div class="poster-placeholder">
                            ${movie.title.substring(0, 2).toUpperCase()}
                        </div>

                        <div class="movie-year">
                            ${movie.year}
                        </div>

                        <div class="movie-rating">
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 20 20"
                                fill="currentColor">

                                <path
                                    d="M10 1L12.163 6.38L18 7.045L14 10.855L15.326 16.67L10 13.805L4.674 16.67L6 10.855L2 7.045L7.837 6.38L10 1Z"/>
                            </svg>

                            ${movie.rating}
                        </div>

                        <div class="movie-overlay">
                            <div class="overlay-actions">

                                <button
                                    class="overlay-btn primary play-movie-btn"
                                    data-movie-id="${movie.id}">

                                    <svg
                                        viewBox="0 0 20 20"
                                        fill="currentColor">

                                        <path d="M6 4L15 10L6 16V4Z"/>
                                    </svg>

                                    Play
                                </button>

                                <button
                                    class="overlay-btn info-btn"
                                    data-movie-id="${movie.id}">

                                    <svg
                                        viewBox="0 0 20 20"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="2">

                                        <circle cx="10" cy="10" r="8"/>

                                        <path
                                            d="M10 10V14M10 6H10.01"
                                            stroke-linecap="round"/>
                                    </svg>

                                    Info
                                </button>

                            </div>
                        </div>
                    </div>

                    <div class="movie-info">
                        <h3 class="movie-title">
                            ${movie.title}
                        </h3>

                        <p class="movie-genre">
                            ${movie.genre} • ${movie.duration}
                        </p>
                    </div>
                </div>
            `;
        }).join('');

        this.attachMovieListeners();
    }

    /**
     * Attach event listeners to movie cards
     */
    attachMovieListeners() {
        const infoBtns =
            document.querySelectorAll('.info-btn');

        infoBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();

                const movieId =
                    parseInt(
                        btn.getAttribute('data-movie-id')
                    );

                this.showMovieModal(movieId);
            });
        });

        const playBtns =
            document.querySelectorAll('.play-movie-btn');

        playBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();

                const movieId =
                    parseInt(
                        btn.getAttribute('data-movie-id')
                    );

                this.playMovie(movieId);
            });
        });

        const movieCards =
            document.querySelectorAll('.movie-card');

        movieCards.forEach(card => {
            card.addEventListener('click', () => {
                const movieId =
                    parseInt(
                        card.getAttribute('data-movie-id')
                    );

                this.showMovieModal(movieId);
            });
        });
    }

    /**
     * Show movie details modal
     */
    showMovieModal(movieId) {
        const movie =
            window.moviesManager.getMovieById(movieId);

        if (!movie) return;

        const isFavorited =
            window.moviesManager.isFavorited(movieId);

        const modalHTML = `
            <div
                class="movie-modal-overlay"
                id="movieModalOverlay">

                <div class="movie-modal">

                    <div class="modal-header">

                        <button
                            class="modal-close"
                            id="modalClose">

                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2">

                                <path
                                    d="M18 6L6 18M6 6L18 18"
                                    stroke-linecap="round"/>
                            </svg>
                        </button>

                        <h2 class="modal-title">
                            ${movie.title}
                        </h2>

                        <div class="modal-meta">

                            <span class="meta-badge">
                                ${movie.year}
                            </span>

                            <span class="meta-badge">
                                ${movie.duration}
                            </span>

                            <span class="meta-badge rating">

                                <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 20 20"
                                    fill="currentColor">

                                    <path
                                        d="M10 1L12.163 6.38L18 7.045L14 10.855L15.326 16.67L10 13.805L4.674 16.67L6 10.855L2 7.045L7.837 6.38L10 1Z"/>
                                </svg>

                                ${movie.rating}
                            </span>

                        </div>
                    </div>

                    <div class="modal-body">

                        <div class="modal-section">
                            <div class="section-label">
                                Synopsis
                            </div>

                            <p class="modal-description">
                                ${movie.description}
                            </p>
                        </div>

                        <div class="modal-section">
                            <div class="section-label">
                                Cast
                            </div>

                            <p class="modal-description">
                                ${movie.cast}
                            </p>
                        </div>

                        <div class="modal-section">
                            <div class="section-label">
                                Director
                            </div>

                            <p class="modal-description">
                                ${movie.director}
                            </p>
                        </div>

                        <div class="modal-section">
                            <div class="section-label">
                                Genre
                            </div>

                            <div class="modal-tags">
                                <span class="tag">
                                    ${movie.genre}
                                </span>
                            </div>
                        </div>

                    </div>

                    <div class="modal-footer">

                        <button
                            class="modal-btn primary"
                            id="modalPlayBtn"
                            data-movie-id="${movieId}">

                            <svg
                                viewBox="0 0 20 20"
                                fill="currentColor">

                                <path d="M6 4L15 10L6 16V4Z"/>
                            </svg>

                            Play Movie
                        </button>

                        <button
                            class="modal-btn secondary ${isFavorited ? 'favorited' : ''}"
                            id="modalFavoriteBtn"
                            data-movie-id="${movieId}">

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

                            ${isFavorited
                                ? 'Favorited'
                                : 'Add to Favorites'}
                        </button>

                    </div>
                </div>
            </div>
        `;

        const modalContainer =
            document.getElementById('movieModal');

        if (!modalContainer) return;

        modalContainer.innerHTML = modalHTML;
        modalContainer.style.display = 'block';

        document
            .getElementById('modalClose')
            .addEventListener('click', () => {
                this.closeMovieModal();
            });

        document
            .getElementById('movieModalOverlay')
            .addEventListener('click', (e) => {
                if (e.target.id === 'movieModalOverlay') {
                    this.closeMovieModal();
                }
            });

        document
            .getElementById('modalPlayBtn')
            .addEventListener('click', () => {
                this.playMovie(movieId);
                this.closeMovieModal();
            });

        document
            .getElementById('modalFavoriteBtn')
            .addEventListener('click', () => {
                this.toggleMovieFavorite(movieId);
            });

        document.body.style.overflow = 'hidden';
    }

    /**
     * Close movie modal
     */
    closeMovieModal() {
        const modalContainer =
            document.getElementById('movieModal');

        if (!modalContainer) return;

        modalContainer.style.display = 'none';
        modalContainer.innerHTML = '';

        document.body.style.overflow = '';
    }

    /**
     * Play movie
     */
    playMovie(movieId) {
        const movie =
            window.moviesManager.getMovieById(movieId);

        if (!movie) return;

        window.moviesManager.addToRecent(movieId);

        alert(
            `Playing: ${movie.title}\n\n` +
            `In a full implementation, this would open a dedicated movie player.\n\n` +
            `For this demo, the video player is integrated with Live TV.`
        );
    }

    /**
     * Toggle movie favorite
     */
    toggleMovieFavorite(movieId) {
        window.moviesManager.toggleFavorite(movieId);

        this.closeMovieModal();
        this.showMovieModal(movieId);

        this.renderMovies();
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

    handleSearch(query) {
        if (query.length < 2) return;

        console.log('Searching for:', query);
    }

    openMobileMenu() {
        this.sidebar.classList.add('active');
        this.mobileOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeMobileMenu() {
        this.sidebar.classList.remove('active');
        this.mobileOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    logout() {
        if (confirm('Are you sure you want to logout?')) {
            this.storage.logout();
            window.location.href = 'login.html';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
```
