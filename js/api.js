// Xtream Codes API Client - v14 (Fixed with detailed error logging)
class XtreamAPI {
    static credentials = null;

    static loadCredentials() {
        if (!this.credentials) {
            this.credentials = StorageManager.get('xtreamCredentials');
        }
        return this.credentials;
    }

    static normalizeServerUrl(url) {
        // Remove trailing slashes
        let normalized = url.replace(/\/+$/, '');
        
        // Ensure protocol exists
        if (!/^https?:\/\//i.test(normalized)) {
            normalized = 'http://' + normalized;
        }
        
        console.log('Normalized URL:', normalized);
        return normalized;
    }

    static async authenticate(serverUrl, username, password) {
        try {
            // Normalize the server URL
            const normalizedUrl = this.normalizeServerUrl(serverUrl);
            
            // Build authentication URL
            const authUrl = `${normalizedUrl}/player_api.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
            
            console.log('=== Xtream API Authentication Debug ===');
            console.log('Server URL (input):', serverUrl);
            console.log('Server URL (normalized):', normalizedUrl);
            console.log('Username:', username);
            console.log('Password:', password ? '***' + password.slice(-3) : 'empty');
            console.log('Full Auth URL:', authUrl);
            console.log('Attempting to connect...');

            // Make the request
            const response = await fetch(authUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
                mode: 'cors', // Explicitly set CORS mode
                cache: 'no-cache'
            });

            console.log('Response status:', response.status);
            console.log('Response OK:', response.ok);
            console.log('Response headers:', [...response.headers.entries()]);

            if (!response.ok) {
                console.error('HTTP Error:', response.status, response.statusText);
                return {
                    success: false,
                    message: `HTTP ${response.status}: ${response.statusText}`,
                    errorType: 'http_error',
                    statusCode: response.status
                };
            }

            // Parse response
            const contentType = response.headers.get('content-type');
            console.log('Content-Type:', contentType);

            let data;
            const responseText = await response.text();
            console.log('Raw response:', responseText.substring(0, 500));

            try {
                data = JSON.parse(responseText);
                console.log('Parsed JSON data:', data);
            } catch (parseError) {
                console.error('JSON Parse Error:', parseError);
                console.error('Response was not valid JSON:', responseText);
                return {
                    success: false,
                    message: 'Server returned invalid JSON response',
                    errorType: 'invalid_json',
                    rawResponse: responseText.substring(0, 200)
                };
            }

            // Check authentication result
            console.log('User info:', data.user_info);
            console.log('Server info:', data.server_info);

            if (data.user_info) {
                if (data.user_info.auth === 1 || data.user_info.auth === '1') {
                    console.log('✓ Authentication successful!');
                    console.log('User status:', data.user_info.status);
                    console.log('User expiry:', data.user_info.exp_date);
                    
                    return {
                        success: true,
                        userInfo: data.user_info,
                        serverInfo: data.server_info || {}
                    };
                } else if (data.user_info.auth === 0 || data.user_info.auth === '0') {
                    console.error('✗ Authentication failed - Invalid credentials');
                    return {
                        success: false,
                        message: 'Invalid username or password',
                        errorType: 'invalid_credentials'
                    };
                }
            }

            // If we get here, response structure is unexpected
            console.error('Unexpected response structure:', data);
            return {
                success: false,
                message: 'Unexpected server response format',
                errorType: 'unexpected_response',
                data: data
            };

        } catch (error) {
            console.error('=== Authentication Error ===');
            console.error('Error type:', error.name);
            console.error('Error message:', error.message);
            console.error('Full error:', error);

            // Determine specific error type
            if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                console.error('This is likely a CORS or network connectivity issue');
                console.error('Possible causes:');
                console.error('1. CORS is not enabled on the Xtream server');
                console.error('2. The server URL is incorrect or unreachable');
                console.error('3. The server is blocking cross-origin requests');
                console.error('4. Network firewall or DNS issue');
                
                return {
                    success: false,
                    message: 'Connection failed. This may be a CORS issue or the server is unreachable. Check console for details.',
                    errorType: 'cors_or_network',
                    technicalDetails: error.message
                };
            }

            if (error.name === 'AbortError') {
                return {
                    success: false,
                    message: 'Request timeout - server took too long to respond',
                    errorType: 'timeout'
                };
            }

            return {
                success: false,
                message: `Connection error: ${error.message}`,
                errorType: 'unknown',
                technicalDetails: error.toString()
            };
        }
    }

    static async getLiveCategories() {
        const creds = this.loadCredentials();
        if (!creds) {
            console.error('No credentials loaded');
            return [];
        }

        try {
            const url = `${creds.serverUrl}/player_api.php?username=${encodeURIComponent(creds.username)}&password=${encodeURIComponent(creds.password)}&action=get_live_categories`;
            console.log('Fetching live categories:', url);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                console.error('Failed to fetch live categories:', response.status);
                return [];
            }
            
            const data = await response.json();
            console.log('Live categories loaded:', data.length);
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error fetching live categories:', error);
            return [];
        }
    }

    static async getLiveStreams(categoryId = null) {
        const creds = this.loadCredentials();
        if (!creds) {
            console.error('No credentials loaded');
            return [];
        }

        try {
            let url = `${creds.serverUrl}/player_api.php?username=${encodeURIComponent(creds.username)}&password=${encodeURIComponent(creds.password)}&action=get_live_streams`;
            
            if (categoryId) {
                url += `&category_id=${categoryId}`;
            }

            console.log('Fetching live streams:', categoryId ? `category ${categoryId}` : 'all');
            const response = await fetch(url);
            
            if (!response.ok) {
                console.error('Failed to fetch live streams:', response.status);
                return [];
            }
            
            const data = await response.json();
            console.log('Live streams loaded:', data.length);
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error fetching live streams:', error);
            return [];
        }
    }

    static getLiveStreamUrl(streamId) {
        const creds = this.loadCredentials();
        if (!creds) {
            console.error('No credentials for stream URL');
            return null;
        }

        const url = `${creds.serverUrl}/live/${encodeURIComponent(creds.username)}/${encodeURIComponent(creds.password)}/${streamId}.m3u8`;
        console.log('Live stream URL:', url);
        return url;
    }

    static async getVODCategories() {
        const creds = this.loadCredentials();
        if (!creds) {
            console.error('No credentials loaded');
            return [];
        }

        try {
            const url = `${creds.serverUrl}/player_api.php?username=${encodeURIComponent(creds.username)}&password=${encodeURIComponent(creds.password)}&action=get_vod_categories`;
            console.log('Fetching VOD categories:', url);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                console.error('Failed to fetch VOD categories:', response.status);
                return [];
            }
            
            const data = await response.json();
            console.log('VOD categories loaded:', data.length);
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error fetching VOD categories:', error);
            return [];
        }
    }

    static async getVODStreams(categoryId = null) {
        const creds = this.loadCredentials();
        if (!creds) {
            console.error('No credentials loaded');
            return [];
        }

        try {
            let url = `${creds.serverUrl}/player_api.php?username=${encodeURIComponent(creds.username)}&password=${encodeURIComponent(creds.password)}&action=get_vod_streams`;
            
            if (categoryId) {
                url += `&category_id=${categoryId}`;
            }

            console.log('Fetching VOD streams:', categoryId ? `category ${categoryId}` : 'all');
            const response = await fetch(url);
            
            if (!response.ok) {
                console.error('Failed to fetch VOD streams:', response.status);
                return [];
            }
            
            const data = await response.json();
            console.log('VOD streams loaded:', data.length);
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error fetching VOD streams:', error);
            return [];
        }
    }

    static getVODStreamUrl(streamId, containerExtension = 'mp4') {
        const creds = this.loadCredentials();
        if (!creds) {
            console.error('No credentials for VOD URL');
            return null;
        }

        const url = `${creds.serverUrl}/movie/${encodeURIComponent(creds.username)}/${encodeURIComponent(creds.password)}/${streamId}.${containerExtension}`;
        console.log('VOD stream URL:', url);
        return url;
    }

    static async getVODInfo(vodId) {
        const creds = this.loadCredentials();
        if (!creds) {
            console.error('No credentials loaded');
            return null;
        }

        try {
            const url = `${creds.serverUrl}/player_api.php?username=${encodeURIComponent(creds.username)}&password=${encodeURIComponent(creds.password)}&action=get_vod_info&vod_id=${vodId}`;
            console.log('Fetching VOD info for:', vodId);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                console.error('Failed to fetch VOD info:', response.status);
                return null;
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching VOD info:', error);
            return null;
        }
    }

    static async getSeriesCategories() {
        const creds = this.loadCredentials();
        if (!creds) {
            console.error('No credentials loaded');
            return [];
        }

        try {
            const url = `${creds.serverUrl}/player_api.php?username=${encodeURIComponent(creds.username)}&password=${encodeURIComponent(creds.password)}&action=get_series_categories`;
            console.log('Fetching series categories:', url);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                console.error('Failed to fetch series categories:', response.status);
                return [];
            }
            
            const data = await response.json();
            console.log('Series categories loaded:', data.length);
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error fetching series categories:', error);
            return [];
        }
    }

    static async getSeries(categoryId = null) {
        const creds = this.loadCredentials();
        if (!creds) {
            console.error('No credentials loaded');
            return [];
        }

        try {
            let url = `${creds.serverUrl}/player_api.php?username=${encodeURIComponent(creds.username)}&password=${encodeURIComponent(creds.password)}&action=get_series`;
            
            if (categoryId) {
                url += `&category_id=${categoryId}`;
            }

            console.log('Fetching series:', categoryId ? `category ${categoryId}` : 'all');
            const response = await fetch(url);
            
            if (!response.ok) {
                console.error('Failed to fetch series:', response.status);
                return [];
            }
            
            const data = await response.json();
            console.log('Series loaded:', data.length);
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error fetching series:', error);
            return [];
        }
    }

    static async getSeriesInfo(seriesId) {
        const creds = this.loadCredentials();
        if (!creds) {
            console.error('No credentials loaded');
            return null;
        }

        try {
            const url = `${creds.serverUrl}/player_api.php?username=${encodeURIComponent(creds.username)}&password=${encodeURIComponent(creds.password)}&action=get_series_info&series_id=${seriesId}`;
            console.log('Fetching series info for:', seriesId);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                console.error('Failed to fetch series info:', response.status);
                return null;
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching series info:', error);
            return null;
        }
    }

    static getSeriesStreamUrl(streamId, containerExtension = 'mp4') {
        const creds = this.loadCredentials();
        if (!creds) {
            console.error('No credentials for series URL');
            return null;
        }

        const url = `${creds.serverUrl}/series/${encodeURIComponent(creds.username)}/${encodeURIComponent(creds.password)}/${streamId}.${containerExtension}`;
        console.log('Series stream URL:', url);
        return url;
    }

    static isAuthenticated() {
        const creds = this.loadCredentials();
        const isAuth = creds !== null && creds.serverUrl && creds.username && creds.password;
        console.log('Is authenticated:', isAuth);
        return isAuth;
    }

    static logout() {
        console.log('Logging out - clearing credentials');
        StorageManager.remove('xtreamCredentials');
        StorageManager.remove('currentUser');
        this.credentials = null;
    }
}

// Make XtreamAPI globally available
window.XtreamAPI = XtreamAPI;

console.log('XtreamAPI v14 loaded - Full debugging enabled');
