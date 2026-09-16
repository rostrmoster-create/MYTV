/**
 * MYTV Channels Module
 * Handles channel data, categories, and filtering
 */

class Channels {
    constructor() {
        this.storage = new Storage();
        this.channels = [];
        this.categories = [];
        this.currentCategory = 'all';
        this.searchQuery = '';
        
        this.init();
    }

    /**
     * Initialize channels
     */
    init() {
        // Load mock channel data
        // In Stage 11, this will be replaced with real API calls
        this.loadMockChannels();
    }

    /**
     * Load mock channel data for demo
     */
    loadMockChannels() {
        this.channels = [
            // News Channels
            {
                id: 1,
                name: 'CNN International',
                category: 'News',
                logo: 'CNN',
                stream_url: 'https://cnn-cnninternational-1-eu.rakuten.wurl.tv/playlist.m3u8',
                is_live: true
            },
            {
                id: 2,
                name: 'BBC World News',
                category: 'News',
                logo: 'BBC',
                stream_url: 'https://d2vnbkvjbims7j.cloudfront.net/containerA/LTN/playlist.m3u8',
                is_live: true
            },
            {
                id: 3,
                name: 'Bloomberg TV',
                category: 'News',
                logo: 'BTV',
                stream_url: 'https://bloomberg-bloomberg-1-eu.rakuten.wurl.tv/playlist.m3u8',
                is_live: true
            },
            {
                id: 4,
                name: 'Al Jazeera English',
                category: 'News',
                logo: 'AJE',
                stream_url: 'https://live-hls-web-aje.getaj.net/AJE/index.m3u8',
                is_live: true
            },

            // Sports Channels
            {
                id: 5,
                name: 'Red Bull TV',
                category: 'Sports',
                logo: 'RBT',
                stream_url: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8',
                is_live: true
            },
            {
                id: 6,
                name: 'Olympic Channel',
                category: 'Sports',
                logo: 'OLY',
                stream_url: 'https://ott-channels.akamaized.net/out/v1/0448be046e404e98aef0a3c611345d18/index.m3u8',
                is_live: true
            },

            // Entertainment
            {
                id: 7,
                name: 'Tastemade',
                category: 'Entertainment',
                logo: 'TM',
                stream_url: 'https://tastemade-freetv16min-plex.amagi.tv/playlist.m3u8',
                is_live: true
            },
            {
                id: 8,
                name: 'Fashion TV',
                category: 'Entertainment',
                logo: 'FTV',
                stream_url: 'https://fashiontv-fashiontv-1-eu.rakuten.wurl.tv/playlist.m3u8',
                is_live: true
            },

            // Movies
            {
                id: 9,
                name: 'Rakuten Action',
                category: 'Movies',
                logo: 'RAC',
                stream_url: 'https://rakuten-actionmovies-1-eu.rakuten.wurl.tv/playlist.m3u8',
                is_live: true
            },
            {
                id: 10,
                name: 'Rakuten Comedy',
                category: 'Movies',
                logo: 'RCO',
                stream_url: 'https://rakuten-comedy-1-eu.rakuten.wurl.tv/playlist.m3u8',
                is_live: true
            },

            // Documentary
            {
                id: 11,
                name: 'Love Nature',
                category: 'Documentary',
                logo: 'LN',
                stream_url: 'https://d18dyiwu97wm6q.cloudfront.net/playlist.m3u8',
                is_live: true
            },
            {
                id: 12,
                name: 'Smithsonian Channel',
                category: 'Documentary',
                logo: 'SMI',
                stream_url: 'https://smithsonianaus-samsungau.amagi.tv/playlist.m3u8',
                is_live: true
            },

            // Kids
            {
                id: 13,
                name: 'Kidoodle TV',
                category: 'Kids',
                logo: 'KDL',
                stream_url: 'https://kidoodletv-kdtv-1-eu.rakuten.wurl.tv/playlist.m3u8',
                is_live: true
            },
            {
                id: 14,
                name: 'Kartoon Channel',
                category: 'Kids',
                logo: 'KC',
                stream_url: 'https://kartoon-channel.samsung.wurl.tv/playlist.m3u8',
                is_live: true
            },

            // Music
            {
                id: 15,
                name: 'MTV Biggest Pop',
                category: 'Music',
                logo: 'MTV',
                stream_url: 'https://mtv-intl.samsung.wurl.tv/playlist.m3u8',
                is_live: true
            },
            {
                id: 16,
                name: 'Now 70s',
                category: 'Music',
                logo: 'N70',
                stream_url: 'https://lightning-now70s-samsungnz.amagi.tv/playlist.m3u8',
                is_live: true
            }
        ];

        // Extract unique categories
        this.categories = ['All', ...new Set(this.channels.map(ch => ch.category))];
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
        if (this.currentCategory !== 'all' && this.currentCategory !== 'All') {
            filtered = filtered.filter(ch => ch.category === this.currentCategory);
        }

        // Filter by search query
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(ch => 
                ch.name.toLowerCase().includes(query) ||
                ch.category.toLowerCase().includes(query)
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
        return this.channels.find(ch => ch.id === parseInt(id));
    }

    /**
     * Toggle favorite channel
     */
    toggleFavorite(channelId) {
        const channel = this.getChannelById(channelId);
        if (!channel) return false;

        const isFavorited = this.storage.isFavorited(channelId, 'channel');

        if (isFavorited) {
            return this.storage.removeFavorite(channelId, 'channel');
        } else {
            return this.storage.addFavorite({
                id: channelId,
                type: 'channel',
                name: channel.name,
                category: channel.category,
                logo: channel.logo,
                addedAt: new Date().toISOString()
            });
        }
    }

    /**
     * Check if channel is favorited
     */
    isFavorited(channelId) {
        return this.storage.isFavorited(channelId, 'channel');
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
            category: channel.category,
            logo: channel.logo
        });
    }
}

// Export for use in other modules
window.Channels = Channels;
