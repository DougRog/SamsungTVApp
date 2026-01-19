// Video Player using Samsung Tizen AVPlay API
const VideoPlayer = {
    player: null,
    currentVideo: null,
    isPlaying: false,
    duration: 0,
    currentTime: 0,
    updateInterval: null,

    /**
     * Initialize video player
     */
    init() {
        try {
            this.player = webapis.avplay;
            this.setupListeners();
        } catch (error) {
            console.error('Error initializing AVPlay:', error);
            Analytics.trackError('AVPlay Init Error', error.message);
        }
    },

    /**
     * Setup player event listeners
     */
    setupListeners() {
        const listeners = {
            onbufferingstart: () => {
                console.log('Buffering started');
                this.showLoading();
            },
            onbufferingprogress: (percent) => {
                console.log('Buffering progress:', percent);
            },
            onbufferingcomplete: () => {
                console.log('Buffering complete');
                this.hideLoading();
            },
            onstreamcompleted: () => {
                console.log('Stream completed');
                this.onVideoEnded();
            },
            oncurrentplaytime: (currentTime) => {
                this.currentTime = currentTime;
                this.updateProgress();
            },
            onerror: (eventType) => {
                console.error('AVPlay error:', eventType);
                Analytics.trackError('Video Playback Error', eventType);
                alert('Video playback error. Please try another video.');
                this.stop();
            },
            onevent: (eventType, eventData) => {
                console.log('AVPlay event:', eventType, eventData);
            },
            ondrmevent: (drmEvent, drmData) => {
                console.log('DRM event:', drmEvent, drmData);
            }
        };

        try {
            this.player.setListener(listeners);
        } catch (error) {
            console.error('Error setting listeners:', error);
        }
    },

    /**
     * Play a video
     * @param {Object} video - Video object with title, videoUrl, etc.
     */
    async play(video) {
        try {
            this.currentVideo = video;

            // Show player screen
            this.showPlayerScreen();

            // Set video info
            document.getElementById('video-title').textContent = video.title;

            // Stop any currently playing video
            if (this.isPlaying) {
                this.stop();
            }

            // Open and prepare video
            this.player.open(video.videoUrl);
            this.player.setDisplayRect(0, 0, 1920, 1080);

            // Prepare async
            this.player.prepareAsync(() => {
                console.log('Video prepared successfully');
                this.hideLoading();

                // Get duration
                this.duration = this.player.getDuration();
                this.updateDuration();

                // Start playback
                this.player.play();
                this.isPlaying = true;

                // Start progress updates
                this.startProgressUpdates();

                // Track video play
                Analytics.trackVideoPlay(video.title, video.category);
            }, (error) => {
                console.error('Error preparing video:', error);
                Analytics.trackError('Video Prepare Error', error);
                alert('Failed to load video. Please try another.');
                this.hidePlayerScreen();
            });

        } catch (error) {
            console.error('Error playing video:', error);
            Analytics.trackError('Video Play Error', error.message);
            alert('Failed to play video.');
            this.hidePlayerScreen();
        }
    },

    /**
     * Pause video
     */
    pause() {
        if (this.isPlaying) {
            try {
                this.player.pause();
                this.isPlaying = false;
                this.stopProgressUpdates();
            } catch (error) {
                console.error('Error pausing video:', error);
            }
        }
    },

    /**
     * Resume video
     */
    resume() {
        if (!this.isPlaying) {
            try {
                this.player.play();
                this.isPlaying = true;
                this.startProgressUpdates();
            } catch (error) {
                console.error('Error resuming video:', error);
            }
        }
    },

    /**
     * Stop video
     */
    stop() {
        try {
            this.stopProgressUpdates();
            if (this.isPlaying) {
                this.player.stop();
            }
            this.player.close();
            this.isPlaying = false;
            this.currentVideo = null;
            this.hidePlayerScreen();
        } catch (error) {
            console.error('Error stopping video:', error);
        }
    },

    /**
     * Seek forward
     * @param {number} seconds - Seconds to seek forward
     */
    seekForward(seconds = 10) {
        try {
            const newTime = Math.min(this.currentTime + (seconds * 1000), this.duration);
            this.player.seekTo(newTime);
        } catch (error) {
            console.error('Error seeking forward:', error);
        }
    },

    /**
     * Seek backward
     * @param {number} seconds - Seconds to seek backward
     */
    seekBackward(seconds = 10) {
        try {
            const newTime = Math.max(this.currentTime - (seconds * 1000), 0);
            this.player.seekTo(newTime);
        } catch (error) {
            console.error('Error seeking backward:', error);
        }
    },

    /**
     * Start progress updates
     */
    startProgressUpdates() {
        this.stopProgressUpdates();
        this.updateInterval = setInterval(() => {
            try {
                this.currentTime = this.player.getCurrentTime();
                this.updateProgress();
            } catch (error) {
                console.error('Error getting current time:', error);
            }
        }, 1000);
    },

    /**
     * Stop progress updates
     */
    stopProgressUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    },

    /**
     * Update progress bar and time display
     */
    updateProgress() {
        const progressBar = document.getElementById('progress-bar');
        const currentTimeEl = document.getElementById('current-time');

        if (this.duration > 0) {
            const progress = (this.currentTime / this.duration) * 100;
            progressBar.style.width = progress + '%';
        }

        currentTimeEl.textContent = this.formatTime(this.currentTime);
    },

    /**
     * Update duration display
     */
    updateDuration() {
        const totalTimeEl = document.getElementById('total-time');
        totalTimeEl.textContent = this.formatTime(this.duration);
    },

    /**
     * Format time in milliseconds to MM:SS
     * @param {number} ms - Time in milliseconds
     * @returns {string} Formatted time
     */
    formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    },

    /**
     * Handle video ended event
     */
    onVideoEnded() {
        console.log('Video ended');
        this.stopProgressUpdates();
        this.isPlaying = false;

        // Track video completion
        if (this.currentVideo) {
            Analytics.trackVideoComplete(this.currentVideo.title, this.currentVideo.category);
        }

        // Return to browser
        setTimeout(() => {
            this.stop();
        }, 1000);
    },

    /**
     * Show player screen
     */
    showPlayerScreen() {
        document.getElementById('browser-screen').classList.add('hidden');
        document.getElementById('player-screen').classList.remove('hidden');
        this.showLoading();
    },

    /**
     * Hide player screen
     */
    hidePlayerScreen() {
        document.getElementById('player-screen').classList.add('hidden');
        document.getElementById('browser-screen').classList.remove('hidden');
        this.hideLoading();
    },

    /**
     * Show loading indicator
     */
    showLoading() {
        document.getElementById('loading-indicator').classList.remove('hidden');
    },

    /**
     * Hide loading indicator
     */
    hideLoading() {
        document.getElementById('loading-indicator').classList.add('hidden');
    }
};
