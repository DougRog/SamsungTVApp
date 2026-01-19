// Ad Manager for preroll ads
const AdManager = {
    adPlayer: null,
    isPlayingAd: false,
    adDuration: 0,
    adCurrentTime: 0,
    adInterval: null,
    pendingVideo: null,
    videoCount: 0,

    /**
     * Initialize Ad Manager
     */
    init() {
        try {
            this.adPlayer = webapis.avplay;
            this.loadVideoCount();
        } catch (error) {
            console.error('Error initializing Ad Manager:', error);
        }
    },

    /**
     * Load video play count from localStorage
     */
    loadVideoCount() {
        try {
            const saved = localStorage.getItem(AppConfig.VIDEO_COUNT_KEY);
            this.videoCount = saved ? parseInt(saved, 10) : 0;
        } catch (error) {
            this.videoCount = 0;
        }
    },

    /**
     * Save video play count to localStorage
     */
    saveVideoCount() {
        try {
            localStorage.setItem(AppConfig.VIDEO_COUNT_KEY, this.videoCount.toString());
        } catch (error) {
            console.error('Error saving video count:', error);
        }
    },

    /**
     * Check if ad should be shown and handle video playback
     * @param {Object} video - Video to play
     */
    handleVideoPlayback(video) {
        this.videoCount++;
        this.saveVideoCount();

        // Show ad every 5 videos
        if (this.videoCount % AppConfig.AD_FREQUENCY === 0) {
            this.pendingVideo = video;
            this.playPrerollAd();
        } else {
            VideoPlayer.play(video);
        }
    },

    /**
     * Play preroll ad
     */
    async playPrerollAd() {
        try {
            console.log('Playing preroll ad');
            Analytics.trackAd('impression', 'preroll');

            // Show ad screen
            this.showAdScreen();

            // In a real implementation, you would fetch VAST ad tag and parse it
            // For this example, we'll use a static ad URL
            const adUrl = await this.fetchAdUrl();

            if (!adUrl) {
                console.log('No ad available, playing video');
                this.playPendingVideo();
                return;
            }

            this.setupAdListeners();

            // Open and prepare ad
            this.adPlayer.open(adUrl);
            this.adPlayer.setDisplayRect(0, 0, 1920, 1080);

            this.adPlayer.prepareAsync(() => {
                console.log('Ad prepared successfully');

                // Get duration
                this.adDuration = this.adPlayer.getDuration();
                this.updateAdCountdown();

                // Start ad playback
                this.adPlayer.play();
                this.isPlayingAd = true;

                // Track ad start
                Analytics.trackAd('start', 'preroll');

                // Start countdown updates
                this.startAdCountdown();

            }, (error) => {
                console.error('Error preparing ad:', error);
                Analytics.trackAd('error', 'preroll');
                this.playPendingVideo();
            });

        } catch (error) {
            console.error('Error playing preroll ad:', error);
            Analytics.trackAd('error', 'preroll');
            this.playPendingVideo();
        }
    },

    /**
     * Fetch ad URL from VAST ad tag
     * @returns {Promise<string>} Ad URL
     */
    async fetchAdUrl() {
        try {
            // In a real implementation, fetch and parse VAST XML
            // For this example, return a placeholder M3U8 ad URL
            // Replace with actual VAST tag parsing logic

            if (!AppConfig.AD_TAG_URL) {
                return null;
            }

            // Simple placeholder - in production, parse VAST XML
            // const response = await fetch(AppConfig.AD_TAG_URL);
            // const vastXml = await response.text();
            // Parse VAST and extract MediaFile URL

            // For now, return null to skip ad if no URL configured
            return null;

        } catch (error) {
            console.error('Error fetching ad:', error);
            return null;
        }
    },

    /**
     * Setup ad player event listeners
     */
    setupAdListeners() {
        const listeners = {
            onbufferingstart: () => {
                console.log('Ad buffering started');
            },
            onbufferingcomplete: () => {
                console.log('Ad buffering complete');
            },
            onstreamcompleted: () => {
                console.log('Ad completed');
                this.onAdComplete();
            },
            oncurrentplaytime: (currentTime) => {
                this.adCurrentTime = currentTime;
                this.updateAdCountdown();
            },
            onerror: (eventType) => {
                console.error('Ad playback error:', eventType);
                Analytics.trackAd('error', 'preroll');
                this.playPendingVideo();
            }
        };

        try {
            this.adPlayer.setListener(listeners);
        } catch (error) {
            console.error('Error setting ad listeners:', error);
        }
    },

    /**
     * Start ad countdown timer
     */
    startAdCountdown() {
        this.stopAdCountdown();
        this.adInterval = setInterval(() => {
            try {
                this.adCurrentTime = this.adPlayer.getCurrentTime();
                this.updateAdCountdown();
            } catch (error) {
                console.error('Error getting ad time:', error);
            }
        }, 1000);
    },

    /**
     * Stop ad countdown timer
     */
    stopAdCountdown() {
        if (this.adInterval) {
            clearInterval(this.adInterval);
            this.adInterval = null;
        }
    },

    /**
     * Update ad countdown display
     */
    updateAdCountdown() {
        const remaining = Math.ceil((this.adDuration - this.adCurrentTime) / 1000);
        const countdownEl = document.getElementById('ad-countdown');
        countdownEl.textContent = `Ad ends in ${remaining}s`;
    },

    /**
     * Handle ad completion
     */
    onAdComplete() {
        console.log('Ad playback completed');
        this.stopAdCountdown();
        this.isPlayingAd = false;

        // Track ad completion
        Analytics.trackAd('complete', 'preroll');

        // Stop ad player
        try {
            this.adPlayer.stop();
            this.adPlayer.close();
        } catch (error) {
            console.error('Error closing ad player:', error);
        }

        // Hide ad screen
        this.hideAdScreen();

        // Play the pending video
        this.playPendingVideo();
    },

    /**
     * Skip ad (if allowed)
     */
    skipAd() {
        if (this.isPlayingAd) {
            console.log('Skipping ad');
            Analytics.trackAd('skip', 'preroll');

            this.stopAdCountdown();

            try {
                this.adPlayer.stop();
                this.adPlayer.close();
            } catch (error) {
                console.error('Error stopping ad:', error);
            }

            this.isPlayingAd = false;
            this.hideAdScreen();
            this.playPendingVideo();
        }
    },

    /**
     * Play the pending video after ad
     */
    playPendingVideo() {
        if (this.pendingVideo) {
            const video = this.pendingVideo;
            this.pendingVideo = null;
            VideoPlayer.play(video);
        }
    },

    /**
     * Show ad screen
     */
    showAdScreen() {
        document.getElementById('browser-screen').classList.add('hidden');
        document.getElementById('player-screen').classList.add('hidden');
        document.getElementById('ad-screen').classList.remove('hidden');
    },

    /**
     * Hide ad screen
     */
    hideAdScreen() {
        document.getElementById('ad-screen').classList.add('hidden');
    },

    /**
     * Reset video counter (for testing)
     */
    resetCounter() {
        this.videoCount = 0;
        this.saveVideoCount();
    }
};
