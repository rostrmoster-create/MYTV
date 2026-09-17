// Series Manager - v13 (Real Xtream Codes API)
class SeriesManager {
    constructor() {
        this.allSeries = [];
        this.categories = [];
        this.filteredSeries = [];
        this.selectedCategory = null;
    }

    async loadSeries() {
        const container = document.getElementById('seriesContent');
        if (container) {
            container.innerHTML = '<div class="loading">Loading series from your server...</div>';
        }

        try {
            // Check authentication
            if (!XtreamAPI.isAuthenticated()) {
                if (container) {
                    container.innerHTML = '<div class="loading">Please login to view series</div>';
                }
                return;
            }

            // Load categories
            this.categories = await XtreamAPI.getSeriesCategories();
            
            // Load all series
            const series = await XtreamAPI.getSeries();
            
            if (!series || series.length === 0) {
                if (container) {
                    container.innerHTML = '<div class="loading">No series available in your account</div>';
                }
                return;
            }

            // Map series to format
            this.allSeries = series.map(s => ({
                id: s.series_id || s.num,
                num: s.num,
                name: s.name,
                title: s.name,
                cover: s.cover,
                poster: s.cover,
                category_id: s.category_id,
                category_name: s.category_name,
                rating: s.rating || 'N/A',
                rating_5based: s.rating_5based,
                year: this.extractYear(s.name),
                genre: s.category_name,
                plot: s.plot,
                cast: s.cast,
                director: s.director,
                releaseDate: s.releaseDate,
                last_modified: s.last_modified
            }));

            this.filteredSeries = [...this.allSeries];
            this.renderCategoryFilter();
            this.renderSeries();
            this.setupFilters();

            console.log(`Loaded ${this.allSeries.length} series from Xtream API`);
        } catch (error) {
            console.error('Error loading series:', error);
            if (container) {
                container.innerHTML = '<div class="loading">Error loading series. Please check your connection.</div>';
            }
        }
    }

    extractYear(title) {
        const match = title.match(/\((\d{4})\)/);
        return match ? match[1] : '';
    }

    renderCategoryFilter() {
        const genreFilter = document.getElementById('seriesGenreFilter');
        if (!genreFilter || this.categories.length === 0) return;

        genreFilter.innerHTML = '<option value="">All Categories</option>';
        this.categories.forEach(cat => {
            genreFilter.innerHTML += `<option value="${cat.category_id}">${cat.category_name}</option>`;
        });
    }

