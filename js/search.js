// Global Search - v12
class GlobalSearch {
    constructor() {
        this.searchBox = null;
        this.resultsDropdown = null;
        this.setupSearch();
    }

    setupSearch() {
        const container = document.getElementById('searchContainer');
        if (!container) return;

        container.innerHTML = `
            <div class="global-search">
                <input 
                    type="text" 
                    id="globalSearchInput" 
                    class="global-search-input" 
                    placeholder="Search movies, series, channels..."
                >
                <div id="searchResults" class="search-results"></div>
            </div>
        `;

        this.searchBox = document.getElementById('globalSearchInput');
        this.resultsDropdown = document.getElementById('searchResults');

        if (this.searchBox) {
            this.searchBox.addEventListener('input', (e) => this.handleSearch(e.target.value));
            this.searchBox.addEventListener('focus', () => {
                if (this.searchBox.value.trim()) {
                    this.resultsDropdown.style.display = 'block';
                }
            });
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.global-search')) {
                this.resultsDropdown.style.display = 'none';
            }
        });

        this.addStyles();
    }

    handleSearch(query) {
        if (query.trim().length < 2) {
            this.resultsDropdown.style.display = 'none';
            return;
        }

        const results = this.search(query.toLowerCase());
        this.displayResults(results);
    }

    search(query) {
        const results = {
            channels: [],
            movies: [],
            series: []
        };

        // Search channels
        if (window.channelManager && window.channelManager.channels) {
            results.channels = window.channelManager.channels.filter(channel =>
                channel.name.toLowerCase().includes(query)
            ).slice(0, 5);
        }

        // Search movies
        if (window.movieManager && window.movieManager.allMovies) {
            results.movies = window.movieManager.allMovies.filter(movie =>
                movie.title.toLowerCase().includes(query)
            ).slice(0, 5);
        }

        // Search series
        if (window.seriesManager && window.seriesManager.allSeries) {
            results.series = window.seriesManager.allSeries.filter(series =>
                series.title.toLowerCase().includes(query)
            ).slice(0, 5);
        }

        return results;
    }

    displayResults(results) {
        const totalResults = results.channels.length + results.movies.length + results.series.length;

        if (totalResults === 0) {
            this.resultsDropdown.innerHTML = '<div class="search-no-results">No results found</div>';
            this.resultsDropdown.style.display = 'block';
            return;
        }

        let html = '';

        if (results.channels.length > 0) {
            html += '<div class="search-category">📡 Channels</div>';
            results.channels.forEach(channel => {
                html += `
                    <div class="search-result-item" onclick="window.globalSearch.selectChannel(${JSON.stringify(channel).replace(/"/g, '&quot;')})">
                        <img src="${channel.logo}" alt="${channel.name}" onerror="this.src='assets/placeholder.jpg'">
                        <div class="search-result-info">
                            <div class="search-result-title">${channel.name}</div>
                            <div class="search-result-meta">${channel.category || 'Live TV'}</div>
                        </div>
                    </div>
                `;
            });
        }

        if (results.movies.length > 0) {
            html += '<div class="search-category">🎬 Movies</div>';
            results.movies.forEach(movie => {
                html += `
                    <div class="search-result-item" onclick="window.globalSearch.selectMovie(${JSON.stringify(movie).replace(/"/g, '&quot;')})">
                        <img src="${movie.poster}" alt="${movie.title}" onerror="this.src='assets/placeholder.jpg'">
                        <div class="search-result-info">
                            <div class="search-result-title">${movie.title}</div>
                            <div class="search-result-meta">${movie.year || ''} • ${movie.genre || ''}</div>
                        </div>
                    </div>
                `;
            });
        }

        if (results.series.length > 0) {
            html += '<div class="search-category">📺 Series</div>';
            results.series.forEach(series => {
                html += `
                    <div class="search-result-item" onclick="window.globalSearch.selectSeries(${JSON.stringify(series).replace(/"/g, '&quot;')})">
                        <img src="${series.poster}" alt="${series.title}" onerror="this.src='assets/placeholder.jpg'">
                        <div class="search-result-info">
                            <div class="search-result-title">${series.title}</div>
                            <div class="search-result-meta">${series.seasons} Season${series.seasons !== 1 ? 's' : ''}</div>
                        </div>
                    </div>
                `;
            });
        }

        this.resultsDropdown.innerHTML = html;
        this.resultsDropdown.style.display = 'block';
    }

    selectChannel(channel) {
        this.resultsDropdown.style.display = 'none';
        this.searchBox.value = '';
        showSection('livetv');
        setTimeout(() => {
            if (window.channelManager) {
                window.channelManager.playChannel(channel);
            }
        }, 100);
    }

    selectMovie(movie) {
        this.resultsDropdown.style.display = 'none';
        this.searchBox.value = '';
        showSection('movies');
        setTimeout(() => {
            if (window.movieManager) {
                window.movieManager.showMovieDetails(movie);
            }
        }, 100);
    }

    selectSeries(series) {
        this.resultsDropdown.style.display = 'none';
        this.searchBox.value = '';
        showSection('series');
        setTimeout(() => {
            if (window.seriesManager) {
                window.seriesManager.showSeriesDetails(series);
            }
        }, 100);
    }

    addStyles() {
        if (document.getElementById('globalSearchStyles')) return;

        const style = document.createElement('style');
        style.id = 'globalSearchStyles';
        style.textContent = `
            .global-search {
                position: relative;
                width: 100%;
            }

            .global-search-input {
                width: 100%;
                padding: 10px 15px;
                border: 2px solid #e2e8f0;
                border-radius: 8px;
                font-size: 14px;
                transition: all 0.3s ease;
            }

            .global-search-input:focus {
                outline: none;
                border-color: #667eea;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }

            .search-results {
                position: absolute;
                top: calc(100% + 5px);
                left: 0;
                right: 0;
                background: white;
                border-radius: 8px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.15);
                max-height: 400px;
                overflow-y: auto;
                display: none;
                z-index: 1001;
            }

            .search-category {
                padding: 10px 15px;
                background: #f8fafc;
                font-weight: 600;
                font-size: 13px;
                color: #64748b;
                border-bottom: 1px solid #e2e8f0;
            }

            .search-result-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 10px 15px;
                cursor: pointer;
                transition: background 0.2s ease;
            }

            .search-result-item:hover {
                background: #f8fafc;
            }

            .search-result-item img {
                width: 40px;
                height: 40px;
                object-fit: cover;
                border-radius: 4px;
            }

            .search-result-info {
                flex: 1;
            }

            .search-result-title {
                font-size: 14px;
                font-weight: 500;
                color: #2c3e50;
                margin-bottom: 2px;
            }

            .search-result-meta {
                font-size: 12px;
                color: #64748b;
            }

            .search-no-results {
                padding: 20px;
                text-align: center;
                color: #64748b;
            }
        `;
        document.head.appendChild(style);
    }
}

window.initGlobalSearch = function() {
    window.globalSearch = new GlobalSearch();
};
