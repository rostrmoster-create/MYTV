// Movies Manager - v12
class MovieManager {
    constructor() {
        this.allMovies = [];
        this.filteredMovies = [];
        this.genres = new Set();
    }

    async loadMovies() {
        try {
            const apiMovies = await APIClient.getVODStreams();
            
            if (apiMovies && apiMovies.length > 0) {
                this.allMovies = apiMovies;
            } else {
                this.allMovies = this.getDemoMovies();
            }
        } catch (error) {
            console.error('Error loading movies:', error);
            this.allMovies = this.getDemoMovies();
        }

        this.extractGenres();
        this.filteredMovies = [...this.allMovies];
        this.renderMovies();
        this.setupFilters();
    }

    getDemoMovies() {
        return [
            {
                id: 'm1',
                title: 'The Shawshank Redemption',
                poster: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
                year: '1994',
                genre: 'Drama',
                rating: '9.3',
                duration: '142 min',
                description: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
                stream_url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8'
            },
            {
                id: 'm2',
                title: 'The Godfather',
                poster: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
                year: '1972',
                genre: 'Crime',
                rating: '9.2',
                duration: '175 min',
                description: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
                stream_url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8'
            },
            {
                id: 'm3',
                title: 'The Dark Knight',
                poster: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
                year: '2008',
                genre: 'Action',
                rating: '9.0',
                duration: '152 min',
                description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest tests.',
                stream_url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8'
            },
            {
                id: 'm4',
                title: 'Pulp Fiction',
                poster: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
                year: '1994',
                genre: 'Crime',
                rating: '8.9',
                duration: '154 min',
                description: 'The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.',
                stream_url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8'
            },
            {
                id: 'm5',
                title: 'Forrest Gump',
                poster: 'https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg',
                year: '1994',
                genre: 'Drama',
                rating: '8.8',
                duration: '142 min',
                description: 'The presidencies of Kennedy and Johnson unfold through the perspective of an Alabama man with an IQ of 75.',
                stream_url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8'
            },
            {
                id: 'm6',
                title: 'Inception',
                poster: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
                year: '2010',
                genre: 'Sci-Fi',
                rating: '8.8',
                duration: '148 min',
                description: 'A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea.',
                stream_url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8'
            },
            {
                id: 'm7',
                title: 'The Matrix',
                poster: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
                year: '1999',
                genre: 'Sci-Fi',
                rating: '8.7',
                duration: '136 min',
                description: 'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.',
                stream_url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8'
            },
            {
                id: 'm8',
                title: 'Interstellar',
                poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
                year: '2014',
                genre: 'Sci-Fi',
                rating: '8.6',
                duration: '169 min',
                description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
                stream_url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8'
            },
            {
                id: 'm9',
                title: 'The Lion King',
                poster: 'https://image.tmdb.org/t/p/w500/sKCr78MXSLixwmZ8DyJLrpMsd15.jpg',
                year: '1994',
                genre: 'Animation',
                rating: '8.5',
                duration: '88 min',
                description: 'Lion prince Simba flees his kingdom only to learn the true meaning of responsibility and bravery.',
                stream_url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8'
            },
            {
                id: 'm10',
                title: 'Gladiator',
                poster: 'https://image.tmdb.org/t/p/w500/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg',
                year: '2000',
                genre: 'Action',
                rating: '8.5',
                duration: '155 min',
                description: 'A former Roman General sets out to exact vengeance against the corrupt emperor who murdered his family.',
                stream_url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8'
            },
            {
                id: 'm11',
                title: 'Titanic',
                poster: 'https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg',
                year: '1997',
                genre: 'Romance',
                rating: '7.9',
                duration: '194 min',
                description: 'A seventeen-year-old aristocrat falls in love with a kind but poor artist aboard the luxurious, ill-fated R.M.S. Titanic.',
                stream_url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8'
            },
            {
                id: 'm12',
                title: 'Avengers: Endgame',
                poster: 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
                year: '2019',
                genre: 'Action',
                rating: '8.4',
                duration: '181 min',
                description: 'After the devastating events, the Avengers assemble once more to reverse Thanos\' actions and restore balance.',
                stream_url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8'
            }
        ];
    }

