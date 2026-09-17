// MYTV Series - v15

class SeriesManager {
    constructor() {
        this.allSeries = [];
        this.categories = [];
        this.currentCategory = 'all';
        this.searchQuery = '';
        this.currentSeries = null;
        this.currentSeriesInfo = null;
    }

    async init() {
        await this.loadCategories();
        await this.loadSeries();
        this.renderCategories();
        this.renderSeries();
        this.attachEventListeners();
    }

    async loadCategories() {
        try {
            const categories = await XtreamAPI.getSeriesCategories();
            this.categories = categories || [];
            console.log('Loaded series categories:', this.categories.length);
        } catch (error) {
            console.error('Failed to load series categories:', error);
            this.categories = [];
        }
    }

    async loadSeries(categoryId = null) {
        try {
            const series = await XtreamAPI.getSeries(categoryId);
            this.allSeries = series || [];
            console.log('Loaded series:', this.allSeries.length);
        } catch (error) {
            console.error('Failed to load series:', error);
            this.allSeries = [];
            this.showError('Failed to load series. Please try again.');
        }
    }

    renderCategories() {
        const container = document.getElementById('series-categories');
        if (!container) return;

        const categories = [
            { category_id: 'all', category_name: 'All Series' },
            ...this.categories
        ];

        container.innerHTML = categories.map(cat => `
            <button class="category-btn ${cat.category_id === this.currentCategory ? 'active' : ''}" 
                    data-category="${cat.category_id}">
                ${this.escapeHtml(cat.category_name)}
            </button>
        `).join('');
    }

