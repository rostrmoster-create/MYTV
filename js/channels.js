// channels.js - Live TV Channels Management with Real API

class ChannelsManager {
    constructor() {
        this.channels = [];
        this.categories = [];
        this.currentCategory = 'all';
        this.favorites = new Set(StorageManager.getFavorites('channels'));
        this.searchTerm = '';
        this.init();
    }

    async init() {
        await this.loadChannels();
        this.renderCategories();
        this.renderChannels();
        this.setupEventListeners();
    }

    async loadChannels() {
        try {
            // Show loading state
            const channelsGrid = document.getElementById('channelsGrid');
            if (channelsGrid) {
                channelsGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #64748b;"><div style="font-size: 18px; margin-bottom: 10px;">Loading channels...</div><div style="font-size: 14px;">Please wait while we fetch your content</div></div>';
            }

            // Get categories first
            const categoriesData = await API.getLiveCategories();
            console.log('Categories loaded:', categoriesData);

            // Get all live streams
            const streamsData = await API.getLiveStreams();
            console.log('Streams loaded:', streamsData);

            if (!streamsData || streamsData.length === 0) {
                throw new Error('No channels available');
            }

            // Transform API data to our format
            this.channels = streamsData.map(stream => ({
                id: stream.stream_id,
                name: stream.name,
                logo: stream.stream_icon || 'https://via.placeholder.com/120x120/e0e7ff/4f46e5?text=' + encodeURIComponent(stream.name.substring(0, 2)),
                category: this.getCategoryName(stream.category_id, categoriesData),
                categoryId: stream.category_id,
                streamUrl: API.buildLiveStreamUrl(stream.stream_id, stream.container_extension || 'ts'),
                epg_channel_id: stream.epg_channel_id,
                num: stream.num
            }));

            // Build categories list
            this.buildCategories(categoriesData);

            console.log(`Loaded ${this.channels.length} channels in ${this.categories.length} categories`);

        } catch (error) {
            console.error('Error loading channels:', error);
            
            // Show error message
            const channelsGrid = document.getElementById('channelsGrid');
            if (channelsGrid) {
                channelsGrid.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                        <div style="color: #ef4444; font-size: 18px; margin-bottom: 10px;">⚠️ Failed to load channels</div>
                        <div style="color: #64748b; font-size: 14px; margin-bottom: 20px;">${error.message}</div>
                        <button onclick="location.reload()" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500;">Retry</button>
                    </div>
                `;
            }
        }
    }

    getCategoryName(categoryId, categories) {
        if (!categories || categories.length === 0) return 'Other';
        const category = categories.find(cat => cat.category_id === categoryId);
        return category ? category.category_name : 'Other';
    }

    buildCategories(categoriesData) {
        // Create categories from the API data
        const categorySet = new Set();
        
        if (categoriesData && categoriesData.length > 0) {
            categoriesData.forEach(cat => {
                categorySet.add(cat.category_name);
            });
        }

        // Add categories from channels as fallback
        this.channels.forEach(channel => {
            if (channel.category) {
                categorySet.add(channel.category);
            }
        });

        this.categories = ['All Channels', ...Array.from(categorySet).sort()];
    }

    renderCategories() {
        const container = document.getElementById('channelCategories');
        if (!container) return;

        container.innerHTML = this.categories.map(category => `
            <button class="category-btn ${this.currentCategory === category.toLowerCase().replace(/ /g, '-') || (category === 'All Channels' && this.currentCategory === 'all') ? 'active' : ''}" 
                    data-category="${category === 'All Channels' ? 'all' : category.toLowerCase().replace(/ /g, '-')}">
                ${category}
            </button>
        `).join('');
    }

    renderChannels() {
        const container = document.getElementById('channelsGrid');
        if (!container) return;

        const filteredChannels = this.getFilteredChannels();

        if (filteredChannels.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #64748b;">
                    <div style="font-size: 48px; margin-bottom: 16px;">📺</div>
                    <div style="font-size: 18px; margin-bottom: 8px;">No channels found</div>
                    <div style="font-size: 14px;">Try a different category or search term</div>
                </div>
            `;
            return;
        }

        container.innerHTML = filteredChannels.map(channel => `
            <div class="channel-card" data-channel-id="${channel.id}">
                <div class="channel-logo">
                    <img src="${channel.logo}" alt="${channel.name}" 
                         onerror="this.src='https://via.placeholder.com/120x120/e0e7ff/4f46e5?text=${encodeURIComponent(channel.name.substring(0, 2))}'">
                </div>
                <div class="channel-info">
                    <h3 class="channel-name">${channel.name}</h3>
                    <p class="channel-category">${channel.category}</p>
                </div>
                <button class="favorite-btn ${this.favorites.has(channel.id) ? 'active' : ''}" 
                        data-channel-id="${channel.id}"
                        title="${this.favorites.has(channel.id) ? 'Remove from favorites' : 'Add to favorites'}">
                    <span class="favorite-icon">${this.favorites.has(channel.id) ? '★' : '☆'}</span>
                </button>
            </div>
        `).join('');
    }

    getFilteredChannels() {
        return this.channels.filter(channel => {
            const matchesCategory = this.currentCategory === 'all' || 
                                   channel.category.toLowerCase().replace(/ /g, '-') === this.currentCategory;
            const matchesSearch = !this.searchTerm || 
                                 channel.name.toLowerCase().includes(this.searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }

    setupEventListeners() {
        // Category buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('category-btn')) {
                document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                this.currentCategory = e.target.dataset.category;
                this.renderChannels();
            }

            // Channel cards
            if (e.target.closest('.channel-card') && !e.target.closest('.favorite-btn')) {
                const card = e.target.closest('.channel-card');
                const channelId = parseInt(card.dataset.channelId);
                this.playChannel(channelId);
            }

            // Favorite buttons
            if (e.target.closest('.favorite-btn')) {
                e.stopPropagation();
                const btn = e.target.closest('.favorite-btn');
                const channelId = parseInt(btn.dataset.channelId);
                this.toggleFavorite(channelId);
            }
        });

        // Search
        const searchInput = document.getElementById('channelSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value;
                this.renderChannels();
            });
        }
    }

    playChannel(channelId) {
        const channel = this.channels.find(c => c.id === channelId);
        if (!channel) return;

        // Add to recently watched
        StorageManager.addToRecentlyWatched('channel', {
            id: channel.id,
            name: channel.name,
            logo: channel.logo,
            category: channel.category
        });

        // Show player section
        const playerSection = document.getElementById('playerSection');
        const channelsSection = document.getElementById('channelsSection');
        
        if (playerSection && channelsSection) {
            playerSection.style.display = 'block';
            channelsSection.style.display = 'none';
        }

        // Initialize or update player
        if (window.videoPlayer) {
            window.videoPlayer.loadChannel(channel);
        } else {
            window.videoPlayer = new VideoPlayer();
            window.videoPlayer.loadChannel(channel);
        }
    }

    toggleFavorite(channelId) {
        if (this.favorites.has(channelId)) {
            this.favorites.delete(channelId);
        } else {
            this.favorites.add(channelId);
        }

        StorageManager.saveFavorites('channels', Array.from(this.favorites));
        this.renderChannels();
    }

    getChannel(channelId) {
        return this.channels.find(c => c.id === channelId);
    }
}

// Initialize when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (document.getElementById('channelsGrid')) {
            window.channelsManager = new ChannelsManager();
        }
    });
} else {
    if (document.getElementById('channelsGrid')) {
        window.channelsManager = new ChannelsManager();
    }
}
