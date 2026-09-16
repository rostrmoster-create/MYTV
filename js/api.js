// API Client - v12
class APIClient {
    static baseURL = 'http://b2wbs.com';
    static username = '02DC5442951471A';
    static password = 'TQo9GN8An0';

    static async authenticate() {
        try {
            const url = `${this.baseURL}/player_api.php?username=${this.username}&password=${this.password}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error('Authentication failed');
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API Authentication Error:', error);
            return null;
        }
    }

    static async getLiveStreams() {
        try {
            const url = `${this.baseURL}/player_api.php?username=${this.username}&password=${this.password}&action=get_live_streams`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error('Failed to fetch live streams');
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API Error (Live Streams):', error);
            return [];
        }
    }

    static async getVODStreams() {
        try {
            const url = `${this.baseURL}/player_api.php?username=${this.username}&password=${this.password}&action=get_vod_streams`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error('Failed to fetch VOD streams');
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API Error (VOD):', error);
            return [];
        }
    }

    static async getSeries() {
        try {
            const url = `${this.baseURL}/player_api.php?username=${this.username}&password=${this.password}&action=get_series`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error('Failed to fetch series');
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API Error (Series):', error);
            return [];
        }
    }

    static getStreamURL(streamId, type = 'live') {
        return `${this.baseURL}/${type}/${this.username}/${this.password}/${streamId}.m3u8`;
    }
}
