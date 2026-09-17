// MYTV Live TV Channels - v15

class ChannelsManager {
    constructor() {
        this.allChannels = [];
        this.categories = [];
        this.currentCategory = 'all';
        this.searchQuery = '';
    }

    async init() {
        await this.loadCategories();
        await this.loadChannels();
        this.renderCategories();
        this.renderChannels();
        this.attachEventListeners();
    }

    async loadCategories() {
        try {
            const categories = await XtreamAPI.getLiveCategories();
            this.categories = categories || [];
            console.log('Loaded categories:', this.categories.length);
        } catch (error) {
            console.error('Failed to load categories:', error);
            this.categories = [];
        }
    }

    async loadChannels(categoryId = null) {
        try {
            const channels = await XtreamAPI.getLiveStreams(categoryId);
            this.allChannels = channels || [];
            console.log('Loaded channels:', this.allChannels.length);
        } catch (error) {
            console.error('Failed to load channels:', error);
            this.allChannels = [];
            this.showError('Failed to load channels. Please try again.');
        }
    }

    renderCategories() {
        const container = document.getElementById('channel-categories');
        if (!container) return;

        const categories = [
            { category_id: 'all', category_name: 'All Channels' },
            ...this.categories
        ];

        container.innerHTML = categories.map(cat => `
            <button class="category-btn ${cat.category_id === this.currentCategory ? 'active' : ''}" 
                    data-category="${cat.category_id}">
                ${this.escapeHtml(cat.category_name)}
            </button>
        `).join('');
    }

    renderChannels() {
        const container = document.getElementById('channels-grid');
        if (!container) return;

        let channels = this.allChannels;

        // Apply search filter
        if (this.searchQuery) {
            channels = channels.filter(ch => 
                ch.name.toLowerCase().includes(this.searchQuery.toLowerCase())
            );
        }

        if (channels.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <p>No channels found</p>
                </div>
            `;
            return;
        }

        container.innerHTML = channels.map(channel => `
            <div class="channel-card" data-channel-id="${channel.stream_id}">
                <div class="channel-logo">
                    ${channel.stream_icon ? 
                        `<img src="${this.escapeHtml(channel.stream_icon)}" 
                              alt="${this.escapeHtml(channel.name)}"
                              onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%23e0e7ff%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2250%22 font-size=%2240%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%236366f1%22>TV</text></svg>'">` 
                        : `<div class="channel-placeholder">TV</div>`
                    }
                </div>
                <div class="channel-info">
                    <h3 class="channel-name">${this.escapeHtml(channel.name)}</h3>
                    ${channel.category_name ? `<p class="channel-category">${this.escapeHtml(channel.category_name)}</p>` : ''}
                </div>
                <button class="play-btn" onclick="channelsManager.playChannel(${channel.stream_id})">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M3 2L13 8L3 14V2Z" fill="currentColor"/>
                    </svg>
                    Play
                </button>
            </div>
        `).join('');
    }

    async playChannel(channelId) {
        try {
            const channel = this.allChannels.find(ch => ch.stream_id === channelId);
            if (!channel) {
                console.error('Channel not found:', channelId);
                return;
            }

            // Get stream URL from backend - FIXED: Added await
            const streamUrl = await XtreamAPI.getLiveStreamUrl(channelId);

            if (!streamUrl) {
                throw new Error('Failed to get stream URL');
            }

            // Track in recently watched
            if (window.recentlyWatchedManager) {
                recentlyWatchedManager.addItem({
                    id: channel.stream_id,
                    type: 'live',
                    title: channel.name,
                    thumbnail: channel.stream_icon || '',
                    category: channel.category_name || 'Live TV'
                });
            }

            // Play in video player
            if (window.videoPlayer) {
                videoPlayer.play({
                    url: streamUrl,
                    title: channel.name,
                    type: 'live',
                    poster: channel.stream_icon || ''
                });
            }

        } catch (error) {
            console.error('Failed to play channel:', error);
            this.showError('Failed to play channel. Please try again.');
        }
    }

    async filterByCategory(categoryId) {
        this.currentCategory = categoryId;
        
        if (categoryId === 'all') {
            await this.loadChannels(null);
        } else {
            await this.loadChannels(categoryId);
        }
        
        this.renderCategories();
        this.renderChannels();
    }

    searchChannels(query) {
        this.searchQuery = query;
        this.renderChannels();
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
                if (window.location.hash === '#live-tv') {
                    this.searchChannels(e.target.value);
                }
            });
        }
    }

    showError(message) {
        const container = document.getElementById('channels-grid');
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
let channelsManager;
if (window.location.pathname.includes('app.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        channelsManager = new ChannelsManager();
    });
}
