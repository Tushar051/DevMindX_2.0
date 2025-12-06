import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyToken } from '../services/auth.js';

interface CollaborationUser {
  id: string;
  socketId: string;
  username: string;
  email: string;
  color: string;
  cursor: {
    line: number;
    column: number;
    file: string;
  };
  currentFile: string;
  isOnline: boolean;
  lastActivity: Date;
}

interface CollaborationSession {
  id: string;
  name: string;
  hostId: string;
  users: Map<string, CollaborationUser>;
  files: Map<string, string>;
  createdAt: Date;
  lastActivity: Date;
}

// In-memory storage (replace with Redis for production)
const sessions = new Map<string, CollaborationSession>();
const userColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];

let colorIndex = 0;
function getNextColor(): string {
  const color = userColors[colorIndex % userColors.length];
  colorIndex++;
  return color;
}

export function setupSocketIO(httpServer: HTTPServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = verifyToken(token) as any;
      socket.data.user = {
        id: decoded.id,
        username: decoded.username,
        email: decoded.email
      };
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.data.user.username} (${socket.id})`);

    // Join collaboration session
    socket.on('join-session', async (sessionId: string) => {
      try {
        let session = sessions.get(sessionId);
        
        // Create session if it doesn't exist
        if (!session) {
          session = {
            id: sessionId,
            name: `Session ${sessionId}`,
            hostId: socket.data.user.id,
            users: new Map(),
            files: new Map(),
            createdAt: new Date(),
            lastActivity: new Date()
          };
          sessions.set(sessionId, session);
        }

        // Add user to session
        const user: CollaborationUser = {
          id: socket.data.user.id,
          socketId: socket.id,
          username: socket.data.user.username,
          email: socket.data.user.email,
          color: getNextColor(),
          cursor: { line: 1, column: 1, file: '' },
          currentFile: '',
          isOnline: true,
          lastActivity: new Date()
        };

        session.users.set(socket.data.user.id, user);
        socket.join(sessionId);
        socket.data.sessionId = sessionId;

        // Send current session state to the joining user
        socket.emit('session-state', {
          sessionId: session.id,
          users: Array.from(session.users.values()),
          files: Object.fromEntries(session.files)
        });

        // Notify others that a new user joined
        socket.to(sessionId).emit('user-joined', {
          user: {
            id: user.id,
            username: user.username,
            color: user.color,
            cursor: user.cursor
          }
        });

        console.log(`User ${user.username} joined session ${sessionId}`);
      } catch (error) {
        console.error('Error joining session:', error);
        socket.emit('error', { message: 'Failed to join session' });
      }
    });

    // Leave session
    socket.on('leave-session', () => {
      handleUserLeave(socket);
    });

    // Update cursor position
    socket.on('cursor-move', (data: { line: number; column: number; file: string }) => {
      const sessionId = socket.data.sessionId;
      if (!sessionId) return;

      const session = sessions.get(sessionId);
      if (!session) return;

      const user = session.users.get(socket.data.user.id);
      if (user) {
        user.cursor = data;
        user.lastActivity = new Date();

        // Broadcast cursor position to others
        socket.to(sessionId).emit('cursor-update', {
          userId: user.id,
          username: user.username,
          color: user.color,
          cursor: data
        });
      }
    });

    // Code change
    socket.on('code-change', (data: { file: string; content: string; changes: any }) => {
      const sessionId = socket.data.sessionId;
      if (!sessionId) return;

      const session = sessions.get(sessionId);
      if (!session) return;

      // Update file content
      session.files.set(data.file, data.content);
      session.lastActivity = new Date();

      // Broadcast code change to others
      socket.to(sessionId).emit('code-update', {
        userId: socket.data.user.id,
        username: socket.data.user.username,
        file: data.file,
        content: data.content,
        changes: data.changes
      });
    });

    // Chat message
    socket.on('chat-message', (data: { message: string }) => {
      const sessionId = socket.data.sessionId;
      if (!sessionId) {
        console.log('No sessionId for chat message');
        return;
      }

      const session = sessions.get(sessionId);
      if (!session) {
        console.log('Session not found:', sessionId);
        return;
      }

      const user = session.users.get(socket.data.user.id);
      if (!user) {
        console.log('User not found in session:', socket.data.user.id);
        return;
      }

      const chatMessage = {
        id: `${Date.now()}-${socket.id}`,
        userId: user.id,
        username: user.username,
        color: user.color,
        message: data.message,
        timestamp: new Date()
      };

      console.log(`Broadcasting chat message from ${user.username} to session ${sessionId}`);
      
      // Broadcast message to all users in session (including sender)
      io.to(sessionId).emit('chat-message', chatMessage);
      
      // Also emit directly to sender to ensure they receive it
      socket.emit('chat-message', chatMessage);
    });

    // File opened
    socket.on('file-open', (data: { file: string }) => {
      const sessionId = socket.data.sessionId;
      if (!sessionId) return;

      const session = sessions.get(sessionId);
      if (!session) return;

      const user = session.users.get(socket.data.user.id);
      if (user) {
        user.currentFile = data.file;
        user.lastActivity = new Date();

        // Notify others
        socket.to(sessionId).emit('user-file-change', {
          userId: user.id,
          username: user.username,
          file: data.file
        });
      }
    });

    // File tree operations
    socket.on('file-tree-update', (data: { action: string; node: any; parentId?: string }) => {
      const sessionId = socket.data.sessionId;
      if (!sessionId) return;

      const session = sessions.get(sessionId);
      if (!session) return;

      console.log(`File tree update from ${socket.data.user.username}: ${data.action}`);

      // Broadcast file tree change to all other users
      socket.to(sessionId).emit('file-tree-update', {
        userId: socket.data.user.id,
        username: socket.data.user.username,
        action: data.action,
        node: data.node,
        parentId: data.parentId
      });
    });

    // File/folder deletion
    socket.on('file-tree-delete', (data: { nodeId: string }) => {
      const sessionId = socket.data.sessionId;
      if (!sessionId) return;

      const session = sessions.get(sessionId);
      if (!session) return;

      console.log(`File tree delete from ${socket.data.user.username}: ${data.nodeId}`);

      // Broadcast deletion to all other users
      socket.to(sessionId).emit('file-tree-delete', {
        userId: socket.data.user.id,
        username: socket.data.user.username,
        nodeId: data.nodeId
      });
    });

    // Whiteboard updates
    socket.on('whiteboard-update', (data: { data: string }) => {
      const sessionId = socket.data.sessionId;
      if (!sessionId) return;

      // Broadcast whiteboard drawing to all other users
      socket.to(sessionId).emit('whiteboard-update', {
        userId: socket.data.user.id,
        username: socket.data.user.username,
        data: data.data
      });
    });

    // User typing indicator
    socket.on('typing-start', () => {
      const sessionId = socket.data.sessionId;
      if (!sessionId) return;

      socket.to(sessionId).emit('user-typing', {
        userId: socket.data.user.id,
        username: socket.data.user.username
      });
    });

    socket.on('typing-stop', () => {
      const sessionId = socket.data.sessionId;
      if (!sessionId) return;

      socket.to(sessionId).emit('user-stopped-typing', {
        userId: socket.data.user.id
      });
    });

    // ============ VIDEO CALL / WebRTC Signaling ============

    // Join video call
    socket.on('join-video-call', (data: { sessionId: string; userId: string; username: string; color: string }) => {
      const sessionId = data.sessionId;
      if (!sessionId) return;

      console.log(`${data.username} joined video call in session ${sessionId}`);

      // Notify other participants
      socket.to(sessionId).emit('participant-joined-call', {
        userId: data.userId,
        username: data.username,
        color: data.color
      });
    });

    // Leave video call
    socket.on('leave-video-call', (data: { sessionId: string; userId: string }) => {
      const sessionId = data.sessionId;
      if (!sessionId) return;

      console.log(`User ${data.userId} left video call in session ${sessionId}`);

      socket.to(sessionId).emit('participant-left-call', {
        userId: data.userId
      });
    });

    // WebRTC Offer
    socket.on('video-offer', (data: { sessionId: string; targetId: string; offer: any }) => {
      const session = sessions.get(data.sessionId);
      if (!session) return;

      const targetUser = session.users.get(data.targetId);
      if (targetUser) {
        io.to(targetUser.socketId).emit('video-offer', {
          senderId: socket.data.user.id,
          senderName: socket.data.user.username,
          offer: data.offer
        });
      }
    });

    // WebRTC Answer
    socket.on('video-answer', (data: { sessionId: string; targetId: string; answer: any }) => {
      const session = sessions.get(data.sessionId);
      if (!session) return;

      const targetUser = session.users.get(data.targetId);
      if (targetUser) {
        io.to(targetUser.socketId).emit('video-answer', {
          senderId: socket.data.user.id,
          answer: data.answer
        });
      }
    });

    // ICE Candidate
    socket.on('ice-candidate', (data: { sessionId: string; targetId: string; candidate: any }) => {
      const session = sessions.get(data.sessionId);
      if (!session) return;

      const targetUser = session.users.get(data.targetId);
      if (targetUser) {
        io.to(targetUser.socketId).emit('ice-candidate', {
          senderId: socket.data.user.id,
          candidate: data.candidate
        });
      }
    });

    // Screen share started
    socket.on('screen-share-started', (data: { sessionId: string }) => {
      socket.to(data.sessionId).emit('screen-share-started', {
        userId: socket.data.user.id,
        username: socket.data.user.username
      });
    });

    // Screen share stopped
    socket.on('screen-share-stopped', (data: { sessionId: string }) => {
      socket.to(data.sessionId).emit('screen-share-stopped', {
        userId: socket.data.user.id
      });
    });

    // End meeting (host only)
    socket.on('end-meeting', (data: { sessionId: string }) => {
      const session = sessions.get(data.sessionId);
      if (!session) return;

      // Only host can end meeting
      if (session.hostId === socket.data.user.id) {
        io.to(data.sessionId).emit('meeting-ended', {
          endedBy: socket.data.user.username,
          endTime: new Date()
        });
        console.log(`Meeting ended in session ${data.sessionId} by host ${socket.data.user.username}`);
      }
    });

    // ============ END VIDEO CALL ============

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.data.user?.username} (${socket.id})`);
      handleUserLeave(socket);
    });
  });

  // Cleanup inactive sessions every 5 minutes
  setInterval(() => {
    const now = new Date();
    for (const [sessionId, session] of sessions.entries()) {
      const inactiveTime = now.getTime() - session.lastActivity.getTime();
      // Remove sessions inactive for more than 1 hour
      if (inactiveTime > 60 * 60 * 1000) {
        sessions.delete(sessionId);
        console.log(`Cleaned up inactive session: ${sessionId}`);
      }
    }
  }, 5 * 60 * 1000);

  return io;
}

function handleUserLeave(socket: Socket) {
  const sessionId = socket.data.sessionId;
  if (!sessionId) return;

  const session = sessions.get(sessionId);
  if (!session) return;

  const user = session.users.get(socket.data.user.id);
  if (user) {
    session.users.delete(socket.data.user.id);
    socket.leave(sessionId);

    // Notify others
    socket.to(sessionId).emit('user-left', {
      userId: user.id,
      username: user.username
    });

    console.log(`User ${user.username} left session ${sessionId}`);

    // Delete session if empty
    if (session.users.size === 0) {
      sessions.delete(sessionId);
      console.log(`Session ${sessionId} deleted (no users)`);
    }
  }
}

// Export for testing
export { sessions };
