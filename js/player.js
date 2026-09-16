// Video Player Manager - v12
class PlayerManager {
    constructor() {
        this.player = null;
        this.hls = null;
        this.videoElement = document.getElementById('videoPlayer');
    }

    playStream(url) {
        if (!this.videoElement) return;

        // Destroy previous HLS instance
        if (this.hls) {
            this.hls.destroy();
        }

        if (Hls.isSupported()) {
            this.hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });

            this.hls.loadSource(url);
            this.hls.attachMedia(this.videoElement);

            this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
                this.videoElement.play().catch(error => {
                    console.log('Autoplay prevented:', error);
                });
            });

            this.hls.on(Hls.Events.ERROR, (event, data) => {
                console.error('HLS Error:', data);
                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            console.log('Network error, trying to recover...');
                            this.hls.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            console.log('Media error, trying to recover...');
                            this.hls.recoverMediaError();
                            break;
                        default:
                            console.log('Fatal error, cannot recover');
                            this.hls.destroy();
                            break;
                    }
                }
            });
        } else if (this.videoElement.canPlayType('application/vnd.apple.mpegurl')) {
            // Native HLS support (Safari)
            this.videoElement.src = url;
            this.videoElement.play().catch(error => {
                console.log('Autoplay prevented:', error);
            });
        } else {
            console.error('HLS not supported in this browser');
        }
    }

    stop() {
        if (this.videoElement) {
            this.videoElement.pause();
            this.videoElement.src = '';
        }
        if (this.hls) {
            this.hls.destroy();
            this.hls = null;
        }
    }
}

// Initialize player
function initPlayer() {
    window.playerManager = new PlayerManager();
}
