# Installation Guide

## Quick Start

1. **Configure the app** by editing `js/config.js`:
   ```javascript
   MRSS_FEED_URL: 'https://your-domain.com/feed.xml',  // Your MRSS feed
   GA_MEASUREMENT_ID: 'G-XXXXXXXXXX',                   // Your Google Analytics ID
   ```

2. **Update App ID** in `config.xml`:
   ```xml
   <tizen:application id="YOUR_APP_ID.SamsungTVApp" package="YOUR_APP_ID"/>
   ```

3. **Update Google Analytics ID** in `index.html`:
   ```html
   <script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
   ```
   And in the gtag config:
   ```javascript
   gtag('config', 'GA_MEASUREMENT_ID');
   ```

## Development Setup

### Install Tizen Studio

1. Download Tizen Studio from: https://developer.samsung.com/smarttv/develop/getting-started/setting-up-sdk.html
2. Install Tizen Studio
3. Install TV Extensions via Package Manager

### Setup Samsung TV for Development

1. **Enable Developer Mode on TV:**
   - Press **Home** button on remote
   - Go to **Apps**
   - Press **1 2 3 4 5** on the remote
   - Toggle **Developer mode** to **ON**
   - Enter your computer's IP address
   - Restart the TV

2. **Connect TV in Tizen Studio:**
   - Open Device Manager in Tizen Studio
   - Click **Remote Device Manager**
   - Click **+** to add TV
   - Enter TV's IP address
   - Click **Add** and **Connect**

## Building the App

1. Open Tizen Studio
2. File > Open Projects from File System
3. Select the `SamsungTVApp` folder
4. Right-click on project > **Build Project**

## Running the App

### On Emulator

1. Tools > Emulator Manager
2. Create a TV emulator
3. Launch emulator
4. Right-click project > Run As > Tizen TV Web Application

### On Real TV

1. Ensure TV is connected in Device Manager
2. Right-click project > Run As > Tizen TV Web Application
3. Select your TV from the device list

## Creating App Icon

Replace `icon.png` with your app icon:
- Size: 512x512 pixels
- Format: PNG
- Transparent background recommended

## Testing with Sample Feed

A sample MRSS feed is included in `sample-feed.xml`. To test locally:

1. Host the feed on a local web server or upload to a URL
2. Update `MRSS_FEED_URL` in `js/config.js`
3. Replace the sample video URLs with your own M3U8 streams

## Packaging for Distribution

1. Right-click project > Build Signed Package
2. Create or select a certificate
3. Follow Samsung's app submission guidelines

## Troubleshooting

### App won't load on TV
- Verify Developer Mode is enabled
- Check TV and computer are on same network
- Restart TV after enabling Developer Mode

### Videos won't play
- Ensure M3U8 URLs are publicly accessible
- Check CORS settings on your video server
- Verify URLs in MRSS feed are correct

### Can't connect to TV in Tizen Studio
- Verify computer and TV IP addresses
- Check firewall settings
- Ensure TV Developer Mode is ON
