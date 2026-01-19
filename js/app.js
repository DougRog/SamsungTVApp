// Main application entry point
const App = {
    config: null,

    /**
     * Initialize the application
     */
    async init() {
        console.log('Initializing Samsung TV App...');

        try {
            // Show splash screen
            this.showSplash();

            // Load configuration
            this.config = await AppConfig.loadConfig();

            // Apply theme from configuration
            this.applyTheme(this.config.theme);

            // Update splash screen with configured logo
            if (this.config.splash && this.config.splash.enabled) {
                this.updateSplashScreen(this.config.splash);
            }

            // Initialize modules
            Analytics.init();
            VideoPlayer.init();
            AdManager.init();
            UIManager.init();
            Navigation.init();

            // Track app start
            Analytics.trackPageView('Home');

            // Load content from multiple feeds
            await this.loadContent();

            // Hide splash screen after configured duration
            const splashDuration = this.config.splash?.duration || 3000;
            setTimeout(() => {
                this.hideSplash();
            }, splashDuration);

        } catch (error) {
            console.error('Error initializing app:', error);
            Analytics.trackError('App Init Error', error.message);
            this.hideSplash();
            this.showError('Failed to initialize app. Please restart.');
        }
    },

    /**
     * Apply theme from configuration
     * @param {Object} theme - Theme configuration
     */
    applyTheme(theme) {
        if (!theme) return;

        const root = document.documentElement;

        if (theme.backgroundColor) {
            root.style.setProperty('--theme-bg-color', theme.backgroundColor);
        }

        if (theme.textColor) {
            root.style.setProperty('--theme-text-color', theme.textColor);
        }

        if (theme.fontFamily) {
            root.style.setProperty('--theme-font-family', theme.fontFamily);
        }

        if (theme.accentColor) {
            root.style.setProperty('--theme-accent-color', theme.accentColor);
        }

        console.log('Theme applied:', theme);
    },

    /**
     * Show splash screen
     */
    showSplash() {
        const splash = document.getElementById('splash-screen');
        if (splash) {
            splash.classList.remove('hidden');
        }
    },

    /**
     * Update splash screen with configuration
     * @param {Object} splashConfig - Splash screen configuration
     */
    updateSplashScreen(splashConfig) {
        const splashScreen = document.getElementById('splash-screen');
        const splashLogo = document.getElementById('splash-logo');

        if (splashConfig.backgroundColor) {
            splashScreen.style.backgroundColor = splashConfig.backgroundColor;
        }

        if (splashConfig.logoUrl) {
            splashLogo.src = splashConfig.logoUrl;
        }

        if (splashConfig.logoScale) {
            const scale = splashConfig.logoScale;
            splashLogo.style.transform = `scale(${scale})`;
        }
    },

    /**
     * Hide splash screen
     */
    hideSplash() {
        const splash = document.getElementById('splash-screen');
        if (splash) {
            splash.classList.add('fade-out');
            setTimeout(() => {
                splash.classList.add('hidden');
                this.showBrowser();
            }, 500);
        }
    },

    /**
     * Show browser screen
     */
    showBrowser() {
        const browser = document.getElementById('browser-screen');
        if (browser) {
            browser.classList.remove('hidden');
        }
    },

    /**
     * Load content from multiple MRSS feeds
     */
    async loadContent() {
        try {
            console.log('Loading content from multiple feeds...');
            UIManager.showLoading();

            // Check if categories are configured
            if (!this.config.categories || this.config.categories.length === 0) {
                throw new Error('No categories configured');
            }

            // Fetch and parse multiple feeds
            const categories = await MRSSParser.fetchMultipleFeeds(this.config.categories);

            console.log('Content loaded:', Object.keys(categories).length, 'categories');

            // Render content
            UIManager.renderContent(categories);
            UIManager.hideLoading();

            // Track successful content load
            Analytics.trackEvent('Content', 'Load Success', 'Multiple Feeds');

        } catch (error) {
            console.error('Error loading content:', error);
            Analytics.trackError('Content Load Error', error.message);
            UIManager.hideLoading();
            this.showError('Failed to load content. Please check your configuration.');
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
