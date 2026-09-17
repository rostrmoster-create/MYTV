// Movies Manager - v13 (Real Xtream Codes API)
class MovieManager {
    constructor() {
        this.allMovies = [];
        this.categories = [];
        this.filteredMovies = [];
        this.selectedCategory = null;
    }

    async loadMovies() {
        const container = document.getElementById('moviesContent');
        if (container) {
            container.innerHTML = '<div class="loading">Loading movies from your server...</div>';
        }

        try {
            // Check authentication
            if (!XtreamAPI.isAuthenticated()) {
                if (container) {
                    container.innerHTML = '<div class="loading">Please login to view movies</div>';
                }
                return;
            }

            // Load categories
            this.categories = await XtreamAPI.getVODCategories();
            
            // Load all VOD streams
            const streams = await XtreamAPI.getVODStreams();
            
            if (!streams || streams.length === 0) {
                if (container) {
                    container.innerHTML = '<div class="loading">No movies available in your account</div>';
                }
                return;
            }

            // Map streams to movie format
            this.allMovies = streams.map(stream => ({
                id: stream.stream_id || stream.num,
                num: stream.num,
                name: stream.name,
                title: stream.name,
                stream_icon: stream.stream_icon,
                poster: stream.stream_icon,
                category_id: stream.category_id,
                category_name: stream.category_name,
                container_extension: stream.container_extension || 'mp4',
                rating: stream.rating || 'N/A',
                rating_5based: stream.rating_5based,
                added: stream.added,
                year: this.extractYear(stream.name),
                genre: stream.category_name,
                description: stream.plot || stream.description || 'No description available'
            }));

            this.filteredMovies = [...this.allMovies];
            this.renderCategoryFilter();
            this.renderMovies();
            this.setupFilters();

            console.log(`Loaded ${this.allMovies.length} movies from Xtream API`);
        } catch (error) {
            console.error('Error loading movies:', error);
            if (container) {
                container.innerHTML = '<div class="loading">Error loading movies. Please check your connection.</div>';
            }
        }
    }

    extractYear(title) {
        const match = title.match(/\((\d{4})\)/);
        return match ? match[1] : '';
    }

    renderCategoryFilter() {
        const genreFilter = document.getElementById('genreFilter');
        if (!genreFilter || this.categories.length === 0) return;

        genreFilter.innerHTML = '<option value="">All Categories</option>';
        this.categories.forEach(cat => {
            genreFilter.innerHTML += `<option value="${cat.category_id}">${cat.category_name}</option>`;
        });
    }

