// Configuration file for the Samsung TV App
const AppConfig = {
    // Remote configuration URL - Host your app-config.json at this URL
    CONFIG_URL: 'https://example.com/app-config.json',

    // Or use local configuration for development/testing
    USE_LOCAL_CONFIG: true,
    LOCAL_CONFIG_PATH: 'app-config.json',

    // App settings
    DEBUG: true,

    // Video counter key for localStorage
    VIDEO_COUNT_KEY: 'videoPlayCount',

    // Runtime configuration (loaded from remote/local config)
    runtime: {
        app: {
            name: 'Samsung TV App',
            version: '1.0.0'
        },
        theme: {
            backgroundColor: '#00277e',
            textColor: '#ffffff',
            fontFamily: 'Inter, Arial, sans-serif',
            accentColor: '#ffffff'
        },
        splash: {
            enabled: true,
            backgroundColor: '#00277e',
            logoUrl: 'images/logo.png',
            logoScale: 0.5,
            duration: 3000
        },
        analytics: {
            googleAnalyticsId: 'G-XXXXXXXXXX',
            enabled: true
        },
        ads: {
            enabled: true,
            frequency: 5,
            vastTagUrl: ''
        },
        categories: []
    },

    /**
     * Load configuration from remote or local source
     * @returns {Promise<Object>} Configuration object
     */
    async loadConfig() {
        try {
            const configUrl = this.USE_LOCAL_CONFIG ? this.LOCAL_CONFIG_PATH : this.CONFIG_URL;

            if (this.DEBUG) {
                console.log('Loading configuration from:', configUrl);
            }

            const response = await fetch(configUrl);

            if (!response.ok) {
                throw new Error(`Failed to fetch config: ${response.status}`);
            }

            const config = await response.json();

            // Merge with runtime config
            this.runtime = { ...this.runtime, ...config };

            if (this.DEBUG) {
                console.log('Configuration loaded:', this.runtime);
            }

            return this.runtime;

        } catch (error) {
            console.error('Error loading configuration:', error);
            console.warn('Using default configuration');
            return this.runtime;
        }
    }
};
