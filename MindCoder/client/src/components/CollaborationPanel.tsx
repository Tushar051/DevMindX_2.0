import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  MessageSquare, 
  Send, 
  Circle, 
  Eye, 
  EyeOff,
  Activity,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CollaborationPanelProps {
  isCollaborating: boolean;
  session: any;
  participants: any[];
  onEndSession: () => void;
}

export default function CollaborationPanel({
  isCollaborating,
  session,
  participants,
  onEndSession
}: CollaborationPanelProps) {
  const { toast } = useToast();
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [fileChanges, setFileChanges] = useState<any[]>([]);
  const [showChat, setShowChat] = useState(true);
  const [showParticipants, setShowParticipants] = useState(true);
  const [showFileChanges, setShowFileChanges] = useState(true);
  const chatRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const sendChatMessage = () => {
    if (!chatInput.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      username: 'You',
      message: chatInput.trim(),
      timestamp: new Date(),
      type: 'chat'
    };

    setChatMessages(prev => [...prev, newMessage]);
    setChatInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendChatMessage();
    }
  };

  if (!isCollaborating || !session) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium">Live Collaboration</span>
          <Circle className="w-2 h-2 text-green-500 animate-pulse" />
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onEndSession}
          className="text-red-600 hover:text-red-700"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="p-3 space-y-3">
        {/* Session Info */}
        <div className="text-xs text-gray-600">
          <p><strong>Session:</strong> {session.sessionName}</p>
          <p><strong>Participants:</strong> {participants.length}</p>
        </div>

        {/* Participants */}
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
              <ScrollArea className="h-20">
                <div className="space-y-1">
                  {participants.map((participant: any) => (
                    <div
                      key={participant.userId}
                      className="flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: participant.color }}
                        />
                        <span>{participant.username}</span>
                        {participant.isOnline && (
                          <Circle className="w-1.5 h-1.5 text-green-500 fill-current" />
                        )}
                      </div>
                      {participant.currentFile && (
                        <span className="text-gray-500 truncate max-w-20">
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

        {/* File Changes */}
        {showFileChanges && fileChanges.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <Activity className="w-4 h-4" />
                  <span>Recent Changes</span>
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFileChanges(false)}
                >
                  <EyeOff className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ScrollArea className="h-20">
                <div className="space-y-1">
                  {fileChanges.map((change: any) => (
                    <div
                      key={change.id}
                      className="flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: change.color || '#666' }}
                        />
                        <span className="font-medium">{change.username}</span>
                        <span className="text-gray-500">{change.changeType}</span>
                      </div>
                      <span className="text-gray-500 truncate max-w-20">
                        {change.filePath}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Chat */}
        {showChat && (
          <Card>
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
            <CardContent className="pt-0">
              <ScrollArea className="h-24 mb-2" ref={chatRef}>
                <div className="space-y-1">
                  {chatMessages.map((message: any) => (
                    <div
                      key={message.id}
                      className={`text-xs ${
                        message.type === 'chat' 
                          ? 'bg-gray-100 p-2 rounded' 
                          : 'text-gray-500 italic'
                      }`}
                    >
                      {message.type === 'chat' && (
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium">{message.username}</span>
                          <span className="text-gray-400">
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
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 text-xs"
                  size={1}
                />
                <Button
                  onClick={sendChatMessage}
                  size="sm"
                  disabled={!chatInput.trim()}
                  className="text-xs"
                >
                  <Send className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Show/Hide Panels */}
        <div className="flex space-x-1">
          {!showParticipants && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowParticipants(true)}
              className="flex items-center space-x-1 text-xs"
            >
              <Eye className="w-3 h-3" />
              <span>Participants</span>
            </Button>
          )}
          {!showChat && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowChat(true)}
              className="flex items-center space-x-1 text-xs"
            >
              <Eye className="w-3 h-3" />
              <span>Chat</span>
            </Button>
          )}
          {!showFileChanges && fileChanges.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFileChanges(true)}
              className="flex items-center space-x-1 text-xs"
            >
              <Eye className="w-3 h-3" />
              <span>Changes</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
