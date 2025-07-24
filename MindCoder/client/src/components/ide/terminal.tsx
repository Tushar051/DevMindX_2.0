import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2, ChevronUp, Terminal as TerminalIcon } from "lucide-react";

interface TerminalLine {
  id: string;
  type: 'command' | 'output' | 'error' | 'info';
  content: string;
  timestamp: Date;
}

interface TerminalProps {
  projectPath?: string;
  initialOutput?: string;
  isRunning?: boolean;
}

export function Terminal({ projectPath, initialOutput, isRunning }: TerminalProps) {
  const [activeTab, setActiveTab] = useState<'terminal' | 'output' | 'debug' | 'problems'>('terminal');
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([]);
  const [currentCommand, setCurrentCommand] = useState('');
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Initialize with welcome message
    addTerminalLine('info', 'DevMindX Terminal initialized');
    if (projectPath) {
      addTerminalLine('info', `Working directory: ${projectPath}`);
    }
    addTerminalLine('command', 'devmindx@local:~/project$ ');
  }, [projectPath]);

  // Handle initial output for code execution
  useEffect(() => {
    if (initialOutput) {
      setActiveTab('output');
      
      // Add run output to the terminal
      const outputLines = initialOutput.split('\n');
      outputLines.forEach(line => {
        addTerminalLine('output', line);
      });
    }
  }, [initialOutput]);

  useEffect(() => {
    scrollToBottom();
  }, [terminalLines]);

  const addTerminalLine = (type: TerminalLine['type'], content: string) => {
    const newLine: TerminalLine = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    };
    setTerminalLines(prev => [...prev, newLine]);
  };

  const scrollToBottom = () => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const executeCommand = async (command: string) => {
    addTerminalLine('command', `devmindx@local:~/project$ ${command}`);
    
    // Simulate command execution
    setTimeout(() => {
      switch (command.toLowerCase().trim()) {
        case 'npm start':
          addTerminalLine('info', '> my-react-app@0.1.0 start');
          addTerminalLine('info', '> react-scripts start');
          addTerminalLine('info', '');
          addTerminalLine('info', 'Starting the development server...');
          addTerminalLine('info', '');
          addTerminalLine('output', 'Compiled successfully!');
          addTerminalLine('info', '');
          addTerminalLine('output', 'You can now view my-react-app in the browser.');
          addTerminalLine('info', '');
          addTerminalLine('output', '  Local:            http://localhost:3000');
          addTerminalLine('output', '  On Your Network:  http://192.168.1.100:3000');
          addTerminalLine('info', '');
          addTerminalLine('info', 'Note that the development build is not optimized.');
          addTerminalLine('info', 'To create a production build, use npm run build.');
          break;
          
        case 'npm install':
          addTerminalLine('info', 'Installing dependencies...');
          setTimeout(() => {
            addTerminalLine('output', 'added 1234 packages in 15.2s');
          }, 2000);
          break;
          
        case 'ls':
        case 'dir':
          addTerminalLine('output', 'src/          package.json  README.md');
          addTerminalLine('output', 'public/       node_modules/ .gitignore');
          break;
          
        case 'pwd':
          addTerminalLine('output', '/home/devmindx/project');
          break;
          
        case 'clear':
          setTerminalLines([]);
          return;
          
        case 'help':
          addTerminalLine('output', 'Available commands:');
          addTerminalLine('output', '  npm start    - Start development server');
          addTerminalLine('output', '  npm install  - Install dependencies');
          addTerminalLine('output', '  ls/dir       - List directory contents');
          addTerminalLine('output', '  pwd          - Print working directory');
          addTerminalLine('output', '  clear        - Clear terminal');
          addTerminalLine('output', '  help         - Show this help');
          break;
          
        default:
          addTerminalLine('error', `Command not found: ${command}`);
          addTerminalLine('info', 'Type "help" for available commands');
      }
      
      addTerminalLine('command', 'devmindx@local:~/project$ ');
    }, 500);
  };

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentCommand.trim()) {
      executeCommand(currentCommand);
      setCurrentCommand('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommandSubmit(e);
    }
  };

  const getLineClassName = (type: TerminalLine['type']) => {
    switch (type) {
      case 'command':
        return 'terminal-prompt';
      case 'error':
        return 'terminal-error';
      case 'info':
        return 'terminal-info';
      case 'output':
      default:
        return 'text-white';
    }
  };

  return (
    <div className="h-64 ide-panel border-t ide-border flex flex-col">
      {/* Panel Tabs */}
      <div className="h-8 flex items-center ide-sidebar border-b ide-border">
        <button
          onClick={() => setActiveTab('terminal')}
          className={`px-3 py-1 text-sm border-r ide-border ${
            activeTab === 'terminal' ? 'ide-panel text-white' : 'ide-text-secondary hover:text-white'
          }`}
        >
          Terminal
        </button>
        <button
          onClick={() => setActiveTab('output')}
          className={`px-3 py-1 text-sm border-r ide-border ${
            activeTab === 'output' ? 'ide-panel text-white' : 'ide-text-secondary hover:text-white'
          }`}
        >
          Output
        </button>
        <button
          onClick={() => setActiveTab('debug')}
          className={`px-3 py-1 text-sm border-r ide-border ${
            activeTab === 'debug' ? 'ide-panel text-white' : 'ide-text-secondary hover:text-white'
          }`}
        >
          Debug Console
        </button>
        <button
          onClick={() => setActiveTab('problems')}
          className={`px-3 py-1 text-sm ${
            activeTab === 'problems' ? 'ide-panel text-white' : 'ide-text-secondary hover:text-white'
          }`}
        >
          Problems
        </button>
        <div className="flex-1"></div>
        <Button size="sm" variant="ghost" className="w-6 h-6 p-0 hover:bg-border-color mx-1">
          <Plus className="w-3 h-3" />
        </Button>
        <Button 
          size="sm" 
          variant="ghost" 
          className="w-6 h-6 p-0 hover:bg-border-color mx-1"
          onClick={() => setTerminalLines([])}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
        <Button size="sm" variant="ghost" className="w-6 h-6 p-0 hover:bg-border-color mx-1">
          <ChevronUp className="w-3 h-3" />
        </Button>
      </div>

      {/* Terminal Content */}
      {activeTab === 'terminal' && (
        <div className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 p-4">
            <div className="terminal-content space-y-1">
              {terminalLines.map(line => (
                <div key={line.id} className={getLineClassName(line.type)}>
                  {line.content}
                </div>
              ))}
              
              {/* Current command input */}
              <div className="flex items-center terminal-prompt">
                <span>devmindx@local:~/project$ </span>
                <input
                  ref={inputRef}
                  type="text"
                  value={currentCommand}
                  onChange={(e) => setCurrentCommand(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent outline-none text-white ml-1"
                  autoFocus
                />
                <span className="terminal-cursor">|</span>
              </div>
              
              <div ref={terminalEndRef} />
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Output tab content */}
      {activeTab === 'output' && (
        <div className="flex-1 p-4">
          {terminalLines.filter(line => line.type === 'output' || line.type === 'error').length > 0 ? (
            <ScrollArea className="h-full">
              <div className={`space-y-1 ${isRunning ? 'opacity-50' : ''}`}>
                {isRunning && (
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-400">Running code...</span>
                  </div>
                )}
                {terminalLines.filter(line => line.type === 'output' || line.type === 'error').map(line => (
                  <div key={line.id} className={getLineClassName(line.type)}>
                    {line.content}
                  </div>
                ))}
                <div ref={terminalEndRef} />
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center ide-text-secondary">
              <TerminalIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No output to display</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'debug' && (
        <div className="flex-1 p-4 ide-text-secondary">
          <div className="text-center">
            <TerminalIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Debug console is empty</p>
          </div>
        </div>
      )}

      {activeTab === 'problems' && (
        <div className="flex-1 p-4 ide-text-secondary">
          <div className="text-center">
            <TerminalIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No problems detected</p>
          </div>
        </div>
      )}
    </div>
  );
}
