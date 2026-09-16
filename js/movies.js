// movies.js - Movies/VOD Management with Real API and Demo Fallback

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
            const moviesGrid = document.getElementById('moviesGrid');
            if (moviesGrid) {
                moviesGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #64748b;"><div style="font-size: 18px; margin-bottom: 10px;">Loading movies...</div><div style="font-size: 14px;">Please wait while we fetch your content</div></div>';
            }

            console.log('Attempting to load movies from API...');

            const categoriesData = await API.getVODCategories();
            console.log('Movie categories response:', categoriesData);

            const streamsData = await API.getVODStreams();
            console.log('Movies response:', streamsData);

            if (streamsData && streamsData.length > 0) {
                this.movies = streamsData.map(stream => ({
                    id: stream.stream_id,
                    title: stream.name,
                    cover: stream.stream_icon || stream.cover_big || `https://via.placeholder.com/300x450/667eea/ffffff?text=${encodeURIComponent(stream.name.substring(0, 2))}`,
                    genre: this.getCategoryName(stream.category_id, categoriesData),
                    categoryId: stream.category_id,
                    year: stream.releasedate ? new Date(stream.releasedate).getFullYear() : 'N/A',
                    rating: stream.rating ? parseFloat(stream.rating).toFixed(1) : 'N/A',
                    description: stream.plot || 'No description available',
                    duration: stream.duration || 'N/A',
                    streamUrl: API.buildVODStreamUrl(stream.stream_id, stream.container_extension || 'mp4'),
                    container_extension: stream.container_extension
                }));

                this.buildCategories(categoriesData);
                console.log(`✓ Loaded ${this.movies.length} movies from API`);
            } else {
                throw new Error('No movies returned from API - using demo content');
            }

        } catch (error) {
            console.warn('API Error:', error.message);
            console.log('Loading demo movies as fallback...');
            this.loadDemoMovies();
        }
    }

    loadDemoMovies() {
        this.movies = [
            {
                id: 1,
                title: 'The Shawshank Redemption',
                cover: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
                genre: 'Drama',
                year: '1994',
                rating: '9.3',
                description: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
                duration: '142 min',
                streamUrl: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8'
            },
            {
                id: 2,
                title: 'The Godfather',
                cover: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
                genre: 'Crime',
                year: '1972',
                rating: '9.2',
                description: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
                duration: '175 min',
                streamUrl: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8'
            },
            {
                id: 3,
                title: 'The Dark Knight',
                cover: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
                genre: 'Action',
                year: '2008',
                rating: '9.0',
                description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests.',
                duration: '152 min',
                streamUrl: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8'
            },
            {
                id: 4,
                title: 'Pulp Fiction',
                cover: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
                genre: 'Crime',
                year: '1994',
                rating: '8.9',
                description: 'The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.',
                duration: '154 min',
                streamUrl: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8'
            },
            {
                id: 5,
                title: 'Forrest Gump',
                cover: 'https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg',
                genre: 'Drama',
                year: '1994',
                rating: '8.8',
                description: 'The presidencies of Kennedy and Johnson, the Vietnam War, and other historical events unfold from the perspective of an Alabama man.',
                duration: '142 min',
                streamUrl: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8'
            },
            {
                id: 6,
                title: 'Inception',
                cover: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
                genre: 'Sci-Fi',
                year: '2010',
                rating: '8.8',
                description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea.',
                duration: '148 min',
                streamUrl: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8'
            },
            {
                id: 7,
                title: 'The Matrix',
                cover: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
                genre: 'Sci-Fi',
                year: '1999',
                rating: '8.7',
                description: 'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.',
                duration: '136 min',
                streamUrl: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8'
            },
            {
                id: 8,
                title: 'Interstellar',
                cover: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
                genre: 'Sci-Fi',
                year: '2014',
                rating: '8.6',
                description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
                duration: '169 min',
                streamUrl: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8'
            },
            {
                id: 9,
                title: 'The Lion King',
                cover: 'https://image.tmdb.org/t/p/w500/sKCr78MXSLixwmZ8DyJLrpMsd15.jpg',
                genre: 'Animation',
                year: '1994',
                rating: '8.5',
                description: 'Lion prince Simba and his father are targeted by his bitter uncle, who wants to ascend the throne himself.',
                duration: '88 min',
                streamUrl: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8'
            },
            {
                id: 10,
                title: 'Gladiator',
                cover: 'https://image.tmdb.org/t/p/w500/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg',
                genre: 'Action',
                year: '2000',
                rating: '8.5',
                description: 'A former Roman General sets out to exact vengeance against the corrupt emperor who murdered his family and sent him into slavery.',
                duration: '155 min',
                streamUrl: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8'
            },
            {
                id: 11,
                title: 'Titanic',
                cover: 'https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg',
                genre: 'Romance',
                year: '1997',
                rating: '7.9',
                description: 'A seventeen-year-old aristocrat falls in love with a kind but poor artist aboard the luxurious, ill-fated R.M.S. Titanic.',
                duration: '194 min',
                streamUrl: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8'
            },
            {
                id: 12,
                title: 'Avengers: Endgame',
                cover: 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
                genre: 'Action',
                year: '2019',
                rating: '8.4',
                description: 'After the devastating events of Infinity War, the Avengers assemble once more to reverse Thanos actions and restore balance.',
                duration: '181 min',
                streamUrl: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8'
            }
        ];

        const categorySet = new Set(this.movies.map(m => m.genre));
        this.categories = ['All Movies', ...Array.from(categorySet).sort()];

        console.log(`✓ Loaded ${this.movies.length} demo movies`);
    }

    getCategoryName(categoryId, categories) {
        if (!categories || categories.length === 0) return 'Other';
        const category = categories.find(cat => cat.category_id === categoryId);
        return category ? category.category_name : 'Other';
    }

    buildCategories(categoriesData) {
        const categorySet = new Set();
        
        if (categoriesData && categoriesData.length > 0) {
            categoriesData.forEach(cat => {
                categorySet.add(cat.category_name);
            });
        }

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
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('genre-btn')) {
                document.querySelectorAll('.genre-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                this.currentCategory = e.target.dataset.genre;
                this.renderMovies();
            }

            if (e.target.closest('.play-btn')) {
                const card = e.target.closest('.movie-card');
                const movieId = parseInt(card.dataset.movieId);
                this.playMovie(movieId);
            }

            if (e.target.closest('.info-btn')) {
                const card = e.target.closest('.movie-card');
                const movieId = parseInt(card.dataset.movieId);
                this.showMovieDetails(movieId);
            }

            if (e.target.closest('.favorite-btn')) {
                e.stopPropagation();
                const btn = e.target.closest('.favorite-btn');
                const movieId = parseInt(btn.dataset.movieId);
                this.toggleFavorite(movieId);
            }

            if (e.target.classList.contains('modal') || e.target.classList.contains('close-modal')) {
                this.closeModal();
            }
        });

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

        StorageManager.addToRecentlyWatched('movie', {
            id: movie.id,
            title: movie.title,
            cover: movie.cover,
            genre: movie.genre,
            year: movie.year,
            rating: movie.rating
        });

        this.closeModal();

        const playerSection = document.getElementById('playerSection');
        const moviesSection = document.getElementById('moviesSection');
        
        if (playerSection && moviesSection) {
            playerSection.style.display = 'block';
            moviesSection.style.display = 'none';
        }

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
