import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { v4 as uuidv4 } from 'uuid';
import { 
  CollaborationSession, 
  CollaborationParticipant, 
  CollaborationMessage, 
  FileChange,
  CollaborationEvent,
  CursorPosition 
} from '../shared/types';

interface ConnectedClient {
  ws: WebSocket;
  userId: string;
  username: string;
  sessionId?: string;
  isHost: boolean;
}

class CollaborationServer {
  private wss: WebSocketServer;
  private sessions: Map<string, CollaborationSession> = new Map();
  private clients: Map<string, ConnectedClient> = new Map();
  private userColors: Map<string, string> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server });
    this.setupWebSocket();
  }

  private setupWebSocket() {
    this.wss.on('connection', (ws: WebSocket, request) => {
      console.log('New WebSocket connection');
      
      ws.on('message', (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(ws, message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });

      ws.on('close', () => {
        this.handleClientDisconnect(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.handleClientDisconnect(ws);
      });
    });
  }

  private handleMessage(ws: WebSocket, message: any) {
    const { type, data } = message;

    switch (type) {
      case 'join-session':
        this.handleJoinSession(ws, data);
        break;
      case 'leave-session':
        this.handleLeaveSession(ws, data);
        break;
      case 'chat-message':
        this.handleChatMessage(ws, data);
        break;
      case 'file-change':
        this.handleFileChange(ws, data);
        break;
      case 'cursor-move':
        this.handleCursorMove(ws, data);
        break;
      case 'user-activity':
        this.handleUserActivity(ws, data);
        break;
      case 'create-session':
        this.handleCreateSession(ws, data);
        break;
      case 'end-session':
        this.handleEndSession(ws, data);
        break;
      default:
        console.warn('Unknown message type:', type);
    }
  }

  private handleCreateSession(ws: WebSocket, data: any) {
    const { userId, username, projectId, sessionName, settings, sessionId } = data;
    
    // Use provided sessionId or generate new one
    const finalSessionId = sessionId || uuidv4();
    const session: CollaborationSession = {
      id: finalSessionId,
      projectId,
      hostUserId: userId,
      hostUsername: username,
      sessionName: sessionName || 'Collaboration Session',
      isActive: true,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      maxParticipants: 10,
      participants: [],
      settings: {
        allowFileEditing: true,
        allowChat: true,
        allowUserKick: true,
        requireApproval: false,
        autoSave: true,
        ...settings
      }
    };

    this.sessions.set(sessionId, session);
    
    // Add host as first participant
    const hostColor = this.getUserColor(userId);
    const hostParticipant: CollaborationParticipant = {
      userId,
      username,
      email: data.email || '',
      joinedAt: new Date(),
      isOnline: true,
      lastActivity: new Date(),
      color: hostColor
    };

    session.participants.push(hostParticipant);

    // Store client info
    const clientId = uuidv4();
    this.clients.set(clientId, {
      ws,
      userId,
      username,
      sessionId,
      isHost: true
    });

    // Send session created confirmation
    ws.send(JSON.stringify({
      type: 'session-created',
      data: {
        sessionId,
        session,
        clientId
      }
    }));

    console.log(`Session created: ${sessionId} by ${username}`);
  }

  private handleJoinSession(ws: WebSocket, data: any) {
    const { sessionId, userId, username, email } = data;
    
    const session = this.sessions.get(sessionId);
    if (!session) {
      ws.send(JSON.stringify({
        type: 'error',
        data: { message: 'Session not found' }
      }));
      return;
    }

    if (!session.isActive) {
      ws.send(JSON.stringify({
        type: 'error',
        data: { message: 'Session is not active' }
      }));
      return;
    }

    if (session.participants.length >= session.maxParticipants) {
      ws.send(JSON.stringify({
        type: 'error',
        data: { message: 'Session is full' }
      }));
      return;
    }

    // Check if user is already in session
    const existingParticipant = session.participants.find(p => p.userId === userId);
    if (existingParticipant) {
      existingParticipant.isOnline = true;
      existingParticipant.lastActivity = new Date();
    } else {
      // Add new participant
      const userColor = this.getUserColor(userId);
      const participant: CollaborationParticipant = {
        userId,
        username,
        email: email || '',
        joinedAt: new Date(),
        isOnline: true,
        lastActivity: new Date(),
        color: userColor
      };
      session.participants.push(participant);
    }

    // Store client info
    const clientId = uuidv4();
    this.clients.set(clientId, {
      ws,
      userId,
      username,
      sessionId,
      isHost: false
    });

    // Send join confirmation
    ws.send(JSON.stringify({
      type: 'session-joined',
      data: {
        sessionId,
        session,
        clientId,
        participants: session.participants
      }
    }));

    // Notify other participants
    this.broadcastToSession(sessionId, {
      type: 'user-joined',
      data: {
        userId,
        username,
        participants: session.participants
      }
    }, ws);

    console.log(`User ${username} joined session ${sessionId}`);
  }

  private handleLeaveSession(ws: WebSocket, data: any) {
    const { sessionId, userId } = data;
    
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const participant = session.participants.find(p => p.userId === userId);
    if (participant) {
      participant.isOnline = false;
      participant.lastActivity = new Date();
    }

    // Remove client
    for (const [clientId, client] of this.clients.entries()) {
      if (client.ws === ws) {
        this.clients.delete(clientId);
        break;
      }
    }

    // Notify other participants
    this.broadcastToSession(sessionId, {
      type: 'user-left',
      data: {
        userId,
        participants: session.participants
      }
    }, ws);

    console.log(`User ${userId} left session ${sessionId}`);
  }

  private handleChatMessage(ws: WebSocket, data: any) {
    const { sessionId, userId, message } = data;
    
    const session = this.sessions.get(sessionId);
    if (!session || !session.settings.allowChat) return;

    const participant = session.participants.find(p => p.userId === userId);
    if (!participant) return;

    const chatMessage: CollaborationMessage = {
      id: uuidv4(),
      sessionId,
      userId,
      username: participant.username,
      message,
      timestamp: new Date(),
      type: 'chat'
    };

    // Broadcast to all participants in session
    this.broadcastToSession(sessionId, {
      type: 'chat-message',
      data: chatMessage
    });

    console.log(`Chat message from ${participant.username}: ${message}`);
  }

  private handleFileChange(ws: WebSocket, data: any) {
    const { sessionId, userId, filePath, changeType, description } = data;
    
    const session = this.sessions.get(sessionId);
    if (!session || !session.settings.allowFileEditing) return;

    const participant = session.participants.find(p => p.userId === userId);
    if (!participant) return;

    const fileChange: FileChange = {
      id: uuidv4(),
      sessionId,
      userId,
      username: participant.username,
      filePath,
      changeType,
      timestamp: new Date(),
      description
    };

    // Broadcast to all participants in session
    this.broadcastToSession(sessionId, {
      type: 'file-changed',
      data: fileChange
    });

    console.log(`File change by ${participant.username}: ${changeType} on ${filePath}`);
  }

  private handleCursorMove(ws: WebSocket, data: any) {
    const { sessionId, userId, cursorPosition } = data;
    
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const participant = session.participants.find(p => p.userId === userId);
    if (!participant) return;

    participant.cursorPosition = cursorPosition;
    participant.currentFile = cursorPosition.filePath;
    participant.lastActivity = new Date();

    // Broadcast to other participants
    this.broadcastToSession(sessionId, {
      type: 'cursor-moved',
      data: {
        userId,
        username: participant.username,
        cursorPosition,
        color: participant.color
      }
    }, ws);
  }

  private handleUserActivity(ws: WebSocket, data: any) {
    const { sessionId, userId } = data;
    
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const participant = session.participants.find(p => p.userId === userId);
    if (participant) {
      participant.lastActivity = new Date();
    }
  }

  private handleEndSession(ws: WebSocket, data: any) {
    const { sessionId, userId } = data;
    
    const session = this.sessions.get(sessionId);
    if (!session || session.hostUserId !== userId) return;

    session.isActive = false;

    // Notify all participants
    this.broadcastToSession(sessionId, {
      type: 'session-ended',
      data: {
        sessionId,
        endedBy: userId
      }
    });

    // Clean up session
    this.sessions.delete(sessionId);

    console.log(`Session ${sessionId} ended by ${userId}`);
  }

  private handleClientDisconnect(ws: WebSocket) {
    let disconnectedClient: ConnectedClient | null = null;
    let clientId: string | null = null;

    // Find and remove client
    for (const [id, client] of this.clients.entries()) {
      if (client.ws === ws) {
        disconnectedClient = client;
        clientId = id;
        break;
      }
    }

    if (disconnectedClient && clientId) {
      this.clients.delete(clientId);
      
      // Update participant status
      if (disconnectedClient.sessionId) {
        const session = this.sessions.get(disconnectedClient.sessionId);
        if (session) {
          const participant = session.participants.find(p => p.userId === disconnectedClient!.userId);
          if (participant) {
            participant.isOnline = false;
            participant.lastActivity = new Date();
          }

          // Notify other participants
          this.broadcastToSession(disconnectedClient.sessionId, {
            type: 'user-left',
            data: {
              userId: disconnectedClient.userId,
              participants: session.participants
            }
          });
        }
      }

      console.log(`Client disconnected: ${disconnectedClient.username}`);
    }
  }

  private broadcastToSession(sessionId: string, event: CollaborationEvent, excludeWs?: WebSocket) {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const message = JSON.stringify(event);

    for (const client of this.clients.values()) {
      if (client.sessionId === sessionId && client.ws !== excludeWs) {
        try {
          client.ws.send(message);
        } catch (error) {
          console.error('Error sending message to client:', error);
        }
      }
    }
  }

  public getUserColor(userId: string): string {
    if (!this.userColors.has(userId)) {
      const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
        '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
      ];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      this.userColors.set(userId, randomColor);
    }
    return this.userColors.get(userId)!;
  }

  // Public methods for external access
  public getSession(sessionId: string): CollaborationSession | undefined {
    return this.sessions.get(sessionId);
  }

  public getActiveSessions(): CollaborationSession[] {
    return Array.from(this.sessions.values()).filter(s => s.isActive);
  }

  public createSession(session: CollaborationSession): void {
    this.sessions.set(session.id, session);
  }

  public endSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.isActive = false;
    this.broadcastToSession(sessionId, {
      type: 'session-ended',
      data: { sessionId }
    });

    this.sessions.delete(sessionId);
    return true;
  }
}

export default CollaborationServer;
