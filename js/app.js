// Main application entry point
const App = {
    /**
     * Initialize the application
     */
    async init() {
        console.log('Initializing Samsung TV App...');

        try {
            // Initialize modules
            Analytics.init();
            VideoPlayer.init();
            AdManager.init();
            UIManager.init();
            Navigation.init();

            // Track app start
            Analytics.trackPageView('Home');

            // Load content from MRSS feed
            await this.loadContent();

        } catch (error) {
            console.error('Error initializing app:', error);
            Analytics.trackError('App Init Error', error.message);
            this.showError('Failed to initialize app. Please restart.');
        }
    },

    /**
     * Load content from MRSS feed
     */
    async loadContent() {
        try {
            console.log('Loading content from MRSS feed...');
            UIManager.showLoading();

            // Fetch and parse MRSS feed
            const categories = await MRSSParser.fetchAndParse(AppConfig.MRSS_FEED_URL);

            console.log('Content loaded:', Object.keys(categories).length, 'categories');

            // Render content
            UIManager.renderContent(categories);
            UIManager.hideLoading();

            // Track successful content load
            Analytics.trackEvent('Content', 'Load Success', 'MRSS Feed');

        } catch (error) {
            console.error('Error loading content:', error);
            Analytics.trackError('Content Load Error', error.message);
            UIManager.hideLoading();
            this.showError('Failed to load content. Please check your feed URL.');
        }
    },

    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
        const container = document.getElementById('content-container');
        container.innerHTML = `
            <div class="error-message">
                <h2>Error</h2>
                <p>${message}</p>
                <p>Press BACK to exit</p>
            </div>
        `;
    }
};

// Initialize app when window loads
window.onload = () => {
    App.init();
};

// Handle app visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // App went to background
        if (VideoPlayer.isPlaying) {
            VideoPlayer.pause();
        }
    }
});

// Handle window unload
window.onunload = () => {
    try {
        if (VideoPlayer.isPlaying) {
            VideoPlayer.stop();
        }
        if (AdManager.isPlayingAd) {
            AdManager.skipAd();
        }
    } catch (error) {
        console.error('Error during cleanup:', error);
    }
};
