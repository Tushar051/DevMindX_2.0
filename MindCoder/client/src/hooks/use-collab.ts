import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';

export type CollabParticipant = {
  userId: string;
  username?: string;
  color?: string;
};

export type CollabMessage = {
  userId: string;
  username?: string;
  text: string;
  timestamp: number;
};

type RosterEvent = { participants: CollabParticipant[]; hostUserId: string };

export function useCollab() {
  const socketRef = useRef<Socket | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [participants, setParticipants] = useState<CollabParticipant[]>([]);
  const [messages, setMessages] = useState<CollabMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const [hostUserId, setHostUserId] = useState<string | null>(null);

  const connect = useCallback(() => {
    if (socketRef.current) return socketRef.current;
    const token = localStorage.getItem('devmindx_token') || '';
    const socket = io('/', { path: '/socket.io', auth: { token } });
    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('collab:roster', (evt: RosterEvent) => {
      setParticipants(evt.participants || []);
      setHostUserId(evt.hostUserId || null);
    });
    socket.on('collab:message', (msg: CollabMessage) => {
      setMessages(prev => [...prev, msg]);
    });
    socket.on('collab:ended', () => {
      setSessionId(null);
      setParticipants([]);
      setMessages([]);
      setHostUserId(null);
    });

    return socket;
  }, []);

  const joinSession = useCallback((id: string) => {
    const socket = connect();
    setSessionId(id);
    socket.emit('collab:join', { sessionId: id });
  }, [connect]);

  const sendMessage = useCallback((text: string) => {
    if (!sessionId || !socketRef.current || !text.trim()) return;
    socketRef.current.emit('collab:message', { sessionId, text });
  }, [sessionId]);

  const endSession = useCallback(() => {
    if (!sessionId || !socketRef.current) return;
    socketRef.current.emit('collab:end', { sessionId });
  }, [sessionId]);

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  return {
    connected,
    sessionId,
    participants,
    messages,
    joinSession,
    sendMessage,
    endSession,
    hostUserId,
    setSessionId,
  };
}


