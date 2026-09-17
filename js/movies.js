// MYTV Movies (VOD) - v15

class MoviesManager {
    constructor() {
        this.allMovies = [];
        this.categories = [];
        this.currentCategory = 'all';
        this.searchQuery = '';
        this.currentMovie = null;
    }

    async init() {
        await this.loadCategories();
        await this.loadMovies();
        this.renderCategories();
        this.renderMovies();
        this.attachEventListeners();
    }

    async loadCategories() {
        try {
            const categories = await XtreamAPI.getVODCategories();
            this.categories = categories || [];
            console.log('Loaded VOD categories:', this.categories.length);
        } catch (error) {
            console.error('Failed to load VOD categories:', error);
            this.categories = [];
        }
    }

    async loadMovies(categoryId = null) {
        try {
            const movies = await XtreamAPI.getVODStreams(categoryId);
            this.allMovies = movies || [];
            console.log('Loaded movies:', this.allMovies.length);
        } catch (error) {
            console.error('Failed to load movies:', error);
            this.allMovies = [];
            this.showError('Failed to load movies. Please try again.');
        }
    }

    renderCategories() {
        const container = document.getElementById('movie-categories');
        if (!container) return;

        const categories = [
            { category_id: 'all', category_name: 'All Movies' },
            ...this.categories
        ];

        container.innerHTML = categories.map(cat => `
            <button class="category-btn ${cat.category_id === this.currentCategory ? 'active' : ''}" 
                    data-category="${cat.category_id}">
                ${this.escapeHtml(cat.category_name)}
            </button>
        `).join('');
    }

