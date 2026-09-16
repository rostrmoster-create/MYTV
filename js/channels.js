// channels.js - Live TV Channels Management with Real API and Demo Fallback

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

            console.log('Attempting to load channels from API...');

            // Try to get categories first
            const categoriesData = await API.getLiveCategories();
            console.log('Categories response:', categoriesData);

            // Try to get all live streams
            const streamsData = await API.getLiveStreams();
            console.log('Streams response:', streamsData);

            if (streamsData && streamsData.length > 0) {
                // Transform API data to our format
                this.channels = streamsData.map(stream => ({
                    id: stream.stream_id,
                    name: stream.name,
                    logo: stream.stream_icon || `https://via.placeholder.com/120x120/667eea/ffffff?text=${encodeURIComponent(stream.name.substring(0, 2))}`,
                    category: this.getCategoryName(stream.category_id, categoriesData),
                    categoryId: stream.category_id,
                    streamUrl: API.buildLiveStreamUrl(stream.stream_id, stream.container_extension || 'ts'),
                    epg_channel_id: stream.epg_channel_id,
                    num: stream.num
                }));

                // Build categories list
                this.buildCategories(categoriesData);

                console.log(`✓ Loaded ${this.channels.length} channels from API`);
            } else {
                throw new Error('No channels returned from API - using demo content');
            }

        } catch (error) {
            console.warn('API Error:', error.message);
            console.log('Loading demo channels as fallback...');
            
            // Load demo channels as fallback
            this.loadDemoChannels();
        }
    }

    loadDemoChannels() {
        // Demo channels for testing
        this.channels = [
            {
                id: 1,
                name: 'BBC News',
                logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/BBC_News_2019.svg/320px-BBC_News_2019.svg.png',
                category: 'News',
                streamUrl: 'https://d2e1asnsl7br7b.cloudfront.net/7782e205e72f43aeb4a48ec97f66ebbe/index_5.m3u8'
            },
            {
                id: 2,
                name: 'CNN',
                logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/CNN.svg/320px-CNN.svg.png',
                category: 'News',
                streamUrl: 'https://d2e1asnsl7br7b.cloudfront.net/7782e205e72f43aeb4a48ec97f66ebbe/index_5.m3u8'
            },
            {
                id: 3,
                name: 'National Geographic',
                logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Natgeologo.svg/320px-Natgeologo.svg.png',
                category: 'Documentary',
                streamUrl: 'https://d2e1asnsl7br7b.cloudfront.net/7782e205e72f43aeb4a48ec97f66ebbe/index_5.m3u8'
            },
            {
                id: 4,
                name: 'Discovery Channel',
                logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Discovery_Channel_-_Logo_2019.svg/320px-Discovery_Channel_-_Logo_2019.svg.png',
                category: 'Documentary',
                streamUrl: 'https://d2e1asnsl7br7b.cloudfront.net/7782e205e72f43aeb4a48ec97f66ebbe/index_5.m3u8'
            },
            {
                id: 5,
                name: 'ESPN',
                logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/ESPN_wordmark.svg/320px-ESPN_wordmark.svg.png',
                category: 'Sports',
                streamUrl: 'https://d2e1asnsl7br7b.cloudfront.net/7782e205e72f43aeb4a48ec97f66ebbe/index_5.m3u8'
            },
            {
                id: 6,
                name: 'Sky Sports',
                logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e4/Sky_Sports_logo_2020.svg/320px-Sky_Sports_logo_2020.svg.png',
                category: 'Sports',
                streamUrl: 'https://d2e1asnsl7br7b.cloudfront.net/7782e205e72f43aeb4a48ec97f66ebbe/index_5.m3u8'
            },
            {
                id: 7,
                name: 'HBO',
                logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/HBO_logo.svg/320px-HBO_logo.svg.png',
                category: 'Entertainment',
                streamUrl: 'https://d2e1asnsl7br7b.cloudfront.net/7782e205e72f43aeb4a48ec97f66ebbe/index_5.m3u8'
            },
            {
                id: 8,
                name: 'MTV',
                logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/MTV_2021_%28brand_version%29.svg/320px-MTV_2021_%28brand_version%29.svg.png',
                category: 'Music',
                streamUrl: 'https://d2e1asnsl7br7b.cloudfront.net/7782e205e72f43aeb4a48ec97f66ebbe/index_5.m3u8'
            },
            {
                id: 9,
                name: 'Cartoon Network',
                logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Cartoon_Network_2010_logo.svg/320px-Cartoon_Network_2010_logo.svg.png',
                category: 'Kids',
                streamUrl: 'https://d2e1asnsl7br7b.cloudfront.net/7782e205e72f43aeb4a48ec97f66ebbe/index_5.m3u8'
            },
            {
                id: 10,
                name: 'Disney Channel',
                logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/2019_Disney_Channel_logo.svg/320px-2019_Disney_Channel_logo.svg.png',
                category: 'Kids',
                streamUrl: 'https://d2e1asnsl7br7b.cloudfront.net/7782e205e72f43aeb4a48ec97f66ebbe/index_5.m3u8'
            },
            {
                id: 11,
                name: 'Food Network',
                logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Food_Network_logo.svg/320px-Food_Network_logo.svg.png',
                category: 'Lifestyle',
                streamUrl: 'https://d2e1asnsl7br7b.cloudfront.net/7782e205e72f43aeb4a48ec97f66ebbe/index_5.m3u8'
            },
            {
                id: 12,
                name: 'History Channel',
                logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/History_%282021%29.svg/320px-History_%282021%29.svg.png',
                category: 'Documentary',
                streamUrl: 'https://d2e1asnsl7br7b.cloudfront.net/7782e205e72f43aeb4a48ec97f66ebbe/index_5.m3u8'
            },
            {
                id: 13,
                name: 'Comedy Central',
                logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Comedy_Central_2018.svg/320px-Comedy_Central_2018.svg.png',
                category: 'Entertainment',
                streamUrl: 'https://d2e1asnsl7br7b.cloudfront.net/7782e205e72f43aeb4a48ec97f66ebbe/index_5.m3u8'
            },
            {
                id: 14,
                name: 'Fox News',
                logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Fox_News_Channel_logo.svg/320px-Fox_News_Channel_logo.svg.png',
                category: 'News',
                streamUrl: 'https://d2e1asnsl7br7b.cloudfront.net/7782e205e72f43aeb4a48ec97f66ebbe/index_5.m3u8'
            },
            {
                id: 15,
                name: 'Animal Planet',
                logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/2018_Animal_Planet_logo.svg/320px-2018_Animal_Planet_logo.svg.png',
                category: 'Documentary',
                streamUrl: 'https://d2e1asnsl7br7b.cloudfront.net/7782e205e72f43aeb4a48ec97f66ebbe/index_5.m3u8'
            },
            {
                id: 16,
                name: 'Nickelodeon',
                logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Nickelodeon_2009_logo.svg/320px-Nickelodeon_2009_logo.svg.png',
                category: 'Kids',
                streamUrl: 'https://d2e1asnsl7br7b.cloudfront.net/7782e205e72f43aeb4a48ec97f66ebbe/index_5.m3u8'
            }
        ];

        // Build categories from demo data
        const categorySet = new Set(this.channels.map(ch => ch.category));
        this.categories = ['All Channels', ...Array.from(categorySet).sort()];

        console.log(`✓ Loaded ${this.channels.length} demo channels`);
    }

    getCategoryName(categoryId, categories) {
        if (!categories || categories.length === 0) return 'Other';
        const category = categories.find(cat => cat.category_id === categoryId);
        return category ? category.category_name : 'Other';
    }

    buildCategories(categoriesData) {
        const categorySet = new Set();
        
        if (categoriesData && categoriesData.length > 0) {
            categoriesData.forEach(cat => {
                categorySet.add(cat.category_name);
            });
        }

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
                         onerror="this.src='https://via.placeholder.com/120x120/667eea/ffffff?text=${encodeURIComponent(channel.name.substring(0, 2))}'">
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
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('category-btn')) {
                document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                this.currentCategory = e.target.dataset.category;
                this.renderChannels();
            }

            if (e.target.closest('.channel-card') && !e.target.closest('.favorite-btn')) {
                const card = e.target.closest('.channel-card');
                const channelId = parseInt(card.dataset.channelId);
                this.playChannel(channelId);
            }

            if (e.target.closest('.favorite-btn')) {
                e.stopPropagation();
                const btn = e.target.closest('.favorite-btn');
                const channelId = parseInt(btn.dataset.channelId);
                this.toggleFavorite(channelId);
            }
        });

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

        StorageManager.addToRecentlyWatched('channel', {
            id: channel.id,
            name: channel.name,
            logo: channel.logo,
            category: channel.category
        });

        const playerSection = document.getElementById('playerSection');
        const channelsSection = document.getElementById('channelsSection');
        
        if (playerSection && channelsSection) {
            playerSection.style.display = 'block';
            channelsSection.style.display = 'none';
        }

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
