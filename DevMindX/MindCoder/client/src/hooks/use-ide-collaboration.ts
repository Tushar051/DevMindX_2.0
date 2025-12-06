import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useToast } from './use-toast';

interface CollaborationUser {
  id: string;
  username: string;
  color: string;
  cursor: {
    line: number;
    column: number;
    file: string;
  };
  currentFile: string;
}

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  color: string;
  message: string;
  timestamp: Date;
}

interface FileChange {
  userId: string;
  username: string;
  file: string;
  content: string;
  changes: any;
}

export function useIDECollaboration() {
  const { toast } = useToast();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState<CollaborationUser[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isHost, setIsHost] = useState(false);
  const editorRef = useRef<any>(null);

  // Initialize Socket.IO connection
  const connect = useCallback((token: string) => {
    const newSocket = io('http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Connected to collaboration server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from collaboration server');
      setIsConnected(false);
    });

    newSocket.on('error', (error: any) => {
      console.error('Socket error:', error);
      toast({
        title: 'Connection Error',
        description: error.message || 'Failed to connect to collaboration server',
        variant: 'destructive'
      });
    });

    // Session state received
    newSocket.on('session-state', (data: any) => {
      console.log('Session state received:', data);
      setUsers(data.users || []);
      setSessionId(data.sessionId);
    });

    // User joined
    newSocket.on('user-joined', (data: any) => {
      console.log('User joined:', data.user);
      setUsers(prev => [...prev, data.user]);
      toast({
        title: 'User Joined',
        description: `${data.user.username} joined the session`
      });
    });

    // User left
    newSocket.on('user-left', (data: any) => {
      console.log('User left:', data.username);
      setUsers(prev => prev.filter(u => u.id !== data.userId));
      toast({
        title: 'User Left',
        description: `${data.username} left the session`
      });
    });

    // Cursor update
    newSocket.on('cursor-update', (data: any) => {
      setUsers(prev => prev.map(u => 
        u.id === data.userId 
          ? { ...u, cursor: data.cursor }
          : u
      ));
    });

    // Code update from other users
    newSocket.on('code-update', (data: FileChange) => {
      console.log('Code update received:', data);
      // This will be handled by the IDE component
    });

    // Chat message
    newSocket.on('chat-message', (message: ChatMessage) => {
      console.log('Chat message received:', message);
      setMessages(prev => [...prev, message]);
    });

    // User file change
    newSocket.on('user-file-change', (data: any) => {
      setUsers(prev => prev.map(u =>
        u.id === data.userId
          ? { ...u, currentFile: data.file }
          : u
      ));
    });

    // File tree updates (handled by IDE component)
    newSocket.on('file-tree-update', (data: any) => {
      console.log('File tree update received:', data);
    });

    newSocket.on('file-tree-delete', (data: any) => {
      console.log('File tree delete received:', data);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [toast]);

  // Start a new collaboration session
  const startSession = useCallback((projectName: string = 'Untitled') => {
    if (!socket) return null;

    const newSessionId = generateSessionCode();
    setSessionId(newSessionId);
    setIsHost(true);

    socket.emit('join-session', newSessionId);

    toast({
      title: 'Session Started',
      description: `Share code: ${newSessionId}`
    });

    return {
      sessionId: newSessionId,
      shareLink: `${window.location.origin}/cursor-ide?session=${newSessionId}`
    };
  }, [socket, toast]);

  // Join an existing session
  const joinSession = useCallback((code: string) => {
    if (!socket) return;

    setSessionId(code);
    setIsHost(false);
    socket.emit('join-session', code);
  }, [socket]);

  // Leave session
  const leaveSession = useCallback(() => {
    if (!socket || !sessionId) return;

    socket.emit('leave-session');
    setSessionId(null);
    setUsers([]);
    setMessages([]);
    setIsHost(false);

    toast({
      title: 'Left Session',
      description: 'You have left the collaboration session'
    });
  }, [socket, sessionId, toast]);

  // Send code changes
  const sendCodeChange = useCallback((file: string, content: string, changes: any) => {
    if (!socket || !sessionId) return;

    socket.emit('code-change', {
      file,
      content,
      changes
    });
  }, [socket, sessionId]);

  // Send cursor position
  const sendCursorPosition = useCallback((line: number, column: number, file: string) => {
    if (!socket || !sessionId) return;

    socket.emit('cursor-move', {
      line,
      column,
      file
    });
  }, [socket, sessionId]);

  // Send chat message
  const sendMessage = useCallback((message: string) => {
    if (!socket || !sessionId || !message.trim()) return;

    socket.emit('chat-message', { message: message.trim() });
  }, [socket, sessionId]);

  // Notify file opened
  const notifyFileOpen = useCallback((file: string) => {
    if (!socket || !sessionId) return;

    socket.emit('file-open', { file });
  }, [socket, sessionId]);

  // Notify file tree update (create file/folder)
  const notifyFileTreeUpdate = useCallback((action: string, node: any, parentId?: string) => {
    if (!socket || !sessionId) return;

    socket.emit('file-tree-update', { action, node, parentId });
  }, [socket, sessionId]);

  // Notify file tree deletion
  const notifyFileTreeDelete = useCallback((nodeId: string) => {
    if (!socket || !sessionId) return;

    socket.emit('file-tree-delete', { nodeId });
  }, [socket, sessionId]);

  // Generate session code
  function generateSessionCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [socket]);

  return {
    // Connection
    connect,
    isConnected,
    socket,
    
    // Session management
    sessionId,
    isHost,
    startSession,
    joinSession,
    leaveSession,
    
    // Users
    users,
    
    // Code collaboration
    sendCodeChange,
    sendCursorPosition,
    notifyFileOpen,
    notifyFileTreeUpdate,
    notifyFileTreeDelete,
    
    // Chat
    messages,
    sendMessage
  };
}
