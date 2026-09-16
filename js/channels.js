```javascript
/**
 * MYTV Channels Module
 * Handles channel data from real IPTV API
 */

class Channels {
    constructor() {
        this.storage = new Storage();
        this.api = new API();
        this.channels = [];
        this.categories = [];
        this.currentCategory = 'all';
        this.searchQuery = '';
        this.isLoading = false;
        
        this.init();
    }

    /**
     * Initialize channels
     */
    async init() {
        // Get user credentials
        const user = this.storage.getUser();
        if (user && user.serverUrl && user.username && user.password) {
            this.api.init(user.serverUrl, user.username, user.password);
            await this.loadChannels();
        }
    }

    /**
     * Load channels from API
     */
    async loadChannels() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        
        try {
            // Fetch categories
            const categoriesData = await this.api.getLiveCategories();
            this.categories = ['All', ...(categoriesData || []).map(cat => cat.category_name)];
            
            // Fetch all live streams
            const streamsData = await this.api.getLiveStreams();
            
            // Transform API data to our format
            this.channels = (streamsData || []).map(stream => ({
                id: stream.stream_id,
                name: stream.name,
                category: stream.category_id,
                category_name: this.getCategoryName(stream.category_id, categoriesData),
                logo: stream.stream_icon || '',
                stream_url: this.api.getLiveStreamUrl(
                    stream.stream_id,
                    stream.container_extension || 'ts'
                ),
                stream_type: stream.stream_type,
                is_live: true,
                epg_channel_id: stream.epg_channel_id,
                added: stream.added,
                custom_sid: stream.custom_sid
            }));

            console.log(`Loaded ${this.channels.length} channels from API`);
        } catch (error) {
            console.error('Error loading channels:', error);

            // Fallback to mock data if API fails
            this.loadMockChannels();
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Get category name by ID
     */
    getCategoryName(categoryId, categories) {
        const category = categories.find(
            cat => cat.category_id === categoryId
        );

        return category ? category.category_name : 'Uncategorized';
    }

    /**
     * Load mock channel data (fallback)
     */
    loadMockChannels() {
        this.channels = [
            {
                id: 1,
                name: 'CNN International',
                category: 'News',
                category_name: 'News',
                logo: '',
                stream_url: 'https://cnn-cnninternational-1-eu.rakuten.wurl.tv/playlist.m3u8',
                is_live: true
            },
            {
                id: 2,
                name: 'BBC World News',
                category: 'News',
                category_name: 'News',
                logo: '',
                stream_url: 'https://d2vnbkvjbims7j.cloudfront.net/containerA/LTN/playlist.m3u8',
                is_live: true
            }
        ];

        this.categories = ['All', 'News'];
    }

    /**
     * Get all categories
     */
    getCategories() {
        return this.categories;
    }

    /**
     * Get filtered channels
     */
    getFilteredChannels() {
        let filtered = this.channels;

        // Filter by category
        if (
            this.currentCategory !== 'all' &&
            this.currentCategory !== 'All'
        ) {
            filtered = filtered.filter(
                ch => ch.category_name === this.currentCategory
            );
        }

        // Filter by search query
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();

            filtered = filtered.filter(ch =>
                ch.name.toLowerCase().includes(query) ||
                (
                    ch.category_name &&
                    ch.category_name.toLowerCase().includes(query)
                )
            );
        }

        return filtered;
    }

    /**
     * Set category filter
     */
    setCategory(category) {
        this.currentCategory = category;
    }

    /**
     * Set search query
     */
    setSearchQuery(query) {
        this.searchQuery = query;
    }

    /**
     * Get channel by ID
     */
    getChannelById(id) {
        return this.channels.find(
            ch => ch.id === parseInt(id)
        );
    }

    /**
     * Toggle favorite channel
     */
    toggleFavorite(channelId) {
        const channel = this.getChannelById(channelId);
        if (!channel) return false;

        const isFavorited = this.storage.isFavorited(
            channelId,
            'channel'
        );

        if (isFavorited) {
            return this.storage.removeFavorite(
                channelId,
                'channel'
            );
        } else {
            return this.storage.addFavorite({
                id: channelId,
                type: 'channel',
                name: channel.name,
                category: channel.category_name,
                logo: channel.logo,
                addedAt: new Date().toISOString()
            });
        }
    }

    /**
     * Check if channel is favorited
     */
    isFavorited(channelId) {
        return this.storage.isFavorited(
            channelId,
            'channel'
        );
    }

    /**
     * Add to recently watched
     */
    addToRecent(channelId) {
        const channel = this.getChannelById(channelId);
        if (!channel) return false;

        return this.storage.addRecent({
            id: channelId,
            type: 'channel',
            name: channel.name,
            category: channel.category_name,
            logo: channel.logo
        });
    }

    /**
     * Reload channels from API
     */
    async reload() {
        await this.loadChannels();
    }
}

// Export for use in other modules
window.Channels = Channels;
```
