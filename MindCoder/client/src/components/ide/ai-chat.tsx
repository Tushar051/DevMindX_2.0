import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, User, Send, History, Settings, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { aiApi } from "@/lib/api";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatProps {
  projectId?: number;
  onCreateFile?: (path: string, content: string) => void;
  onInsertCode?: (code: string) => void;
}

export function AIChat({ projectId, onCreateFile, onInsertCode }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingFile, setIsGeneratingFile] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load chat history for project
    if (projectId) {
      loadChatHistory();
    } else {
      // Add welcome message for new chat
      setMessages([{
        id: '1',
        role: 'assistant',
        content: "Hello! I'm your AI coding assistant. I can help you generate code, explain concepts, debug issues, and more. What would you like to work on today?",
        timestamp: new Date()
      }]);
    }
  }, [projectId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatHistory = async () => {
    if (!projectId) return;
    
    try {
      const history = await aiApi.getChatHistory(projectId);
      if (history.messages && history.messages.length > 0) {
        setMessages(history.messages.map((msg: any, index: number) => ({
          id: String(index),
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.timestamp)
        })));
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await aiApi.chat(inputMessage, projectId, conversationHistory);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      toast({
        title: "AI Chat Error",
        description: error.message || "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const extractCodeBlock = (content: string): string | null => {
    const codeBlockRegex = /```(?:[\w-]*)\n([\s\S]*?)```/;
    const match = content.match(codeBlockRegex);
    return match ? match[1] : null;
  };

  const extractFilePath = (content: string): string | null => {
    // Look for file path patterns like "filename.ext" or "path/to/filename.ext"
    const filePathRegex = /[`'"]((?:[\w-]+\/)*[\w-]+\.\w+)[`'"]/;
    const match = content.match(filePathRegex);
    return match ? match[1] : null;
  };

  const handleCreateFile = (content: string) => {
    setIsGeneratingFile(true);
    
    try {
      const code = extractCodeBlock(content);
      const filePath = extractFilePath(content);
      
      if (code && filePath && onCreateFile) {
        onCreateFile(filePath, code);
        toast({
          title: "File Created",
          description: `Created ${filePath} successfully.`,
        });
      } else {
        toast({
          title: "Could Not Create File",
          description: "Missing file path or code content.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "File Creation Failed",
        description: "An error occurred while creating the file.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingFile(false);
    }
  };

  const insertCodeExample = (content: string) => {
    const code = extractCodeBlock(content);
    
    if (code && onInsertCode) {
      onInsertCode(code);
      toast({
        title: "Code Inserted",
        description: "Code has been inserted into your editor.",
      });
    } else {
      toast({
        title: "Could Not Insert Code",
        description: "No valid code block found.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-96 ide-sidebar border-l ide-border flex flex-col">
      {/* Chat Header */}
      <div className="h-12 flex items-center justify-between px-4 border-b ide-border">
        <div className="flex items-center">
          <Bot className="w-5 h-5 text-accent-blue mr-2" />
          <span className="font-medium">AI Assistant</span>
        </div>
        <div className="flex space-x-2">
          <Button size="sm" variant="ghost" className="w-8 h-8 p-0 hover:bg-border-color">
            <History className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" className="w-8 h-8 p-0 hover:bg-border-color">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map(message => (
            <div key={message.id} className={`flex space-x-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
              {message.role === 'assistant' && (
                <div className="w-8 h-8 bg-accent-blue rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              
              <div className={`chat-bubble ${message.role}`}>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                {message.content.includes('```') && message.role === 'assistant' && (
                  <div className="flex space-x-2 mt-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs text-accent-blue hover:underline"
                      onClick={() => insertCodeExample(message.content)}
                    >
                      Insert into editor
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs text-green-500 hover:underline"
                      onClick={() => handleCreateFile(message.content)}
                      disabled={isGeneratingFile}
                    >
                      {isGeneratingFile ? "Creating..." : "Create file"}
                    </Button>
                  </div>
                )}
              </div>

              {message.role === 'user' && (
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))}

          {/* Loading Message */}
          {isLoading && (
            <div className="flex space-x-3">
              <div className="w-8 h-8 bg-accent-blue rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="chat-bubble assistant">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-accent-blue rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-accent-blue rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-accent-blue rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  <span className="text-sm ide-text-secondary">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Chat Input */}
      <div className="border-t ide-border p-4">
        <div className="flex space-x-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask AI to generate code, create files, or help with coding..."
            className="flex-1 ide-bg border-border-color text-sm focus:ring-accent-blue"
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={isLoading || !inputMessage.trim()}
            className="bg-accent-blue hover:bg-blue-600 text-white px-4"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="ghost"
              className="text-xs ide-text-secondary hover:text-white px-2 py-1 rounded hover:bg-border-color"
              onClick={() => setInputMessage("Create an index.html file with a basic HTML5 template")}
            >
              <Wand2 className="w-3 h-3 mr-1" />
              Create HTML
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-xs ide-text-secondary hover:text-white px-2 py-1 rounded hover:bg-border-color"
              onClick={() => setInputMessage("Create a simple JavaScript file that demonstrates DOM manipulation")}
            >
              <Wand2 className="w-3 h-3 mr-1" />
              Create JS
            </Button>
          </div>
          <span className="text-xs ide-text-secondary">Shift + Enter for new line</span>
        </div>
      </div>
    </div>
  );
}
