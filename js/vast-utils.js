// VAST Tag URL Utility
const VASTUtils = {
    /**
     * Get device ID from Samsung TV
     * @returns {string} Device ID
     */
    getDeviceId() {
        try {
            // Try to get Samsung TV device ID
            if (typeof webapis !== 'undefined' && webapis.productinfo) {
                // Try different methods to get device ID
                const deviceId = webapis.productinfo.getDuid() ||
                               webapis.productinfo.getRealModel() ||
                               webapis.productinfo.getModel();

                if (deviceId) {
                    return deviceId;
                }
            }
        } catch (error) {
            console.warn('Could not retrieve Samsung device ID:', error);
        }

        // Fallback: Generate a persistent UUID and store it
        return this.getOrCreatePersistentId();
    },

    /**
     * Get or create a persistent device ID stored in localStorage
     * @returns {string} Persistent device ID
     */
    getOrCreatePersistentId() {
        const STORAGE_KEY = 'devicePersistentId';

        try {
            let deviceId = localStorage.getItem(STORAGE_KEY);

            if (!deviceId) {
                deviceId = this.generateUUID();
                localStorage.setItem(STORAGE_KEY, deviceId);
            }

            return deviceId;
        } catch (error) {
            console.error('Error accessing localStorage for device ID:', error);
            return this.generateUUID();
        }
    },

    /**
     * Generate a UUID v4
     * @returns {string} UUID
     */
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

    /**
     * Generate a cache buster (timestamp)
     * @returns {string} Cache buster value
     */
    getCacheBuster() {
        return Date.now().toString();
    },

    /**
     * Get device IP address
     * @returns {Promise<string>} IP address
     */
    async getIPAddress() {
        try {
            // Try to get IP from Samsung TV API
            if (typeof webapis !== 'undefined' && webapis.network) {
                try {
                    const ipInfo = webapis.network.getIp();
                    if (ipInfo) {
                        return ipInfo;
                    }
                } catch (e) {
                    console.warn('Could not get IP from webapis:', e);
                }
            }

            // Fallback: Use external service
            const response = await fetch('https://api.ipify.org?format=json', {
                method: 'GET',
                cache: 'no-cache'
            });

            if (response.ok) {
                const data = await response.json();
                return data.ip || '';
            }
        } catch (error) {
            console.warn('Could not retrieve IP address:', error);
        }

        return '';
    },

    /**
     * Build VAST tag URL with dynamic parameters
     * @param {string} templateUrl - VAST tag URL template with {{VARIABLES}}
     * @param {Object} config - Ad configuration from app-config.json
     * @returns {Promise<string>} VAST tag URL with populated variables
     */
    async buildVASTUrl(templateUrl, config) {
        if (!templateUrl) {
            return null;
        }

        try {
            // Get dynamic values
            const deviceId = this.getDeviceId();
            const cacheBuster = this.getCacheBuster();
            const ip = await this.getIPAddress();

            // Get static values from config
            const appBundle = config.appBundle || 'com.samsungtv.app';
            const appName = config.appName || 'Samsung TV App';
            const appStoreUrl = config.appStoreUrl || '';

            // Build replacement map
            const replacements = {
                '{{APP_BUNDLE}}': encodeURIComponent(appBundle),
                '{{DEVICE_ID}}': encodeURIComponent(deviceId),
                '{{CACHEBUSTER}}': cacheBuster,
                '{{IP}}': ip,
                '{{APP_NAME}}': encodeURIComponent(appName),
                '{{APP_STORE_URL}}': encodeURIComponent(appStoreUrl)
            };

            // Replace all variables in template
            let vastUrl = templateUrl;
            for (const [placeholder, value] of Object.entries(replacements)) {
                vastUrl = vastUrl.replace(new RegExp(placeholder, 'g'), value);
            }

            if (AppConfig.DEBUG) {
                console.log('VAST URL Template:', templateUrl);
                console.log('VAST URL Populated:', vastUrl);
                console.log('VAST Parameters:', {
                    appBundle,
                    deviceId,
                    cacheBuster,
                    ip,
                    appName,
                    appStoreUrl
                });
            }

            return vastUrl;

        } catch (error) {
            console.error('Error building VAST URL:', error);
            return templateUrl; // Return template as fallback
        }
    }
};
