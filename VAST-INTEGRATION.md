# VAST Tag Integration Guide

## Overview

The Samsung TV App supports dynamic VAST (Video Ad Serving Template) tag URLs with automatic parameter substitution. This enables server-side header bidding, personalized ad targeting, and proper device identification.

## Configuration

### Complete Example

```json
{
  "ads": {
    "enabled": true,
    "frequency": 5,
    "vastTagUrl": "https://pbs.getpublica.com/v1/s2s-hb?site_id=65414&app_bundle={{APP_BUNDLE}}&did={{DEVICE_ID}}&format=vast&pod_duration=30&min_ad_duration=6&max_ad_duration=30&cb={{CACHEBUSTER}}&ip={{IP}}&app_domain=erienewsnow.com&app_name={{APP_NAME}}&app_store_url={{APP_STORE_URL}}&position=preroll&schain=erienewsnow&deviceprovider=da-v3",
    "appBundle": "com.erienewsnow.samsungtv",
    "appName": "Erie News Now",
    "appStoreUrl": "https://example.com/app-store-url"
  }
}
```

## Supported Variables

| Variable | Description | Source | Example Value |
|----------|-------------|--------|---------------|
| `{{APP_BUNDLE}}` | App bundle/package identifier | Config (`appBundle`) | `com.erienewsnow.samsungtv` |
| `{{APP_NAME}}` | Application display name | Config (`appName`) | `Erie News Now` |
| `{{APP_STORE_URL}}` | App store or website URL | Config (`appStoreUrl`) | `https://erienewsnow.com/app` |
| `{{DEVICE_ID}}` | Unique device identifier | Auto-detected | `a1b2c3d4-e5f6-7890-abcd-ef1234567890` |
| `{{IP}}` | Device IP address | Auto-detected | `192.168.1.100` |
| `{{CACHEBUSTER}}` | Timestamp for cache prevention | Auto-generated | `1705412345678` |

## Variable Details

### Static Variables (From Config)

These values come from your `app-config.json` file:

**APP_BUNDLE**
- Your app's bundle identifier
- Format: Reverse domain notation (e.g., `com.company.appname`)
- Used for app identification in ad networks

**APP_NAME**
- Your application's display name
- Plain text name shown to users
- Used in ad reporting and analytics

**APP_STORE_URL**
- URL where users can find your app
- Can be app store link or website URL
- Used for attribution and tracking

### Dynamic Variables (Auto-Generated)

These values are automatically collected at runtime:

**DEVICE_ID**
- Unique identifier for the TV device
- Detection order:
  1. Samsung TV API: `webapis.productinfo.getDuid()`
  2. TV model number: `webapis.productinfo.getRealModel()`
  3. Generated UUID stored in localStorage (persistent)
- Format: UUID v4 (e.g., `550e8400-e29b-41d4-a716-446655440000`)

**IP**
- Current IP address of the device
- Detection order:
  1. Samsung TV Network API: `webapis.network.getIp()`
  2. External service: `api.ipify.org` (fallback)
- Format: IPv4 address (e.g., `192.168.1.100`)

**CACHEBUSTER**
- Current timestamp in milliseconds
- Regenerated on every ad request
- Prevents ad server caching
- Format: Unix timestamp in milliseconds (e.g., `1705412345678`)

## How It Works

### 1. Configuration Loading

The app loads the VAST configuration from `app-config.json`:

```json
"ads": {
  "vastTagUrl": "https://ad-server.com/vast?did={{DEVICE_ID}}&cb={{CACHEBUSTER}}",
  "appBundle": "com.myapp.samsungtv",
  "appName": "My App"
}
```

### 2. Parameter Collection

When an ad is needed, the app:
1. Retrieves static values from config
2. Detects device ID using Samsung APIs or generates UUID
3. Fetches IP address from network APIs or external service
4. Generates fresh cache buster timestamp

### 3. URL Building

The `VASTUtils.buildVASTUrl()` function:
1. Takes the template URL
2. Collects all parameter values
3. URL-encodes each value
4. Replaces all `{{VARIABLE}}` placeholders
5. Returns the complete URL

**Example:**

Template:
```
https://ad.server/vast?did={{DEVICE_ID}}&app={{APP_NAME}}&cb={{CACHEBUSTER}}
```

Becomes:
```
https://ad.server/vast?did=a1b2c3d4-5678&app=My%20App&cb=1705412345678
```

### 4. VAST Fetching

The app:
1. Sends HTTP GET request to the built URL
2. Receives VAST XML response
3. Parses XML to extract media file URL

### 5. Media File Selection

The parser looks for `<MediaFile>` elements and:
1. Prefers HLS/M3U8 format (`application/x-mpegURL`)
2. Falls back to MP4 format (`video/mp4`)
3. Uses first available as last resort

### 6. Ad Playback

The extracted media URL is played using Samsung AVPlay API.

## Example VAST Request

**Template in config:**
```
https://pbs.getpublica.com/v1/s2s-hb?site_id=65414&app_bundle={{APP_BUNDLE}}&did={{DEVICE_ID}}&cb={{CACHEBUSTER}}&ip={{IP}}&app_name={{APP_NAME}}
```

