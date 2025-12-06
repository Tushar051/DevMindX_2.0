import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Lightbulb, Sparkles, CheckIcon, XIcon } from 'lucide-react';

interface AICodeAssistantProps {
  code: string;
  language: string;
  onAcceptSuggestion: (suggestion: string) => void;
  onClose: () => void;
}

export function AICodeAssistant({ code, language, onAcceptSuggestion, onClose }: AICodeAssistantProps) {
  const [suggestions, setSuggestions] = useState<Array<{ type: string; title: string; code: string; description: string }>>([
    {
      type: 'completion',
      title: 'Add Error Handling',
      code: `try {\n  ${code}\n} catch (error) {\n  console.error('Error:', error);\n}`,
      description: 'Wrap your code in try-catch for better error handling'
    },
    {
      type: 'optimization',
      title: 'Add Type Safety',
      code: code.replace(/function\s+(\w+)\s*\(/g, 'function $1(param: any): any {'),
      description: 'Add TypeScript type annotations for better type safety'
    },
    {
      type: 'refactor',
      title: 'Extract Function',
      code: `// Extracted function\nfunction extracted() {\n  ${code}\n}\n\nextracted();`,
      description: 'Extract code into a reusable function'
    }
  ]);

  const [loading, setLoading] = useState(false);

  const generateAISuggestions = async () => {
    setLoading(true);
    // Simulate AI processing
    setTimeout(() => {
      setSuggestions([
        {
          type: 'ai',
          title: 'AI Suggestion: Add Comments',
          code: `// This function performs...\n${code}`,
          description: 'AI-generated documentation for your code'
        },
        ...suggestions
      ]);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="fixed right-0 top-12 bottom-0 w-96 bg-[#252526] border-l border-gray-700 z-40 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span className="font-semibold text-white">AI Assistant</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <XIcon className="w-4 h-4" />
          </Button>
        </div>

        <Button
          onClick={generateAISuggestions}
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700"
          size="sm"
        >
          <Lightbulb className="w-4 h-4 mr-2" />
          {loading ? 'Analyzing...' : 'Get AI Suggestions'}
        </Button>
      </div>

      {/* Suggestions */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {suggestions.map((suggestion, index) => (
            <div key={index} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-semibold text-white">{suggestion.title}</span>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-purple-600/20 text-purple-400">
                  {suggestion.type}
                </span>
              </div>

              <p className="text-xs text-gray-400 mb-3">{suggestion.description}</p>

              <div className="bg-[#1e1e1e] rounded p-3 mb-3">
                <pre className="text-xs text-gray-300 overflow-x-auto">
                  <code>{suggestion.code}</code>
                </pre>
              </div>

              <Button
                size="sm"
                onClick={() => onAcceptSuggestion(suggestion.code)}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <CheckIcon className="w-4 h-4 mr-2" />
                Apply Suggestion
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Info */}
      <div className="p-3 border-t border-gray-700 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3 h-3" />
          <span>AI-powered code suggestions for {language}</span>
        </div>
      </div>
    </div>
  );
}
