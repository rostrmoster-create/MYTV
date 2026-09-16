// storage.js - Local Storage Management with Fallback

class StorageManager {
    static memoryStorage = {}; // Fallback storage

    static isLocalStorageAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    static getItem(key) {
        try {
            if (this.isLocalStorageAvailable()) {
                return localStorage.getItem(key);
            } else {
                return this.memoryStorage[key] || null;
            }
        } catch (e) {
            console.warn('Storage get failed, using memory:', e);
            return this.memoryStorage[key] || null;
        }
    }

    static setItem(key, value) {
        try {
            if (this.isLocalStorageAvailable()) {
                localStorage.setItem(key, value);
            } else {
                this.memoryStorage[key] = value;
            }
        } catch (e) {
            console.warn('Storage set failed, using memory:', e);
            this.memoryStorage[key] = value;
        }
    }

    static removeItem(key) {
        try {
            if (this.isLocalStorageAvailable()) {
                localStorage.removeItem(key);
            } else {
                delete this.memoryStorage[key];
            }
        } catch (e) {
            console.warn('Storage remove failed:', e);
            delete this.memoryStorage[key];
        }
    }

    static saveUserCredentials(username, password, serverUrl) {
        const userData = {
            username,
            password,
            serverUrl,
            loginTime: new Date().toISOString()
        };
        this.setItem('mytv_user', JSON.stringify(userData));
    }

    static getUserCredentials() {
        const data = this.getItem('mytv_user');
        return data ? JSON.parse(data) : null;
    }

    static clearUserCredentials() {
        this.removeItem('mytv_user');
    }

    static isLoggedIn() {
        return this.getUserCredentials() !== null;
    }

    static saveFavorites(type, favorites) {
        this.setItem(`mytv_favorites_${type}`, JSON.stringify(favorites));
    }

    static getFavorites(type) {
        const data = this.getItem(`mytv_favorites_${type}`);
        return data ? JSON.parse(data) : [];
    }

    static addToRecentlyWatched(type, item) {
        const recent = this.getRecentlyWatched();
        
        // Remove if already exists
        const filtered = recent.filter(r => !(r.type === type && r.id === item.id));
        
        // Add to beginning
        filtered.unshift({
            type,
            ...item,
            watchedAt: new Date().toISOString()
        });

        // Keep only last 50 items
        const limited = filtered.slice(0, 50);
        
        this.setItem('mytv_recently_watched', JSON.stringify(limited));
    }

    static getRecentlyWatched() {
        const data = this.getItem('mytv_recently_watched');
        return data ? JSON.parse(data) : [];
    }

    static clearRecentlyWatched() {
        this.removeItem('mytv_recently_watched');
    }

    static saveSettings(settings) {
        this.setItem('mytv_settings', JSON.stringify(settings));
    }

    static getSettings() {
        const data = this.getItem('mytv_settings');
        return data ? JSON.parse(data) : this.getDefaultSettings();
    }

    static getDefaultSettings() {
        return {
            videoQuality: 'auto',
            autoplay: true,
            subtitles: false,
            theme: 'light',
            language: 'en'
        };
    }

    static clearAllData() {
        if (this.isLocalStorageAvailable()) {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith('mytv_')) {
                    localStorage.removeItem(key);
                }
            });
        }
        // Clear memory storage
        this.memoryStorage = {};
    }
}

// Don't initialize - just export the class
console.log('StorageManager loaded successfully');
