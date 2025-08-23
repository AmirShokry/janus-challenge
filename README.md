# Janus WebRTC Demo

A mini WebRTC demo app built with **Nuxt 4** that allows:

- **Publisher**: Send webcam stream to a Janus videoroom and auto-register it as a mountpoint
- **Viewer**: Pick a mountpoint and watch the live stream via Janus streaming plugin

## Features

### Publisher (/videoroom)

- Join a Janus videoroom using `janus.plugin.videoroom`
- Publish local webcam + microphone stream
- Automatically register mountpoint via backend API
- Real-time status indicators and controls
- Clean UI built with Nuxt UI Pro components

### Viewer (/streaming)

- Fetch available mountpoints from backend API
- Select mountpoint from dropdown
- Play live streams using `janus.plugin.streaming`
- Video player controls (Play/Stop)
- Real-time stream status

### Backend API

- In-memory mountpoints storage
- RESTful API endpoints:
  - `GET /api/mountpoints` - List all mountpoints
  - `POST /api/mountpoints` - Create new mountpoint
  - `DELETE /api/mountpoints` - Delete mountpoint

## Tech Stack

- **Framework**: Nuxt 4
- **UI Library**: Nuxt UI Pro + Tailwind CSS
- **WebRTC**: typed_janus_js
- **Server**: H3 (built-in Nuxt server)
- **Styling**: Tailwind CSS

## Installation & Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd janus-challenge
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

## Janus Server Configuration

### Default Configuration

The app is configured to use the test Janus server:

```
wss://janus1.januscaler.com/janus/ws
```

### Local Janus Server (Optional)

If you want to use a local Janus server:

1. Install and configure Janus WebRTC Gateway
2. Enable the following plugins:
   - `janus.plugin.videoroom`
   - `janus.plugin.streaming`
3. Update the server URL in the components to:
   ```javascript
   server: "ws://localhost:8188/janus";
   ```

## Project Structure

```
janus-challenge/
├── pages/
│   ├── index.vue           # Home page with navigation
│   ├── videoroom.vue       # Publisher page
│   └── streaming.vue       # Viewer page
├── components/
│   ├── PublisherCard.vue   # Publisher component
│   └── ViewerCard.vue      # Viewer component
├── server/
│   └── api/
│       └── mountpoints.ts  # Mountpoints API
├── package.json
├── nuxt.config.ts
└── README.md
```

## Usage

### Publishing a Stream

1. Navigate to `/videoroom`
2. Click "Join Room" to connect to Janus and access your camera
3. Click "Publish" to start broadcasting your stream
4. Your stream will be automatically registered as a mountpoint

### Viewing a Stream

1. Navigate to `/streaming`
2. Click "Refresh" to load available mountpoints
3. Select a mountpoint from the dropdown
4. Click "Play" to start watching the stream

## API Endpoints

### GET /api/mountpoints

Returns all available mountpoints.

**Response:**

```json
[
  {
    "id": 1,
    "description": "Live Stream from Room 1234",
    "roomId": 1234,
    "createdAt": "2025-08-23T12:00:00.000Z"
  }
]
```

### POST /api/mountpoints

Creates a new mountpoint.

**Request:**

```json
{
  "description": "My Live Stream",
  "roomId": 1234
}
```

**Response:**

```json
{
  "id": 1,
  "description": "My Live Stream",
  "roomId": 1234,
  "createdAt": "2025-08-23T12:00:00.000Z"
}
```

### DELETE /api/mountpoints

Deletes a mountpoint.

**Request:**

```json
{
  "id": 1
}
```

**Response:**

```json
{
  "success": true
}
```

## Browser Compatibility

- **Chrome/Chromium**: Full support
- **Firefox**: Full support
- **Safari**: Supported (may require user interaction for camera access)
- **Edge**: Full support

**Note**: HTTPS is required for camera/microphone access in production.

## Development Notes

### Camera Permissions

- The app requests camera and microphone permissions
- Allow permissions when prompted for full functionality
- On localhost, permissions are usually granted automatically

### WebRTC Connection

- The app uses the public Janus test server
- Connection may take a few seconds to establish
- Check browser console for detailed WebRTC logs

### Troubleshooting

- If camera doesn't appear, check browser permissions
- If connection fails, ensure the Janus server is accessible
- Use browser developer tools to debug WebRTC issues

## Resources

- [Janus WebRTC Gateway](https://janus.conf.meetecho.com/)
- [Janus VideoRoom Plugin](https://janus.conf.meetecho.com/docs/videoroom.html)
- [Janus Streaming Plugin](https://janus.conf.meetecho.com/docs/streaming.html)
- [Nuxt UI Pro](https://ui.nuxt.com/pro)
- [typed_janus_js](https://www.npmjs.com/package/typed_janus_js)

## License

MIT License - feel free to use this code for learning and development purposes.