    renderSeries() {
        const container = document.getElementById('seriesContent');
        if (!container) return;

        if (this.filteredSeries.length === 0) {
            container.innerHTML = '<div class="loading">No series found</div>';
            return;
        }

        const html = this.filteredSeries.map(series => {
            const poster = series.poster || series.cover || 'assets/placeholder.jpg';
            
            return `
                <div class="movie-card" onclick="window.seriesManager.showSeriesDetails(${JSON.stringify(series).replace(/"/g, '&quot;')})">
                    <div class="movie-poster">
                        <img src="${poster}" alt="${series.title}" onerror="this.src='assets/placeholder.jpg'">
                        <div class="movie-overlay">
                            <button class="play-btn">▶ Watch</button>
                        </div>
                    </div>
                    <div class="movie-info">
                        <h3>${series.title}</h3>
                        <div class="movie-meta">
                            <span>⭐ ${series.rating}</span>
                            ${series.year ? `<span>${series.year}</span>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    }

    async showSeriesDetails(series) {
        // Add to recently watched
        if (typeof window.addToRecentlyWatched === 'function') {
            window.addToRecentlyWatched({
                type: 'series',
                id: series.id,
                seriesId: series.id,
                seriesName: series.title,
                title: series.title,
                poster: series.poster || series.cover,
                year: series.year,
                genre: series.genre,
                rating: series.rating
            });
        }

        const isFavorite = this.isFavorite(series.id);
        
        // Get detailed series info with episodes
        let seriesInfo = null;
        let episodesHtml = '';
        
        try {
            seriesInfo = await XtreamAPI.getSeriesInfo(series.id);
            
            if (seriesInfo && seriesInfo.episodes) {
                episodesHtml = '<div class="series-episodes"><h3>Episodes</h3>';
                
                // Group episodes by season
                const seasons = {};
                Object.keys(seriesInfo.episodes).forEach(seasonNum => {
                    seasons[seasonNum] = seriesInfo.episodes[seasonNum];
                });

                // Render episodes
                Object.keys(seasons).sort((a, b) => parseInt(a) - parseInt(b)).forEach(seasonNum => {
                    const episodes = seasons[seasonNum];
                    episodes.forEach(ep => {
                        episodesHtml += `
                            <div class="episode-item" onclick="window.seriesManager.playEpisode(${JSON.stringify(series).replace(/"/g, '&quot;')}, ${JSON.stringify(ep).replace(/"/g, '&quot;')}, '${seasonNum}')">
                                <div class="episode-number">S${seasonNum}E${ep.episode_num}</div>
                                <div class="episode-info">
                                    <h4>${ep.title || 'Episode ' + ep.episode_num}</h4>
                                    <span>${ep.info?.duration || ''}</span>
                                </div>
                                <button class="episode-play-btn">▶</button>
                            </div>
                        `;
                    });
                });
                
                episodesHtml += '</div>';
            }
        } catch (error) {
            console.log('Could not fetch series details:', error);
        }

        const description = seriesInfo?.info?.plot || series.plot || 'No description available';
        const poster = series.poster || series.cover || 'assets/placeholder.jpg';
        const numSeasons = seriesInfo?.episodes ? Object.keys(seriesInfo.episodes).length : '?';
        
        const modal = document.getElementById('detailModal');
        const modalBody = document.getElementById('modalBody');
        
        modalBody.innerHTML = `
            <div class="movie-detail">
                <div class="movie-detail-poster">
                    <img src="${poster}" alt="${series.title}" onerror="this.src='assets/placeholder.jpg'">
                </div>
                <div class="movie-detail-content">
                    <h2>${series.title}</h2>
                    <div class="movie-detail-meta">
                        <span class="rating">⭐ ${series.rating}</span>
                        ${series.year ? `<span>${series.year}</span>` : ''}
                        <span>${numSeasons} Season${numSeasons !== 1 ? 's' : ''}</span>
                        ${series.genre ? `<span class="genre-badge">${series.genre}</span>` : ''}
                    </div>
                    <p class="movie-description">${description}</p>
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

    playEpisode(series, episode, seasonNum) {
        // Add episode to recently watched
        if (typeof window.addToRecentlyWatched === 'function') {
            window.addToRecentlyWatched({
                type: 'series',
                id: `${series.id}-s${seasonNum}e${episode.episode_num}`,
                seriesId: series.id,
                seriesName: series.title,
                title: episode.title || `Episode ${episode.episode_num}`,
                season: seasonNum,
                episode: episode.episode_num,
                poster: series.poster || series.cover
            });
        }

        closeModal();
        
        // Get episode stream URL
        const streamUrl = XtreamAPI.getSeriesStreamUrl(episode.id, episode.container_extension || 'mp4');
        
        if (streamUrl && window.playerManager) {
            showSection('livetv');
            setTimeout(() => {
                const channelInfo = document.getElementById('channelInfo');
                const channelName = document.getElementById('currentChannelName');
                const playerOverlay = document.getElementById('playerOverlay');

                if (channelInfo && channelName) {
                    channelName.textContent = `${series.title} - S${seasonNum}E${episode.episode_num}: ${episode.title || 'Episode ' + episode.episode_num}`;
                    channelInfo.style.display = 'block';
                }

                if (playerOverlay) {
                    playerOverlay.style.display = 'none';
                }

                window.playerManager.playStream(streamUrl);
                console.log('Playing episode:', episode.title);
            }, 100);
        } else {
            alert('Stream not available.');
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
                poster: series.poster || series.cover,
                year: series.year,
                genre: series.genre,
                rating: series.rating
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
            genreFilter.addEventListener('change', (e) => {
                this.selectedCategory = e.target.value;
                this.applyFilters();
            });
        }
    }

    applyFilters() {
        const searchQuery = document.getElementById('seriesSearch')?.value.toLowerCase() || '';
        
        this.filteredSeries = this.allSeries.filter(series => {
            const matchesSearch = !searchQuery ||
                series.title.toLowerCase().includes(searchQuery) ||
                (series.plot && series.plot.toLowerCase().includes(searchQuery));
            
            const matchesCategory = !this.selectedCategory || 
                series.category_id == this.selectedCategory;
            
            return matchesSearch && matchesCategory;
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
