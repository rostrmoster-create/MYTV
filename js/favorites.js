// Favorites Manager - v12
class FavoritesManager {
    constructor() {
        this.favorites = [];
        this.currentFilter = 'all';
        this.loadFavorites();
    }

    loadFavorites() {
        try {
            const stored = StorageManager.get('favorites');
            this.favorites = stored || [];
        } catch (error) {
            console.error('Error loading favorites:', error);
            this.favorites = [];
        }
    }

    renderFilterTabs() {
        const channelCount = this.favorites.filter(f => f.type === 'channel').length;
        const movieCount = this.favorites.filter(f => f.type === 'movie').length;
        const seriesCount = this.favorites.filter(f => f.type === 'series').length;

        return `
            <div class="filter-tab ${this.currentFilter === 'all' ? 'active' : ''}" 
                 onclick="window.favoritesManager.filterFavorites('all')">
                All (${this.favorites.length})
            </div>
            <div class="filter-tab ${this.currentFilter === 'channel' ? 'active' : ''}" 
                 onclick="window.favoritesManager.filterFavorites('channel')">
                Channels (${channelCount})
            </div>
            <div class="filter-tab ${this.currentFilter === 'movie' ? 'active' : ''}" 
                 onclick="window.favoritesManager.filterFavorites('movie')">
                Movies (${movieCount})
            </div>
            <div class="filter-tab ${this.currentFilter === 'series' ? 'active' : ''}" 
                 onclick="window.favoritesManager.filterFavorites('series')">
                Series (${seriesCount})
            </div>
        `;
    }

    filterFavorites(type) {
        this.currentFilter = type;
        this.renderFavorites();
    }

    renderFavorites() {
        const filterContainer = document.getElementById('favoritesFilter');
        const contentContainer = document.getElementById('favoritesContent');

        if (!filterContainer || !contentContainer) return;

        filterContainer.innerHTML = this.renderFilterTabs();

        if (this.favorites.length === 0) {
            contentContainer.innerHTML = `
                <div class="empty-favorites">
                    <div class="empty-icon">⭐</div>
                    <h3>No Favorites Yet</h3>
                    <p>Start adding your favorite content to see them here</p>
                    <button class="explore-btn" onclick="showSection('movies')">Explore Content</button>
                </div>
            `;
            return;
        }

        const filteredFavorites = this.currentFilter === 'all' 
            ? this.favorites 
            : this.favorites.filter(f => f.type === this.currentFilter);

        if (filteredFavorites.length === 0) {
            contentContainer.innerHTML = `
                <div class="empty-favorites">
                    <div class="empty-icon">⭐</div>
                    <h3>No ${this.currentFilter}s in favorites</h3>
                    <p>Add some ${this.currentFilter}s to your favorites</p>
                </div>
            `;
            return;
        }

        const groupedFavorites = this.groupByType(filteredFavorites);
        let html = '';

        Object.keys(groupedFavorites).forEach(type => {
            const items = groupedFavorites[type];
            if (items.length === 0) return;

            const typeLabel = type.charAt(0).toUpperCase() + type.slice(1) + 's';
            html += `
                <div class="favorites-section">
                    <h3 class="favorites-section-title">${typeLabel}</h3>
                    <div class="movies-grid">
                        ${items.map(item => this.renderFavoriteCard(item)).join('')}
                    </div>
                </div>
            `;
        });

        contentContainer.innerHTML = html;
    }

    groupByType(favorites) {
        return {
            channel: favorites.filter(f => f.type === 'channel'),
            movie: favorites.filter(f => f.type === 'movie'),
            series: favorites.filter(f => f.type === 'series')
        };
    }

    renderFavoriteCard(item) {
        const image = item.logo || item.poster || 'assets/placeholder.jpg';
        const title = item.name || item.title;
        const meta = this.getItemMeta(item);

        return `
            <div class="movie-card" onclick="window.favoritesManager.openItem(${JSON.stringify(item).replace(/"/g, '&quot;')})">
                <div class="movie-poster">
                    <img src="${image}" alt="${title}" onerror="this.src='assets/placeholder.jpg'">
                    <div class="movie-overlay">
                        <button class="play-btn">▶ ${item.type === 'channel' ? 'Watch' : 'View'}</button>
                    </div>
                </div>
                <div class="movie-info">
                    <h3>${title}</h3>
                    <div class="movie-meta">
                        ${meta}
                    </div>
                </div>
            </div>
        `;
    }

    getItemMeta(item) {
        switch(item.type) {
            case 'channel':
                return `<span>${item.category || 'Live TV'}</span>`;
            case 'movie':
                return `<span>⭐ ${item.rating || 'N/A'}</span><span>${item.year || ''}</span>`;
            case 'series':
                return `<span>⭐ ${item.rating || 'N/A'}</span><span>${item.seasons} Season${item.seasons !== 1 ? 's' : ''}</span>`;
            default:
                return '';
        }
    }

    openItem(item) {
        switch(item.type) {
            case 'channel':
                showSection('livetv');
                setTimeout(() => {
                    if (window.channelManager) {
                        window.channelManager.playChannel(item);
                    }
                }, 100);
                break;
            case 'movie':
                showSection('movies');
                setTimeout(() => {
                    if (window.movieManager) {
                        window.movieManager.showMovieDetails(item);
                    }
                }, 100);
                break;
            case 'series':
                showSection('series');
                setTimeout(() => {
                    if (window.seriesManager) {
                        window.seriesManager.showSeriesDetails(item);
                    }
                }, 100);
                break;
        }
    }
}

window.initFavoritesManager = function() {
    if (!window.favoritesManager) {
        window.favoritesManager = new FavoritesManager();
    }
    window.favoritesManager.renderFavorites();
};
