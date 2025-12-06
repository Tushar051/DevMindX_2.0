import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, Share2, LogOut, Copy, Check, 
  MessageSquare, Send, X, UserPlus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  username: string;
  color: string;
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

interface IDECollaborationPanelProps {
  isConnected: boolean;
  sessionId: string | null;
  isHost: boolean;
  users: User[];
  messages: ChatMessage[];
  onStartSession: () => void;
  onJoinSession: (code: string) => void;
  onLeaveSession: () => void;
  onSendMessage: (message: string) => void;
}

export function IDECollaborationPanel({
  isConnected,
  sessionId,
  isHost,
  users,
  messages,
  onStartSession,
  onJoinSession,
  onLeaveSession,
  onSendMessage
}: IDECollaborationPanelProps) {
  const { toast } = useToast();
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [showChat, setShowChat] = useState(true);

  const handleCopySessionCode = () => {
    if (!sessionId) return;
    
    navigator.clipboard.writeText(sessionId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    toast({
      title: 'Copied!',
      description: 'Session code copied to clipboard'
    });
  };

  const handleCopyShareLink = () => {
    if (!sessionId) return;
    
    const shareLink = `${window.location.origin}/cursor-ide?session=${sessionId}`;
    navigator.clipboard.writeText(shareLink);
    
    toast({
      title: 'Link Copied!',
      description: 'Share link copied to clipboard'
    });
  };

  const handleJoin = () => {
    if (joinCode.trim()) {
      onJoinSession(joinCode.trim().toUpperCase());
      setShowJoinDialog(false);
      setJoinCode('');
    }
  };

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      onSendMessage(chatMessage);
      setChatMessage('');
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="h-full flex flex-col bg-[#252526] border-l border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            <span className="font-semibold text-white">Collaboration</span>
          </div>
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-500'}`} />
        </div>

        {!sessionId ? (
          <div className="space-y-2">
            <Button
              onClick={onStartSession}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              disabled={!isConnected}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Start Session
            </Button>
            <Button
              onClick={() => setShowJoinDialog(true)}
              variant="outline"
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
              disabled={!isConnected}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Join Session
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="bg-gray-800 rounded p-2">
              <div className="text-xs text-gray-400 mb-1">Session Code</div>
              <div className="flex items-center justify-between">
                <code className="text-lg font-bold text-purple-400">{sessionId}</code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopySessionCode}
                  className="h-6 w-6 p-0"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </Button>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyShareLink}
                className="flex-1 border-gray-600 text-xs"
              >
                <Share2 className="w-3 h-3 mr-1" />
                Share Link
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onLeaveSession}
                className="border-red-600 text-red-400 hover:bg-red-600/10"
              >
                <LogOut className="w-3 h-3 mr-1" />
                Leave
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Users List */}
      {sessionId && (
        <div className="p-4 border-b border-gray-700">
          <div className="text-sm font-semibold text-gray-300 mb-2">
            Active Users ({users.length})
          </div>
          <ScrollArea className="max-h-32">
            <div className="space-y-2">
              {users.map((user) => (
                <div key={user.id} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: user.color }}
                  />
                  <span className="text-sm text-gray-300">{user.username}</span>
                  {user.currentFile && (
                    <span className="text-xs text-gray-500 truncate ml-auto">
                      {user.currentFile.split('/').pop()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Chat Section */}
      {sessionId && (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="p-2 border-b border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-semibold text-gray-300">Chat</span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowChat(!showChat)}
              className="h-6 w-6 p-0"
            >
              {showChat ? <X className="w-3 h-3" /> : <MessageSquare className="w-3 h-3" />}
            </Button>
          </div>

          {showChat && (
            <>
              <ScrollArea className="flex-1 p-3">
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div key={msg.id} className="text-sm">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span
                          className="font-semibold"
                          style={{ color: msg.color }}
                        >
                          {msg.username}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                      <div className="text-gray-300 break-words">
                        {msg.message}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="p-3 border-t border-gray-700">
                <div className="flex gap-2">
                  <Input
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-800 border-gray-600 text-white text-sm"
                  />
                  <Button
                    size="sm"
                    onClick={handleSendMessage}
                    className="bg-purple-600 hover:bg-purple-700"
                    disabled={!chatMessage.trim()}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Join Dialog */}
      {showJoinDialog && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#2d2d2d] rounded-lg p-6 w-80 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Join Session</h3>
            <Input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              placeholder="Enter 6-digit code"
              className="mb-4 bg-gray-800 border-gray-600 text-white uppercase"
              maxLength={6}
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowJoinDialog(false)}
                className="flex-1 border-gray-600"
              >
                Cancel
              </Button>
              <Button
                onClick={handleJoin}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
                disabled={joinCode.length !== 6}
              >
                Join
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
