// series.js - TV Series Management with Real API and Demo Fallback

class SeriesManager {
    constructor() {
        this.series = [];
        this.categories = [];
        this.currentCategory = 'all';
        this.favorites = new Set(StorageManager.getFavorites('series'));
        this.searchTerm = '';
        this.currentSeriesInfo = null;
        this.init();
    }

    async init() {
        await this.loadSeries();
        this.renderCategories();
        this.renderSeries();
        this.setupEventListeners();
    }

    async loadSeries() {
        try {
            const seriesGrid = document.getElementById('seriesGrid');
            if (seriesGrid) {
                seriesGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #64748b;"><div style="font-size: 18px; margin-bottom: 10px;">Loading series...</div><div style="font-size: 14px;">Please wait while we fetch your content</div></div>';
            }

            console.log('Attempting to load series from API...');

            const categoriesData = await API.getSeriesCategories();
            console.log('Series categories response:', categoriesData);

            const seriesData = await API.getSeries();
            console.log('Series response:', seriesData);

            if (seriesData && seriesData.length > 0) {
                this.series = seriesData.map(show => ({
                    id: show.series_id,
                    title: show.name,
                    cover: show.cover || show.cover_big || `https://via.placeholder.com/300x450/667eea/ffffff?text=${encodeURIComponent(show.name.substring(0, 2))}`,
                    genre: this.getCategoryName(show.category_id, categoriesData),
                    categoryId: show.category_id,
                    year: show.releaseDate || 'N/A',
                    rating: show.rating ? parseFloat(show.rating).toFixed(1) : 'N/A',
                    description: show.plot || 'No description available',
                    episodes: show.episode_run_time || 'N/A',
                    seasons: show.seasons || []
                }));

                this.buildCategories(categoriesData);
                console.log(`✓ Loaded ${this.series.length} series from API`);
            } else {
                throw new Error('No series returned from API - using demo content');
            }

        } catch (error) {
            console.warn('API Error:', error.message);
            console.log('Loading demo series as fallback...');
            this.loadDemoSeries();
        }
    }

