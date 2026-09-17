// Xtream Codes API Client - v13
class XtreamAPI {
    static credentials = null;

    static loadCredentials() {
        if (!this.credentials) {
            this.credentials = StorageManager.get('xtreamCredentials');
        }
        return this.credentials;
    }

    static async authenticate(serverUrl, username, password) {
        try {
            const url = `${serverUrl}/player_api.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                return {
                    success: false,
                    message: `Server error: ${response.status}`
                };
            }

            const data = await response.json();

            // Check if authentication was successful
            if (data.user_info && data.user_info.auth === 1) {
                return {
                    success: true,
                    userInfo: data.user_info,
                    serverInfo: data.server_info
                };
            } else if (data.user_info && data.user_info.auth === 0) {
                return {
                    success: false,
                    message: 'Invalid username or password'
                };
            } else {
                return {
                    success: false,
                    message: 'Invalid server response'
                };
            }
        } catch (error) {
            console.error('Authentication error:', error);
            return {
                success: false,
                message: 'Unable to connect to server. Please check the URL.'
            };
        }
    }

    static async getLiveCategories() {
        const creds = this.loadCredentials();
        if (!creds) return [];

        try {
            const url = `${creds.serverUrl}/player_api.php?username=${encodeURIComponent(creds.username)}&password=${encodeURIComponent(creds.password)}&action=get_live_categories`;
            const response = await fetch(url);
            
            if (!response.ok) throw new Error('Failed to fetch categories');
            
            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error fetching live categories:', error);
            return [];
        }
    }

    static async getLiveStreams(categoryId = null) {
        const creds = this.loadCredentials();
        if (!creds) return [];

        try {
            let url = `${creds.serverUrl}/player_api.php?username=${encodeURIComponent(creds.username)}&password=${encodeURIComponent(creds.password)}&action=get_live_streams`;
            
            if (categoryId) {
                url += `&category_id=${categoryId}`;
            }

            const response = await fetch(url);
            
            if (!response.ok) throw new Error('Failed to fetch live streams');
            
            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error fetching live streams:', error);
            return [];
        }
    }

    static getLiveStreamUrl(streamId) {
        const creds = this.loadCredentials();
        if (!creds) return null;

        return `${creds.serverUrl}/live/${encodeURIComponent(creds.username)}/${encodeURIComponent(creds.password)}/${streamId}.m3u8`;
    }

    static async getVODCategories() {
        const creds = this.loadCredentials();
        if (!creds) return [];

        try {
            const url = `${creds.serverUrl}/player_api.php?username=${encodeURIComponent(creds.username)}&password=${encodeURIComponent(creds.password)}&action=get_vod_categories`;
            const response = await fetch(url);
            
            if (!response.ok) throw new Error('Failed to fetch VOD categories');
            
            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error fetching VOD categories:', error);
            return [];
        }
    }

    static async getVODStreams(categoryId = null) {
        const creds = this.loadCredentials();
        if (!creds) return [];

        try {
            let url = `${creds.serverUrl}/player_api.php?username=${encodeURIComponent(creds.username)}&password=${encodeURIComponent(creds.password)}&action=get_vod_streams`;
            
            if (categoryId) {
                url += `&category_id=${categoryId}`;
            }

            const response = await fetch(url);
            
            if (!response.ok) throw new Error('Failed to fetch VOD streams');
            
            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error fetching VOD streams:', error);
            return [];
        }
    }

    static getVODStreamUrl(streamId, containerExtension = 'mp4') {
        const creds = this.loadCredentials();
        if (!creds) return null;

        return `${creds.serverUrl}/movie/${encodeURIComponent(creds.username)}/${encodeURIComponent(creds.password)}/${streamId}.${containerExtension}`;
    }

    static async getVODInfo(vodId) {
        const creds = this.loadCredentials();
        if (!creds) return null;

        try {
            const url = `${creds.serverUrl}/player_api.php?username=${encodeURIComponent(creds.username)}&password=${encodeURIComponent(creds.password)}&action=get_vod_info&vod_id=${vodId}`;
            const response = await fetch(url);
            
            if (!response.ok) throw new Error('Failed to fetch VOD info');
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching VOD info:', error);
            return null;
        }
    }

    static async getSeriesCategories() {
        const creds = this.loadCredentials();
        if (!creds) return [];

        try {
            const url = `${creds.serverUrl}/player_api.php?username=${encodeURIComponent(creds.username)}&password=${encodeURIComponent(creds.password)}&action=get_series_categories`;
            const response = await fetch(url);
            
            if (!response.ok) throw new Error('Failed to fetch series categories');
            
            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error fetching series categories:', error);
            return [];
        }
    }

    static async getSeries(categoryId = null) {
        const creds = this.loadCredentials();
        if (!creds) return [];

        try {
            let url = `${creds.serverUrl}/player_api.php?username=${encodeURIComponent(creds.username)}&password=${encodeURIComponent(creds.password)}&action=get_series`;
            
            if (categoryId) {
                url += `&category_id=${categoryId}`;
            }

            const response = await fetch(url);
            
            if (!response.ok) throw new Error('Failed to fetch series');
            
            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error fetching series:', error);
            return [];
        }
    }

    static async getSeriesInfo(seriesId) {
        const creds = this.loadCredentials();
        if (!creds) return null;

        try {
            const url = `${creds.serverUrl}/player_api.php?username=${encodeURIComponent(creds.username)}&password=${encodeURIComponent(creds.password)}&action=get_series_info&series_id=${seriesId}`;
            const response = await fetch(url);
            
            if (!response.ok) throw new Error('Failed to fetch series info');
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching series info:', error);
            return null;
        }
    }

    static getSeriesStreamUrl(streamId, containerExtension = 'mp4') {
        const creds = this.loadCredentials();
        if (!creds) return null;

        return `${creds.serverUrl}/series/${encodeURIComponent(creds.username)}/${encodeURIComponent(creds.password)}/${streamId}.${containerExtension}`;
    }

    static isAuthenticated() {
        const creds = this.loadCredentials();
        return creds !== null && creds.serverUrl && creds.username && creds.password;
    }

    static logout() {
        StorageManager.remove('xtreamCredentials');
        StorageManager.remove('currentUser');
        this.credentials = null;
    }
}

// Make XtreamAPI globally available
window.XtreamAPI = XtreamAPI;
