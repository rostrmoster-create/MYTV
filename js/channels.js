// Channel Manager - v13 (Real Xtream Codes API)
class ChannelManager {
    constructor() {
        this.channels = [];
        this.categories = [];
        this.filteredChannels = [];
        this.currentChannel = null;
        this.initialized = false;
        this.selectedCategory = null;
    }

    async loadChannels() {
        if (this.initialized) return;
        
        const channelList = document.getElementById('channelList');
        if (!channelList) return;

        channelList.innerHTML = '<div class="loading">Loading channels from your server...</div>';

        try {
            // Check if user is authenticated
            if (!XtreamAPI.isAuthenticated()) {
                channelList.innerHTML = '<div class="loading">Please login to view channels</div>';
                return;
            }

            // Load categories first
            this.categories = await XtreamAPI.getLiveCategories();
            
            // Load all live streams
            const streams = await XtreamAPI.getLiveStreams();
            
            if (!streams || streams.length === 0) {
                channelList.innerHTML = '<div class="loading">No channels available in your account</div>';
                this.initialized = true;
                return;
            }

            // Map streams to channel format
            this.channels = streams.map(stream => ({
                id: stream.stream_id || stream.num,
                num: stream.num,
                name: stream.name,
                stream_icon: stream.stream_icon,
                category_id: stream.category_id,
                category_name: stream.category_name,
                stream_type: stream.stream_type,
                epg_channel_id: stream.epg_channel_id,
                added: stream.added,
                custom_sid: stream.custom_sid,
                tv_archive: stream.tv_archive,
                direct_source: stream.direct_source,
                tv_archive_duration: stream.tv_archive_duration
            }));

            this.filteredChannels = [...this.channels];
            this.renderChannels();
            this.renderCategoryFilter();
            this.setupSearch();
            this.initialized = true;

            console.log(`Loaded ${this.channels.length} channels from Xtream API`);
        } catch (error) {
            console.error('Error loading channels:', error);
            channelList.innerHTML = '<div class="loading">Error loading channels. Please check your connection.</div>';
        }
    }

    renderCategoryFilter() {
        const searchContainer = document.querySelector('#livetvSection .section-controls');
        if (!searchContainer || this.categories.length === 0) return;

        // Check if filter already exists
        if (document.getElementById('categoryFilterSelect')) return;

        const filterSelect = document.createElement('select');
        filterSelect.id = 'categoryFilterSelect';
        filterSelect.className = 'genre-filter';
        filterSelect.innerHTML = '<option value="">All Categories</option>';
        
        this.categories.forEach(cat => {
            filterSelect.innerHTML += `<option value="${cat.category_id}">${cat.category_name}</option>`;
        });

        filterSelect.addEventListener('change', (e) => {
            this.selectedCategory = e.target.value;
            this.applyFilters();
        });

        searchContainer.appendChild(filterSelect);
    }

    renderChannels() {
        const channelList = document.getElementById('channelList');
        if (!channelList) return;

        if (this.filteredChannels.length === 0) {
            channelList.innerHTML = '<div class="loading">No channels found</div>';
            return;
        }

        const html = this.filteredChannels.map(channel => {
            const logo = channel.stream_icon || 'assets/placeholder.jpg';
            const categoryName = channel.category_name || 'General';
            
            return `
                <div class="channel-item" onclick="window.channelManager.playChannel(${JSON.stringify(channel).replace(/"/g, '&quot;')})">
                    <img src="${logo}" alt="${channel.name}" onerror="this.src='assets/placeholder.jpg'">
                    <div class="channel-item-info">
                        <h4>${channel.name}</h4>
                        <p>${categoryName}</p>
                    </div>
                </div>
            `;
        }).join('');

        channelList.innerHTML = html;
    }

    playChannel(channel) {
        this.currentChannel = channel;
        
        // Add to recently watched
        if (typeof window.addToRecentlyWatched === 'function') {
            window.addToRecentlyWatched({
                type: 'channel',
                id: channel.id,
                name: channel.name,
                logo: channel.stream_icon,
                category: channel.category_name
            });
        }

        // Update UI
        const channelInfo = document.getElementById('channelInfo');
        const channelName = document.getElementById('currentChannelName');
        const playerOverlay = document.getElementById('playerOverlay');

        if (channelInfo && channelName) {
            channelName.textContent = channel.name;
            channelInfo.style.display = 'block';
        }

        if (playerOverlay) {
            playerOverlay.style.display = 'none';
        }

        // Get stream URL from API
        const streamUrl = XtreamAPI.getLiveStreamUrl(channel.id);
        
        // Play stream
        if (window.playerManager && streamUrl) {
            window.playerManager.playStream(streamUrl);
            console.log('Playing channel:', channel.name, 'URL:', streamUrl);
        } else {
            console.error('Unable to play channel - no stream URL');
        }
    }

    setupSearch() {
        const searchInput = document.getElementById('channelSearch');
        if (!searchInput) return;

        searchInput.addEventListener('input', (e) => {
            this.applyFilters();
        });
    }

    applyFilters() {
        const searchInput = document.getElementById('channelSearch');
        const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
        
        this.filteredChannels = this.channels.filter(channel => {
            const matchesSearch = !query || 
                channel.name.toLowerCase().includes(query) ||
                (channel.category_name && channel.category_name.toLowerCase().includes(query));
            
            const matchesCategory = !this.selectedCategory || 
                channel.category_id == this.selectedCategory;
            
            return matchesSearch && matchesCategory;
        });
        
        this.renderChannels();
    }
}

// Initialize channel manager
window.channelManager = new ChannelManager();