    loadDemoSeries() {
        this.series = [
            {
                id: 1,
                title: 'Breaking Bad',
                cover: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
                genre: 'Crime',
                year: '2008-2013',
                rating: '9.5',
                description: 'A high school chemistry teacher diagnosed with terminal lung cancer teams up with a former student to manufacture and sell methamphetamine.',
                episodes: '45 min',
                seasons: 5
            },
            {
                id: 2,
                title: 'Game of Thrones',
                cover: 'https://image.tmdb.org/t/p/w500/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg',
                genre: 'Fantasy',
                year: '2011-2019',
                rating: '9.3',
                description: 'Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for millennia.',
                episodes: '60 min',
                seasons: 8
            },
            {
                id: 3,
                title: 'Stranger Things',
                cover: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
                genre: 'Sci-Fi',
                year: '2016-',
                rating: '8.7',
                description: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.',
                episodes: '50 min',
                seasons: 4
            },
            {
                id: 4,
                title: 'The Crown',
                cover: 'https://image.tmdb.org/t/p/w500/1M876KPjulVwppEpldhdc8V4o68.jpg',
                genre: 'Drama',
                year: '2016-',
                rating: '8.6',
                description: 'Follows the political rivalries and romance of Queen Elizabeth II reign and the events that shaped the second half of the 20th century.',
                episodes: '58 min',
                seasons: 6
            },
            {
                id: 5,
                title: 'The Mandalorian',
                cover: 'https://image.tmdb.org/t/p/w500/sWgBv7LV2PRoQgkxwlibdGXKz1S.jpg',
                genre: 'Sci-Fi',
                year: '2019-',
                rating: '8.7',
                description: 'The travels of a lone bounty hunter in the outer reaches of the galaxy, far from the authority of the New Republic.',
                episodes: '40 min',
                seasons: 3
            },
            {
                id: 6,
                title: 'The Office',
                cover: 'https://image.tmdb.org/t/p/w500/qWnJzyZhyy74gjpSjIXWmuk0ifX.jpg',
                genre: 'Comedy',
                year: '2005-2013',
                rating: '9.0',
                description: 'A mockumentary on a group of typical office workers, where the workday consists of ego clashes, inappropriate behavior, and tedium.',
                episodes: '22 min',
                seasons: 9
            },
            {
                id: 7,
                title: 'Friends',
                cover: 'https://image.tmdb.org/t/p/w500/f496cm9enuEsZkSPzCwnTESEK5s.jpg',
                genre: 'Comedy',
                year: '1994-2004',
                rating: '8.9',
                description: 'Follows the personal and professional lives of six twenty to thirty-something-year-old friends living in Manhattan.',
                episodes: '22 min',
                seasons: 10
            },
            {
                id: 8,
                title: 'The Witcher',
                cover: 'https://image.tmdb.org/t/p/w500/7vjaCdMw15FEbXyLQTVa04URsPm.jpg',
                genre: 'Fantasy',
                year: '2019-',
                rating: '8.2',
                description: 'Geralt of Rivia, a solitary monster hunter, struggles to find his place in a world where people often prove more wicked than beasts.',
                episodes: '60 min',
                seasons: 3
            },
            {
                id: 9,
                title: 'Sherlock',
                cover: 'https://image.tmdb.org/t/p/w500/7WTsnHkbA0FaG6R9twfFde0I9hl.jpg',
                genre: 'Crime',
                year: '2010-2017',
                rating: '9.1',
                description: 'A modern update finds the famous sleuth and his doctor partner solving crime in 21st century London.',
                episodes: '90 min',
                seasons: 4
            },
            {
                id: 10,
                title: 'The Boys',
                cover: 'https://image.tmdb.org/t/p/w500/stTEycfG9928HYGEISBFaG1ngjM.jpg',
                genre: 'Action',
                year: '2019-',
                rating: '8.7',
                description: 'A group of vigilantes set out to take down corrupt superheroes who abuse their superpowers.',
                episodes: '60 min',
                seasons: 4
            },
            {
                id: 11,
                title: 'The Last of Us',
                cover: 'https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg',
                genre: 'Drama',
                year: '2023-',
                rating: '8.8',
                description: 'Twenty years after a fungal outbreak ravages the planet, survivors Joel and Ellie embark on a brutal journey across post-pandemic America.',
                episodes: '60 min',
                seasons: 1
            },
            {
                id: 12,
                title: 'Wednesday',
                cover: 'https://image.tmdb.org/t/p/w500/9PFonBhy4cQy7Jz20NpMygczOkv.jpg',
                genre: 'Comedy',
                year: '2022-',
                rating: '8.1',
                description: 'Wednesday Addams attempts to master her emerging psychic ability while investigating a murder spree that has terrorized her new school.',
                episodes: '50 min',
                seasons: 2
            }
        ];

        const categorySet = new Set(this.series.map(s => s.genre));
        this.categories = ['All Series', ...Array.from(categorySet).sort()];

        console.log(`✓ Loaded ${this.series.length} demo series`);
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

        this.series.forEach(show => {
            if (show.genre) {
                categorySet.add(show.genre);
            }
        });

        this.categories = ['All Series', ...Array.from(categorySet).sort()];
    }

    renderCategories() {
        const container = document.getElementById('seriesGenres');
        if (!container) return;

        container.innerHTML = this.categories.map(category => `
            <button class="genre-btn ${this.currentCategory === category.toLowerCase().replace(/ /g, '-') || (category === 'All Series' && this.currentCategory === 'all') ? 'active' : ''}" 
                    data-genre="${category === 'All Series' ? 'all' : category.toLowerCase().replace(/ /g, '-')}">
                ${category}
            </button>
        `).join('');
    }

