// MRSS Feed Parser
const MRSSParser = {
    /**
     * Fetch and parse MRSS feed
     * @param {string} feedUrl - URL of the MRSS feed
     * @returns {Promise<Object>} Parsed content organized by categories
     */
    async fetchAndParse(feedUrl) {
        try {
            const response = await fetch(feedUrl);
            const xmlText = await response.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

            return this.parseContent(xmlDoc);
        } catch (error) {
            console.error('Error fetching MRSS feed:', error);
            Analytics.trackError('MRSS Fetch Error', error.message);
            throw error;
        }
    },

    /**
     * Parse XML document and organize content by categories
     * @param {Document} xmlDoc - Parsed XML document
     * @returns {Object} Content organized by categories
     */
    parseContent(xmlDoc) {
        const items = xmlDoc.querySelectorAll('item');
        const categories = {};

        items.forEach(item => {
            const video = this.parseItem(item);

            if (video && video.category) {
                if (!categories[video.category]) {
                    categories[video.category] = [];
                }
                categories[video.category].push(video);
            }
        });

        return categories;
    },

    /**
     * Parse individual MRSS item
     * @param {Element} item - XML item element
     * @returns {Object} Parsed video object
     */
    parseItem(item) {
        try {
            // Extract title
            const title = item.querySelector('title')?.textContent || 'Untitled';

            // Extract description
            const description = item.querySelector('description')?.textContent || '';

            // Extract category
            const category = item.querySelector('category')?.textContent ||
                           item.querySelector('media\\:category, category')?.textContent ||
                           'Uncategorized';

            // Extract thumbnail image
            const thumbnail = item.querySelector('media\\:thumbnail, thumbnail')?.getAttribute('url') ||
                            item.querySelector('media\\:content, content')?.getAttribute('url') ||
                            item.querySelector('enclosure')?.getAttribute('url') ||
                            '';

            // Extract M3U8 video URL
            let videoUrl = '';

            // Try media:content with type attribute
            const mediaContents = item.querySelectorAll('media\\:content, content');
            for (let content of mediaContents) {
                const url = content.getAttribute('url');
                const type = content.getAttribute('type');

                if (url && (url.includes('.m3u8') || type === 'application/x-mpegURL' || type === 'application/vnd.apple.mpegurl')) {
                    videoUrl = url;
                    break;
                }
            }

            // Fallback: check enclosure
            if (!videoUrl) {
                const enclosure = item.querySelector('enclosure');
                if (enclosure) {
                    const url = enclosure.getAttribute('url');
                    if (url && url.includes('.m3u8')) {
                        videoUrl = url;
                    }
                }
            }

            // Fallback: check link
            if (!videoUrl) {
                const link = item.querySelector('link')?.textContent;
                if (link && link.includes('.m3u8')) {
                    videoUrl = link;
                }
            }

            if (!videoUrl) {
                console.warn('No M3U8 URL found for item:', title);
                return null;
            }

            return {
                title,
                description,
                category,
                thumbnail,
                videoUrl
            };
        } catch (error) {
            console.error('Error parsing MRSS item:', error);
            return null;
        }
    }
};
