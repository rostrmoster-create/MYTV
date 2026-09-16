/**
 * MYTV Storage Module
 * Handles localStorage operations for user data and app state
 */

class Storage {
    constructor() {
        this.keys = {
            USER: 'mytvUser',
            FAVORITES: 'mytvFavorites',
            RECENT: 'mytvRecent',
            SETTINGS: 'mytvSettings'
        };
    }

    /**
     * Get user data
     */
    getUser() {
        try {
            const userData = localStorage.getItem(this.keys.USER);
            return userData ? JSON.parse(userData) : null;
        } catch (e) {
            console.error('Error reading user data:', e);
            return null;
        }
    }

    /**
     * Set user data
     */
    setUser(userData) {
        try {
            localStorage.setItem(this.keys.USER, JSON.stringify(userData));
            return true;
        } catch (e) {
            console.error('Error saving user data:', e);
            return false;
        }
    }

    /**
     * Check if user is logged in
     */
    isLoggedIn() {
        const user = this.getUser();
        return user && user.loggedIn === true;
    }

    /**
     * Logout user
     */
    logout() {
        localStorage.removeItem(this.keys.USER);
    }

    /**
     * Get favorites
     */
    getFavorites() {
        try {
            const favorites = localStorage.getItem(this.keys.FAVORITES);
            return favorites ? JSON.parse(favorites) : [];
        } catch (e) {
            console.error('Error reading favorites:', e);
            return [];
        }
    }

    /**
     * Add to favorites
     */
    addFavorite(item) {
        try {
            const favorites = this.getFavorites();
            const exists = favorites.find(fav => fav.id === item.id && fav.type === item.type);
            
            if (!exists) {
                favorites.unshift(item);
                localStorage.setItem(this.keys.FAVORITES, JSON.stringify(favorites));
                return true;
            }
            return false;
        } catch (e) {
            console.error('Error adding favorite:', e);
            return false;
        }
    }

    /**
     * Remove from favorites
     */
    removeFavorite(id, type) {
        try {
            let favorites = this.getFavorites();
            favorites = favorites.filter(fav => !(fav.id === id && fav.type === type));
            localStorage.setItem(this.keys.FAVORITES, JSON.stringify(favorites));
            return true;
        } catch (e) {
            console.error('Error removing favorite:', e);
            return false;
        }
    }

    /**
     * Check if item is favorited
     */
    isFavorited(id, type) {
        const favorites = this.getFavorites();
        return favorites.some(fav => fav.id === id && fav.type === type);
    }

    /**
     * Get recently watched
     */
    getRecent() {
        try {
            const recent = localStorage.getItem(this.keys.RECENT);
            return recent ? JSON.parse(recent) : [];
        } catch (e) {
            console.error('Error reading recent:', e);
            return [];
        }
    }

    /**
     * Add to recently watched
     */
    addRecent(item) {
        try {
            let recent = this.getRecent();
            
            // Remove if already exists
            recent = recent.filter(r => !(r.id === item.id && r.type === item.type));
            
            // Add to beginning
            recent.unshift({
                ...item,
                watchedAt: new Date().toISOString()
            });
            
            // Keep only last 50 items
            recent = recent.slice(0, 50);
            
            localStorage.setItem(this.keys.RECENT, JSON.stringify(recent));
            return true;
        } catch (e) {
            console.error('Error adding recent:', e);
            return false;
        }
    }

    /**
     * Clear recently watched
     */
    clearRecent() {
        localStorage.removeItem(this.keys.RECENT);
    }

    /**
     * Get settings
     */
    getSettings() {
        try {
            const settings = localStorage.getItem(this.keys.SETTINGS);
            return settings ? JSON.parse(settings) : this.getDefaultSettings();
        } catch (e) {
            console.error('Error reading settings:', e);
            return this.getDefaultSettings();
        }
    }

    /**
     * Get default settings
     */
    getDefaultSettings() {
        return {
            autoplay: true,
            quality: 'auto',
            language: 'en',
            subtitles: false
        };
    }

    /**
     * Update settings
     */
    updateSettings(newSettings) {
        try {
            const currentSettings = this.getSettings();
            const updatedSettings = { ...currentSettings, ...newSettings };
            localStorage.setItem(this.keys.SETTINGS, JSON.stringify(updatedSettings));
            return true;
        } catch (e) {
            console.error('Error updating settings:', e);
            return false;
        }
    }
}

// Export for use in other modules
window.Storage = Storage;
