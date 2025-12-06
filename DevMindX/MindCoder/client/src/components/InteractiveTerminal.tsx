import { useEffect, useRef, useState } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import 'xterm/css/xterm.css';

interface InteractiveTerminalProps {
  onCommand?: (command: string) => void;
  initialOutput?: string[];
  onClearTerminal?: () => void;
}

export function InteractiveTerminal({ onCommand, initialOutput = [], onClearTerminal }: InteractiveTerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [currentLine, setCurrentLine] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    if (!terminalRef.current || xtermRef.current) return;

    // Initialize xterm
    const term = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
        cursor: '#d4d4d4',
        black: '#000000',
        red: '#cd3131',
        green: '#0dbc79',
        yellow: '#e5e510',
        blue: '#2472c8',
        magenta: '#bc3fbc',
        cyan: '#11a8cd',
        white: '#e5e5e5',
        brightBlack: '#666666',
        brightRed: '#f14c4c',
        brightGreen: '#23d18b',
        brightYellow: '#f5f543',
        brightBlue: '#3b8eea',
        brightMagenta: '#d670d6',
        brightCyan: '#29b8db',
        brightWhite: '#e5e5e5'
      },
      scrollback: 10000,
      tabStopWidth: 4
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();

    term.loadAddon(fitAddon);
    term.loadAddon(webLinksAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    // Welcome message
    term.writeln('\x1b[1;32m╔═══════════════════════════════════════╗\x1b[0m');
    term.writeln('\x1b[1;32m║   DevMindX Interactive Terminal      ║\x1b[0m');
    term.writeln('\x1b[1;32m╚═══════════════════════════════════════╝\x1b[0m');
    term.writeln('');
    term.writeln('\x1b[36mType commands and press Enter to execute\x1b[0m');
    term.writeln('\x1b[36mUse ↑/↓ arrows for command history\x1b[0m');
    term.writeln('');

    // Show initial output
    initialOutput.forEach(line => term.writeln(line));

    // Prompt
    term.write('\x1b[1;33m$\x1b[0m ');

    // Handle input
    let currentInput = '';

    term.onData((data) => {
      const code = data.charCodeAt(0);

      // Handle Enter
      if (code === 13) {
        term.writeln('');
        if (currentInput.trim()) {
          // Add to history
          setCommandHistory(prev => [...prev, currentInput]);
          setHistoryIndex(-1);

          // Execute command
          if (onCommand) {
            onCommand(currentInput);
          }

          // Handle built-in commands
          if (currentInput.trim() === 'clear') {
            term.clear();
          } else if (currentInput.trim() === 'help') {
            term.writeln('\x1b[1;36mAvailable commands:\x1b[0m');
            term.writeln('  clear  - Clear terminal');
            term.writeln('  help   - Show this help');
            term.writeln('  exit   - Close terminal');
            term.writeln('');
            term.writeln('\x1b[36mYou can also run code using the "Run Code" button\x1b[0m');
          }

          currentInput = '';
        }
        term.write('\x1b[1;33m$\x1b[0m ');
      }
      // Handle Backspace
      else if (code === 127) {
        if (currentInput.length > 0) {
          currentInput = currentInput.slice(0, -1);
          term.write('\b \b');
        }
      }
      // Handle Ctrl+C
      else if (code === 3) {
        term.writeln('^C');
        currentInput = '';
        term.write('\x1b[1;33m$\x1b[0m ');
      }
      // Handle Ctrl+L (clear)
      else if (code === 12) {
        term.clear();
        term.write('\x1b[1;33m$\x1b[0m ');
      }
      // Handle Arrow Up (history)
      else if (data === '\x1b[A') {
        if (commandHistory.length > 0) {
          const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
          if (newIndex >= 0) {
            // Clear current line
            term.write('\r\x1b[K');
            term.write('\x1b[1;33m$\x1b[0m ');
            
            // Write history command
            const cmd = commandHistory[commandHistory.length - 1 - newIndex];
            term.write(cmd);
            currentInput = cmd;
            setHistoryIndex(newIndex);
          }
        }
      }
      // Handle Arrow Down (history)
      else if (data === '\x1b[B') {
        if (historyIndex > 0) {
          const newIndex = historyIndex - 1;
          // Clear current line
          term.write('\r\x1b[K');
          term.write('\x1b[1;33m$\x1b[0m ');
          
          // Write history command
          const cmd = commandHistory[commandHistory.length - 1 - newIndex];
          term.write(cmd);
          currentInput = cmd;
          setHistoryIndex(newIndex);
        } else if (historyIndex === 0) {
          // Clear to empty
          term.write('\r\x1b[K');
          term.write('\x1b[1;33m$\x1b[0m ');
          currentInput = '';
          setHistoryIndex(-1);
        }
      }
      // Handle regular characters
      else if (code >= 32 && code < 127) {
        currentInput += data;
        term.write(data);
      }
    });

    // Handle resize
    const handleResize = () => {
      fitAddon.fit();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
    };
  }, []);

  // Method to write output to terminal
  useEffect(() => {
    if (xtermRef.current && initialOutput.length > 0) {
      // This will be handled by parent component
    }
  }, [initialOutput]);

  // Expose methods to write to terminal and clear it
  useEffect(() => {
    if (xtermRef.current) {
      (window as any).writeToTerminal = (text: string) => {
        xtermRef.current?.writeln(text);
      };
      (window as any).clearTerminal = () => {
        xtermRef.current?.clear();
        xtermRef.current?.writeln('\x1b[1;32m╔═══════════════════════════════════════╗\x1b[0m');
        xtermRef.current?.writeln('\x1b[1;32m║   DevMindX Interactive Terminal      ║\x1b[0m');
        xtermRef.current?.writeln('\x1b[1;32m╚═══════════════════════════════════════╝\x1b[0m');
        xtermRef.current?.writeln('');
        xtermRef.current?.write('\x1b[1;33m$\x1b[0m ');
        if (onClearTerminal) {
          onClearTerminal();
        }
      };
    }
  }, [onClearTerminal]);

  return (
    <div 
      ref={terminalRef} 
      className="w-full h-full"
      style={{ padding: '8px' }}
    />
  );
}
