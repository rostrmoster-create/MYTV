// Settings Manager - v10
class SettingsManager {
    constructor() {
        this.settings = this.loadSettings();
        this.user = StorageManager.get('currentUser') || {};
    }

    loadSettings() {
        const defaults = {
            autoplay: true,
            defaultQuality: 'auto',
            itemsPerPage: 12,
            showThumbnails: true,
            enableNotifications: true,
            theme: 'light'
        };

        try {
            const stored = StorageManager.get('userSettings');
            return { ...defaults, ...stored };
        } catch (error) {
            console.error('Error loading settings:', error);
            return defaults;
        }
    }

    saveSettings() {
        try {
            StorageManager.set('userSettings', this.settings);
            this.showNotification('Settings saved successfully!', 'success');
        } catch (error) {
            console.error('Error saving settings:', error);
            this.showNotification('Error saving settings', 'error');
        }
    }

    updateSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
    }

    updateProfile(data) {
        try {
            const user = StorageManager.get('currentUser') || {};
            const updatedUser = { ...user, ...data };
            StorageManager.set('currentUser', updatedUser);
            this.user = updatedUser;
            
            // Update display
            const userNameEl = document.getElementById('userName');
            if (userNameEl && updatedUser.username) {
                userNameEl.textContent = updatedUser.username;
            }
            
            this.showNotification('Profile updated successfully!', 'success');
            this.renderSettings();
        } catch (error) {
            console.error('Error updating profile:', error);
            this.showNotification('Error updating profile', 'error');
        }
    }

    clearCache() {
        if (confirm('This will clear all cached data except favorites and watch history. Continue?')) {
            try {
                // Clear specific cache items but keep user data
                const keysToKeep = ['currentUser', 'userSettings', 'favorites', 'recentlyWatched'];
                const allKeys = Object.keys(localStorage);
                
                allKeys.forEach(key => {
                    if (!keysToKeep.includes(key)) {
                        localStorage.removeItem(key);
                    }
                });
                
                this.showNotification('Cache cleared successfully!', 'success');
            } catch (error) {
                console.error('Error clearing cache:', error);
                this.showNotification('Error clearing cache', 'error');
            }
        }
    }

    exportData() {
        try {
            const exportData = {
                favorites: StorageManager.get('favorites') || [],
                recentlyWatched: StorageManager.get('recentlyWatched') || [],
                settings: this.settings,
                exportDate: new Date().toISOString()
            };

            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `mytv-backup-${Date.now()}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            this.showNotification('Data exported successfully!', 'success');
        } catch (error) {
            console.error('Error exporting data:', error);
            this.showNotification('Error exporting data', 'error');
        }
    }

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const importData = JSON.parse(event.target.result);
                    
                    if (confirm('This will replace your current favorites and settings. Continue?')) {
                        if (importData.favorites) {
                            StorageManager.set('favorites', importData.favorites);
                        }
                        if (importData.recentlyWatched) {
                            StorageManager.set('recentlyWatched', importData.recentlyWatched);
                        }
                        if (importData.settings) {
                            this.settings = { ...this.settings, ...importData.settings };
                            StorageManager.set('userSettings', this.settings);
                        }
                        
                        this.showNotification('Data imported successfully! Refreshing...', 'success');
                        setTimeout(() => location.reload(), 1500);
                    }
                } catch (error) {
                    console.error('Error importing data:', error);
                    this.showNotification('Invalid backup file', 'error');
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    }

    clearAllData() {
        if (confirm('⚠️ This will delete ALL your data including favorites and watch history. This cannot be undone. Continue?')) {
            if (confirm('Are you absolutely sure? This is permanent!')) {
                try {
                    localStorage.clear();
                    this.showNotification('All data cleared. Redirecting to login...', 'success');
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 1500);
                } catch (error) {
                    console.error('Error clearing data:', error);
                    this.showNotification('Error clearing data', 'error');
                }
            }
        }
    }

    getStorageInfo() {
        try {
            const favorites = StorageManager.get('favorites') || [];
            const recentlyWatched = StorageManager.get('recentlyWatched') || [];
            
            // Estimate storage size
            let totalSize = 0;
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    totalSize += localStorage[key].length + key.length;
                }
            }
            
            return {
                favoritesCount: favorites.length,
                recentCount: recentlyWatched.length,
                storageSize: (totalSize / 1024).toFixed(2) + ' KB',
                totalItems: Object.keys(localStorage).length
            };
        } catch (error) {
            console.error('Error getting storage info:', error);
            return {
                favoritesCount: 0,
                recentCount: 0,
                storageSize: '0 KB',
                totalItems: 0
            };
        }
    }

    showNotification(message, type = 'info') {
        // Remove existing notification if any
        const existing = document.querySelector('.settings-notification');
        if (existing) {
            existing.remove();
        }

        const notification = document.createElement('div');
        notification.className = `settings-notification ${type}`;
        notification.textContent = message;
        
        const settingsContainer = document.querySelector('.settings-container');
        if (settingsContainer) {
            settingsContainer.insertBefore(notification, settingsContainer.firstChild);
            
            setTimeout(() => {
                notification.style.opacity = '0';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }
    }

    renderSettings() {
        const container = document.getElementById('settingsContent');
        if (!container) return;

        const storageInfo = this.getStorageInfo();

        container.innerHTML = `
            <div class="settings-container">
                <!-- Profile Section -->
                <div class="settings-section">
                    <div class="settings-section-header">
                        <span class="settings-icon">👤</span>
                        <h3>Profile Information</h3>
                    </div>
                    <div class="settings-section-content">
                        <div class="settings-form-group">
                            <label>Username</label>
                            <input type="text" id="usernameInput" class="settings-input" 
                                value="${this.user.username || ''}" placeholder="Enter username">
                        </div>
                        <div class="settings-form-group">
                            <label>Email</label>
                            <input type="email" id="emailInput" class="settings-input" 
                                value="${this.user.email || ''}" placeholder="Enter email">
                        </div>
                        <button class="settings-btn primary" onclick="window.settingsManager?.saveProfile()">
                            Save Profile
                        </button>
                    </div>
                </div>

                <!-- Playback Settings -->
                <div class="settings-section">
                    <div class="settings-section-header">
                        <span class="settings-icon">▶️</span>
                        <h3>Playback Settings</h3>
                    </div>
                    <div class="settings-section-content">
                        <div class="settings-toggle-group">
                            <div class="settings-toggle-item">
                                <div>
                                    <strong>Autoplay</strong>
                                    <p>Automatically play next episode</p>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="autoplayToggle" 
                                        ${this.settings.autoplay ? 'checked' : ''}
                                        onchange="window.settingsManager?.updateSetting('autoplay', this.checked)">
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                            <div class="settings-toggle-item">
                                <div>
                                    <strong>Show Thumbnails</strong>
                                    <p>Display preview thumbnails</p>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="thumbnailsToggle" 
                                        ${this.settings.showThumbnails ? 'checked' : ''}
                                        onchange="window.settingsManager?.updateSetting('showThumbnails', this.checked)">
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                        <div class="settings-form-group">
                            <label>Default Quality</label>
                            <select id="qualitySelect" class="settings-select"
                                onchange="window.settingsManager?.updateSetting('defaultQuality', this.value)">
                                <option value="auto" ${this.settings.defaultQuality === 'auto' ? 'selected' : ''}>Auto</option>
                                <option value="1080p" ${this.settings.defaultQuality === '1080p' ? 'selected' : ''}>1080p</option>
                                <option value="720p" ${this.settings.defaultQuality === '720p' ? 'selected' : ''}>720p</option>
                                <option value="480p" ${this.settings.defaultQuality === '480p' ? 'selected' : ''}>480p</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Display Settings -->
                <div class="settings-section">
                    <div class="settings-section-header">
                        <span class="settings-icon">🖥️</span>
                        <h3>Display Settings</h3>
                    </div>
                    <div class="settings-section-content">
                        <div class="settings-form-group">
                            <label>Items Per Page</label>
                            <select id="itemsPerPageSelect" class="settings-select"
                                onchange="window.settingsManager?.updateSetting('itemsPerPage', parseInt(this.value))">
                                <option value="12" ${this.settings.itemsPerPage === 12 ? 'selected' : ''}>12 items</option>
                                <option value="24" ${this.settings.itemsPerPage === 24 ? 'selected' : ''}>24 items</option>
                                <option value="36" ${this.settings.itemsPerPage === 36 ? 'selected' : ''}>36 items</option>
                                <option value="48" ${this.settings.itemsPerPage === 48 ? 'selected' : ''}>48 items</option>
                            </select>
                        </div>
                        <div class="settings-toggle-item">
                            <div>
                                <strong>Enable Notifications</strong>
                                <p>Show system notifications</p>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" id="notificationsToggle" 
                                    ${this.settings.enableNotifications ? 'checked' : ''}
                                    onchange="window.settingsManager?.updateSetting('enableNotifications', this.checked)">
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                </div>

                <!-- Data Management -->
                <div class="settings-section">
                    <div class="settings-section-header">
                        <span class="settings-icon">💾</span>
                        <h3>Data Management</h3>
                    </div>
                    <div class="settings-section-content">
                        <div class="storage-info">
                            <div class="storage-stat">
                                <span class="stat-value">${storageInfo.favoritesCount}</span>
                                <span class="stat-label">Favorites</span>
                            </div>
                            <div class="storage-stat">
                                <span class="stat-value">${storageInfo.recentCount}</span>
                                <span class="stat-label">Recent Items</span>
                            </div>
                            <div class="storage-stat">
                                <span class="stat-value">${storageInfo.storageSize}</span>
                                <span class="stat-label">Storage Used</span>
                            </div>
                        </div>
                        <div class="settings-actions">
                            <button class="settings-btn secondary" onclick="window.settingsManager?.exportData()">
                                📤 Export Data
                            </button>
                            <button class="settings-btn secondary" onclick="window.settingsManager?.importData()">
                                📥 Import Data
                            </button>
                            <button class="settings-btn warning" onclick="window.settingsManager?.clearCache()">
                                🗑️ Clear Cache
                            </button>
                            <button class="settings-btn danger" onclick="window.settingsManager?.clearAllData()">
                                ⚠️ Clear All Data
                            </button>
                        </div>
                    </div>
                </div>

                <!-- About Section -->
                <div class="settings-section">
                    <div class="settings-section-header">
                        <span class="settings-icon">ℹ️</span>
                        <h3>About MYTV</h3>
                    </div>
                    <div class="settings-section-content">
                        <div class="about-info">
                            <p><strong>Version:</strong> 1.0.0</p>
                            <p><strong>Platform:</strong> Web Application</p>
                            <p><strong>Last Updated:</strong> ${new Date().toLocaleDateString()}</p>
                            <p class="about-description">
                                MYTV is a premium IPTV streaming platform providing access to 
                                live TV channels, movies, and TV series with an elegant and 
                                user-friendly interface.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    saveProfile() {
        const username = document.getElementById('usernameInput').value.trim();
        const email = document.getElementById('emailInput').value.trim();

        if (!username) {
            this.showNotification('Username cannot be empty', 'error');
            return;
        }

        this.updateProfile({ username, email });
    }
}

// Initialize function
window.initSettingsManager = function() {
    if (!window.settingsManager) {
        window.settingsManager = new SettingsManager();
    }
    window.settingsManager.renderSettings();
};