    renderSeries() {
        const container = document.getElementById('seriesGrid');
        if (!container) return;

        const filteredSeries = this.getFilteredSeries();

        if (filteredSeries.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #64748b;">
                    <div style="font-size: 48px; margin-bottom: 16px;">🎭</div>
                    <div style="font-size: 18px; margin-bottom: 8px;">No series found</div>
                    <div style="font-size: 14px;">Try a different category or search term</div>
                </div>
            `;
            return;
        }

        container.innerHTML = filteredSeries.map(show => `
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
                        ${show.seasons ? `<span class="series-seasons">📺 ${show.seasons} ${show.seasons === 1 ? 'Season' : 'Seasons'}</span>` : ''}
                    </div>
                </div>
                <button class="favorite-btn ${this.favorites.has(show.id) ? 'active' : ''}" 
                        data-series-id="${show.id}"
                        title="${this.favorites.has(show.id) ? 'Remove from favorites' : 'Add to favorites'}">
                    <span class="favorite-icon">${this.favorites.has(show.id) ? '★' : '☆'}</span>
                </button>
            </div>
        `).join('');
    }

    getFilteredSeries() {
        return this.series.filter(show => {
            const matchesCategory = this.currentCategory === 'all' || 
                                   show.genre.toLowerCase().replace(/ /g, '-') === this.currentCategory;
            const matchesSearch = !this.searchTerm || 
                                 show.title.toLowerCase().includes(this.searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('genre-btn') && e.target.closest('#seriesGenres')) {
                document.querySelectorAll('#seriesGenres .genre-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                this.currentCategory = e.target.dataset.genre;
                this.renderSeries();
            }

            if (e.target.closest('.series-info-btn')) {
                const card = e.target.closest('.movie-card');
                const seriesId = parseInt(card.dataset.seriesId);
                this.showSeriesDetails(seriesId);
            }

            if (e.target.closest('.favorite-btn') && e.target.closest('[data-series-id]')) {
                e.stopPropagation();
                const btn = e.target.closest('.favorite-btn');
                const seriesId = parseInt(btn.dataset.seriesId);
                this.toggleFavorite(seriesId);
            }

            if (e.target.classList.contains('modal') || e.target.classList.contains('close-modal')) {
                this.closeModal();
            }
        });

        const searchInput = document.getElementById('seriesSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value;
                this.renderSeries();
            });
        }
    }

    showSeriesDetails(seriesId) {
        const show = this.series.find(s => s.id === seriesId);
        if (!show) return;

        const modal = document.getElementById('seriesModal');
        if (!modal) return;

        document.getElementById('seriesModalPoster').src = show.cover;
        document.getElementById('seriesModalTitle').textContent = show.title;
        document.getElementById('seriesModalYear').textContent = show.year;
        document.getElementById('seriesModalRating').textContent = show.rating !== 'N/A' ? `⭐ ${show.rating}` : '';
        document.getElementById('seriesModalGenre').textContent = show.genre;
        document.getElementById('seriesModalEpisodes').textContent = show.episodes;
        document.getElementById('seriesModalSeasons').textContent = show.seasons ? `${show.seasons} ${show.seasons === 1 ? 'Season' : 'Seasons'}` : 'N/A';
        document.getElementById('seriesModalDescription').textContent = show.description;

        // For now, just show a message about episodes
        const episodesList = document.getElementById('seriesEpisodesList');
        episodesList.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: #64748b;">
                <div style="font-size: 48px; margin-bottom: 16px;">📺</div>
                <div style="font-size: 18px; margin-bottom: 8px;">Episodes Coming Soon</div>
                <div style="font-size: 14px;">Episode selection will be available in the next update</div>
            </div>
        `;

        modal.classList.add('active');
    }

    closeModal() {
        const modal = document.getElementById('seriesModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    toggleFavorite(seriesId) {
        if (this.favorites.has(seriesId)) {
            this.favorites.delete(seriesId);
        } else {
            this.favorites.add(seriesId);
        }

        StorageManager.saveFavorites('series', Array.from(this.favorites));
        this.renderSeries();
    }

    getSeries(seriesId) {
        return this.series.find(s => s.id === seriesId);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (document.getElementById('seriesGrid')) {
            window.seriesManager = new SeriesManager();
        }
    });
} else {
    if (document.getElementById('seriesGrid')) {
        window.seriesManager = new SeriesManager();
    }
}
