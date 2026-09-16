// Series Manager - v12
class SeriesManager {
    constructor() {
        this.allSeries = [];
        this.filteredSeries = [];
        this.genres = new Set();
    }

    async loadSeries() {
        try {
            const apiSeries = await APIClient.getSeries();
            
            if (apiSeries && apiSeries.length > 0) {
                this.allSeries = apiSeries;
            } else {
                this.allSeries = this.getDemoSeries();
            }
        } catch (error) {
            console.error('Error loading series:', error);
            this.allSeries = this.getDemoSeries();
        }

        this.extractGenres();
        this.filteredSeries = [...this.allSeries];
        this.renderSeries();
        this.setupFilters();
    }

    getDemoSeries() {
        return [
            {
                id: 's1',
                title: 'Breaking Bad',
                poster: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
                year: '2008-2013',
                genre: 'Crime',
                rating: '9.5',
                seasons: 5,
                description: 'A high school chemistry teacher turned methamphetamine producer partners with a former student.',
                episodes: [
                    { season: 1, episode: 1, title: 'Pilot', duration: '58 min' },
                    { season: 1, episode: 2, title: 'Cat\'s in the Bag...', duration: '48 min' }
                ]
            },
            {
                id: 's2',
                title: 'Game of Thrones',
                poster: 'https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg',
                year: '2011-2019',
                genre: 'Fantasy',
                rating: '9.3',
                seasons: 8,
                description: 'Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns.',
                episodes: [
                    { season: 1, episode: 1, title: 'Winter Is Coming', duration: '62 min' },
                    { season: 1, episode: 2, title: 'The Kingsroad', duration: '56 min' }
                ]
            },
            {
                id: 's3',
                title: 'Stranger Things',
                poster: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
                year: '2016-',
                genre: 'Sci-Fi',
                rating: '8.7',
                seasons: 4,
                description: 'When a young boy disappears, his mother, friends, and the local police chief uncover a mystery involving secret experiments.',
                episodes: [
                    { season: 1, episode: 1, title: 'Chapter One: The Vanishing of Will Byers', duration: '47 min' },
                    { season: 1, episode: 2, title: 'Chapter Two: The Weirdo on Maple Street', duration: '55 min' }
                ]
            },
            {
                id: 's4',
                title: 'The Crown',
                poster: 'https://image.tmdb.org/t/p/w500/1M876KPjulVwppEpldhdc8V4o68.jpg',
                year: '2016-',
                genre: 'Drama',
                rating: '8.6',
                seasons: 6,
                description: 'Follows the political rivalries and romance of Queen Elizabeth II\'s reign and the events that shaped the second half of the 20th century.',
                episodes: [
                    { season: 1, episode: 1, title: 'Wolferton Splash', duration: '57 min' },
                    { season: 1, episode: 2, title: 'Hyde Park Corner', duration: '56 min' }
                ]
            },
            {
                id: 's5',
                title: 'The Mandalorian',
                poster: 'https://image.tmdb.org/t/p/w500/sWgBv7LV2PRoQgkxwlibdGXKz1S.jpg',
                year: '2019-',
                genre: 'Sci-Fi',
                rating: '8.7',
                seasons: 3,
                description: 'The travels of a lone bounty hunter in the outer reaches of the galaxy, far from the authority of the New Republic.',
                episodes: [
                    { season: 1, episode: 1, title: 'Chapter 1: The Mandalorian', duration: '39 min' },
                    { season: 1, episode: 2, title: 'Chapter 2: The Child', duration: '32 min' }
                ]
            },
            {
                id: 's6',
                title: 'The Office',
                poster: 'https://image.tmdb.org/t/p/w500/7DJKHzAi83BmQrWLrYYOqcoKfhR.jpg',
                year: '2005-2013',
                genre: 'Comedy',
                rating: '9.0',
                seasons: 9,
                description: 'A mockumentary on a group of typical office workers, where the workday consists of ego clashes, inappropriate behavior, and tedium.',
                episodes: [
                    { season: 1, episode: 1, title: 'Pilot', duration: '22 min' },
                    { season: 1, episode: 2, title: 'Diversity Day', duration: '22 min' }
                ]
            },
            {
                id: 's7',
                title: 'Friends',
                poster: 'https://image.tmdb.org/t/p/w500/f496cm9enuEsZkSPzCwnTESEK5s.jpg',
                year: '1994-2004',
                genre: 'Comedy',
                rating: '8.9',
                seasons: 10,
                description: 'Follows the personal and professional lives of six twenty to thirty-something-year-old friends living in Manhattan.',
                episodes: [
                    { season: 1, episode: 1, title: 'The One Where Monica Gets a Roommate', duration: '22 min' },
                    { season: 1, episode: 2, title: 'The One with the Sonogram at the End', duration: '22 min' }
                ]
            },
            {
                id: 's8',
                title: 'The Witcher',
                poster: 'https://image.tmdb.org/t/p/w500/7vjaCdMw15FEbXyLQTVa04URsPm.jpg',
                year: '2019-',
                genre: 'Fantasy',
                rating: '8.2',
                seasons: 3,
                description: 'Geralt of Rivia, a solitary monster hunter, struggles to find his place in a world where people often prove more wicked than beasts.',
                episodes: [
                    { season: 1, episode: 1, title: 'The End\'s Beginning', duration: '60 min' },
                    { season: 1, episode: 2, title: 'Four Marks', duration: '60 min' }
                ]
            },
            {
                id: 's9',
                title: 'Sherlock',
                poster: 'https://image.tmdb.org/t/p/w500/7WTsnHkbA0FaG6R9twfFde0I9hl.jpg',
                year: '2010-2017',
                genre: 'Crime',
                rating: '9.1',
                seasons: 4,
                description: 'A modern update finds the famous sleuth and his doctor partner solving crime in 21st century London.',
                episodes: [
                    { season: 1, episode: 1, title: 'A Study in Pink', duration: '88 min' },
                    { season: 1, episode: 2, title: 'The Blind Banker', duration: '89 min' }
                ]
            },
            {
                id: 's10',
                title: 'The Boys',
                poster: 'https://image.tmdb.org/t/p/w500/stTEycfG9928HYGEISBFaG1ngjM.jpg',
                year: '2019-',
                genre: 'Action',
                rating: '8.7',
                seasons: 4,
                description: 'A group of vigilantes set out to take down corrupt superheroes who abuse their superpowers.',
                episodes: [
                    { season: 1, episode: 1, title: 'The Name of the Game', duration: '61 min' },
                    { season: 1, episode: 2, title: 'Cherry', duration: '59 min' }
                ]
            },
            {
                id: 's11',
                title: 'The Last of Us',
                poster: 'https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg',
                year: '2023-',
                genre: 'Drama',
                rating: '8.8',
                seasons: 1,
                description: 'After a global pandemic destroys civilization, a hardened survivor takes charge of a 14-year-old girl who may be humanity\'s last hope.',
                episodes: [
                    { season: 1, episode: 1, title: 'When You\'re Lost in the Darkness', duration: '81 min' },
                    { season: 1, episode: 2, title: 'Infected', duration: '45 min' }
                ]
            },
            {
                id: 's12',
                title: 'Wednesday',
                poster: 'https://image.tmdb.org/t/p/w500/9PFonBhy4cQy7Jz20NpMygczOkv.jpg',
                year: '2022-',
                genre: 'Comedy',
                rating: '8.1',
                seasons: 1,
                description: 'Follows Wednesday Addams\' years as a student at Nevermore Academy, where she attempts to master her emerging psychic ability.',
                episodes: [
                    { season: 1, episode: 1, title: 'Wednesday\'s Child Is Full of Woe', duration: '47 min' },
                    { season: 1, episode: 2, title: 'Woe Is the Loneliest Number', duration: '47 min' }
                ]
            }
        ];
    }