**Actual request sent:**
```
https://pbs.getpublica.com/v1/s2s-hb?site_id=65414&app_bundle=com.erienewsnow.samsungtv&did=550e8400-e29b-41d4-a716-446655440000&cb=1705412345678&ip=192.168.1.100&app_name=Erie%20News%20Now
```

## VAST Response Example

The ad server should return VAST XML:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<VAST version="3.0">
  <Ad id="12345">
    <InLine>
      <AdTitle>Sample Ad</AdTitle>
      <Creatives>
        <Creative>
          <Linear>
            <Duration>00:00:30</Duration>
            <MediaFiles>
              <MediaFile delivery="progressive" type="application/x-mpegURL">
                https://cdn.example.com/ad-video.m3u8
              </MediaFile>
              <MediaFile delivery="progressive" type="video/mp4">
                https://cdn.example.com/ad-video.mp4
              </MediaFile>
            </MediaFiles>
          </Linear>
        </Creative>
      </Creatives>
    </InLine>
  </Ad>
</VAST>
```

## Ad Frequency Configuration

Control how often ads are shown with the `frequency` parameter:

```json
"ads": {
  "frequency": 5  // Show ad every 5 videos
}
```

The app tracks video plays in localStorage and shows a preroll ad every N videos.

## Debugging

### Enable Debug Mode

Set `DEBUG: true` in `js/config.js`:

```javascript
const AppConfig = {
    DEBUG: true,
    // ...
};
```

### Console Output

With debug enabled, you'll see:

```
Loading configuration from: app-config.json
Configuration loaded: {ads: {...}, categories: [...]}
Playing preroll ad
VAST URL Template: https://ad.server/vast?did={{DEVICE_ID}}...
VAST URL Populated: https://ad.server/vast?did=a1b2c3d4-5678...
VAST Parameters: {
  appBundle: "com.myapp.tv",
  deviceId: "a1b2c3d4-5678",
  cacheBuster: "1705412345678",
  ip: "192.168.1.100",
  appName: "My App",
  appStoreUrl: "https://myapp.com"
}
Fetching VAST from: https://ad.server/vast?...
Selected ad media file: https://cdn.example.com/ad.m3u8
```

### Network Inspector

Use browser developer tools to inspect:
1. VAST tag request URL
2. VAST XML response
3. Media file request

### Common Issues

**No ads playing:**
- Check `ads.enabled` is `true`
- Verify `vastTagUrl` is configured
- Check console for VAST fetch errors
- Ensure ad frequency threshold is met

**Invalid device ID:**
- Check Samsung TV API availability
- Fallback UUID should be generated and stored
- Verify localStorage is working

**IP address not detected:**
- Check network connectivity
- Fallback to external IP service should work
- Empty IP is allowed (some ad servers don't require it)

**VAST parsing errors:**
- Verify VAST XML is valid
- Check MediaFile elements exist
- Ensure media URLs are accessible

## Testing

### Test with Mock VAST Server

Create a simple VAST XML file and host it:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<VAST version="3.0">
  <Ad id="test">
    <InLine>
      <AdTitle>Test Ad</AdTitle>
      <Creatives>
        <Creative>
          <Linear>
            <Duration>00:00:15</Duration>
            <MediaFiles>
              <MediaFile delivery="progressive" type="application/x-mpegURL">
                https://your-test-server.com/test-ad.m3u8
              </MediaFile>
            </MediaFiles>
          </Linear>
        </Creative>
      </Creatives>
    </InLine>
  </Ad>
</VAST>
```

Configure:
```json
"ads": {
  "enabled": true,
  "frequency": 1,  // Test every video
  "vastTagUrl": "https://your-test-server.com/test-vast.xml"
}
```

### Test Variable Substitution

Set debug mode and check console logs to verify:
1. Template URL contains `{{VARIABLES}}`
2. Populated URL has actual values
3. All variables are properly URL-encoded
4. Device ID is consistent across requests
5. Cache buster changes each time

## Best Practices

1. **Use HTTPS**: Always use HTTPS URLs for VAST tags
2. **Set Proper Frequency**: Don't overload users with ads (5-7 videos is good)
3. **Monitor Performance**: Track ad load times and failures
4. **Test Thoroughly**: Test with real VAST endpoints before production
5. **Handle Failures Gracefully**: App continues if ads fail
6. **Respect Privacy**: Only collect necessary device information
7. **Cache Device ID**: Use localStorage to maintain consistent device ID

## Analytics Integration

Ad events are automatically tracked to Google Analytics:

- `Ad Impression` - VAST request initiated
- `Ad Start` - Ad playback started
- `Ad Complete` - Ad finished playing
- `Ad Skip` - User skipped ad (if enabled)
- `Ad Error` - VAST fetch or playback error

View these events in your Google Analytics dashboard under Events > Ad.

## Support

For VAST specification details:
- VAST 2.0: https://www.iab.com/guidelines/vast/
- VAST 3.0: https://www.iab.com/guidelines/vast/
- VAST 4.0: https://www.iab.com/guidelines/vast/

For Samsung TV development:
- https://developer.samsung.com/smarttv
- https://developer.tizen.org/
