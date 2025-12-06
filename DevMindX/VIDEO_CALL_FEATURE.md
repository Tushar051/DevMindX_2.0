# DevMindX Video Call & Meeting Notes Feature

## Overview
Complete video conferencing system integrated into the IDE with automatic meeting notes, file activity tracking, and PDF export capabilities.

## Features

### 🎥 Video Calling
- **WebRTC-based** peer-to-peer video calls
- **Multi-participant** support with grid layout
- **Audio/Video controls** - mute/unmute, camera on/off
- **Expandable view** - full screen or compact mode
- **User presence** - see who's in the call with colored avatars

### 🖥️ Screen Sharing
- **One-click screen share** - share entire screen or specific window
- **Browser native** - uses `getDisplayMedia` API
- **Auto-stop detection** - handles when user stops via browser UI
- **Notification** - all participants notified when sharing starts/stops

### 📝 Automatic Meeting Notes
The system automatically tracks and logs:
- Meeting start/end times
- Participant join/leave events
- File creation, modification, deletion
- Screen sharing events
- Manual notes added by users

### 📊 Meeting Summary PDF
Download a comprehensive PDF report including:
- **Meeting Details**: ID, host, start/end time, duration
- **Participants**: Names, join times, leave times, duration in meeting
- **File Activities**: Created, modified, deleted files with timestamps
- **Meeting Notes**: Both auto-generated and manual notes
- **Chat History**: All messages exchanged during the meeting

## Architecture

### Client Components
```
client/src/
├── hooks/
│   └── use-video-call.ts       # WebRTC & meeting state management
├── components/
│   └── VideoCallPanel.tsx      # Main video call UI component
└── utils/
    └── meeting-pdf-generator.ts # PDF generation utility
```

### Server Events (Socket.IO)
```typescript
// Video Call Events
'join-video-call'      // User joins video call
'leave-video-call'     // User leaves video call
'video-offer'          // WebRTC offer signaling
'video-answer'         // WebRTC answer signaling
'ice-candidate'        // ICE candidate exchange
'screen-share-started' // Screen sharing notification
'screen-share-stopped' // Screen sharing ended
'end-meeting'          // Host ends the meeting
```

## Usage

### Starting a Video Call
1. Start or join a collaboration session first
2. Click the **"Video Call"** button in the toolbar (red icon)
3. Click **"Join Call"** to start your camera/microphone
4. Other participants in the session will see you join

### Screen Sharing
1. While in a call, click the **Monitor** icon
2. Select the screen/window to share
3. Click the icon again to stop sharing

### Adding Notes
1. Switch to the **"Notes"** tab in the video panel
2. Type your note in the input field
3. Press Enter or click the + button
4. Notes are timestamped and attributed to you

### Downloading Meeting Summary
1. Click the **"PDF"** button in the control bar
2. A comprehensive PDF will be generated
3. Includes all meeting data, participants, files, and notes

## Technical Details

### WebRTC Configuration
```typescript
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ]
};
```

### Media Constraints
```typescript
// Video
{ width: 1280, height: 720, facingMode: 'user' }

// Audio
{ echoCancellation: true, noiseSuppression: true }
```

### Meeting Data Structure
```typescript
interface MeetingData {
  id: string;
  title: string;
  hostId: string;
  hostName: string;
  startTime: Date;
  endTime?: Date;
  participants: Participant[];
  fileActivities: FileActivity[];
  notes: MeetingNote[];
  chatMessages: ChatMessage[];
}
```

## Integration with IDE

### File Activity Tracking
When files are created, modified, or deleted during a meeting:
```typescript
trackFileActivity('created', 'index.ts', userId, username);
trackFileActivity('updated', 'app.tsx', userId, username);
trackFileActivity('deleted', 'old-file.js', userId, username);
```

### Chat Integration
Chat messages are automatically captured in meeting data:
```typescript
addChatMessage(userId, username, message);
```

## UI Components

### Video Grid
- Responsive grid layout (2 columns compact, 3 columns expanded)
- Local video with "You" label
- Remote participants with username labels
- Muted indicator overlay
- Screen share takes priority display

### Control Bar
- 🎤 Microphone toggle
- 📹 Camera toggle
- 🖥️ Screen share toggle
- 📥 Download PDF
- 📞 Leave call
- 🔴 End meeting (host only)

### Tabs
- **Video**: Main video grid view
- **Participants**: List with join/leave times
- **Notes**: Manual and auto-generated notes
- **Files**: File activity log

## Future Enhancements
- [ ] Recording capability
- [ ] Virtual backgrounds
- [ ] Breakout rooms
- [ ] Raise hand feature
- [ ] Reactions/emojis
- [ ] Transcription (AI-powered)
- [ ] Calendar integration
