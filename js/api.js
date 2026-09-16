/**
 * MYTV API Module
 * Handles connection to Xtream Codes IPTV API
 */

class API {
    constructor() {
        this.storage = new Storage();
        this.baseUrl = '';
        this.username = '';
        this.password = '';
        this.serverInfo = null;
        this.userInfo = null;
    }

    /**
     * Initialize API with credentials
     */
    init(serverUrl, username, password) {
        // Clean up server URL
        this.baseUrl = serverUrl.replace(/\/$/, ''); // Remove trailing slash
        this.username = username;
        this.password = password;
    }

    /**
     * Authenticate with the server
     */
    async authenticate() {
        try {
            const response = await fetch(
                `${this.baseUrl}/player_api.php?username=${this.username}&password=${this.password}`
            );

            if (!response.ok) {
                throw new Error('Authentication failed');
            }

            const data = await response.json();

            if (data.user_info && data.user_info.auth === 1) {
                this.serverInfo = data.server_info;
                this.userInfo = data.user_info;
                return {
                    success: true,
                    data: data
                };
            } else {
                return {
                    success: false,
                    error: 'Invalid credentials'
                };
            }
        } catch (error) {
            console.error('Authentication error:', error);
            return {
                success: false,
                error: error.message || 'Connection failed. Please check your server URL.'
            };
        }
    }

    /**
     * Get live categories
     */
    async getLiveCategories() {
        try {
            const response = await fetch(
                `${this.baseUrl}/player_api.php?username=${this.username}&password=${this.password}&action=get_live_categories`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch categories');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching categories:', error);
            return [];
        }
    }

    /**
     * Get live streams
     */
    async getLiveStreams(categoryId = null) {
        try {
            let url = `${this.baseUrl}/player_api.php?username=${this.username}&password=${this.password}&action=get_live_streams`;
            
            if (categoryId) {
                url += `&category_id=${categoryId}`;
            }

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('Failed to fetch streams');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching streams:', error);
            return [];
        }
    }

    /**
     * Get VOD categories
     */
    async getVODCategories() {
        try {
            const response = await fetch(
                `${this.baseUrl}/player_api.php?username=${this.username}&password=${this.password}&action=get_vod_categories`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch VOD categories');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching VOD categories:', error);
            return [];
        }
    }

    /**
     * Get VOD streams (movies)
     */
    async getVODStreams(categoryId = null) {
        try {
            let url = `${this.baseUrl}/player_api.php?username=${this.username}&password=${this.password}&action=get_vod_streams`;
            
            if (categoryId) {
                url += `&category_id=${categoryId}`;
            }

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('Failed to fetch VOD streams');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching VOD streams:', error);
            return [];
        }
    }

    /**
     * Get VOD info
     */
    async getVODInfo(vodId) {
        try {
            const response = await fetch(
                `${this.baseUrl}/player_api.php?username=${this.username}&password=${this.password}&action=get_vod_info&vod_id=${vodId}`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch VOD info');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching VOD info:', error);
            return null;
        }
    }

    /**
     * Get series categories
     */
    async getSeriesCategories() {
        try {
            const response = await fetch(
                `${this.baseUrl}/player_api.php?username=${this.username}&password=${this.password}&action=get_series_categories`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch series categories');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching series categories:', error);
            return [];
        }
    }

    /**
     * Get series
     */
    async getSeries(categoryId = null) {
        try {
            let url = `${this.baseUrl}/player_api.php?username=${this.username}&password=${this.password}&action=get_series`;
            
            if (categoryId) {
                url += `&category_id=${categoryId}`;
            }

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('Failed to fetch series');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching series:', error);
            return [];
        }
    }

    /**
     * Get series info
     */
    async getSeriesInfo(seriesId) {
        try {
            const response = await fetch(
                `${this.baseUrl}/player_api.php?username=${this.username}&password=${this.password}&action=get_series_info&series_id=${seriesId}`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch series info');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching series info:', error);
            return null;
        }
    }

    /**
     * Build stream URL for live channel
     */
    getLiveStreamUrl(streamId, extension = 'ts') {
        return `${this.baseUrl}/live/${this.username}/${this.password}/${streamId}.${extension}`;
    }

    /**
     * Build stream URL for VOD
     */
    getVODStreamUrl(streamId, extension = 'mp4') {
        return `${this.baseUrl}/movie/${this.username}/${this.password}/${streamId}.${extension}`;
    }

    /**
     * Build stream URL for series episode
     */
    getSeriesStreamUrl(streamId, extension = 'mp4') {
        return `${this.baseUrl}/series/${this.username}/${this.password}/${streamId}.${extension}`;
    }

    /**
     * Get user info
     */
    getUserInfo() {
        return this.userInfo;
    }

    /**
     * Get server info
     */
    getServerInfo() {
        return this.serverInfo;
    }
}

// Export for use in other modules
window.API = API;
