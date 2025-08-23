import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Users, 
  Share2, 
  MessageSquare, 
  Copy, 
  X, 
  UserPlus, 
  Circle,
  Send,
  Eye,
  EyeOff
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { collaborationApi } from '@/lib/api';

interface CollaborationManagerProps {
  currentFile?: string;
  currentFileContent?: string;
  onFileContentChange?: (content: string) => void;
}

export default function CollaborationManager({
  currentFile,
  currentFileContent,
  onFileContentChange
}: CollaborationManagerProps) {
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const [isCollaborating, setIsCollaborating] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [fileChanges, setFileChanges] = useState<any[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [sessionName, setSessionName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [collaborationUrl, setCollaborationUrl] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [showParticipants, setShowParticipants] = useState(true);

  const wsRef = useRef<WebSocket | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  // Create collaboration session
  const createSession = async () => {
    if (!sessionName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a session name',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await collaborationApi.createSession(
        'current-project',
        sessionName
      );

      if (response.success) {
        setCollaborationUrl(response.collaborationUrl);
        setSession(response.invite);
        setIsCollaborating(true);
        setIsHost(true);
        setShowCreateDialog(false);
        connectWebSocket();
        toast({
          title: 'Session Created',
          description: 'Collaboration session is now active',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create collaboration session',
        variant: 'destructive',
      });
    }
  };

  // Join collaboration session
  const joinSession = async () => {
    if (!inviteCode.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter an invite code',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await collaborationApi.joinSession(inviteCode);
      
      if (response.success) {
        setSession(response.session);
        setIsCollaborating(true);
        setIsHost(false);
        console.log('[Client] Session joined:', response.session);
        setShowJoinDialog(false);
        connectWebSocket();
        toast({
          title: 'Joined Session',
          description: `Joined ${response.session.sessionName}`,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to join collaboration session',
        variant: 'destructive',
      });
    }
  };

  // End collaboration session
  const endSession = async () => {
    if (!session || !isHost) return;

    try {
      await collaborationApi.endSession(session.id);
      wsRef.current?.close();
      setIsCollaborating(false);
      setSession(null);
      setParticipants([]);
      setChatMessages([]);
      setFileChanges([]);
      toast({
        title: 'Session Ended',
        description: 'Collaboration session has been ended',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to end session',
        variant: 'destructive',
      });
    }
  };

  // WebSocket connection
  const connectWebSocket = () => {
    if (!session || !user) return;

    const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws-collaboration`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      if (isHost) {
        ws.send(JSON.stringify({
          type: 'create-session',
          data: {
            userId: user.id,
            username: user.username,
            email: user.email,
            projectId: session.id,
            sessionName: session.sessionName
          }
        }));
      } else {
        ws.send(JSON.stringify({
          type: 'join-session',
          data: {
            sessionId: session.id,
            userId: user.id,
            username: user.username,
            email: user.email
          }
        }));
      }
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        handleWebSocketMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsCollaborating(false);
      setSession(null);
    };
  };

  const handleWebSocketMessage = (message: any) => {
    console.log('[Client] Received WebSocket message:', message);
    const { type, data } = message;

    switch (type) {
      case 'session-created':
        setSession(data.session);
        setIsCollaborating(true);
        setIsHost(true);
        break;

      case 'session-joined':
        setSession(data.session);
        setParticipants(data.participants);
        setIsCollaborating(true);
        setIsHost(false);
        break;

      case 'user-joined':
        setParticipants(data.participants);
        setChatMessages(prev => [...prev, {
          id: Date.now().toString(),
          username: 'System',
          message: `${data.username} joined the session`,
          timestamp: new Date(),
          type: 'user-join'
        }]);
        break;


      case 'file-changed':
        setFileChanges(prev => [data, ...prev.slice(0, 9)]);
        console.log('[Client] File change received:', data);
        break;

      case 'session-ended':
        setIsCollaborating(false);
        setSession(null);
        setParticipants([]);
        setChatMessages([]);
        setFileChanges([]);
        console.log('[Client] Session ended.');
        break;
    }
  };

  // Send chat message
  const sendChatMessage = () => {
    if (!chatInput.trim() || !session || !user || !wsRef.current) return;

    const message = {
      type: 'chat-message',
      data: {
        sessionId: session.id,
        userId: user.id,
        message: chatInput.trim()
      }
    };

    wsRef.current.send(JSON.stringify(message));
    setChatInput('');
  };

  // Copy collaboration URL
  const copyCollaborationUrl = () => {
    if (collaborationUrl) {
      navigator.clipboard.writeText(collaborationUrl);
      toast({
        title: 'URL Copied',
        description: 'Collaboration URL copied to clipboard',
      });
    }
  };

  // Auto-scroll chat
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Polling for session status and chat messages every second
  useEffect(() => {
  let interval: NodeJS.Timeout | null = null;
  
  if (isCollaborating && session) {
    const pollSession = async () => {
      try {
        const sessionData = await collaborationApi.getSession(session.id);
        if (!sessionData) {
          // Session ended
          setIsCollaborating(false);
          setSession(null);
          setParticipants([]);
          setChatMessages([]);
          setFileChanges([]);
          toast({ title: 'Session Ended', description: 'The collaboration session has ended.' });
          return;
        }

        const messages = await collaborationApi.getSessionMessages(session.id);
        setChatMessages(prev => {
          const existingIds = new Set(prev.map(m => m.id));
          const newMessages = messages.filter(m => !existingIds.has(m.id))
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
          return [...prev, ...newMessages];
        });
      } catch (error) {
        console.error('Polling error:', error);
        if (error instanceof Error && (error.message.includes('404') || error.message.includes('Unauthorized'))) {
          setIsCollaborating(false);
          setSession(null);
          toast({ title: 'Session Error', description: 'Session no longer available.', variant: 'destructive' });
        }
      }
    };
    
    pollSession(); // Initial poll
    interval = setInterval(pollSession, 1000);
  }
  
  return () => {
    if (interval) {
      clearInterval(interval);
    }
  };
}, [isCollaborating, session]);
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Collaboration Button */}
      <div className="flex items-center space-x-2 mb-4">
        <Button
          onClick={() => setShowCreateDialog(true)}
          className={`flex items-center space-x-2 ${
            isCollaborating 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
          disabled={isCollaborating}
        >
          <Users className="w-4 h-4" />
          <span>{isCollaborating ? 'Collaborating' : 'Start Collaboration'}</span>
          {isCollaborating && <Circle className="w-2 h-2 animate-pulse" />}
        </Button>

        {!isCollaborating && (
          <Button
            variant="outline"
            onClick={() => setShowJoinDialog(true)}
            className="flex items-center space-x-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Join Session</span>
          </Button>
        )}

        {isCollaborating && isHost && (
          <Button
            variant="outline"
            onClick={endSession}
            className="flex items-center space-x-2 text-red-600 hover:text-red-700"
          >
            <X className="w-4 h-4" />
            <span>End Session</span>
          </Button>
        )}
      </div>

      {/* Collaboration Status */}
      {isCollaborating && session && (
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              <span>Active Session: {session.sessionName}</span>
              <Badge variant={isHost ? 'default' : 'secondary'}>
                {isHost ? 'Host' : 'Participant'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{participants.length} participants</span>
              {collaborationUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyCollaborationUrl}
                  className="flex items-center space-x-1 text-xs"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy Link</span>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Collaboration Panels */}
      {isCollaborating && (
        <div className="flex-1 flex flex-col space-y-4">
          {/* Participants Panel */}
          {showParticipants && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>Participants</span>
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowParticipants(false)}
                  >
                    <EyeOff className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ScrollArea className="h-24">
                  <div className="space-y-2">
                    {participants.map((participant: any) => (
                      <div
                        key={participant.userId}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: participant.color }}
                          />
                          <span>{participant.username}</span>
                          {participant.isOnline && (
                            <Circle className="w-2 h-2 text-green-500 fill-current" />
                          )}
                        </div>
                        {participant.currentFile && (
                          <span className="text-xs text-gray-500">
                            {participant.currentFile}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Chat Panel */}
          {showChat && (
            <Card className="flex-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>Chat</span>
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowChat(false)}
                  >
                    <EyeOff className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 flex flex-col h-full">
                <ScrollArea className="flex-1 mb-2" ref={chatRef}>
                  <div className="space-y-2">
                    {chatMessages.map((message: any) => (
                      <div
                        key={message.id}
                        className={`text-sm ${
                          message.type === 'chat' 
                            ? 'bg-gray-100 p-2 rounded' 
                            : 'text-gray-500 italic'
                        }`}
                      >
                        {message.type === 'chat' && (
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium">{message.username}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        )}
                        <span>{message.message}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="flex space-x-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type a message..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        sendChatMessage();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    onClick={sendChatMessage}
                    size="sm"
                    disabled={!chatInput.trim()}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Show/Hide Panels Buttons */}
          <div className="flex space-x-2">
            {!showParticipants && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowParticipants(true)}
                className="flex items-center space-x-1"
              >
                <Eye className="w-4 h-4" />
                <span>Show Participants</span>
              </Button>
            )}
            {!showChat && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowChat(true)}
                className="flex items-center space-x-1"
              >
                <Eye className="w-4 h-4" />
                <span>Show Chat</span>
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Create Session Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Collaboration Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Session Name</label>
              <Input
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder="Enter session name"
                className="mt-1"
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={createSession} className="flex-1">
                Create Session
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Join Session Dialog */}
      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join Collaboration Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Invite Code</label>
              <Input
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="Enter invite code"
                className="mt-1"
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={joinSession} className="flex-1">
                Join Session
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowJoinDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
