// Google Analytics Integration
const Analytics = {
    initialized: false,

    /**
     * Initialize Google Analytics
     */
    init() {
        try {
            if (typeof gtag !== 'undefined') {
                this.initialized = true;
                console.log('Google Analytics initialized');

                // Track app launch
                this.trackEvent('App', 'Launch', 'Application Started');
            } else {
                console.warn('Google Analytics not available');
            }
        } catch (error) {
            console.error('Error initializing Google Analytics:', error);
        }
    },

    /**
     * Track a custom event
     * @param {string} category - Event category
     * @param {string} action - Event action
     * @param {string} label - Event label
     * @param {number} value - Event value (optional)
     */
    trackEvent(category, action, label, value) {
        if (!this.initialized) return;

        try {
            const eventParams = {
                event_category: category,
                event_label: label
            };

            if (value !== undefined) {
                eventParams.value = value;
            }

            gtag('event', action, eventParams);

            if (AppConfig.DEBUG) {
                console.log('Analytics Event:', category, action, label, value);
            }
        } catch (error) {
            console.error('Error tracking event:', error);
        }
    },

    /**
     * Track page view
     * @param {string} pageName - Page name
     */
    trackPageView(pageName) {
        if (!this.initialized) return;

        try {
            gtag('event', 'page_view', {
                page_title: pageName,
                page_location: window.location.href
            });

            if (AppConfig.DEBUG) {
                console.log('Analytics Page View:', pageName);
            }
        } catch (error) {
            console.error('Error tracking page view:', error);
        }
    },

    /**
     * Track video play event
     * @param {string} videoTitle - Video title
     * @param {string} category - Video category
     */
    trackVideoPlay(videoTitle, category) {
        this.trackEvent('Video', 'Play', videoTitle, null);
        this.trackEvent('Category', 'Video Play', category, null);
    },

    /**
     * Track video completion
     * @param {string} videoTitle - Video title
     * @param {string} category - Video category
     */
    trackVideoComplete(videoTitle, category) {
        this.trackEvent('Video', 'Complete', videoTitle, null);
        this.trackEvent('Category', 'Video Complete', category, null);
    },

    /**
     * Track ad events
     * @param {string} action - Ad action (impression, start, complete, skip, error)
     * @param {string} adType - Ad type (preroll, midroll, etc.)
     */
    trackAd(action, adType) {
        this.trackEvent('Ad', action, adType, null);
    },

    /**
     * Track errors
     * @param {string} errorType - Type of error
     * @param {string} errorMessage - Error message
     */
    trackError(errorType, errorMessage) {
        this.trackEvent('Error', errorType, errorMessage, null);
    },

    /**
     * Track navigation events
     * @param {string} action - Navigation action
     * @param {string} details - Navigation details
     */
    trackNavigation(action, details) {
        this.trackEvent('Navigation', action, details, null);
    }
};