    renderSeries() {
        const container = document.getElementById('series-grid');
        if (!container) return;

        let series = this.allSeries;

        // Apply search filter
        if (this.searchQuery) {
            series = series.filter(s => 
                s.name.toLowerCase().includes(this.searchQuery.toLowerCase())
            );
        }

        if (series.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <p>No series found</p>
                </div>
            `;
            return;
        }

        container.innerHTML = series.map(show => {
            const isFavorite = window.favoritesManager && 
                              favoritesManager.isFavorite(show.series_id, 'series');

            return `
                <div class="series-card" data-series-id="${show.series_id}">
                    <div class="series-poster">
                        ${show.cover ? 
                            `<img src="${this.escapeHtml(show.cover)}" 
                                  alt="${this.escapeHtml(show.name)}"
                                  onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 300 450%22><rect fill=%22%23e0e7ff%22 width=%22300%22 height=%22450%22/><text x=%2250%%22 y=%2250%%22 font-size=%2260%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%236366f1%22>📺</text></svg>'">` 
                            : `<div class="series-placeholder">📺</div>`
                        }
                        <div class="series-overlay">
                            <button class="play-btn-overlay" onclick="seriesManager.showSeriesDetails(${show.series_id})">
                                <svg width="48" height="48" viewBox="0 0 48 48">
                                    <circle cx="24" cy="24" r="24" fill="rgba(255,255,255,0.9)"/>
                                    <path d="M20 14L34 24L20 34V14Z" fill="#6366f1"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="series-info">
                        <h3 class="series-title">${this.escapeHtml(show.name)}</h3>
                        <div class="series-meta">
                            ${show.rating ? `<span class="rating">⭐ ${show.rating}</span>` : ''}
                            ${show.category_name ? `<span class="genre">${this.escapeHtml(show.category_name)}</span>` : ''}
                        </div>
                        <div class="series-actions">
                            <button class="action-btn" onclick="seriesManager.showSeriesDetails(${show.series_id})">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <rect x="2" y="4" width="12" height="10" rx="1" stroke="currentColor" stroke-width="2" fill="none"/>
                                    <path d="M5 2V4M11 2V4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                </svg>
                                Episodes
                            </button>
                            <button class="action-btn favorite-btn ${isFavorite ? 'active' : ''}" 
                                    onclick="seriesManager.toggleFavorite(${show.series_id})">
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

    async showSeriesDetails(seriesId) {
        try {
            const show = this.allSeries.find(s => s.series_id === seriesId);
            if (!show) return;

            this.currentSeries = show;

            // Get detailed info with seasons and episodes
            const seriesInfo = await XtreamAPI.getSeriesInfo(seriesId);
            this.currentSeriesInfo = seriesInfo;

            this.openModal();

        } catch (error) {
            console.error('Failed to load series details:', error);
            this.showError('Failed to load series details. Please try again.');
        }
    }

    openModal() {
        if (!this.currentSeries || !this.currentSeriesInfo) return;

        const modal = document.getElementById('series-modal');
        if (!modal) return;

        const info = this.currentSeriesInfo.info || {};
        const isFavorite = window.favoritesManager && 
                          favoritesManager.isFavorite(this.currentSeries.series_id, 'series');

        document.getElementById('series-modal-poster').src = this.currentSeries.cover || 
            'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 450"><rect fill="#e0e7ff" width="300" height="450"/><text x="50%" y="50%" font-size="60" text-anchor="middle" dy=".3em" fill="#6366f1">📺</text></svg>';
        
        document.getElementById('series-modal-title').textContent = this.currentSeries.name;
        document.getElementById('series-modal-rating').textContent = info.rating || this.currentSeries.rating || 'N/A';
        document.getElementById('series-modal-year').textContent = info.releaseDate || info.year || 'N/A';
        document.getElementById('series-modal-genre').textContent = info.genre || this.currentSeries.category_name || 'N/A';
        document.getElementById('series-modal-plot').textContent = info.plot || 'No description available.';

        const favoriteBtn = document.getElementById('series-modal-favorite-btn');
        favoriteBtn.className = `modal-action-btn ${isFavorite ? 'active' : ''}`;
        favoriteBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 16 16" fill="${isFavorite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.5">
                <path d="M8 2.5L9.5 6.5L14 7L11 10L12 14.5L8 12L4 14.5L5 10L2 7L6.5 6.5L8 2.5Z"/>
            </svg>
            ${isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
        `;

        // Render seasons and episodes
        this.renderEpisodes();

        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    renderEpisodes() {
        const container = document.getElementById('series-episodes-list');
        if (!container || !this.currentSeriesInfo) return;

        const seasons = this.currentSeriesInfo.seasons || {};
        const episodes = this.currentSeriesInfo.episodes || {};

        if (Object.keys(seasons).length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #64748b;">No episodes available</p>';
            return;
        }

        let html = '';

        // Sort seasons numerically
        const sortedSeasons = Object.keys(seasons).sort((a, b) => parseInt(a) - parseInt(b));

        sortedSeasons.forEach(seasonNum => {
            const seasonEpisodes = episodes[seasonNum] || [];
            
            if (seasonEpisodes.length === 0) return;

            html += `
                <div class="season-section">
                    <h3 class="season-title">Season ${seasonNum}</h3>
                    <div class="episodes-grid">
            `;

            seasonEpisodes.forEach(episode => {
                html += `
                    <div class="episode-card" onclick="seriesManager.playEpisode('${episode.id}', '${episode.container_extension || 'mp4'}', 'S${seasonNum}E${episode.episode_num}: ${this.escapeHtml(episode.title)}')">
                        <div class="episode-thumbnail">
                            ${episode.info && episode.info.movie_image ? 
                                `<img src="${this.escapeHtml(episode.info.movie_image)}" alt="Episode ${episode.episode_num}">` 
                                : `<div class="episode-placeholder">E${episode.episode_num}</div>`
                            }
                            <div class="episode-play-overlay">
                                <svg width="32" height="32" viewBox="0 0 32 32">
                                    <circle cx="16" cy="16" r="16" fill="rgba(255,255,255,0.9)"/>
                                    <path d="M12 8L24 16L12 24V8Z" fill="#6366f1"/>
                                </svg>
                            </div>
                        </div>
                        <div class="episode-info">
                            <div class="episode-number">Episode ${episode.episode_num}</div>
                            <div class="episode-title">${this.escapeHtml(episode.title)}</div>
                            ${episode.info && episode.info.duration ? `<div class="episode-duration">${episode.info.duration}</div>` : ''}
                        </div>
                    </div>
                `;
            });

            html += `
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    async playEpisode(episodeId, containerExtension, title) {
        try {
            // Get stream URL from backend - FIXED: Added await
            const streamUrl = await XtreamAPI.getSeriesStreamUrl(episodeId, containerExtension || 'mp4');

            if (!streamUrl) {
                throw new Error('Failed to get stream URL');
            }

            // Track in recently watched
            if (window.recentlyWatchedManager) {
                recentlyWatchedManager.addItem({
                    id: episodeId,
                    type: 'series',
                    title: `${this.currentSeries.name} - ${title}`,
                    thumbnail: this.currentSeries.cover || '',
                    category: this.currentSeries.category_name || 'Series'
                });
            }

            // Play in video player
            if (window.videoPlayer) {
                videoPlayer.play({
                    url: streamUrl,
                    title: `${this.currentSeries.name} - ${title}`,
                    type: 'series',
                    poster: this.currentSeries.cover || ''
                });
            }

            this.closeModal();

        } catch (error) {
            console.error('Failed to play episode:', error);
            alert('Failed to play episode. Please try again.');
        }
    }

    closeModal() {
        const modal = document.getElementById('series-modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
        this.currentSeries = null;
        this.currentSeriesInfo = null;
    }

    toggleFavoriteModal() {
        if (this.currentSeries && window.favoritesManager) {
            favoritesManager.toggleFavorite({
                id: this.currentSeries.series_id,
                type: 'series',
                title: this.currentSeries.name,
                thumbnail: this.currentSeries.cover || '',
                category: this.currentSeries.category_name || 'Series'
            });
            
            // Update button
            const favoriteBtn = document.getElementById('series-modal-favorite-btn');
            const isFavorite = favoritesManager.isFavorite(this.currentSeries.series_id, 'series');
            favoriteBtn.className = `modal-action-btn ${isFavorite ? 'active' : ''}`;
            favoriteBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 16 16" fill="${isFavorite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.5">
                    <path d="M8 2.5L9.5 6.5L14 7L11 10L12 14.5L8 12L4 14.5L5 10L2 7L6.5 6.5L8 2.5Z"/>
                </svg>
                ${isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
            `;
            
            // Refresh series grid
            this.renderSeries();
        }
    }

    toggleFavorite(seriesId) {
        const show = this.allSeries.find(s => s.series_id === seriesId);
        if (show && window.favoritesManager) {
            favoritesManager.toggleFavorite({
                id: show.series_id,
                type: 'series',
                title: show.name,
                thumbnail: show.cover || '',
                category: show.category_name || 'Series'
            });
            this.renderSeries();
        }
    }

    async filterByCategory(categoryId) {
        this.currentCategory = categoryId;
        
        if (categoryId === 'all') {
            await this.loadSeries(null);
        } else {
            await this.loadSeries(categoryId);
        }
        
        this.renderCategories();
        this.renderSeries();
    }

    searchSeries(query) {
        this.searchQuery = query;
        this.renderSeries();
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
                if (window.location.hash === '#series') {
                    this.searchSeries(e.target.value);
                }
            });
        }

        // Modal close button
        const closeBtn = document.querySelector('.series-modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }

        // Modal backdrop click
        const modal = document.getElementById('series-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }

        // Modal favorite button
        const modalFavoriteBtn = document.getElementById('series-modal-favorite-btn');
        if (modalFavoriteBtn) {
            modalFavoriteBtn.addEventListener('click', () => this.toggleFavoriteModal());
        }
    }

    showError(message) {
        const container = document.getElementById('series-grid');
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
let seriesManager;
if (window.location.pathname.includes('app.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        seriesManager = new SeriesManager();
    });
}
