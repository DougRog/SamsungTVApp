// UI Manager for rendering content rows
const UIManager = {
    contentContainer: null,
    categories: {},
    currentRow: 0,
    currentCol: 0,

    /**
     * Initialize UI Manager
     */
    init() {
        this.contentContainer = document.getElementById('content-container');
    },

    /**
     * Render content organized by categories
     * @param {Object} categories - Content organized by categories
     */
    renderContent(categories) {
        this.categories = categories;
        this.contentContainer.innerHTML = '';

        const categoryKeys = Object.keys(categories);

        if (categoryKeys.length === 0) {
            this.contentContainer.innerHTML = '<p class="no-content">No content available</p>';
            return;
        }

        categoryKeys.forEach((categoryName, rowIndex) => {
            const categoryRow = this.createCategoryRow(categoryName, categories[categoryName], rowIndex);
            this.contentContainer.appendChild(categoryRow);
        });

        // Set focus on first item
        this.setFocus(0, 0);
    },

    /**
     * Create a category row with thumbnails
     * @param {string} categoryName - Name of the category
     * @param {Array} videos - Array of video objects
     * @param {number} rowIndex - Index of the row
     * @returns {HTMLElement} Category row element
     */
    createCategoryRow(categoryName, videos, rowIndex) {
        const row = document.createElement('div');
        row.className = 'category-row';
        row.dataset.rowIndex = rowIndex;

        const title = document.createElement('h2');
        title.className = 'category-title';
        title.textContent = categoryName;
        row.appendChild(title);

        const thumbnailContainer = document.createElement('div');
        thumbnailContainer.className = 'thumbnail-container';

        videos.forEach((video, colIndex) => {
            const thumbnail = this.createThumbnail(video, rowIndex, colIndex);
            thumbnailContainer.appendChild(thumbnail);
        });

        row.appendChild(thumbnailContainer);
        return row;
    },

    /**
     * Create a video thumbnail
     * @param {Object} video - Video object
     * @param {number} rowIndex - Row index
     * @param {number} colIndex - Column index
     * @returns {HTMLElement} Thumbnail element
     */
    createThumbnail(video, rowIndex, colIndex) {
        const thumbnail = document.createElement('div');
        thumbnail.className = 'thumbnail';
        thumbnail.dataset.rowIndex = rowIndex;
        thumbnail.dataset.colIndex = colIndex;

        const img = document.createElement('img');
        img.src = video.thumbnail || 'images/placeholder.png';
        img.alt = video.title;
        img.onerror = function() {
            this.src = 'images/placeholder.png';
        };

        const titleOverlay = document.createElement('div');
        titleOverlay.className = 'thumbnail-title';
        titleOverlay.textContent = video.title;

        thumbnail.appendChild(img);
        thumbnail.appendChild(titleOverlay);

        // Store video data
        thumbnail.videoData = video;

        return thumbnail;
    },

    /**
     * Set focus on a specific thumbnail
     * @param {number} row - Row index
     * @param {number} col - Column index
     */
    setFocus(row, col) {
        // Remove previous focus
        const previousFocused = document.querySelector('.thumbnail.focused');
        if (previousFocused) {
            previousFocused.classList.remove('focused');
        }

        // Set new focus
        const thumbnail = document.querySelector(
            `.thumbnail[data-row-index="${row}"][data-col-index="${col}"]`
        );

        if (thumbnail) {
            thumbnail.classList.add('focused');
            this.currentRow = row;
            this.currentCol = col;

            // Scroll into view
            thumbnail.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    },

    /**
     * Get currently focused video data
     * @returns {Object|null} Video data
     */
    getFocusedVideo() {
        const focused = document.querySelector('.thumbnail.focused');
        return focused ? focused.videoData : null;
    },

    /**
     * Get total rows
     * @returns {number} Number of rows
     */
    getTotalRows() {
        return Object.keys(this.categories).length;
    },

    /**
     * Get total columns in a row
     * @param {number} row - Row index
     * @returns {number} Number of columns
     */
    getTotalCols(row) {
        const categoryKeys = Object.keys(this.categories);
        if (row >= 0 && row < categoryKeys.length) {
            return this.categories[categoryKeys[row]].length;
        }
        return 0;
    },

    /**
     * Show loading indicator
     */
    showLoading() {
        document.getElementById('loading').classList.remove('hidden');
    },

    /**
     * Hide loading indicator
     */
    hideLoading() {
        document.getElementById('loading').classList.add('hidden');
    }
};
