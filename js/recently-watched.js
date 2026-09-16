// Recently Watched Manager - v9
class RecentlyWatchedManager {
    constructor() {
        this.recentItems = [];
        this.maxItems = 50;
        this.loadRecentItems();
    }

    loadRecentItems() {
        try {
            const stored = StorageManager.get('recentlyWatched');
            this.recentItems = stored || [];
        } catch (error) {
            console.error('Error loading recently watched:', error);
            this.recentItems = [];
        }
    }

    addItem(item) {
        try {
            // Remove if already exists
            this.recentItems = this.recentItems.filter(i => 
                !(i.type === item.type && i.id === item.id)
            );

            // Add to beginning with timestamp
            this.recentItems.unshift({
                ...item,
                watchedAt: Date.now()
            });

            // Keep only max items
            if (this.recentItems.length > this.maxItems) {
                this.recentItems = this.recentItems.slice(0, this.maxItems);
            }

            StorageManager.set('recentlyWatched', this.recentItems);
        } catch (error) {
            console.error('Error adding recently watched item:', error);
        }
    }

    removeItem(type, id) {
        try {
            this.recentItems = this.recentItems.filter(item => 
                !(item.type === type && item.id === id)
            );
            StorageManager.set('recentlyWatched', this.recentItems);
            this.renderRecentItems();
        } catch (error) {
            console.error('Error removing item:', error);
        }
    }

    clearAll() {
        if (confirm('Clear all watch history?')) {
            this.recentItems = [];
            StorageManager.set('recentlyWatched', []);
            this.renderRecentItems();
        }
    }

    getTimeAgo(timestamp) {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
        if (seconds < 172800) return 'Yesterday';
        if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
        if (seconds < 2592000) return `${Math.floor(seconds / 604800)} weeks ago`;
        return new Date(timestamp).toLocaleDateString();
    }

    renderRecentItems() {
        const container = document.getElementById('recentlyWatchedContent');
        if (!container) return;

        if (this.recentItems.length === 0) {
            container.innerHTML = `
                <div class="empty-recent">
                    <div class="empty-icon">📺</div>
                    <h3>No Watch History</h3>
                    <p>Items you watch will appear here</p>
                    <button class="explore-btn" onclick="showSection('home')">
                        Explore Content
                    </button>
                </div>
            `;
            return;
        }

        const html = `
            <div class="recent-header-controls">
                <p class="recent-count">${this.recentItems.length} item${this.recentItems.length !== 1 ? 's' : ''}</p>
                <button class="clear-all-btn" onclick="window.recentlyWatchedManager?.clearAll()">
                    Clear All
                </button>
            </div>
            <div class="recent-grid">
                ${this.recentItems.map(item => this.renderRecentCard(item)).join('')}
            </div>
        `;

        container.innerHTML = html;
    }

    renderRecentCard(item) {
        const timeAgo = this.getTimeAgo(item.watchedAt);
        let thumbnail = item.logo || item.poster || 'assets/placeholder.jpg';
        let title = item.name || item.title || 'Unknown';
        let subtitle = '';
        let icon = '';

        switch(item.type) {
            case 'channel':
                icon = '📡';
                subtitle = 'Live TV';
                break;
            case 'movie':
                icon = '🎬';
                subtitle = item.year ? `Movie • ${item.year}` : 'Movie';
                break;
            case 'series':
                icon = '📺';
                if (item.season && item.episode) {
                    subtitle = `S${item.season}E${item.episode}`;
                    title = `${item.seriesName || title}`;
                } else {
                    subtitle = 'TV Series';
                }
                break;
        }

        return `
            <div class="recent-card" onclick="window.recentlyWatchedManager?.playItem(${JSON.stringify(item).replace(/"/g, '&quot;')})">
                <div class="recent-card-image">
                    <img src="${thumbnail}" alt="${title}" onerror="this.src='assets/placeholder.jpg'">
                    <div class="recent-type-badge">${icon}</div>
                </div>
                <div class="recent-card-content">
                    <h3 class="recent-card-title">${title}</h3>
                    <p class="recent-card-subtitle">${subtitle}</p>
                    <p class="recent-card-time">${timeAgo}</p>
                </div>
                <button class="recent-remove-btn" onclick="event.stopPropagation(); window.recentlyWatchedManager?.removeItem('${item.type}', '${item.id}')">
                    ×
                </button>
            </div>
        `;
    }

    playItem(item) {
        switch(item.type) {
            case 'channel':
                showSection('livetv');
                setTimeout(() => {
                    if (window.channelManager) {
                        const channel = window.channelManager.channels.find(c => c.id === item.id);
                        if (channel) {
                            window.channelManager.playChannel(channel);
                        }
                    }
                }, 100);
                break;

            case 'movie':
                showSection('movies');
                setTimeout(() => {
                    if (window.movieManager) {
                        const movie = window.movieManager.allMovies.find(m => m.id === item.id);
                        if (movie) {
                            window.movieManager.showMovieDetails(movie);
                        }
                    }
                }, 100);
                break;

            case 'series':
                showSection('series');
                setTimeout(() => {
                    if (window.seriesManager) {
                        const series = window.seriesManager.allSeries.find(s => s.id === item.seriesId || s.id === item.id);
                        if (series) {
                            window.seriesManager.showSeriesDetails(series);
                        }
                    }
                }, 100);
                break;
        }
    }
}

// Initialize function
window.initRecentlyWatchedManager = function() {
    if (!window.recentlyWatchedManager) {
        window.recentlyWatchedManager = new RecentlyWatchedManager();
    }
    window.recentlyWatchedManager.renderRecentItems();
};

// Helper function to add items from other managers
window.addToRecentlyWatched = function(item) {
    if (window.recentlyWatchedManager) {
        window.recentlyWatchedManager.addItem(item);
    }
};
