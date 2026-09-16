// favorites.js - Enhanced Favorites Management

class FavoritesManager {
    constructor() {
        this.favoriteChannels = [];
        this.favoriteMovies = [];
        this.favoriteSeries = [];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.loadFavorites();
        this.renderFilterTabs();
        this.renderFavorites();
        this.setupEventListeners();
    }

    loadFavorites() {
        // Get favorite IDs from storage
        const channelIds = StorageManager.getFavorites('channels');
        const movieIds = StorageManager.getFavorites('movies');
        const seriesIds = StorageManager.getFavorites('series');

        // Get actual data from managers
        if (window.channelsManager && window.channelsManager.channels) {
            this.favoriteChannels = window.channelsManager.channels.filter(ch => 
                channelIds.includes(ch.id)
            );
        }

        if (window.moviesManager && window.moviesManager.movies) {
            this.favoriteMovies = window.moviesManager.movies.filter(m => 
                movieIds.includes(m.id)
            );
        }

        if (window.seriesManager && window.seriesManager.series) {
            this.favoriteSeries = window.seriesManager.series.filter(s => 
                seriesIds.includes(s.id)
            );
        }

        console.log(`Loaded favorites: ${this.favoriteChannels.length} channels, ${this.favoriteMovies.length} movies, ${this.favoriteSeries.length} series`);
    }

    renderFilterTabs() {
        const container = document.getElementById('favoritesFilter');
        if (!container) return;

        const totalFavorites = this.favoriteChannels.length + this.favoriteMovies.length + this.favoriteSeries.length;

        container.innerHTML = `
            <button class="filter-tab ${this.currentFilter === 'all' ? 'active' : ''}" data-filter="all">
                All (${totalFavorites})
            </button>
            <button class="filter-tab ${this.currentFilter === 'channels' ? 'active' : ''}" data-filter="channels">
                📺 Channels (${this.favoriteChannels.length})
            </button>
            <button class="filter-tab ${this.currentFilter === 'movies' ? 'active' : ''}" data-filter="movies">
                🎬 Movies (${this.favoriteMovies.length})
            </button>
            <button class="filter-tab ${this.currentFilter === 'series' ? 'active' : ''}" data-filter="series">
                🎭 Series (${this.favoriteSeries.length})
            </button>
        `;
    }

