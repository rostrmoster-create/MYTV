// movies.js - Movies/VOD Management with Real API

class MoviesManager {
    constructor() {
        this.movies = [];
        this.categories = [];
        this.currentCategory = 'all';
        this.favorites = new Set(StorageManager.getFavorites('movies'));
        this.searchTerm = '';
        this.init();
    }

    async init() {
        await this.loadMovies();
        this.renderCategories();
        this.renderMovies();
        this.setupEventListeners();
    }

    async loadMovies() {
        try {
            // Show loading state
            const moviesGrid = document.getElementById('moviesGrid');
            if (moviesGrid) {
                moviesGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #64748b;"><div style="font-size: 18px; margin-bottom: 10px;">Loading movies...</div><div style="font-size: 14px;">Please wait while we fetch your content</div></div>';
            }

            // Get categories first
            const categoriesData = await API.getVODCategories();
            console.log('Movie categories loaded:', categoriesData);

            // Get all VOD streams
            const streamsData = await API.getVODStreams();
            console.log('Movies loaded:', streamsData);

            if (!streamsData || streamsData.length === 0) {
                throw new Error('No movies available');
            }

            // Transform API data to our format
            this.movies = streamsData.map(stream => ({
                id: stream.stream_id,
                title: stream.name,
                cover: stream.stream_icon || stream.cover_big || 'https://via.placeholder.com/300x450/e0e7ff/4f46e5?text=' + encodeURIComponent(stream.name.substring(0, 2)),
                genre: this.getCategoryName(stream.category_id, categoriesData),
                categoryId: stream.category_id,
                year: stream.releasedate ? new Date(stream.releasedate).getFullYear() : 'N/A',
                rating: stream.rating ? parseFloat(stream.rating).toFixed(1) : 'N/A',
                description: stream.plot || 'No description available',
                duration: stream.duration || 'N/A',
                streamUrl: API.buildVODStreamUrl(stream.stream_id, stream.container_extension || 'mp4'),
                container_extension: stream.container_extension
            }));

            // Build categories list
            this.buildCategories(categoriesData);

            console.log(`Loaded ${this.movies.length} movies in ${this.categories.length} categories`);

        } catch (error) {
            console.error('Error loading movies:', error);
            
            // Show error message
            const moviesGrid = document.getElementById('moviesGrid');
            if (moviesGrid) {
                moviesGrid.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                        <div style="color: #ef4444; font-size: 18px; margin-bottom: 10px;">⚠️ Failed to load movies</div>
                        <div style="color: #64748b; font-size: 14px; margin-bottom: 20px;">${error.message}</div>
                        <button onclick="location.reload()" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500;">Retry</button>
                    </div>
                `;
            }
        }
    }

    getCategoryName(categoryId, categories) {
        if (!categories || categories.length === 0) return 'Other';
        const category = categories.find(cat => cat.category_id === categoryId);
        return category ? category.category_name : 'Other';
    }

    buildCategories(categoriesData) {
        // Create categories from the API data
        const categorySet = new Set();
        
        if (categoriesData && categoriesData.length > 0) {
            categoriesData.forEach(cat => {
                categorySet.add(cat.category_name);
            });
        }

        // Add categories from movies as fallback
        this.movies.forEach(movie => {
            if (movie.genre) {
                categorySet.add(movie.genre);
            }
        });

        this.categories = ['All Movies', ...Array.from(categorySet).sort()];
    }

    renderCategories() {
        const container = document.getElementById('movieGenres');
        if (!container) return;

        container.innerHTML = this.categories.map(category => `
            <button class="genre-btn ${this.currentCategory === category.toLowerCase().replace(/ /g, '-') || (category === 'All Movies' && this.currentCategory === 'all') ? 'active' : ''}" 
                    data-genre="${category === 'All Movies' ? 'all' : category.toLowerCase().replace(/ /g, '-')}">
                ${category}
            </button>
        `).join('');
    }

    renderMovies() {
        const container = document.getElementById('moviesGrid');
        if (!container) return;

        const filteredMovies = this.getFilteredMovies();

        if (filteredMovies.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #64748b;">
                    <div style="font-size: 48px; margin-bottom: 16px;">🎬</div>
                    <div style="font-size: 18px; margin-bottom: 8px;">No movies found</div>
                    <div style="font-size: 14px;">Try a different category or search term</div>
                </div>
            `;
            return;
        }

        container.innerHTML = filteredMovies.map(movie => `
            <div class="movie-card" data-movie-id="${movie.id}">
                <div class="movie-poster">
                    <img src="${movie.cover}" alt="${movie.title}"
                         onerror="this.src='https://via.placeholder.com/300x450/e0e7ff/4f46e5?text=${encodeURIComponent(movie.title.substring(0, 2))}'">
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
                <button class="favorite-btn ${this.favorites.has(movie.id) ? 'active' : ''}" 
                        data-movie-id="${movie.id}"
                        title="${this.favorites.has(movie.id) ? 'Remove from favorites' : 'Add to favorites'}">
                    <span class="favorite-icon">${this.favorites.has(movie.id) ? '★' : '☆'}</span>
                </button>
            </div>
        `).join('');
    }

    getFilteredMovies() {
        return this.movies.filter(movie => {
            const matchesCategory = this.currentCategory === 'all' || 
                                   movie.genre.toLowerCase().replace(/ /g, '-') === this.currentCategory;
            const matchesSearch = !this.searchTerm || 
                                 movie.title.toLowerCase().includes(this.searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }

    setupEventListeners() {
        // Genre buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('genre-btn')) {
                document.querySelectorAll('.genre-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                this.currentCategory = e.target.dataset.genre;
                this.renderMovies();
            }

            // Play button
            if (e.target.closest('.play-btn')) {
                const card = e.target.closest('.movie-card');
                const movieId = parseInt(card.dataset.movieId);
                this.playMovie(movieId);
            }

            // Info button
            if (e.target.closest('.info-btn')) {
                const card = e.target.closest('.movie-card');
                const movieId = parseInt(card.dataset.movieId);
                this.showMovieDetails(movieId);
            }

            // Favorite buttons
            if (e.target.closest('.favorite-btn')) {
                e.stopPropagation();
                const btn = e.target.closest('.favorite-btn');
                const movieId = parseInt(btn.dataset.movieId);
                this.toggleFavorite(movieId);
            }

            // Close modal
            if (e.target.classList.contains('modal') || e.target.classList.contains('close-modal')) {
                this.closeModal();
            }
        });

        // Search
        const searchInput = document.getElementById('movieSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value;
                this.renderMovies();
            });
        }
    }

