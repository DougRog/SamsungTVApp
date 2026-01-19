# Samsung Tizen CTV App

A Connected TV (CTV) application for Samsung Tizen platform with web-based configuration, multiple MRSS feed support, customizable theming, splash screen, Google Analytics, and preroll advertisements.

## Features

- **Web-Based Configuration**: Host configuration at a URL for easy updates without rebuilding
- **Multiple MRSS Feeds**: Each category pulls from its own dedicated feed
- **Customizable Splash Screen**: Branded splash with configurable logo, colors, and duration
- **Dynamic Theming**: Configurable colors, fonts (Inter by default), and styling
- **Category-based Rows**: Content organized in horizontal scrolling rows
- **M3U8 Streaming**: HLS video playback using Samsung AVPlay API
- **Google Analytics**: Comprehensive event tracking
- **Preroll Ads**: VAST ad integration with configurable frequency
- **TV Remote Navigation**: Full Samsung TV remote control support

## Quick Start

### 1. Configure the App

Create or edit `app-config.json` with your settings:

```json
{
  "app": {
    "name": "Your App Name",
    "version": "1.0.0"
  },
  "theme": {
    "backgroundColor": "#00277e",
    "textColor": "#ffffff",
    "fontFamily": "Inter, Arial, sans-serif",
    "accentColor": "#ffffff"
  },
  "splash": {
    "enabled": true,
    "backgroundColor": "#00277e",
    "logoUrl": "images/logo.png",
    "logoScale": 0.5,
    "duration": 3000
  },
  "analytics": {
    "googleAnalyticsId": "G-XXXXXXXXXX",
    "enabled": true
  },
  "ads": {
    "enabled": true,
    "frequency": 5,
    "vastTagUrl": "https://example.com/vast.xml"
  },
  "categories": [
    {
      "name": "Action",
      "feedUrl": "https://example.com/feeds/action.xml",
      "enabled": true
    },
    {
      "name": "Comedy",
      "feedUrl": "https://example.com/feeds/comedy.xml",
      "enabled": true
    }
  ]
}
```

See [CONFIG.md](CONFIG.md) for detailed configuration options.

### 2. Add Your Logo

Place your logo image at `images/logo.png` (recommended size: 800x400px or larger)

### 3. Configure Remote or Local Config

Edit `js/config.js`:

**For remote configuration (recommended for production):**
```javascript
CONFIG_URL: 'https://your-domain.com/app-config.json',
USE_LOCAL_CONFIG: false
```

**For local configuration (development):**
```javascript
USE_LOCAL_CONFIG: true,
LOCAL_CONFIG_PATH: 'app-config.json'
```

### 4. Update App ID

Edit `config.xml` and replace `YOUR_APP_ID`:
```xml
<tizen:application id="YOUR_APP_ID.SamsungTVApp" package="YOUR_APP_ID"/>
```

### 5. Update Google Analytics ID

Edit `index.html` (lines 16 and 21) and replace `GA_MEASUREMENT_ID` with your actual Google Analytics ID.

## Project Structure

```
SamsungTVApp/
├── index.html              # Main HTML with splash screen
├── app-config.json         # Web-based configuration file
├── config.xml              # Tizen app configuration
├── .project                # Tizen project file
├── css/
│   └── style.css          # Styles with CSS variables for theming
├── js/
│   ├── app.js             # Main app with splash screen logic
│   ├── config.js          # Config loader (remote/local)
│   ├── mrss-parser.js     # Multi-feed MRSS parser
│   ├── ui-manager.js      # UI rendering
│   ├── video-player.js    # AVPlay video player
│   ├── ad-manager.js      # Preroll ad system
│   ├── analytics.js       # Google Analytics
│   └── navigation.js      # Remote control navigation
├── images/
│   ├── logo.png           # Splash screen logo
│   ├── icon.png           # App icon (512x512)
│   └── placeholder.png    # Fallback thumbnail
├── CONFIG.md              # Detailed configuration guide
├── INSTALLATION.md        # Setup and deployment guide
└── sample-feed.xml        # Sample MRSS feed
```

