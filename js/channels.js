// Channel Manager - v12
class ChannelManager {
    constructor() {
        this.channels = [];
        this.filteredChannels = [];
        this.currentChannel = null;
        this.initialized = false;
    }

    async loadChannels() {
        if (this.initialized) return;
        
        const channelList = document.getElementById('channelList');
        if (!channelList) return;

        channelList.innerHTML = '<div class="loading">Loading channels...</div>';

        try {
            // Try to load from API first
            const apiChannels = await APIClient.getLiveStreams();
            
            if (apiChannels && apiChannels.length > 0) {
                this.channels = apiChannels;
            } else {
                // Fallback to demo channels
                this.channels = this.getDemoChannels();
            }
        } catch (error) {
            console.error('Error loading channels:', error);
            // Use demo channels on error
            this.channels = this.getDemoChannels();
        }

        this.filteredChannels = [...this.channels];
        this.renderChannels();
        this.setupSearch();
        this.initialized = true;
    }

    getDemoChannels() {
        return [
            {
                id: '1',
                name: 'BBC News',
                logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/BBC_News_2019.svg/320px-BBC_News_2019.svg.png',
                stream_url: 'https://d2vnbkvjbims7j.cloudfront.net/containerA/LTN/playlist.m3u8',
                category: 'News'
            },
            {
                id: '2',
                name: 'CNN International',
                logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/CNN.svg/320px-CNN.svg.png',
                stream_url: 'https://cnn-cnninternational-1-eu.rakuten.wurl.tv/playlist.m3u8',
                category: 'News'
            },
            {
                id: '3',
                name: 'National Geographic',
                logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/National_Geographic_Channel.svg/320px-National_Geographic_Channel.svg.png',
                stream_url: 'https://admdn2.cdn.mangomolo.com/nagtv/smil:nagtv.stream.smil/playlist.m3u8',
                category: 'Documentary'
            },
            {
                id: '4',
                name: 'Discovery Channel',
                logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Discovery_Channel_-_Logo_2019.svg/320px-Discovery_Channel_-_Logo_2019.svg.png',
                stream_url: 'https://food-dlvr-ott.akamaized.net/primary/3/686a061683e44b518cdf57c4cc09497a/index_19.m3u8',
                category: 'Documentary'
            },
            {
                id: '5',
                name: 'ESPN',
                logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/ESPN_wordmark.svg/320px-ESPN_wordmark.svg.png',
                stream_url: 'https://d2vnbkvjbims7j.cloudfront.net/containerA/LTN/playlist.m3u8',
                category: 'Sports'
            },
            {
                id: '6',
                name: 'Sky Sports',
                logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e4/Sky_Sports_logo_2020.svg/320px-Sky_Sports_logo_2020.svg.png',
                stream_url: 'https://d2vnbkvjbims7j.cloudfront.net/containerA/LTN/playlist.m3u8',
                category: 'Sports'
            },
            {
                id: '7',
                name: 'HBO',
                logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/HBO_logo.svg/320px-HBO_logo.svg.png',
                stream_url: 'https://food-dlvr-ott.akamaized.net/primary/3/686a061683e44b518cdf57c4cc09497a/index_19.m3u8',
                category: 'Entertainment'
            },
            {
                id: '8',
                name: 'MTV',
                logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/MTV_2021_%28brand_version%29.svg/320px-MTV_2021_%28brand_version%29.svg.png',
                stream_url: 'https://d2vnbkvjbims7j.cloudfront.net/containerA/LTN/playlist.m3u8',
                category: 'Music'
            },
            {
                id: '9',
                name: 'Cartoon Network',
                logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Cartoon_Network_2010_logo.svg/320px-Cartoon_Network_2010_logo.svg.png',
                stream_url: 'https://food-dlvr-ott.akamaized.net/primary/3/686a061683e44b518cdf57c4cc09497a/index_19.m3u8',
                category: 'Kids'
            },
            {
                id: '10',
                name: 'Disney Channel',
                logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/2019_Disney_Channel_logo.svg/320px-2019_Disney_Channel_logo.svg.png',
                stream_url: 'https://d2vnbkvjbims7j.cloudfront.net/containerA/LTN/playlist.m3u8',
                category: 'Kids'
            },
            {
                id: '11',
                name: 'Food Network',
                logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Food_Network_logo.svg/320px-Food_Network_logo.svg.png',
                stream_url: 'https://food-dlvr-ott.akamaized.net/primary/3/686a061683e44b518cdf57c4cc09497a/index_19.m3u8',
                category: 'Lifestyle'
            },
            {
                id: '12',
                name: 'History Channel',
                logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/History_%282021%29.svg/320px-History_%282021%29.svg.png',
                stream_url: 'https://d2vnbkvjbims7j.cloudfront.net/containerA/LTN/playlist.m3u8',
                category: 'Documentary'
            },
            {
                id: '13',
                name: 'Comedy Central',
                logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Comedy_Central_2018.svg/320px-Comedy_Central_2018.svg.png',
                stream_url: 'https://food-dlvr-ott.akamaized.net/primary/3/686a061683e44b518cdf57c4cc09497a/index_19.m3u8',
                category: 'Entertainment'
            },
            {
                id: '14',
                name: 'Fox News',
                logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Fox_News_Channel_logo.svg/320px-Fox_News_Channel_logo.svg.png',
                stream_url: 'https://d2vnbkvjbims7j.cloudfront.net/containerA/LTN/playlist.m3u8',
                category: 'News'
            },
            {
                id: '15',
                name: 'Animal Planet',
                logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/2018_Animal_Planet_logo.svg/320px-2018_Animal_Planet_logo.svg.png',
                stream_url: 'https://food-dlvr-ott.akamaized.net/primary/3/686a061683e44b518cdf57c4cc09497a/index_19.m3u8',
                category: 'Documentary'
            },
            {
                id: '16',
                name: 'Nickelodeon',
                logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Nickelodeon_2009_logo.svg/320px-Nickelodeon_2009_logo.svg.png',
                stream_url: 'https://d2vnbkvjbims7j.cloudfront.net/containerA/LTN/playlist.m3u8',
                category: 'Kids'
            }
        ];
    }

    renderChannels() {
        const channelList = document.getElementById('channelList');
        if (!channelList) return;

        if (this.filteredChannels.length === 0) {
            channelList.innerHTML = '<div class="loading">No channels found</div>';
            return;
        }

        const html = this.filteredChannels.map(channel => `
            <div class="channel-item" onclick="window.channelManager.playChannel(${JSON.stringify(channel).replace(/"/g, '&quot;')})">
                <img src="${channel.logo || 'assets/placeholder.jpg'}" alt="${channel.name}" onerror="this.src='assets/placeholder.jpg'">
                <div class="channel-item-info">
                    <h4>${channel.name}</h4>
                    <p>${channel.category || 'General'}</p>
                </div>
            </div>
        `).join('');

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
                logo: channel.logo,
                category: channel.category
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

        // Play stream
        if (window.playerManager && channel.stream_url) {
            window.playerManager.playStream(channel.stream_url);
        }

        console.log('Playing channel:', channel.name);
    }

    setupSearch() {
        const searchInput = document.getElementById('channelSearch');
        if (!searchInput) return;

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            
            if (query === '') {
                this.filteredChannels = [...this.channels];
            } else {
                this.filteredChannels = this.channels.filter(channel =>
                    channel.name.toLowerCase().includes(query) ||
                    (channel.category && channel.category.toLowerCase().includes(query))
                );
            }
            
            this.renderChannels();
        });
    }
}

// Initialize channel manager
window.channelManager = new ChannelManager();
