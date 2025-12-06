import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BugIcon, PlayIcon, PauseIcon, StepForwardIcon, XCircleIcon } from 'lucide-react';

interface Breakpoint {
  line: number;
  file: string;
}

interface DebugPanelProps {
  currentFile: string;
  onClose: () => void;
}

export function DebugPanel({ currentFile, onClose }: DebugPanelProps) {
  const [isDebugging, setIsDebugging] = useState(false);
  const [breakpoints, setBreakpoints] = useState<Breakpoint[]>([]);
  const [variables, setVariables] = useState<Array<{ name: string; value: string; type: string }>>([]);
  const [callStack, setCallStack] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState<number | null>(null);

  const startDebugging = () => {
    setIsDebugging(true);
    setCurrentLine(1);
    setVariables([
      { name: 'x', value: '10', type: 'number' },
      { name: 'message', value: '"Hello World"', type: 'string' },
      { name: 'isActive', value: 'true', type: 'boolean' }
    ]);
    setCallStack(['main()', 'init()', 'start()']);
  };

  const stopDebugging = () => {
    setIsDebugging(false);
    setCurrentLine(null);
    setVariables([]);
    setCallStack([]);
  };

  const stepOver = () => {
    if (currentLine !== null) {
      setCurrentLine(currentLine + 1);
    }
  };

  const addBreakpoint = (line: number) => {
    setBreakpoints([...breakpoints, { line, file: currentFile }]);
  };

  const removeBreakpoint = (line: number) => {
    setBreakpoints(breakpoints.filter(bp => bp.line !== line));
  };

  return (
    <div className="h-full flex flex-col bg-[#252526] border-t border-gray-700">
      {/* Header */}
      <div className="p-3 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BugIcon className="w-5 h-5 text-red-400" />
            <span className="font-semibold text-white">Debugger</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <XCircleIcon className="w-4 h-4" />
          </Button>
        </div>

        {/* Debug Controls */}
        <div className="flex gap-2">
          {!isDebugging ? (
            <Button
              onClick={startDebugging}
              size="sm"
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <PlayIcon className="w-4 h-4 mr-2" />
              Start Debug
            </Button>
          ) : (
            <>
              <Button
                onClick={stopDebugging}
                size="sm"
                variant="outline"
                className="border-red-600 text-red-400"
              >
                <XCircleIcon className="w-4 h-4" />
              </Button>
              <Button
                onClick={stepOver}
                size="sm"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <StepForwardIcon className="w-4 h-4 mr-2" />
                Step Over
              </Button>
            </>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        {/* Variables */}
        <div className="p-3 border-b border-gray-700">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">Variables</h3>
          {variables.length === 0 ? (
            <div className="text-xs text-gray-500">No variables in scope</div>
          ) : (
            <div className="space-y-2">
              {variables.map((variable, index) => (
                <div key={index} className="bg-gray-800 rounded p-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-400">{variable.name}</span>
                    <span className="text-gray-500">{variable.type}</span>
                  </div>
                  <div className="text-green-400 mt-1">{variable.value}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Call Stack */}
        <div className="p-3 border-b border-gray-700">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">Call Stack</h3>
          {callStack.length === 0 ? (
            <div className="text-xs text-gray-500">No active call stack</div>
          ) : (
            <div className="space-y-1">
              {callStack.map((frame, index) => (
                <div key={index} className="bg-gray-800 rounded p-2 text-xs text-gray-300">
                  {frame}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Breakpoints */}
        <div className="p-3">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">Breakpoints</h3>
          {breakpoints.length === 0 ? (
            <div className="text-xs text-gray-500">
              Click on line numbers to add breakpoints
            </div>
          ) : (
            <div className="space-y-1">
              {breakpoints.map((bp, index) => (
                <div
                  key={index}
                  className="bg-gray-800 rounded p-2 text-xs text-gray-300 flex items-center justify-between"
                >
                  <span>Line {bp.line}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeBreakpoint(bp.line)}
                    className="h-5 w-5 p-0"
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Status */}
      {isDebugging && currentLine && (
        <div className="p-3 border-t border-gray-700 bg-yellow-600/10">
          <div className="text-xs text-yellow-400 flex items-center gap-2">
            <PauseIcon className="w-3 h-3" />
            Paused at line {currentLine}
          </div>
        </div>
      )}
    </div>
  );
}
