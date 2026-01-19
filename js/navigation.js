// Navigation handler for TV remote control
const Navigation = {
    currentScreen: 'browser', // browser, player, ad

    /**
     * Initialize navigation
     */
    init() {
        this.registerKeys();
        this.setupKeyHandlers();
    },

    /**
     * Register TV remote keys
     */
    registerKeys() {
        try {
            const keys = [
                'MediaPlay',
                'MediaPause',
                'MediaStop',
                'MediaPlayPause',
                'MediaRewind',
                'MediaFastForward',
                '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
            ];

            keys.forEach(key => {
                try {
                    tizen.tvinputdevice.registerKey(key);
                } catch (error) {
                    console.warn('Could not register key:', key);
                }
            });
        } catch (error) {
            console.error('Error registering keys:', error);
        }
    },

    /**
     * Setup keyboard event handlers
     */
    setupKeyHandlers() {
        document.addEventListener('keydown', (e) => {
            this.handleKeyDown(e);
        });
    },

    /**
     * Handle key down events
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleKeyDown(e) {
        e.preventDefault();

        const keyCode = e.keyCode;

        if (AppConfig.DEBUG) {
            console.log('Key pressed:', keyCode);
        }

        // Determine current screen
        if (!document.getElementById('browser-screen').classList.contains('hidden')) {
            this.currentScreen = 'browser';
        } else if (!document.getElementById('player-screen').classList.contains('hidden')) {
            this.currentScreen = 'player';
        } else if (!document.getElementById('ad-screen').classList.contains('hidden')) {
            this.currentScreen = 'ad';
        }

        // Route to appropriate handler
        switch (this.currentScreen) {
            case 'browser':
                this.handleBrowserKeys(keyCode);
                break;
            case 'player':
                this.handlePlayerKeys(keyCode);
                break;
            case 'ad':
                this.handleAdKeys(keyCode);
                break;
        }
    },

    /**
     * Handle keys in browser screen
     * @param {number} keyCode - Key code
     */
    handleBrowserKeys(keyCode) {
        switch (keyCode) {
            case 37: // Left arrow
                this.navigateLeft();
                Analytics.trackNavigation('Navigate', 'Left');
                break;
            case 38: // Up arrow
                this.navigateUp();
                Analytics.trackNavigation('Navigate', 'Up');
                break;
            case 39: // Right arrow
                this.navigateRight();
                Analytics.trackNavigation('Navigate', 'Right');
                break;
            case 40: // Down arrow
                this.navigateDown();
                Analytics.trackNavigation('Navigate', 'Down');
                break;
            case 13: // Enter/OK
                this.selectVideo();
                Analytics.trackNavigation('Select', 'Video');
                break;
            case 10009: // Back button
            case 27: // ESC
                this.handleBack();
                break;
        }
    },

    /**
     * Handle keys in player screen
     * @param {number} keyCode - Key code
     */
    handlePlayerKeys(keyCode) {
        switch (keyCode) {
            case 415: // Play
            case 463: // MediaPlayPause
                if (VideoPlayer.isPlaying) {
                    VideoPlayer.pause();
                    Analytics.trackEvent('Player', 'Pause', 'Remote Control');
                } else {
                    VideoPlayer.resume();
                    Analytics.trackEvent('Player', 'Resume', 'Remote Control');
                }
                break;
            case 19: // Pause
                VideoPlayer.pause();
                Analytics.trackEvent('Player', 'Pause', 'Remote Control');
                break;
            case 413: // Stop
                VideoPlayer.stop();
                Analytics.trackEvent('Player', 'Stop', 'Remote Control');
                break;
            case 417: // Fast Forward
            case 39: // Right arrow
                VideoPlayer.seekForward(10);
                Analytics.trackEvent('Player', 'Seek Forward', '10s');
                break;
            case 412: // Rewind
            case 37: // Left arrow
                VideoPlayer.seekBackward(10);
                Analytics.trackEvent('Player', 'Seek Backward', '10s');
                break;
            case 10009: // Back button
            case 27: // ESC
                VideoPlayer.stop();
                Analytics.trackEvent('Player', 'Exit', 'Back Button');
                break;
        }
    },

    /**
     * Handle keys in ad screen
     * @param {number} keyCode - Key code
     */
    handleAdKeys(keyCode) {
        switch (keyCode) {
            case 10009: // Back button
            case 27: // ESC
                // Optionally allow skipping ad after certain time
                // For now, prevent back during ad
                console.log('Cannot skip ad');
                break;
            case 415: // Play/Pause during ad - no action
            case 19:
            case 463:
                console.log('Cannot control ad playback');
                break;
        }
    },

    /**
     * Navigate left in browser
     */
    navigateLeft() {
        const newCol = UIManager.currentCol - 1;
        if (newCol >= 0) {
            UIManager.setFocus(UIManager.currentRow, newCol);
        }
    },

    /**
     * Navigate right in browser
     */
    navigateRight() {
        const totalCols = UIManager.getTotalCols(UIManager.currentRow);
        const newCol = UIManager.currentCol + 1;
        if (newCol < totalCols) {
            UIManager.setFocus(UIManager.currentRow, newCol);
        }
    },

    /**
     * Navigate up in browser
     */
    navigateUp() {
        const newRow = UIManager.currentRow - 1;
        if (newRow >= 0) {
            const totalCols = UIManager.getTotalCols(newRow);
            const newCol = Math.min(UIManager.currentCol, totalCols - 1);
            UIManager.setFocus(newRow, newCol);
        }
    },

    /**
     * Navigate down in browser
     */
    navigateDown() {
        const totalRows = UIManager.getTotalRows();
        const newRow = UIManager.currentRow + 1;
        if (newRow < totalRows) {
            const totalCols = UIManager.getTotalCols(newRow);
            const newCol = Math.min(UIManager.currentCol, totalCols - 1);
            UIManager.setFocus(newRow, newCol);
        }
    },

    /**
     * Select current video
     */
    selectVideo() {
        const video = UIManager.getFocusedVideo();
        if (video) {
            console.log('Selected video:', video.title);
            AdManager.handleVideoPlayback(video);
        }
    },

    /**
     * Handle back button
     */
    handleBack() {
        try {
            tizen.application.getCurrentApplication().exit();
        } catch (error) {
            console.error('Error exiting app:', error);
            window.close();
        }
    }
};
