/**
 * MYTV Video Player Module
 * Handles HLS video playback
 */

class Player {
    constructor() {
        this.videoElement = null;
        this.hls = null;
        this.currentChannel = null;
        this.isPlaying = false;
        
        this.init();
    }

    /**
     * Initialize player
     */
    init() {
        // HLS.js will be loaded from CDN in the HTML
        console.log('Player initialized');
    }

    /**
     * Load and play channel
     */
    playChannel(channel) {
        if (!channel || !channel.stream_url) {
            this.showError('Invalid channel or stream URL');
            return;
        }

        this.currentChannel = channel;
        this.showLoading();

        // Get video element
        this.videoElement = document.getElementById('playerVideo');
        
        if (!this.videoElement) {
            console.error('Video element not found');
            return;
        }

        // Check if HLS is supported
        if (Hls.isSupported()) {
            this.playHLS(channel.stream_url);
        } else if (this.videoElement.canPlayType('application/vnd.apple.mpegurl')) {
            // Native HLS support (Safari)
            this.playNative(channel.stream_url);
        } else {
            this.showError('HLS playback is not supported in your browser');
        }
    }

    /**
     * Play using HLS.js
     */
    playHLS(url) {
        // Destroy existing instance
        if (this.hls) {
            this.hls.destroy();
        }

        // Create new HLS instance
        this.hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
        });

        // Bind to video element
        this.hls.loadSource(url);
        this.hls.attachMedia(this.videoElement);

        // Handle events
        this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
            this.hideLoading();
            this.videoElement.play().catch(e => {
                console.error('Autoplay failed:', e);
                this.showError('Please click play to start the stream');
            });
        });

        this.hls.on(Hls.Events.ERROR, (event, data) => {
            console.error('HLS Error:', data);
            
            if (data.fatal) {
                switch(data.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                        this.showError('Network error. Please check your connection.');
                        // Try to recover
                        this.hls.startLoad();
                        break;
                    case Hls.ErrorTypes.MEDIA_ERROR:
                        this.showError('Media error. Attempting to recover...');
                        this.hls.recoverMediaError();
                        break;
                    default:
                        this.showError('Cannot play this stream');
                        this.hls.destroy();
                        break;
                }
            }
        });
    }

    /**
     * Play using native HLS (Safari)
     */
    playNative(url) {
        this.videoElement.src = url;
        
        this.videoElement.addEventListener('loadedmetadata', () => {
            this.hideLoading();
            this.videoElement.play().catch(e => {
                console.error('Autoplay failed:', e);
                this.showError('Please click play to start the stream');
            });
        });

        this.videoElement.addEventListener('error', () => {
            this.showError('Cannot play this stream');
        });
    }

    /**
     * Stop playback
     */
    stop() {
        if (this.hls) {
            this.hls.destroy();
            this.hls = null;
        }

        if (this.videoElement) {
            this.videoElement.pause();
            this.videoElement.src = '';
        }

        this.currentChannel = null;
        this.isPlaying = false;
    }

    /**
     * Show loading state
     */
    showLoading() {
        const loadingEl = document.getElementById('playerLoading');
        const errorEl = document.getElementById('playerError');
        const placeholderEl = document.getElementById('playerPlaceholder');

        if (loadingEl) loadingEl.style.display = 'flex';
        if (errorEl) errorEl.style.display = 'none';
        if (placeholderEl) placeholderEl.style.display = 'none';
    }

    /**
     * Hide loading state
     */
    hideLoading() {
        const loadingEl = document.getElementById('playerLoading');
        const placeholderEl = document.getElementById('playerPlaceholder');

        if (loadingEl) loadingEl.style.display = 'none';
        if (placeholderEl) placeholderEl.style.display = 'none';
    }

    /**
     * Show error state
     */
    showError(message) {
        const loadingEl = document.getElementById('playerLoading');
        const errorEl = document.getElementById('playerError');
        const errorText = document.getElementById('playerErrorText');
        const placeholderEl = document.getElementById('playerPlaceholder');

        if (loadingEl) loadingEl.style.display = 'none';
        if (placeholderEl) placeholderEl.style.display = 'none';
        if (errorEl) errorEl.style.display = 'flex';
        if (errorText) errorText.textContent = message;
    }

    /**
     * Retry playback
     */
    retry() {
        if (this.currentChannel) {
            this.playChannel(this.currentChannel);
        }
    }

    /**
     * Get current channel
     */
    getCurrentChannel() {
        return this.currentChannel;
    }
}

// Export for use in other modules
window.Player = Player;
