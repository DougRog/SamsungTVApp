# Samsung Tizen CTV App

A Connected TV (CTV) application for Samsung Tizen platform that displays video content organized by categories from an MRSS feed, with support for M3U8 streaming, Google Analytics tracking, and preroll advertisements.

## Features

- **Category-based Content Rows**: Displays content organized in horizontal rows by category
- **MRSS Feed Integration**: Dynamically pulls content from MRSS XML feeds
- **M3U8 Streaming**: Supports HLS (HTTP Live Streaming) video playback
- **Google Analytics**: Tracks user interactions, video plays, and completions
- **Preroll Ads**: Shows advertisement every 5 videos played
- **TV Remote Navigation**: Full support for Samsung TV remote control

## Project Structure

```
SamsungTVApp/
├── index.html              # Main HTML file
├── config.xml              # Tizen app configuration
├── .project                # Tizen project file
├── css/
│   └── style.css          # Application styles
├── js/
│   ├── app.js             # Main application entry point
│   ├── config.js          # Configuration settings
│   ├── mrss-parser.js     # MRSS feed parser
│   ├── ui-manager.js      # UI rendering and management
│   ├── video-player.js    # Video player with AVPlay API
│   ├── ad-manager.js      # Advertisement management
│   ├── analytics.js       # Google Analytics integration
│   └── navigation.js      # TV remote control navigation
└── images/
    ├── icon.png           # App icon
    └── placeholder.png    # Placeholder thumbnail
```

## Configuration

### 1. Update MRSS Feed URL

Edit `js/config.js` and set your MRSS feed URL:

```javascript
MRSS_FEED_URL: 'https://your-domain.com/feed.xml',
```

### 2. Configure Google Analytics

1. Edit `index.html` and replace `GA_MEASUREMENT_ID` with your Google Analytics 4 Measurement ID:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
```

2. Also update the configuration in the gtag initialization:

```javascript
gtag('config', 'GA_MEASUREMENT_ID');
```

3. Update `js/config.js`:

```javascript
GA_MEASUREMENT_ID: 'G-XXXXXXXXXX',
```

### 3. Configure Ad Settings (Optional)

Edit `js/config.js`:

```javascript
AD_FREQUENCY: 5,  // Show ad every N videos
AD_TAG_URL: 'https://your-domain.com/vast-ad-tag.xml',  // VAST ad tag URL
```

### 4. Update App ID

Edit `config.xml` and replace `YOUR_APP_ID` with your actual Tizen app ID:

```xml
<tizen:application id="YOUR_APP_ID.SamsungTVApp" package="YOUR_APP_ID" required_version="6.0"/>
```

## MRSS Feed Format

Your MRSS feed should follow this structure:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/">
    <channel>
        <title>Your Channel</title>
        <item>
            <title>Video Title</title>
            <description>Video description</description>
            <category>Category Name</category>
            <media:thumbnail url="https://example.com/thumbnail.jpg"/>
            <media:content url="https://example.com/video.m3u8" type="application/x-mpegURL"/>
        </item>
        <!-- More items -->
    </channel>
</rss>
```

### Required Fields

- `<title>`: Video title
- `<category>`: Category name (used to group videos into rows)
- `<media:thumbnail url="">`: Thumbnail image URL
- `<media:content url="">`: M3U8 video stream URL

## Building and Installing

### Prerequisites

- Tizen Studio installed
- Samsung TV for testing (or Tizen TV emulator)
- Developer mode enabled on Samsung TV

### Build Steps

1. Open Tizen Studio
2. Import the project: File > Open Projects from File System
3. Select the `SamsungTVApp` directory
4. Right-click project > Build Project
5. Right-click project > Run As > Tizen TV Web Application

### Installation on Samsung TV

1. Enable Developer Mode on your Samsung TV:
   - Press Home button
   - Navigate to Apps
   - Enter 12345 on remote
   - Set Developer Mode to ON
   - Enter your computer's IP address
   - Restart TV

2. Install the app:
   - In Tizen Studio, select your TV from the Connection Explorer
   - Right-click the project > Run As > Tizen TV Web Application

## Remote Control Keys

### Content Browser

- **Arrow Keys**: Navigate through content
- **Enter/OK**: Select and play video
- **Back**: Exit application

### Video Player

- **Play/Pause**: Toggle playback
- **Stop**: Stop video and return to browser
- **Fast Forward / Right Arrow**: Seek forward 10 seconds
- **Rewind / Left Arrow**: Seek backward 10 seconds
- **Back**: Stop video and return to browser

## Google Analytics Events Tracked

### App Events
- App Launch
- Content Load Success/Failure

### Video Events
- Video Play (with title and category)
- Video Complete (with title and category)

### Ad Events
- Ad Impression
- Ad Start
- Ad Complete
- Ad Skip
- Ad Error

### Navigation Events
- Navigation direction
- Video selection

### Error Events
- All errors with type and message

## Video Counter and Ad Frequency

The app tracks the number of videos played using localStorage. Every 5 videos (configurable), a preroll ad will play before the selected video.

To reset the counter (for testing):
```javascript
AdManager.resetCounter();
```

## Troubleshooting

### Videos not loading
- Check MRSS feed URL is accessible
- Verify M3U8 URLs are valid and accessible
- Check network connectivity
- Review console logs for errors

### Ads not playing
- Verify AD_TAG_URL is set correctly
- Check VAST ad tag returns valid ad URLs
- Ad implementation includes placeholder for VAST parsing

### Analytics not tracking
- Verify GA_MEASUREMENT_ID is correct
- Check internet connectivity
- Review browser console for gtag errors

## Development

### Debug Mode

Debug mode is enabled by default in `js/config.js`:

```javascript
DEBUG: true
```

This will log additional information to the console.

### Testing

You can test the app in:
1. Tizen TV Emulator (Tizen Studio)
2. Samsung TV Web Simulator
3. Actual Samsung TV with Developer Mode

## License

This project is provided as-is for use with Samsung Tizen TVs.

## Support

For Samsung Tizen development documentation, visit:
- https://developer.samsung.com/smarttv/develop/getting-started/setting-up-sdk.html
- https://developer.tizen.org/development/training/web-application
