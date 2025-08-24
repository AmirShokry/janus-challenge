A mini WebRTC demo app built with **Nuxt 4** that allows:

- **Publisher**: Send webcam stream to a Janus videoroom and auto-register it as a mountpoint
- **Viewer**: Pick a mountpoint and watch the live stream via Janus streaming plugin

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

## Getting Started

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
