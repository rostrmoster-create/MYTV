// Recently Watched Manager - v9
class RecentlyWatchedManager {
    constructor() {
        this.container = document.getElementById('recentlyWatchedContent');
        this.filterContainer = document.getElementById('recentlyWatchedFilter');
        this.currentFilter = 'all';
        this.recentlyWatched = [];
    }

    async init() {
        await this.loadRecentlyWatched();
        this.renderFilterTabs();
        this.render();
    }

    async loadRecentlyWatched() {
        try {
            const watched = await StorageManager.get('recentlyWatched') || [];
            // Sort by most recent first
            this.recentlyWatched = watched.sort((a, b) => 
                new Date(b.timestamp) - new Date(a.timestamp)
            );
        } catch (error) {
            console.error('Error loading recently watched:', error);
            this.recentlyWatched = [];
        }
    }

    renderFilterTabs() {
        if (!this.filterContainer) return;

        const counts = {
            all: this.recentlyWatched.length,
            channels: this.recentlyWatched.filter(item => item.type === 'channel').length,
            movies: this.recentlyWatched.filter(item => item.type === 'movie').length,
            series: this.recentlyWatched.filter(item => item.type === 'series').length
        };

        this.filterContainer.innerHTML = `
            <div class="filter-tabs">
                <button class="filter-tab ${this.currentFilter === 'all' ? 'active' : ''}" 
                        onclick="recentlyWatchedManager.setFilter('all')">
                    All <span class="filter-count">${counts.all}</span>
                </button>
                <button class="filter-tab ${this.currentFilter === 'channels' ? 'active' : ''}" 
                        onclick="recentlyWatchedManager.setFilter('channels')">
                    Live TV <span class="filter-count">${counts.channels}</span>
                </button>
                <button class="filter-tab ${this.currentFilter === 'movies' ? 'active' : ''}" 
                        onclick="recentlyWatchedManager.setFilter('movies')">
                    Movies <span class="filter-count">${counts.movies}</span>
                </button>
                <button class="filter-tab ${this.currentFilter === 'series' ? 'active' : ''}" 
                        onclick="recentlyWatchedManager.setFilter('series')">
                    Series <span class="filter-count">${counts.series}</span>
                </button>
            </div>
        `;
    }

    setFilter(filter) {
        this.currentFilter = filter;
        this.renderFilterTabs();
        this.render();
    }

    getFilteredItems() {
        if (this.currentFilter === 'all') {
            return this.recentlyWatched;
        }
        return this.recentlyWatched.filter(item => {
            if (this.currentFilter === 'channels') return item.type === 'channel';
            if (this.currentFilter === 'movies') return item.type === 'movie';
            if (this.currentFilter === 'series') return item.type === 'series';
            return true;
        });
    }

    render() {
        if (!this.container) return;

        const filteredItems = this.getFilteredItems();

        if (filteredItems.length === 0) {
            this.container.innerHTML = this.renderEmptyState();
            return;
        }

        // Group by type for organized display
        const grouped = {
            channels: filteredItems.filter(item => item.type === 'channel'),
            movies: filteredItems.filter(item => item.type === 'movie'),
            series: filteredItems.filter(item => item.type === 'series')
        };

        let html = '';

        if (this.currentFilter === 'all') {
            // Show all types with headers
            if (grouped.channels.length > 0) {
                html += this.renderSection('Live TV', grouped.channels);
            }
            if (grouped.movies.length > 0) {
                html += this.renderSection('Movies', grouped.movies);
            }
            if (grouped.series.length > 0) {
                html += this.renderSection('TV Series', grouped.series);
            }
        } else {
            // Show only filtered type
            html += this.renderItems(filteredItems);
        }

        // Add clear history button
        html += `
            <div class="clear-history-section">
                <button class="clear-history-btn" onclick="recentlyWatchedManager.clearHistory()">
                    <i class="fas fa-trash-alt"></i> Clear Watch History
                </button>
            </div>
        `;

        this.container.innerHTML = html;
    }

    renderSection(title, items) {
        if (items.length === 0) return '';
        
        return `
            <div class="watched-section">
                <h3 class="watched-section-title">${title}</h3>
                ${this.renderItems(items)}
            </div>
        `;
    }

    renderItems(items) {
        return `
            <div class="watched-grid">
                ${items.map(item => this.renderItem(item)).join('')}
            </div>
        `;
    }