    extractGenres() {
        this.genres.clear();
        this.allMovies.forEach(movie => {
            if (movie.genre) {
                this.genres.add(movie.genre);
            }
        });

        const genreFilter = document.getElementById('genreFilter');
        if (genreFilter) {
            genreFilter.innerHTML = '<option value="all">All Genres</option>';
            Array.from(this.genres).sort().forEach(genre => {
                genreFilter.innerHTML += `<option value="${genre}">${genre}</option>`;
            });
        }
    }

    renderMovies() {
        const container = document.getElementById('moviesContent');
        if (!container) return;

        if (this.filteredMovies.length === 0) {
            container.innerHTML = '<div class="loading">No movies found</div>';
            return;
        }

        const html = this.filteredMovies.map(movie => `
            <div class="movie-card" onclick="window.movieManager.showMovieDetails(${JSON.stringify(movie).replace(/"/g, '&quot;')})">
                <div class="movie-poster">
                    <img src="${movie.poster}" alt="${movie.title}" onerror="this.src='assets/placeholder.jpg'">
                    <div class="movie-overlay">
                        <button class="play-btn">▶ Play</button>
                    </div>
                </div>
                <div class="movie-info">
                    <h3>${movie.title}</h3>
                    <div class="movie-meta">
                        <span>⭐ ${movie.rating || 'N/A'}</span>
                        <span>${movie.year || 'N/A'}</span>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = html;
    }

    showMovieDetails(movie) {
        // Add to recently watched when viewing details
        if (typeof window.addToRecentlyWatched === 'function') {
            window.addToRecentlyWatched({
                type: 'movie',
                id: movie.id,
                title: movie.title,
                poster: movie.poster,
                year: movie.year,
                genre: movie.genre,
                rating: movie.rating
            });
        }

        const isFavorite = this.isFavorite(movie.id);
        
        const modal = document.getElementById('detailModal');
        const modalBody = document.getElementById('modalBody');
        
        modalBody.innerHTML = `
            <div class="movie-detail">
                <div class="movie-detail-poster">
                    <img src="${movie.poster}" alt="${movie.title}" onerror="this.src='assets/placeholder.jpg'">
                </div>
                <div class="movie-detail-content">
                    <h2>${movie.title}</h2>
                    <div class="movie-detail-meta">
                        <span class="rating">⭐ ${movie.rating || 'N/A'}</span>
                        <span>${movie.year || 'N/A'}</span>
                        <span>${movie.duration || 'N/A'}</span>
                        <span class="genre-badge">${movie.genre || 'General'}</span>
                    </div>
                    <p class="movie-description">${movie.description || 'No description available.'}</p>
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
        // Update recently watched (playing, not just viewing)
        if (typeof window.addToRecentlyWatched === 'function') {
            window.addToRecentlyWatched({
                type: 'movie',
                id: movie.id,
                title: movie.title,
                poster: movie.poster,
                year: movie.year,
                genre: movie.genre,
                rating: movie.rating
            });
        }

        closeModal();
        
        if (movie.stream_url && window.playerManager) {
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

                window.playerManager.playStream(movie.stream_url);
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
                poster: movie.poster,
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
            genreFilter.addEventListener('change', () => this.applyFilters());
        }
    }

    applyFilters() {
        const searchQuery = document.getElementById('movieSearch')?.value.toLowerCase() || '';
        const selectedGenre = document.getElementById('genreFilter')?.value || 'all';

        this.filteredMovies = this.allMovies.filter(movie => {
            const matchesSearch = movie.title.toLowerCase().includes(searchQuery) ||
                                (movie.description && movie.description.toLowerCase().includes(searchQuery));
            const matchesGenre = selectedGenre === 'all' || movie.genre === selectedGenre;
            
            return matchesSearch && matchesGenre;
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
