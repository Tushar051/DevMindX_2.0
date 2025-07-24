import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { File, X, Save, Code, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EditorTab {
  path: string;
  name: string;
  content: string;
  modified: boolean;
}

interface CodeEditorProps {
  tabs: EditorTab[];
  activeTab: string | null;
  onTabChange: (path: string) => void;
  onTabClose: (path: string) => void;
  onContentChange: (path: string, content: string) => void;
}

export function CodeEditor({ 
  tabs, 
  activeTab, 
  onTabChange, 
  onTabClose, 
  onContentChange 
}: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [editor, setEditor] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Enhanced editor initialization
    const initEditor = async () => {
      if (editorRef.current && !editor) {
        // Create a pre element with syntax highlighting
        const editorContainer = document.createElement('div');
        editorContainer.className = 'w-full h-full relative';
        
        // Create line numbers
        const lineNumbers = document.createElement('div');
        lineNumbers.className = 'absolute left-0 top-0 bottom-0 w-12 bg-gray-800 text-gray-500 text-right pr-2 pt-4 select-none';
        editorContainer.appendChild(lineNumbers);
        
        // Create the editable area
        const codeArea = document.createElement('pre');
        codeArea.className = 'w-full h-full bg-transparent text-white font-mono text-sm outline-none p-4 pl-16 overflow-auto';
        codeArea.contentEditable = 'true';
        codeArea.style.lineHeight = '1.6';
        codeArea.style.tabSize = '2';
        editorContainer.appendChild(codeArea);
        
        // Add event listeners
        codeArea.addEventListener('input', (e) => {
          if (activeTab) {
            const content = (e.target as HTMLPreElement).innerText;
            onContentChange(activeTab, content);
            updateLineNumbers(content);
          }
        });
        
        // Handle tab key
        codeArea.addEventListener('keydown', (e) => {
          if (e.key === 'Tab') {
            e.preventDefault();
            document.execCommand('insertText', false, '  ');
          }
        });
        
        editorRef.current.appendChild(editorContainer);
        
        // Function to update line numbers
        const updateLineNumbers = (content: string) => {
          const lines = content.split('\n');
          lineNumbers.innerHTML = '';
          
          for (let i = 1; i <= lines.length; i++) {
            const lineNumber = document.createElement('div');
            lineNumber.textContent = i.toString();
            lineNumber.style.lineHeight = '1.6';
            lineNumbers.appendChild(lineNumber);
          }
        };
        
        setEditor({
          codeArea,
          lineNumbers,
          updateLineNumbers,
          setValue: (value: string) => {
            codeArea.innerText = value;
            updateLineNumbers(value);
            applySyntaxHighlighting(value);
          }
        });
      }
    };

    initEditor();
  }, []);

  // Function to apply basic syntax highlighting
  const applySyntaxHighlighting = (code: string) => {
    if (!editor || !editor.codeArea) return;
    
    // This is a simplified version - in a real app, you'd use a proper syntax highlighter
    // For now, we'll just add some basic color classes
    let highlighted = code;
    
    // Get file extension to determine language
    const ext = activeTab ? activeTab.split('.').pop()?.toLowerCase() : '';
    
    if (ext === 'js' || ext === 'jsx' || ext === 'ts' || ext === 'tsx') {
      // JavaScript/TypeScript highlighting
      highlighted = highlighted
        .replace(/\b(const|let|var|function|return|if|else|for|while|class|import|export|from|async|await)\b/g, '<span style="color: #ff79c6;">$1</span>')
        .replace(/\b(true|false|null|undefined|this)\b/g, '<span style="color: #bd93f9;">$1</span>')
        .replace(/"([^"]*)"/g, '<span style="color: #f1fa8c;">"$1"</span>')
        .replace(/'([^']*)'/g, '<span style="color: #f1fa8c;">\'$1\'</span>')
        .replace(/\/\/(.*)/g, '<span style="color: #6272a4;">//$1</span>');
    } else if (ext === 'html') {
      // HTML highlighting
      highlighted = highlighted
        .replace(/&lt;([\/\w]+)(?:\s+([^&>]*))?&gt;/g, '<span style="color: #ff79c6;">&lt;$1$2&gt;</span>')
        .replace(/&lt;!DOCTYPE[^>]*&gt;/g, '<span style="color: #bd93f9;">&lt;!DOCTYPE html&gt;</span>');
    } else if (ext === 'css') {
      // CSS highlighting
      highlighted = highlighted
        .replace(/([^{]*)\{/g, '<span style="color: #ff79c6;">$1</span>{')
        .replace(/:(.*);/g, ':<span style="color: #f1fa8c;">$1</span>;');
    }
    
    // Apply the highlighted code
    editor.codeArea.innerHTML = highlighted;
  };

  useEffect(() => {
    if (editor && activeTab) {
      const currentTab = tabs.find(tab => tab.path === activeTab);
      if (currentTab && editor.setValue) {
        editor.setValue(currentTab.content);
      }
    }
  }, [activeTab, tabs, editor]);

  const handleSaveFile = () => {
    if (activeTab) {
      toast({
        title: "File Saved",
        description: `${activeTab} has been saved successfully.`,
      });
    }
  };

  const handleCopyCode = () => {
    if (activeTab) {
      const currentTab = tabs.find(tab => tab.path === activeTab);
      if (currentTab) {
        navigator.clipboard.writeText(currentTab.content);
        toast({
          title: "Code Copied",
          description: "Code has been copied to clipboard.",
        });
      }
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    
    switch (ext) {
      case 'js':
      case 'jsx':
        return <File className="w-4 h-4 text-yellow-400" />;
      case 'ts':
      case 'tsx':
        return <File className="w-4 h-4 text-blue-400" />;
      case 'css':
        return <File className="w-4 h-4 text-blue-400" />;
      case 'html':
        return <File className="w-4 h-4 text-orange-400" />;
      case 'json':
        return <File className="w-4 h-4 text-green-400" />;
      default:
        return <File className="w-4 h-4 text-gray-400" />;
    }
  };

  const currentTab = tabs.find(tab => tab.path === activeTab);

  return (
    <div className="flex-1 flex flex-col">
      {/* Editor Tabs */}
      {tabs.length > 0 && (
        <div className="ide-panel border-b ide-border flex">
          {tabs.map(tab => (
            <div
              key={tab.path}
              className={`editor-tab ${activeTab === tab.path ? 'active' : ''}`}
              onClick={() => onTabChange(tab.path)}
            >
              {getFileIcon(tab.name)}
              <span className="ml-2">{tab.name}</span>
              {tab.modified && <span className="ml-1 text-orange-400">●</span>}
              <Button
                size="sm"
                variant="ghost"
                className="ml-2 w-4 h-4 p-0 hover:bg-border-color rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  onTabClose(tab.path);
                }}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Code Editor */}
      <div className="flex-1 ide-bg overflow-hidden">
        {currentTab ? (
          <div className="h-full w-full flex flex-col">
            {/* Editor toolbar */}
            <div className="h-8 bg-gray-800 border-b border-gray-700 flex items-center px-2">
              <div className="flex-1 text-xs text-gray-400">
                {currentTab.path}
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-xs text-gray-300 hover:text-white"
                  onClick={handleSaveFile}
                >
                  <Save className="w-3 h-3 mr-1" />
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-xs text-gray-300 hover:text-white"
                  onClick={handleCopyCode}
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </Button>
              </div>
            </div>
            
            {/* Editor content */}
            <div className="flex-1 relative">
              <div
                ref={editorRef}
                className="h-full w-full monaco-editor-container"
              />
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center ide-text-secondary">
              <File className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No file selected</h3>
              <p className="text-sm">Select a file from the explorer to start editing</p>
              <p className="text-sm mt-4">Or ask AI to create a new file for you</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
