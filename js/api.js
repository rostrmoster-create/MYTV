// MYTV API Client - v16 JWT Token Authentication
class XtreamAPI {
    static BACKEND_URL = 'https://mytv-pi-eight.vercel.app/api/xtream';
    
    // Get token from localStorage
    static getToken() {
        const tokenData = localStorage.getItem('authToken');
        return tokenData;
    }

    // Set token in localStorage
    static setToken(token) {
        localStorage.setItem('authToken', token);
    }

    // Remove token
    static clearToken() {
        localStorage.removeItem('authToken');
    }

    // Get headers with auth token
    static getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        return headers;
    }
    
    // Authenticate and get token
    static async authenticate(serverUrl, username, password, profileName) {
        try {
            console.log('🔵 Calling backend authenticate...');
            
            const response = await fetch(`${this.BACKEND_URL}/authenticate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    serverUrl,
                    username,
                    password,
                    profileName
                })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Authentication failed');
            }

            console.log('🟢 Authentication successful, received token');

            // Store the token
            this.setToken(data.token);

            return data;
        } catch (error) {
            console.error('🔴 Authentication error:', error);
            throw error;
        }
    }

    // Check if token is valid
    static async checkSession() {
        try {
            const token = this.getToken();
            if (!token) {
                console.log('🔴 No token found');
                return false;
            }

            const response = await fetch(`${this.BACKEND_URL}/session-status`, {
                headers: this.getHeaders()
            });

            if (!response.ok) {
                console.log('🔴 Token invalid or expired');
                this.clearToken();
                return false;
            }

            const data = await response.json();
            console.log('🟢 Session valid:', data);
            return data.authenticated || false;
        } catch (error) {
            console.error('🔴 Session check error:', error);
            this.clearToken();
            return false;
        }
    }

    // Logout
    static async logout() {
        try {
            await fetch(`${this.BACKEND_URL}/logout`, {
                method: 'POST',
                headers: this.getHeaders()
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.clearToken();
        }
    }

    // Live TV Categories
    static async getLiveCategories() {
        try {
            const response = await fetch(`${this.BACKEND_URL}/live-categories`, {
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to fetch live categories');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching live categories:', error);
            throw error;
        }
    }

    // Live TV Streams
    static async getLiveStreams(categoryId = null) {
        try {
            const url = categoryId 
                ? `${this.BACKEND_URL}/live-streams?category_id=${categoryId}`
                : `${this.BACKEND_URL}/live-streams`;

            const response = await fetch(url, {
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to fetch live streams');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching live streams:', error);
            throw error;
        }
    }

    // Get Live Stream URL
    static async getLiveStreamUrl(streamId) {
        try {
            const response = await fetch(`${this.BACKEND_URL}/live-stream-url`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ streamId })
            });

            if (!response.ok) {
                throw new Error('Failed to get stream URL');
            }

            const data = await response.json();
            return data.url;
        } catch (error) {
            console.error('Error getting live stream URL:', error);
            throw error;
        }
    }

    // VOD Categories
    static async getVODCategories() {
        try {
            const response = await fetch(`${this.BACKEND_URL}/vod-categories`, {
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to fetch VOD categories');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching VOD categories:', error);
            throw error;
        }
    }

    // VOD Streams
    static async getVODStreams(categoryId = null) {
        try {
            const url = categoryId 
                ? `${this.BACKEND_URL}/vod-streams?category_id=${categoryId}`
                : `${this.BACKEND_URL}/vod-streams`;

            const response = await fetch(url, {
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to fetch VOD streams');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching VOD streams:', error);
            throw error;
        }
    }

    // Get VOD Stream URL
    static async getVODStreamUrl(streamId, containerExtension = 'mp4') {
        try {
            const response = await fetch(`${this.BACKEND_URL}/vod-stream-url`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ streamId, containerExtension })
            });

            if (!response.ok) {
                throw new Error('Failed to get VOD stream URL');
            }

            const data = await response.json();
            return data.url;
        } catch (error) {
            console.error('Error getting VOD stream URL:', error);
            throw error;
        }
    }

    // Get VOD Info
    static async getVODInfo(vodId) {
        try {
            const response = await fetch(`${this.BACKEND_URL}/vod-info/${vodId}`, {
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to fetch VOD info');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching VOD info:', error);
            throw error;
        }
    }

    // Series Categories
    static async getSeriesCategories() {
        try {
            const response = await fetch(`${this.BACKEND_URL}/series-categories`, {
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to fetch series categories');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching series categories:', error);
            throw error;
        }
    }

    // Series List
    static async getSeries(categoryId = null) {
        try {
            const url = categoryId 
                ? `${this.BACKEND_URL}/series?category_id=${categoryId}`
                : `${this.BACKEND_URL}/series`;

            const response = await fetch(url, {
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to fetch series');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching series:', error);
            throw error;
        }
    }

    // Get Series Info (seasons and episodes)
    static async getSeriesInfo(seriesId) {
        try {
            const response = await fetch(`${this.BACKEND_URL}/series-info/${seriesId}`, {
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to fetch series info');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching series info:', error);
            throw error;
        }
    }

    // Get Series Episode Stream URL
    static async getSeriesStreamUrl(streamId, containerExtension = 'mp4') {
        try {
            const response = await fetch(`${this.BACKEND_URL}/series-stream-url`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ streamId, containerExtension })
            });

            if (!response.ok) {
                throw new Error('Failed to get series stream URL');
            }

            const data = await response.json();
            return data.url;
        } catch (error) {
            console.error('Error getting series stream URL:', error);
            throw error;
        }
    }
}