    playMovie(movieId) {
        const movie = this.movies.find(m => m.id === movieId);
        if (!movie) return;

        // Add to recently watched
        StorageManager.addToRecentlyWatched('movie', {
            id: movie.id,
            title: movie.title,
            cover: movie.cover,
            genre: movie.genre,
            year: movie.year,
            rating: movie.rating
        });

        // Close modal if open
        this.closeModal();

        // Show player section
        const playerSection = document.getElementById('playerSection');
        const moviesSection = document.getElementById('moviesSection');
        
        if (playerSection && moviesSection) {
            playerSection.style.display = 'block';
            moviesSection.style.display = 'none';
        }

        // Initialize or update player
        if (window.videoPlayer) {
            window.videoPlayer.loadMovie(movie);
        } else {
            window.videoPlayer = new VideoPlayer();
            window.videoPlayer.loadMovie(movie);
        }
    }

    showMovieDetails(movieId) {
        const movie = this.movies.find(m => m.id === movieId);
        if (!movie) return;

        const modal = document.getElementById('movieModal');
        if (!modal) return;

        document.getElementById('modalPoster').src = movie.cover;
        document.getElementById('modalTitle').textContent = movie.title;
        document.getElementById('modalYear').textContent = movie.year;
        document.getElementById('modalRating').textContent = movie.rating !== 'N/A' ? `⭐ ${movie.rating}` : '';
        document.getElementById('modalGenre').textContent = movie.genre;
        document.getElementById('modalDuration').textContent = movie.duration;
        document.getElementById('modalDescription').textContent = movie.description;

        const playButton = document.getElementById('modalPlayButton');
        playButton.onclick = () => this.playMovie(movieId);

        modal.classList.add('active');
    }

    closeModal() {
        const modal = document.getElementById('movieModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    toggleFavorite(movieId) {
        if (this.favorites.has(movieId)) {
            this.favorites.delete(movieId);
        } else {
            this.favorites.add(movieId);
        }

        StorageManager.saveFavorites('movies', Array.from(this.favorites));
        this.renderMovies();
    }

    getMovie(movieId) {
        return this.movies.find(m => m.id === movieId);
    }
}

// Initialize when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (document.getElementById('moviesGrid')) {
            window.moviesManager = new MoviesManager();
        }
    });
} else {
    if (document.getElementById('moviesGrid')) {
        window.moviesManager = new MoviesManager();
    }
}
