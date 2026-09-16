// Storage Manager - v12
class StorageManager {
    static memoryStore = {};

    static get(key) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.warn('localStorage not available, using memory storage:', error);
            return StorageManager.memoryStore[key] || null;
        }
    }

    static set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.warn('localStorage not available, using memory storage:', error);
            StorageManager.memoryStore[key] = value;
        }
    }

    static remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.warn('localStorage not available, using memory storage:', error);
            delete StorageManager.memoryStore[key];
        }
    }

    static clear() {
        try {
            localStorage.clear();
        } catch (error) {
            console.warn('localStorage not available, using memory storage:', error);
            StorageManager.memoryStore = {};
        }
    }
}