    extractGenres() {
        this.genres.clear();
        this.allSeries.forEach(series => {
            if (series.genre) {
                this.genres.add(series.genre);
            }
        });

        const genreFilter = document.getElementById('seriesGenreFilter');
        if (genreFilter) {
            genreFilter.innerHTML = '<option value="all">All Genres</option>';
            Array.from(this.genres).sort().forEach(genre => {
                genreFilter.innerHTML += `<option value="${genre}">${genre}</option>`;
            });
        }
    }

    renderSeries() {
        const container = document.getElementById('seriesContent');
        if (!container) return;

        if (this.filteredSeries.length === 0) {
            container.innerHTML = '<div class="loading">No series found</div>';
            return;
        }

        const html = this.filteredSeries.map(series => `
            <div class="movie-card" onclick="window.seriesManager.showSeriesDetails(${JSON.stringify(series).replace(/"/g, '&quot;')})">
                <div class="movie-poster">
                    <img src="${series.poster}" alt="${series.title}" onerror="this.src='assets/placeholder.jpg'">
                    <div class="movie-overlay">
                        <button class="play-btn">▶ Watch</button>
                    </div>
                </div>
                <div class="movie-info">
                    <h3>${series.title}</h3>
                    <div class="movie-meta">
                        <span>⭐ ${series.rating || 'N/A'}</span>
                        <span>${series.seasons} Season${series.seasons !== 1 ? 's' : ''}</span>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = html;
    }

    showSeriesDetails(series) {
        // Add to recently watched when viewing details
        if (typeof window.addToRecentlyWatched === 'function') {
            window.addToRecentlyWatched({
                type: 'series',
                id: series.id,
                seriesId: series.id,
                seriesName: series.title,
                title: series.title,
                poster: series.poster,
                year: series.year,
                genre: series.genre,
                rating: series.rating
            });
        }

        const isFavorite = this.isFavorite(series.id);
        
        const modal = document.getElementById('detailModal');
        const modalBody = document.getElementById('modalBody');
        
        const episodesHtml = series.episodes && series.episodes.length > 0 ? `
            <div class="series-episodes">
                <h3>Episodes</h3>
                ${series.episodes.map(ep => `
                    <div class="episode-item" onclick="window.seriesManager.playEpisode(${JSON.stringify(series).replace(/"/g, '&quot;')}, ${JSON.stringify(ep).replace(/"/g, '&quot;')})">
                        <div class="episode-number">S${ep.season}E${ep.episode}</div>
                        <div class="episode-info">
                            <h4>${ep.title}</h4>
                            <span>${ep.duration}</span>
                        </div>
                        <button class="episode-play-btn">▶</button>
                    </div>
                `).join('')}
            </div>
        ` : '';
        
        modalBody.innerHTML = `
            <div class="movie-detail">
                <div class="movie-detail-poster">
                    <img src="${series.poster}" alt="${series.title}" onerror="this.src='assets/placeholder.jpg'">
                </div>
                <div class="movie-detail-content">
                    <h2>${series.title}</h2>
                    <div class="movie-detail-meta">
                        <span class="rating">⭐ ${series.rating || 'N/A'}</span>
                        <span>${series.year || 'N/A'}</span>
                        <span>${series.seasons} Season${series.seasons !== 1 ? 's' : ''}</span>
                        <span class="genre-badge">${series.genre || 'General'}</span>
                    </div>
                    <p class="movie-description">${series.description || 'No description available.'}</p>
                    <div class="movie-actions">
                        <button class="action-btn ${isFavorite ? 'active' : ''}" onclick="window.seriesManager.toggleFavorite(${JSON.stringify(series).replace(/"/g, '&quot;')})">
                            ${isFavorite ? '❤️ Remove from Favorites' : '🤍 Add to Favorites'}
                        </button>
                    </div>
                    ${episodesHtml}
                </div>
            </div>
        `;
        
        modal.style.display = 'block';
    }

    playEpisode(series, episode) {
        // Add episode to recently watched
        if (typeof window.addToRecentlyWatched === 'function') {
            window.addToRecentlyWatched({
                type: 'series',
                id: `${series.id}-s${episode.season}e${episode.episode}`,
                seriesId: series.id,
                seriesName: series.title,
                title: episode.title,
                season: episode.season,
                episode: episode.episode,
                poster: series.poster
            });
        }

        closeModal();
        
        const demoUrl = 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8';
        
        if (window.playerManager) {
            showSection('livetv');
            setTimeout(() => {
                const channelInfo = document.getElementById('channelInfo');
                const channelName = document.getElementById('currentChannelName');
                const playerOverlay = document.getElementById('playerOverlay');

                if (channelInfo && channelName) {
                    channelName.textContent = `${series.title} - S${episode.season}E${episode.episode}: ${episode.title}`;
                    channelInfo.style.display = 'block';
                }

                if (playerOverlay) {
                    playerOverlay.style.display = 'none';
                }

                window.playerManager.playStream(demoUrl);
            }, 100);
        } else {
            alert('Player not available.');
        }
    }

    toggleFavorite(series) {
        const favorites = StorageManager.get('favorites') || [];
        const index = favorites.findIndex(f => f.type === 'series' && f.id === series.id);
        
        if (index > -1) {
            favorites.splice(index, 1);
        } else {
            favorites.push({
                type: 'series',
                id: series.id,
                title: series.title,
                poster: series.poster,
                year: series.year,
                genre: series.genre,
                rating: series.rating,
                seasons: series.seasons
            });
        }
        
        StorageManager.set('favorites', favorites);
        this.showSeriesDetails(series);
        
        if (window.favoritesManager) {
            window.favoritesManager.loadFavorites();
        }
    }

    isFavorite(seriesId) {
        const favorites = StorageManager.get('favorites') || [];
        return favorites.some(f => f.type === 'series' && f.id === seriesId);
    }

    setupFilters() {
        const searchInput = document.getElementById('seriesSearch');
        const genreFilter = document.getElementById('seriesGenreFilter');

        if (searchInput) {
            searchInput.addEventListener('input', () => this.applyFilters());
        }

        if (genreFilter) {
            genreFilter.addEventListener('change', () => this.applyFilters());
        }
    }

    applyFilters() {
        const searchQuery = document.getElementById('seriesSearch')?.value.toLowerCase() || '';
        const selectedGenre = document.getElementById('seriesGenreFilter')?.value || 'all';

        this.filteredSeries = this.allSeries.filter(series => {
            const matchesSearch = series.title.toLowerCase().includes(searchQuery) ||
                                (series.description && series.description.toLowerCase().includes(searchQuery));
            const matchesGenre = selectedGenre === 'all' || series.genre === selectedGenre;
            
            return matchesSearch && matchesGenre;
        });

        this.renderSeries();
    }
}

window.initSeriesManager = function() {
    if (!window.seriesManager) {
        window.seriesManager = new SeriesManager();
        window.seriesManager.loadSeries();
    }
};