    renderFavorites() {
        const container = document.getElementById('favoritesContent');
        if (!container) return;

        const totalFavorites = this.favoriteChannels.length + this.favoriteMovies.length + this.favoriteSeries.length;

        if (totalFavorites === 0) {
            container.innerHTML = `
                <div class="empty-favorites">
                    <div class="empty-icon">⭐</div>
                    <h3>No Favorites Yet</h3>
                    <p>Start adding your favorite channels, movies, and series!</p>
                    <button class="explore-btn" onclick="app.showSection('channels')">
                        Explore Content
                    </button>
                </div>
            `;
            return;
        }

        let html = '';

        // Show channels
        if ((this.currentFilter === 'all' || this.currentFilter === 'channels') && this.favoriteChannels.length > 0) {
            html += `
                <div class="favorites-section">
                    <h3 class="favorites-section-title">📺 Live TV Channels</h3>
                    <div class="channels-grid">
                        ${this.favoriteChannels.map(channel => `
                            <div class="channel-card" data-channel-id="${channel.id}">
                                <div class="channel-logo">
                                    <img src="${channel.logo}" alt="${channel.name}" 
                                         onerror="this.src='https://via.placeholder.com/120x120/667eea/ffffff?text=${encodeURIComponent(channel.name.substring(0, 2))}'">
                                </div>
                                <div class="channel-info">
                                    <h3 class="channel-name">${channel.name}</h3>
                                    <p class="channel-category">${channel.category}</p>
                                </div>
                                <button class="favorite-btn active" data-type="channel" data-id="${channel.id}">
                                    <span class="favorite-icon">★</span>
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // Show movies
        if ((this.currentFilter === 'all' || this.currentFilter === 'movies') && this.favoriteMovies.length > 0) {
            html += `
                <div class="favorites-section">
                    <h3 class="favorites-section-title">🎬 Movies</h3>
                    <div class="movies-grid">
                        ${this.favoriteMovies.map(movie => `
                            <div class="movie-card" data-movie-id="${movie.id}">
                                <div class="movie-poster">
                                    <img src="${movie.cover}" alt="${movie.title}"
                                         onerror="this.src='https://via.placeholder.com/300x450/667eea/ffffff?text=${encodeURIComponent(movie.title.substring(0, 2))}'">
                                    <div class="movie-overlay">
                                        <button class="play-btn">
                                            <span class="play-icon">▶</span>
                                            <span>Play Now</span>
                                        </button>
                                        <button class="info-btn">
                                            <span>ℹ</span>
                                            <span>More Info</span>
                                        </button>
                                    </div>
                                </div>
                                <div class="movie-info">
                                    <h3 class="movie-title">${movie.title}</h3>
                                    <div class="movie-meta">
                                        <span class="movie-year">${movie.year}</span>
                                        ${movie.rating !== 'N/A' ? `<span class="movie-rating">⭐ ${movie.rating}</span>` : ''}
                                    </div>
                                </div>
                                <button class="favorite-btn active" data-type="movie" data-id="${movie.id}">
                                    <span class="favorite-icon">★</span>
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // Show series
        if ((this.currentFilter === 'all' || this.currentFilter === 'series') && this.favoriteSeries.length > 0) {
            html += `
                <div class="favorites-section">
                    <h3 class="favorites-section-title">🎭 TV Series</h3>
                    <div class="movies-grid">
                        ${this.favoriteSeries.map(show => `
                            <div class="movie-card" data-series-id="${show.id}">
                                <div class="movie-poster">
                                    <img src="${show.cover}" alt="${show.title}"
                                         onerror="this.src='https://via.placeholder.com/300x450/667eea/ffffff?text=${encodeURIComponent(show.title.substring(0, 2))}'">
                                    <div class="movie-overlay">
                                        <button class="series-info-btn">
                                            <span>ℹ</span>
                                            <span>View Episodes</span>
                                        </button>
                                    </div>
                                </div>
                                <div class="movie-info">
                                    <h3 class="movie-title">${show.title}</h3>
                                    <div class="movie-meta">
                                        <span class="movie-year">${show.year}</span>
                                        ${show.rating !== 'N/A' ? `<span class="movie-rating">⭐ ${show.rating}</span>` : ''}
                                    </div>
                                </div>
                                <button class="favorite-btn active" data-type="series" data-id="${show.id}">
                                    <span class="favorite-icon">★</span>
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        container.innerHTML = html;
    }

    setupEventListeners() {
        // Filter tabs
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-tab')) {
                document.querySelectorAll('.filter-tab').forEach(tab => tab.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.renderFavorites();
            }

            // Channel clicks
            if (e.target.closest('.channel-card') && !e.target.closest('.favorite-btn')) {
                const card = e.target.closest('.channel-card');
                const channelId = parseInt(card.dataset.channelId);
                this.playChannel(channelId);
            }

            // Movie play button
            if (e.target.closest('.play-btn')) {
                const card = e.target.closest('.movie-card');
                const movieId = parseInt(card.dataset.movieId);
                this.playMovie(movieId);
            }

            // Movie info button
            if (e.target.closest('.info-btn')) {
                const card = e.target.closest('.movie-card');
                const movieId = parseInt(card.dataset.movieId);
                this.showMovieDetails(movieId);
            }

            // Series info button
            if (e.target.closest('.series-info-btn')) {
                const card = e.target.closest('.movie-card');
                const seriesId = parseInt(card.dataset.seriesId);
                this.showSeriesDetails(seriesId);
            }

            // Favorite buttons
            if (e.target.closest('.favorite-btn')) {
                e.stopPropagation();
                const btn = e.target.closest('.favorite-btn');
                const type = btn.dataset.type;
                const id = parseInt(btn.dataset.id);
                this.removeFavorite(type, id);
            }
        });
    }

    playChannel(channelId) {
        if (window.channelsManager) {
            window.app.showSection('channels');
            setTimeout(() => {
                window.channelsManager.playChannel(channelId);
            }, 100);
        }
    }

    playMovie(movieId) {
        if (window.moviesManager) {
            window.moviesManager.playMovie(movieId);
        }
    }

    showMovieDetails(movieId) {
        if (window.moviesManager) {
            window.moviesManager.showMovieDetails(movieId);
        }
    }

    showSeriesDetails(seriesId) {
        if (window.seriesManager) {
            window.seriesManager.showSeriesDetails(seriesId);
        }
    }

    removeFavorite(type, id) {
        if (confirm('Remove from favorites?')) {
            // Remove from respective manager
            if (type === 'channel' && window.channelsManager) {
                window.channelsManager.toggleFavorite(id);
            } else if (type === 'movie' && window.moviesManager) {
                window.moviesManager.toggleFavorite(id);
            } else if (type === 'series' && window.seriesManager) {
                window.seriesManager.toggleFavorite(id);
            }

            // Reload favorites
            this.loadFavorites();
            this.renderFilterTabs();
            this.renderFavorites();
        }
    }

    refresh() {
        this.loadFavorites();
        this.renderFilterTabs();
        this.renderFavorites();
    }
}

// Initialize when favorites section is shown
window.initFavoritesManager = function() {
    if (!window.favoritesManager) {
        window.favoritesManager = new FavoritesManager();
    } else {
        window.favoritesManager.refresh();
    }
};