    renderMovies() {
        const container = document.getElementById('moviesContent');
        if (!container) return;

        if (this.filteredMovies.length === 0) {
            container.innerHTML = '<div class="loading">No movies found</div>';
            return;
        }

        const html = this.filteredMovies.map(movie => {
            const poster = movie.poster || movie.stream_icon || 'assets/placeholder.jpg';
            
            return `
                <div class="movie-card" onclick="window.movieManager.showMovieDetails(${JSON.stringify(movie).replace(/"/g, '&quot;')})">
                    <div class="movie-poster">
                        <img src="${poster}" alt="${movie.title}" onerror="this.src='assets/placeholder.jpg'">
                        <div class="movie-overlay">
                            <button class="play-btn">▶ Play</button>
                        </div>
                    </div>
                    <div class="movie-info">
                        <h3>${movie.title}</h3>
                        <div class="movie-meta">
                            <span>⭐ ${movie.rating}</span>
                            ${movie.year ? `<span>${movie.year}</span>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    }

    async showMovieDetails(movie) {
        // Add to recently watched
        if (typeof window.addToRecentlyWatched === 'function') {
            window.addToRecentlyWatched({
                type: 'movie',
                id: movie.id,
                title: movie.title,
                poster: movie.poster || movie.stream_icon,
                year: movie.year,
                genre: movie.genre,
                rating: movie.rating
            });
        }

        const isFavorite = this.isFavorite(movie.id);
        
        // Try to get detailed info
        let detailedInfo = null;
        try {
            detailedInfo = await XtreamAPI.getVODInfo(movie.id);
        } catch (error) {
            console.log('Could not fetch detailed info:', error);
        }

        const description = detailedInfo?.info?.plot || movie.description || 'No description available';
        const duration = detailedInfo?.info?.duration || movie.duration || 'N/A';
        const poster = movie.poster || movie.stream_icon || 'assets/placeholder.jpg';
        
        const modal = document.getElementById('detailModal');
        const modalBody = document.getElementById('modalBody');
        
        modalBody.innerHTML = `
            <div class="movie-detail">
                <div class="movie-detail-poster">
                    <img src="${poster}" alt="${movie.title}" onerror="this.src='assets/placeholder.jpg'">
                </div>
                <div class="movie-detail-content">
                    <h2>${movie.title}</h2>
                    <div class="movie-detail-meta">
                        <span class="rating">⭐ ${movie.rating}</span>
                        ${movie.year ? `<span>${movie.year}</span>` : ''}
                        <span>${duration}</span>
                        ${movie.genre ? `<span class="genre-badge">${movie.genre}</span>` : ''}
                    </div>
                    <p class="movie-description">${description}</p>
                    <div class="movie-actions">
                        <button class="action-btn primary" onclick="window.movieManager.playMovie(${JSON.stringify(movie).replace(/"/g, '&quot;')})">
                            ▶ Play Movie
                        </button>
                        <button class="action-btn ${isFavorite ? 'active' : ''}" onclick="window.movieManager.toggleFavorite(${JSON.stringify(movie).replace(/"/g, '&quot;')})">
                            ${isFavorite ? '❤️ Remove from Favorites' : '🤍 Add to Favorites'}
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        modal.style.display = 'block';
    }

    playMovie(movie) {
        // Update recently watched
        if (typeof window.addToRecentlyWatched === 'function') {
            window.addToRecentlyWatched({
                type: 'movie',
                id: movie.id,
                title: movie.title,
                poster: movie.poster || movie.stream_icon,
                year: movie.year,
                genre: movie.genre,
                rating: movie.rating
            });
        }

        closeModal();
        
        // Get stream URL from API
        const streamUrl = XtreamAPI.getVODStreamUrl(movie.id, movie.container_extension);
        
        if (streamUrl && window.playerManager) {
            showSection('livetv');
            setTimeout(() => {
                const channelInfo = document.getElementById('channelInfo');
                const channelName = document.getElementById('currentChannelName');
                const playerOverlay = document.getElementById('playerOverlay');

                if (channelInfo && channelName) {
                    channelName.textContent = movie.title;
                    channelInfo.style.display = 'block';
                }

                if (playerOverlay) {
                    playerOverlay.style.display = 'none';
                }

                window.playerManager.playStream(streamUrl);
                console.log('Playing movie:', movie.title);
            }, 100);
        } else {
            alert('Stream not available for this movie.');
        }
    }

    toggleFavorite(movie) {
        const favorites = StorageManager.get('favorites') || [];
        const index = favorites.findIndex(f => f.type === 'movie' && f.id === movie.id);
        
        if (index > -1) {
            favorites.splice(index, 1);
        } else {
            favorites.push({
                type: 'movie',
                id: movie.id,
                title: movie.title,
                poster: movie.poster || movie.stream_icon,
                year: movie.year,
                genre: movie.genre,
                rating: movie.rating
            });
        }
        
        StorageManager.set('favorites', favorites);
        this.showMovieDetails(movie);
        
        if (window.favoritesManager) {
            window.favoritesManager.loadFavorites();
        }
    }

    isFavorite(movieId) {
        const favorites = StorageManager.get('favorites') || [];
        return favorites.some(f => f.type === 'movie' && f.id === movieId);
    }

    setupFilters() {
        const searchInput = document.getElementById('movieSearch');
        const genreFilter = document.getElementById('genreFilter');

        if (searchInput) {
            searchInput.addEventListener('input', () => this.applyFilters());
        }

        if (genreFilter) {
            genreFilter.addEventListener('change', (e) => {
                this.selectedCategory = e.target.value;
                this.applyFilters();
            });
        }
    }

    applyFilters() {
        const searchQuery = document.getElementById('movieSearch')?.value.toLowerCase() || '';
        
        this.filteredMovies = this.allMovies.filter(movie => {
            const matchesSearch = !searchQuery ||
                movie.title.toLowerCase().includes(searchQuery) ||
                (movie.description && movie.description.toLowerCase().includes(searchQuery));
            
            const matchesCategory = !this.selectedCategory || 
                movie.category_id == this.selectedCategory;
            
            return matchesSearch && matchesCategory;
        });

        this.renderMovies();
    }
}

window.initMovieManager = function() {
    if (!window.movieManager) {
        window.movieManager = new MovieManager();
        window.movieManager.loadMovies();
    }
};