    renderItem(item) {
        const timeAgo = this.getTimeAgo(item.timestamp);
        const progress = item.progress || 0;
        const hasProgress = progress > 0 && progress < 100;

        let imageUrl = 'https://via.placeholder.com/300x450/e8f0fe/4285f4?text=';
        let title = item.title || 'Unknown';

        if (item.type === 'channel') {
            imageUrl = item.logo || `${imageUrl}Channel`;
        } else if (item.type === 'movie') {
            imageUrl = item.poster || `${imageUrl}Movie`;
        } else if (item.type === 'series') {
            imageUrl = item.poster || `${imageUrl}Series`;
        }

        return `
            <div class="watched-item" onclick="recentlyWatchedManager.openItem(${this.escapeJson(item)})">
                <div class="watched-item-poster">
                    <img src="${imageUrl}" alt="${title}" onerror="this.src='https://via.placeholder.com/300x450/e8f0fe/4285f4?text=No+Image'">
                    ${hasProgress ? `
                        <div class="progress-overlay">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${progress}%"></div>
                            </div>
                            <span class="progress-text">${Math.round(progress)}%</span>
                        </div>
                    ` : ''}
                    <div class="watched-overlay">
                        <i class="fas fa-play-circle"></i>
                        <span>${hasProgress ? 'Resume' : 'Watch Again'}</span>
                    </div>
                </div>
                <div class="watched-item-info">
                    <h4 class="watched-item-title">${title}</h4>
                    <div class="watched-item-meta">
                        <span class="watched-type">
                            <i class="fas ${this.getTypeIcon(item.type)}"></i>
                            ${this.getTypeLabel(item.type)}
                        </span>
                        <span class="watched-time">${timeAgo}</span>
                    </div>
                    ${item.type === 'series' && item.episode ? `
                        <div class="watched-episode">
                            S${item.season} E${item.episode}
                        </div>
                    ` : ''}
                </div>
                <button class="remove-watched-btn" onclick="event.stopPropagation(); recentlyWatchedManager.removeItem(${this.escapeJson(item)})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    }

    renderEmptyState() {
        return `
            <div class="empty-watched">
                <div class="empty-icon">
                    <i class="fas fa-history"></i>
                </div>
                <h3>No Watch History Yet</h3>
                <p>Content you watch will appear here so you can easily continue watching.</p>
                <button class="explore-btn" onclick="navigateTo('liveTV')">
                    <i class="fas fa-tv"></i> Start Watching
                </button>
            </div>
        `;
    }

    getTypeIcon(type) {
        const icons = {
            channel: 'fa-tv',
            movie: 'fa-film',
            series: 'fa-video'
        };
        return icons[type] || 'fa-play';
    }

    getTypeLabel(type) {
        const labels = {
            channel: 'Live TV',
            movie: 'Movie',
            series: 'Series'
        };
        return labels[type] || type;
    }

    getTimeAgo(timestamp) {
        const now = new Date();
        const watched = new Date(timestamp);
        const seconds = Math.floor((now - watched) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
        
        return watched.toLocaleDateString();
    }

    escapeJson(obj) {
        return JSON.stringify(obj).replace(/'/g, "\\'").replace(/"/g, '&quot;');
    }

    async openItem(item) {
        if (item.type === 'channel') {
            navigateTo('liveTV');
            setTimeout(() => {
                if (window.channelManager) {
                    const channel = window.channelManager.channels.find(c => c.name === item.title);
                    if (channel) {
                        window.channelManager.playChannel(channel);
                    }
                }
            }, 100);
        } else if (item.type === 'movie') {
            navigateTo('movies');
            setTimeout(() => {
                if (window.movieManager) {
                    const movie = window.movieManager.movies.find(m => m.title === item.title);
                    if (movie) {
                        window.movieManager.showMovieDetails(movie);
                    }
                }
            }, 100);
        } else if (item.type === 'series') {
            navigateTo('series');
            setTimeout(() => {
                if (window.seriesManager) {
                    const series = window.seriesManager.series.find(s => s.title === item.title);
                    if (series) {
                        window.seriesManager.showSeriesDetails(series);
                    }
                }
            }, 100);
        }
    }

    async removeItem(item) {
        if (!confirm(`Remove "${item.title}" from watch history?`)) {
            return;
        }

        try {
            const watched = await StorageManager.get('recentlyWatched') || [];
            const filtered = watched.filter(w => 
                !(w.type === item.type && w.title === item.title && w.timestamp === item.timestamp)
            );
            
            await StorageManager.set('recentlyWatched', filtered);
            await this.loadRecentlyWatched();
            this.renderFilterTabs();
            this.render();
        } catch (error) {
            console.error('Error removing item:', error);
            alert('Failed to remove item from history');
        }
    }

    async clearHistory() {
        if (!confirm('Clear your entire watch history? This cannot be undone.')) {
            return;
        }

        try {
            await StorageManager.set('recentlyWatched', []);
            await this.loadRecentlyWatched();
            this.renderFilterTabs();
            this.render();
        } catch (error) {
            console.error('Error clearing history:', error);
            alert('Failed to clear watch history');
        }
    }

    // Static method to add watched item
    static async addWatchedItem(type, data) {
        try {
            const watched = await StorageManager.get('recentlyWatched') || [];
            
            const item = {
                type: type,
                title: data.title || data.name,
                timestamp: new Date().toISOString(),
                progress: data.progress || 0
            };

            if (type === 'channel') {
                item.logo = data.logo;
                item.streamUrl = data.stream_url;
            } else if (type === 'movie') {
                item.poster = data.poster;
                item.id = data.id;
            } else if (type === 'series') {
                item.poster = data.poster;
                item.id = data.id;
                item.season = data.season;
                item.episode = data.episode;
            }

            // Remove existing entry for same content
            const filtered = watched.filter(w => 
                !(w.type === type && w.title === item.title)
            );

            // Add to beginning
            filtered.unshift(item);

            // Keep only last 50 items
            const limited = filtered.slice(0, 50);

            await StorageManager.set('recentlyWatched', limited);

            // Refresh if manager is active
            if (window.recentlyWatchedManager) {
                await window.recentlyWatchedManager.loadRecentlyWatched();
                window.recentlyWatchedManager.renderFilterTabs();
                window.recentlyWatchedManager.render();
            }
        } catch (error) {
            console.error('Error adding watched item:', error);
        }
    }
}

// Global function to initialize
window.initRecentlyWatchedManager = function() {
    if (!window.recentlyWatchedManager) {
        window.recentlyWatchedManager = new RecentlyWatchedManager();
    }
    window.recentlyWatchedManager.init();
};
