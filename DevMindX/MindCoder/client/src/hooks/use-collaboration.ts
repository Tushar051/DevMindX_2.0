import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface CollaborationUser {
  id: string;
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
}

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  color: string;
  message: string;
  timestamp: Date;
}

interface UseCollaborationOptions {
  sessionId: string;
  onCodeUpdate?: (data: any) => void;
  onCursorUpdate?: (data: any) => void;
}

export function useCollaboration({ sessionId, onCodeUpdate, onCursorUpdate }: UseCollaborationOptions) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [users, setUsers] = useState<CollaborationUser[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState<string[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('devmindx_token');
    if (!token || !sessionId) return;

    // Create Socket.IO connection
    const newSocket = io(window.location.origin, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    socketRef.current = newSocket;

    // Connection events
    newSocket.on('connect', () => {
      console.log('Connected to collaboration server');
      setIsConnected(true);
      newSocket.emit('join-session', sessionId);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from collaboration server');
      setIsConnected(false);
    });

    // Session state
    newSocket.on('session-state', (data: { users: CollaborationUser[] }) => {
      console.log('Session state received:', data);
      setUsers(data.users.filter(u => u.id !== newSocket.id));
    });

    // User joined
    newSocket.on('user-joined', (data: { user: CollaborationUser }) => {
      console.log('User joined:', data.user.username);
      setUsers(prev => [...prev, data.user]);
    });

    // User left
    newSocket.on('user-left', (data: { userId: string; username: string }) => {
      console.log('User left:', data.username);
      setUsers(prev => prev.filter(u => u.id !== data.userId));
    });

    // Cursor updates
    newSocket.on('cursor-update', (data: any) => {
      setUsers(prev => prev.map(u => 
        u.id === data.userId 
          ? { ...u, cursor: data.cursor }
          : u
      ));
      onCursorUpdate?.(data);
    });

    // Code updates
    newSocket.on('code-update', (data: any) => {
      console.log('Code update from:', data.username);
      onCodeUpdate?.(data);
    });

    // Chat messages
    newSocket.on('chat-message', (message: ChatMessage) => {
      setMessages(prev => [...prev, message]);
    });

    // User file change
    newSocket.on('user-file-change', (data: { userId: string; username: string; file: string }) => {
      setUsers(prev => prev.map(u => 
        u.id === data.userId 
          ? { ...u, currentFile: data.file }
          : u
      ));
    });

    // Typing indicators
    newSocket.on('user-typing', (data: { userId: string; username: string }) => {
      setIsTyping(prev => {
        if (prev.includes(data.username)) return prev;
        return [...prev, data.username];
      });
    });

    newSocket.on('user-stopped-typing', (data: { userId: string }) => {
      setIsTyping(prev => prev.filter(name => name !== data.userId));
    });

    // Error handling
    newSocket.on('error', (error: any) => {
      console.error('Socket error:', error);
    });

    setSocket(newSocket);

    // Cleanup
    return () => {
      newSocket.emit('leave-session');
      newSocket.disconnect();
    };
  }, [sessionId, onCodeUpdate, onCursorUpdate]);

  // Send cursor position
  const sendCursorPosition = useCallback((line: number, column: number, file: string) => {
    socketRef.current?.emit('cursor-move', { line, column, file });
  }, []);

  // Send code change
  const sendCodeChange = useCallback((file: string, content: string, changes: any) => {
    socketRef.current?.emit('code-change', { file, content, changes });
  }, []);

  // Send chat message
  const sendMessage = useCallback((message: string) => {
    socketRef.current?.emit('chat-message', { message });
  }, []);

  // Send file open
  const sendFileOpen = useCallback((file: string) => {
    socketRef.current?.emit('file-open', { file });
  }, []);

  // Send typing indicator
  const sendTypingStart = useCallback(() => {
    socketRef.current?.emit('typing-start');
  }, []);

  const sendTypingStop = useCallback(() => {
    socketRef.current?.emit('typing-stop');
  }, []);

  return {
    socket,
    users,
    messages,
    isConnected,
    isTyping,
    sendCursorPosition,
    sendCodeChange,
    sendMessage,
    sendFileOpen,
    sendTypingStart,
    sendTypingStop
  };
}