    renderMovies() {
        const container = document.getElementById('movies-grid');
        if (!container) return;

        let movies = this.allMovies;

        // Apply search filter
        if (this.searchQuery) {
            movies = movies.filter(m => 
                m.name.toLowerCase().includes(this.searchQuery.toLowerCase())
            );
        }

        if (movies.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <p>No movies found</p>
                </div>
            `;
            return;
        }

        container.innerHTML = movies.map(movie => {
            const isFavorite = window.favoritesManager && 
                              favoritesManager.isFavorite(movie.stream_id, 'movie');

            return `
                <div class="movie-card" data-movie-id="${movie.stream_id}">
                    <div class="movie-poster">
                        ${movie.stream_icon ? 
                            `<img src="${this.escapeHtml(movie.stream_icon)}" 
                                  alt="${this.escapeHtml(movie.name)}"
                                  onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 300 450%22><rect fill=%22%23e0e7ff%22 width=%22300%22 height=%22450%22/><text x=%2250%%22 y=%2250%%22 font-size=%2260%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%236366f1%22>🎬</text></svg>'">` 
                            : `<div class="movie-placeholder">🎬</div>`
                        }
                        <div class="movie-overlay">
                            <button class="play-btn-overlay" onclick="moviesManager.playMovie(${movie.stream_id})">
                                <svg width="48" height="48" viewBox="0 0 48 48">
                                    <circle cx="24" cy="24" r="24" fill="rgba(255,255,255,0.9)"/>
                                    <path d="M18 12L36 24L18 36V12Z" fill="#6366f1"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="movie-info">
                        <h3 class="movie-title">${this.escapeHtml(movie.name)}</h3>
                        <div class="movie-meta">
                            ${movie.rating ? `<span class="rating">⭐ ${movie.rating}</span>` : ''}
                            ${movie.category_name ? `<span class="genre">${this.escapeHtml(movie.category_name)}</span>` : ''}
                        </div>
                        <div class="movie-actions">
                            <button class="action-btn" onclick="moviesManager.showMovieDetails(${movie.stream_id})">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="2" fill="none"/>
                                    <path d="M8 6V8M8 10H8.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                </svg>
                                Info
                            </button>
                            <button class="action-btn favorite-btn ${isFavorite ? 'active' : ''}" 
                                    onclick="moviesManager.toggleFavorite(${movie.stream_id})">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="${isFavorite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.5">
                                    <path d="M8 2.5L9.5 6.5L14 7L11 10L12 14.5L8 12L4 14.5L5 10L2 7L6.5 6.5L8 2.5Z"/>
                                </svg>
                                ${isFavorite ? 'Favorited' : 'Favorite'}
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    async playMovie(movieId) {
        try {
            const movie = this.allMovies.find(m => m.stream_id === movieId);
            if (!movie) {
                console.error('Movie not found:', movieId);
                return;
            }

            // Get stream URL from backend - FIXED: Added await
            const streamUrl = await XtreamAPI.getVODStreamUrl(movieId, movie.container_extension || 'mp4');

            if (!streamUrl) {
                throw new Error('Failed to get stream URL');
            }

            // Track in recently watched
            if (window.recentlyWatchedManager) {
                recentlyWatchedManager.addItem({
                    id: movie.stream_id,
                    type: 'movie',
                    title: movie.name,
                    thumbnail: movie.stream_icon || '',
                    category: movie.category_name || 'Movies'
                });
            }

            // Play in video player
            if (window.videoPlayer) {
                videoPlayer.play({
                    url: streamUrl,
                    title: movie.name,
                    type: 'vod',
                    poster: movie.stream_icon || ''
                });
            }

        } catch (error) {
            console.error('Failed to play movie:', error);
            this.showError('Failed to play movie. Please try again.');
        }
    }

    async showMovieDetails(movieId) {
        try {
            const movie = this.allMovies.find(m => m.stream_id === movieId);
            if (!movie) return;

            // Get detailed info from backend
            const movieInfo = await XtreamAPI.getVODInfo(movieId);
            
            this.currentMovie = { ...movie, ...movieInfo };
            this.openModal();

        } catch (error) {
            console.error('Failed to load movie details:', error);
            // Show basic info from cached data
            this.currentMovie = this.allMovies.find(m => m.stream_id === movieId);
            this.openModal();
        }
    }

    openModal() {
        if (!this.currentMovie) return;

        const modal = document.getElementById('movie-modal');
        if (!modal) return;

        const info = this.currentMovie.info || this.currentMovie;
        const isFavorite = window.favoritesManager && 
                          favoritesManager.isFavorite(this.currentMovie.stream_id, 'movie');

        document.getElementById('modal-poster').src = this.currentMovie.stream_icon || 
            'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 450"><rect fill="#e0e7ff" width="300" height="450"/><text x="50%" y="50%" font-size="60" text-anchor="middle" dy=".3em" fill="#6366f1">🎬</text></svg>';
        
        document.getElementById('modal-title').textContent = this.currentMovie.name;
        document.getElementById('modal-rating').textContent = info.rating || 'N/A';
        document.getElementById('modal-year').textContent = info.releasedate || info.year || 'N/A';
        document.getElementById('modal-duration').textContent = info.duration || 'N/A';
        document.getElementById('modal-genre').textContent = info.genre || this.currentMovie.category_name || 'N/A';
        document.getElementById('modal-plot').textContent = info.plot || info.description || 'No description available.';
        
        const favoriteBtn = document.getElementById('modal-favorite-btn');
        favoriteBtn.className = `modal-action-btn ${isFavorite ? 'active' : ''}`;
        favoriteBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 16 16" fill="${isFavorite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.5">
                <path d="M8 2.5L9.5 6.5L14 7L11 10L12 14.5L8 12L4 14.5L5 10L2 7L6.5 6.5L8 2.5Z"/>
            </svg>
            ${isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
        `;

        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        const modal = document.getElementById('movie-modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
        this.currentMovie = null;
    }

    playCurrentMovie() {
        if (this.currentMovie) {
            this.playMovie(this.currentMovie.stream_id);
            this.closeModal();
        }
    }

    toggleFavoriteModal() {
        if (this.currentMovie && window.favoritesManager) {
            favoritesManager.toggleFavorite({
                id: this.currentMovie.stream_id,
                type: 'movie',
                title: this.currentMovie.name,
                thumbnail: this.currentMovie.stream_icon || '',
                category: this.currentMovie.category_name || 'Movies'
            });
            
            // Update button
            const favoriteBtn = document.getElementById('modal-favorite-btn');
            const isFavorite = favoritesManager.isFavorite(this.currentMovie.stream_id, 'movie');
            favoriteBtn.className = `modal-action-btn ${isFavorite ? 'active' : ''}`;
            favoriteBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 16 16" fill="${isFavorite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.5">
                    <path d="M8 2.5L9.5 6.5L14 7L11 10L12 14.5L8 12L4 14.5L5 10L2 7L6.5 6.5L8 2.5Z"/>
                </svg>
                ${isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
            `;
            
            // Refresh movie grid if needed
            this.renderMovies();
        }
    }

    toggleFavorite(movieId) {
        const movie = this.allMovies.find(m => m.stream_id === movieId);
        if (movie && window.favoritesManager) {
            favoritesManager.toggleFavorite({
                id: movie.stream_id,
                type: 'movie',
                title: movie.name,
                thumbnail: movie.stream_icon || '',
                category: movie.category_name || 'Movies'
            });
            this.renderMovies();
        }
    }

    async filterByCategory(categoryId) {
        this.currentCategory = categoryId;
        
        if (categoryId === 'all') {
            await this.loadMovies(null);
        } else {
            await this.loadMovies(categoryId);
        }
        
        this.renderCategories();
        this.renderMovies();
    }

    searchMovies(query) {
        this.searchQuery = query;
        this.renderMovies();
    }

    attachEventListeners() {
        // Category filter
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('category-btn')) {
                const categoryId = e.target.dataset.category;
                this.filterByCategory(categoryId);
            }
        });

        // Search in global search bar
        const searchInput = document.getElementById('global-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                if (window.location.hash === '#movies') {
                    this.searchMovies(e.target.value);
                }
            });
        }

        // Modal close button
        const closeBtn = document.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }

        // Modal backdrop click
        const modal = document.getElementById('movie-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }

        // Modal play button
        const modalPlayBtn = document.getElementById('modal-play-btn');
        if (modalPlayBtn) {
            modalPlayBtn.addEventListener('click', () => this.playCurrentMovie());
        }

        // Modal favorite button
        const modalFavoriteBtn = document.getElementById('modal-favorite-btn');
        if (modalFavoriteBtn) {
            modalFavoriteBtn.addEventListener('click', () => this.toggleFavoriteModal());
        }
    }

    showError(message) {
        const container = document.getElementById('movies-grid');
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <p>${this.escapeHtml(message)}</p>
                </div>
            `;
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize on app load
let moviesManager;
if (window.location.pathname.includes('app.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        moviesManager = new MoviesManager();
    });
}
