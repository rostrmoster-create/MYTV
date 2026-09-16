// api.js - Xtream Codes API Integration

const API = {
    serverUrl: '',
    username: '',
    password: '',
    authInfo: null,

    init(serverUrl, username, password) {
        this.serverUrl = serverUrl.replace(/\/$/, ''); // Remove trailing slash
        this.username = username;
        this.password = password;
    },

    async authenticate() {
        try {
            const url = `${this.serverUrl}/player_api.php?username=${this.username}&password=${this.password}`;
            
            console.log('Authenticating with:', this.serverUrl);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Server returned ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data.user_info && data.user_info.auth === 1) {
                this.authInfo = data;
                console.log('Authentication successful');
                return data;
            } else if (data.user_info && data.user_info.auth === 0) {
                throw new Error('Invalid username or password');
            } else {
                throw new Error('Invalid server response');
            }
            
        } catch (error) {
            console.error('Authentication error:', error);
            
            if (error.message.includes('Failed to fetch')) {
                throw new Error('Cannot connect to server. Please check the URL and your internet connection.');
            }
            
            throw error;
        }
    },

    async getLiveCategories() {
        try {
            const url = `${this.serverUrl}/player_api.php?username=${this.username}&password=${this.password}&action=get_live_categories`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error('Failed to fetch live categories');
            }
            
            const data = await response.json();
            return data;
            
        } catch (error) {
            console.error('Error fetching live categories:', error);
            return [];
        }
    },

    async getLiveStreams(categoryId = null) {
        try {
            let url = `${this.serverUrl}/player_api.php?username=${this.username}&password=${this.password}&action=get_live_streams`;
            
            if (categoryId) {
                url += `&category_id=${categoryId}`;
            }
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error('Failed to fetch live streams');
            }
            
            const data = await response.json();
            return data;
            
        } catch (error) {
            console.error('Error fetching live streams:', error);
            throw error;
        }
    },

    async getVODCategories() {
        try {
            const url = `${this.serverUrl}/player_api.php?username=${this.username}&password=${this.password}&action=get_vod_categories`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error('Failed to fetch VOD categories');
            }
            
            const data = await response.json();
            return data;
            
        } catch (error) {
            console.error('Error fetching VOD categories:', error);
            return [];
        }
    },

    async getVODStreams(categoryId = null) {
        try {
            let url = `${this.serverUrl}/player_api.php?username=${this.username}&password=${this.password}&action=get_vod_streams`;
            
            if (categoryId) {
                url += `&category_id=${categoryId}`;
            }
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error('Failed to fetch VOD streams');
            }
            
            const data = await response.json();
            return data;
            
        } catch (error) {
            console.error('Error fetching VOD streams:', error);
            throw error;
        }
    },

    async getSeriesCategories() {
        try {
            const url = `${this.serverUrl}/player_api.php?username=${this.username}&password=${this.password}&action=get_series_categories`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error('Failed to fetch series categories');
            }
            
            const data = await response.json();
            return data;
            
        } catch (error) {
            console.error('Error fetching series categories:', error);
            return [];
        }
    },

    async getSeries(categoryId = null) {
        try {
            let url = `${this.serverUrl}/player_api.php?username=${this.username}&password=${this.password}&action=get_series`;
            
            if (categoryId) {
                url += `&category_id=${categoryId}`;
            }
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error('Failed to fetch series');
            }
            
            const data = await response.json();
            return data;
            
        } catch (error) {
            console.error('Error fetching series:', error);
            throw error;
        }
    },

    async getSeriesInfo(seriesId) {
        try {
            const url = `${this.serverUrl}/player_api.php?username=${this.username}&password=${this.password}&action=get_series_info&series_id=${seriesId}`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error('Failed to fetch series info');
            }
            
            const data = await response.json();
            return data;
            
        } catch (error) {
            console.error('Error fetching series info:', error);
            throw error;
        }
    },

    buildLiveStreamUrl(streamId, extension = 'ts') {
        return `${this.serverUrl}/live/${this.username}/${this.password}/${streamId}.${extension}`;
    },

    buildVODStreamUrl(streamId, extension = 'mp4') {
        return `${this.serverUrl}/movie/${this.username}/${this.password}/${streamId}.${extension}`;
    },

    buildSeriesStreamUrl(streamId, extension = 'mp4') {
        return `${this.serverUrl}/series/${this.username}/${this.password}/${streamId}.${extension}`;
    }
};

console.log('API module loaded successfully');
