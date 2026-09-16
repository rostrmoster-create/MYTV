// search.js - Global Search Functionality

class GlobalSearch {
    constructor() {
        this.searchTerm = '';
        this.results = {
            channels: [],
            movies: [],
            series: []
        };
        this.init();
    }

    init() {
        this.setupSearchBox();
    }

    setupSearchBox() {
        // Create global search in top bar
        const topBar = document.querySelector('.top-bar');
        if (!topBar) return;

        // Check if search already exists
        if (document.getElementById('globalSearch')) return;

        const searchHTML = `
            <div class="global-search-container" style="margin-left: auto;">
                <div class="search-box" style="max-width: 400px; margin: 0;">
                    <input type="text" id="globalSearch" placeholder="Search everything...">
                    <span class="search-icon">🔍</span>
                </div>
            </div>
        `;

        topBar.insertAdjacentHTML('beforeend', searchHTML);

        // Add event listener
        const searchInput = document.getElementById('globalSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value.trim();
                if (this.searchTerm.length >= 2) {
                    this.performSearch();
                } else {
                    this.clearResults();
                }
            });

            searchInput.addEventListener('focus', () => {
                if (this.searchTerm.length >= 2) {
                    this.showResults();
                }
            });
        }

        // Close results when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.global-search-container') && 
                !e.target.closest('.search-results-dropdown')) {
                this.hideResults();
            }
        });
    }

    performSearch() {
        this.results = {
            channels: [],
            movies: [],
            series: []
        };

        const term = this.searchTerm.toLowerCase();

        // Search channels
        if (window.channelsManager && window.channelsManager.channels) {
            this.results.channels = window.channelsManager.channels.filter(channel =>
                channel.name.toLowerCase().includes(term) ||
                channel.category.toLowerCase().includes(term)
            ).slice(0, 5);
        }

        // Search movies
        if (window.moviesManager && window.moviesManager.movies) {
            this.results.movies = window.moviesManager.movies.filter(movie =>
                movie.title.toLowerCase().includes(term) ||
                movie.genre.toLowerCase().includes(term)
            ).slice(0, 5);
        }

        // Search series
        if (window.seriesManager && window.seriesManager.series) {
            this.results.series = window.seriesManager.series.filter(show =>
                show.title.toLowerCase().includes(term) ||
                show.genre.toLowerCase().includes(term)
            ).slice(0, 5);
        }

        this.showResults();
    }

    showResults() {
        this.hideResults(); // Remove any existing dropdown

        const totalResults = this.results.channels.length + 
                           this.results.movies.length + 
                           this.results.series.length;

        if (totalResults === 0) {
            this.showNoResults();
            return;
        }

        const dropdown = document.createElement('div');
        dropdown.className = 'search-results-dropdown';
        dropdown.innerHTML = this.renderResults();

        const searchContainer = document.querySelector('.global-search-container');
        if (searchContainer) {
            searchContainer.appendChild(dropdown);
        }

        // Add click handlers
        this.attachResultHandlers(dropdown);
    }

    renderResults() {
        let html = '';

        // Channels section
        if (this.results.channels.length > 0) {
            html += `
                <div class="search-section">
                    <div class="search-section-title">📺 Live TV</div>
                    <div class="search-items">
                        ${this.results.channels.map(channel => `
                            <div class="search-item" data-type="channel" data-id="${channel.id}">
                                <img src="${channel.logo}" alt="${channel.name}" 
                                     onerror="this.src='https://via.placeholder.com/50x50/667eea/ffffff?text=${encodeURIComponent(channel.name.substring(0, 1))}'">
                                <div class="search-item-info">
                                    <div class="search-item-title">${channel.name}</div>
                                    <div class="search-item-meta">${channel.category}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // Movies section
        if (this.results.movies.length > 0) {
            html += `
                <div class="search-section">
                    <div class="search-section-title">🎬 Movies</div>
                    <div class="search-items">
                        ${this.results.movies.map(movie => `
                            <div class="search-item" data-type="movie" data-id="${movie.id}">
                                <img src="${movie.cover}" alt="${movie.title}"
                                     onerror="this.src='https://via.placeholder.com/50x75/667eea/ffffff?text=${encodeURIComponent(movie.title.substring(0, 1))}'">
                                <div class="search-item-info">
                                    <div class="search-item-title">${movie.title}</div>
                                    <div class="search-item-meta">${movie.genre} • ${movie.year}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // Series section
        if (this.results.series.length > 0) {
            html += `
                <div class="search-section">
                    <div class="search-section-title">🎭 TV Series</div>
                    <div class="search-items">
                        ${this.results.series.map(show => `
                            <div class="search-item" data-type="series" data-id="${show.id}">
                                <img src="${show.cover}" alt="${show.title}"
                                     onerror="this.src='https://via.placeholder.com/50x75/667eea/ffffff?text=${encodeURIComponent(show.title.substring(0, 1))}'">
                                <div class="search-item-info">
                                    <div class="search-item-title">${show.title}</div>
                                    <div class="search-item-meta">${show.genre} • ${show.year}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        return html;
    }

    showNoResults() {
        const dropdown = document.createElement('div');
        dropdown.className = 'search-results-dropdown';
        dropdown.innerHTML = `
            <div class="search-no-results">
                <div style="font-size: 48px; margin-bottom: 12px;">🔍</div>
                <div style="font-size: 16px; font-weight: 600; color: #1e293b; margin-bottom: 4px;">No results found</div>
                <div style="font-size: 14px; color: #64748b;">Try searching for something else</div>
            </div>
        `;

        const searchContainer = document.querySelector('.global-search-container');
        if (searchContainer) {
            searchContainer.appendChild(dropdown);
        }
    }

    attachResultHandlers(dropdown) {
        const items = dropdown.querySelectorAll('.search-item');
        items.forEach(item => {
            item.addEventListener('click', () => {
                const type = item.dataset.type;
                const id = parseInt(item.dataset.id);
                this.handleResultClick(type, id);
            });
        });
    }

    handleResultClick(type, id) {
        this.hideResults();
        document.getElementById('globalSearch').value = '';
        this.searchTerm = '';

        switch(type) {
            case 'channel':
                window.app.showSection('channels');
                setTimeout(() => {
                    if (window.channelsManager) {
                        window.channelsManager.playChannel(id);
                    }
                }, 100);
                break;

            case 'movie':
                window.app.showSection('movies');
                setTimeout(() => {
                    if (window.moviesManager) {
                        window.moviesManager.showMovieDetails(id);
                    }
                }, 100);
                break;

            case 'series':
                window.app.showSection('series');
                setTimeout(() => {
                    if (window.seriesManager) {
                        window.seriesManager.showSeriesDetails(id);
                    }
                }, 100);
                break;
        }
    }

    hideResults() {
        const existing = document.querySelector('.search-results-dropdown');
        if (existing) {
            existing.remove();
        }
    }

    clearResults() {
        this.results = {
            channels: [],
            movies: [],
            series: []
        };
        this.hideResults();
    }
}

// Initialize when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Wait a bit for other managers to initialize
        setTimeout(() => {
            window.globalSearch = new GlobalSearch();
        }, 500);
    });
} else {
    setTimeout(() => {
        window.globalSearch = new GlobalSearch();
    }, 500);
}
