import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Send, Minimize2, Maximize2 } from 'lucide-react';

interface ChatMessage {
  userId: string;
  username?: string;
  text: string;
  timestamp: number;
}

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  currentUserId?: string;
}

export function ChatPanel({ messages, onSendMessage, currentUserId }: ChatPanelProps) {
  const [input, setInput] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="bg-gray-800/50 border-gray-700 h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            <span className="text-lg">Chat</span>
            {messages.length > 0 && (
              <span className="text-sm text-gray-400">({messages.length})</span>
            )}
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsMinimized(!isMinimized)}
            className="hover:bg-gray-700"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </Button>
        </CardTitle>
      </CardHeader>

      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex-1 flex flex-col min-h-0"
          >
            <CardContent className="flex-1 flex flex-col min-h-0 p-4">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-3 mb-3 min-h-0">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">No messages yet</p>
                      <p className="text-gray-500 text-xs">Start the conversation!</p>
                    </div>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isCurrentUser = msg.userId === currentUserId;
                    return (
                      <motion.div
                        key={`${msg.userId}-${msg.timestamp}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                          {!isCurrentUser && (
                            <div className="flex items-center gap-2 mb-1">
                              <div
                                className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold bg-gray-600"
                              >
                                {(msg.username || msg.userId).charAt(0).toUpperCase()}
                              </div>
                              <span className="text-xs text-gray-400 font-semibold">{msg.username || msg.userId}</span>
                            </div>
                          )}
                          <div
                            className={`rounded-lg px-3 py-2 ${
                              isCurrentUser
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-700 text-gray-100'
                            }`}
                          >
                            <p className="text-sm break-words">{msg.text}</p>
                          </div>
                          <span className="text-xs text-gray-500 mt-1 block">
                            {new Date(msg.timestamp).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>



              {/* Input */}
              <div className="flex gap-2 flex-shrink-0">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 placeholder-gray-500"
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
