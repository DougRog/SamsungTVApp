# Configuration Guide

## Overview

The Samsung TV App uses a JSON configuration file that can be hosted at a web URL or used locally. This allows you to update content feeds, theming, and settings without rebuilding the app.

## Configuration File Structure

Create an `app-config.json` file with the following structure:

```json
{
  "app": {
    "name": "Samsung TV App",
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
    "vastTagUrl": "https://example.com/vast-ad-tag.xml"
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
    },
    {
      "name": "Drama",
      "feedUrl": "https://example.com/feeds/drama.xml",
      "enabled": true
    }
  ]
}
```

## Configuration Options

### App Settings

- **name**: Application name displayed in the UI
- **version**: Application version

### Theme Settings

- **backgroundColor**: Background color for splash screen and UI accents (hex color)
- **textColor**: Text color throughout the app (hex color)
- **fontFamily**: CSS font family string (default: "Inter, Arial, sans-serif")
- **accentColor**: Color for focused elements and highlights (hex color)

### Splash Screen Settings

- **enabled**: Show splash screen on app launch (true/false)
- **backgroundColor**: Splash screen background color (hex color)
- **logoUrl**: Path or URL to logo image
- **logoScale**: Scale factor for logo (0.5 = 50% of original size)
- **duration**: How long to show splash screen in milliseconds (e.g., 3000 = 3 seconds)

### Analytics Settings

- **googleAnalyticsId**: Your Google Analytics 4 measurement ID (format: G-XXXXXXXXXX)
- **enabled**: Enable/disable analytics tracking (true/false)

### Ad Settings

- **enabled**: Enable/disable preroll ads (true/false)
- **frequency**: Show ad every N videos (e.g., 5 = ad every 5 videos)
- **vastTagUrl**: URL to VAST ad tag XML

### Categories

Array of content categories, each with:
- **name**: Category display name
- **feedUrl**: URL to MRSS feed for this category
- **enabled**: Enable/disable this category (true/false)

## Hosting Configuration

### Option 1: Remote Configuration (Recommended for Production)

1. Host `app-config.json` on a web server
2. Update `js/config.js`:
   ```javascript
   CONFIG_URL: 'https://your-domain.com/app-config.json',
   USE_LOCAL_CONFIG: false
   ```

**Benefits:**
- Update content feeds without rebuilding the app
- Change theming remotely
- Enable/disable categories dynamically

### Option 2: Local Configuration (Development/Testing)

1. Keep `app-config.json` in the app root directory
2. Update `js/config.js`:
   ```javascript
   USE_LOCAL_CONFIG: true,
   LOCAL_CONFIG_PATH: 'app-config.json'
   ```

## MRSS Feed Format

Each category feed should be a valid MRSS XML file:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/">
    <channel>
        <title>Action Movies</title>
        <item>
            <title>Video Title</title>
            <description>Video description</description>
            <media:thumbnail url="https://example.com/thumbnail.jpg"/>
            <media:content url="https://example.com/video.m3u8" type="application/x-mpegURL"/>
        </item>
    </channel>
</rss>
```

**Required fields per item:**
- `<title>`: Video title
- `<media:thumbnail url="">`: Thumbnail image URL
- `<media:content url="" type="application/x-mpegURL">`: M3U8 video URL

## Theme Customization

### Using Custom Fonts

1. Add font in `index.html`:
   ```html
   <link href="https://fonts.googleapis.com/css2?family=YourFont:wght@400;600&display=swap" rel="stylesheet">
   ```

2. Update `app-config.json`:
   ```json
   "theme": {
     "fontFamily": "YourFont, Arial, sans-serif"
   }
   ```

### Color Scheme Examples

**Netflix-style dark theme:**
```json
"theme": {
  "backgroundColor": "#141414",
  "textColor": "#ffffff",
  "fontFamily": "Inter, Arial, sans-serif",
  "accentColor": "#e50914"
}
```

**Blue corporate theme:**
```json
"theme": {
  "backgroundColor": "#00277e",
  "textColor": "#ffffff",
  "fontFamily": "Inter, Arial, sans-serif",
  "accentColor": "#ffffff"
}
```

## Google Analytics Setup

1. Create a GA4 property at https://analytics.google.com
2. Get your Measurement ID (format: G-XXXXXXXXXX)
3. Update `app-config.json`:
   ```json
   "analytics": {
     "googleAnalyticsId": "G-XXXXXXXXXX",
     "enabled": true
   }
   ```
4. Also update `index.html` (lines 16 and 21) with your Measurement ID

## Advertisement Configuration

### Setting Up VAST Ads

1. Obtain a VAST ad tag URL from your ad provider
2. Update `app-config.json`:
   ```json
   "ads": {
     "enabled": true,
     "frequency": 5,
     "vastTagUrl": "https://your-ad-server.com/vast-tag.xml"
   }
   ```

### Disabling Ads

```json
"ads": {
  "enabled": false
}
```

## Dynamic Content Updates

With remote configuration, you can:

1. **Add/Remove Categories**: Update the categories array
2. **Change Feed URLs**: Point to different content sources
3. **Disable Categories**: Set `enabled: false` for any category
4. **Update Theme**: Change colors and fonts
5. **Adjust Ad Frequency**: Modify the frequency value

Changes take effect on next app launch.

## Testing Configuration

1. Use local configuration during development
2. Test with sample feeds (see `sample-feed.xml`)
3. Validate JSON syntax: https://jsonlint.com/
4. Test all category feeds are accessible
5. Verify M3U8 video URLs work

## Troubleshooting

**Configuration not loading:**
- Check JSON syntax is valid
- Verify CONFIG_URL is accessible
- Check browser console for errors
- Ensure CORS headers allow access

**Feeds not loading:**
- Verify all feedUrl values are valid URLs
- Check feeds return valid MRSS XML
- Ensure M3U8 video URLs are accessible
- Check network connectivity

**Theme not applying:**
- Verify hex color format (#RRGGBB)
- Check CSS variable names are correct
- Clear browser cache
- Check console for CSS errors