## MRSS Feed Format

Each category should have its own MRSS feed:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/">
    <channel>
        <title>Category Name</title>
        <item>
            <title>Video Title</title>
            <description>Video description</description>
            <media:thumbnail url="https://example.com/thumb.jpg"/>
            <media:content url="https://example.com/video.m3u8" type="application/x-mpegURL"/>
        </item>
    </channel>
</rss>
```

## Key Features Explained

### Splash Screen
- Displays on app launch with your logo
- Configurable background color matching your brand
- Logo scales automatically (default 50%)
- Configurable duration (default 3 seconds)
- Smooth fade-in and fade-out animations

### Web-Based Configuration
- Update content feeds without rebuilding app
- Change theming, colors, and fonts remotely
- Enable/disable categories dynamically
- Adjust ad frequency on the fly
- Perfect for managing multiple deployments

### Multiple Feed Support
- Each category loads from its own MRSS feed
- Feeds load in parallel for fast startup
- Failed feeds won't break other categories
- Easy to add/remove categories via config

### Theming System
- Uses CSS variables for easy customization
- Inter font by default (with Google Fonts fallback)
- Configurable background, text, and accent colors
- Consistent styling across all screens

## Building and Testing

### Prerequisites
- Tizen Studio
- Samsung TV (Developer Mode enabled) or TV Emulator

### Build Steps
1. Open project in Tizen Studio
2. File > Open Projects from File System
3. Select the `SamsungTVApp` directory
4. Build Project
5. Run on emulator or TV

See [INSTALLATION.md](INSTALLATION.md) for detailed setup instructions.

## Remote Control Keys

### Content Browser
- **Arrow Keys**: Navigate content
- **Enter/OK**: Select and play video
- **Back**: Exit app

### Video Player
- **Play/Pause**: Toggle playback
- **Stop**: Stop and return to browser
- **Fast Forward/Right**: Seek +10 seconds
- **Rewind/Left**: Seek -10 seconds
- **Back**: Stop and return

## Analytics Events Tracked

- App Launch
- Content Load (Success/Failure)
- Video Play (with title and category)
- Video Complete
- Ad Impression/Start/Complete/Skip/Error
- Navigation events
- All errors with details

## Ad System

- Preroll ads shown every N videos (configurable)
- Play counter stored in localStorage
- VAST ad tag support (requires implementation)
- Tracks all ad events to Analytics

## Customization Examples

### Netflix-Style Theme
```json
"theme": {
  "backgroundColor": "#141414",
  "textColor": "#ffffff",
  "fontFamily": "Inter, Arial, sans-serif",
  "accentColor": "#e50914"
}
```

### Corporate Blue Theme (Default)
```json
"theme": {
  "backgroundColor": "#00277e",
  "textColor": "#ffffff",
  "fontFamily": "Inter, Arial, sans-serif",
  "accentColor": "#ffffff"
}
```

## Documentation

- [CONFIG.md](CONFIG.md) - Detailed configuration guide
- [INSTALLATION.md](INSTALLATION.md) - Setup and deployment
- [sample-feed.xml](sample-feed.xml) - Example MRSS feed

## Troubleshooting

**Splash screen not showing:**
- Check `splash.enabled` is `true` in config
- Verify logo.png exists in images folder
- Check browser console for errors

**Configuration not loading:**
- Validate JSON syntax at jsonlint.com
- Check CONFIG_URL is accessible
- Verify CORS headers if using remote config
- Try USE_LOCAL_CONFIG: true for testing

**Videos not playing:**
- Ensure M3U8 URLs are accessible
- Check CORS settings on video server
- Verify feedUrl values in config
- Test feeds in browser

**Theme not applying:**
- Check hex color format (#RRGGBB)
- Verify config loaded successfully
- Check browser console for CSS errors

## Support

For Samsung Tizen development:
- https://developer.samsung.com/smarttv
- https://developer.tizen.org/

For issues with this app, check the console logs for detailed error messages.

## License

Provided as-is for use with Samsung Tizen TVs.
