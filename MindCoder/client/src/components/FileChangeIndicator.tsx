import React from 'react';
import { User } from '../hooks/useCollaboration';

interface FileChange {
  userId: string;
  userName: string;
  userColor: string;
  startLine: number;
  endLine: number;
  timestamp: number;
  type: 'insert' | 'delete' | 'modify';
}

interface FileChangeIndicatorProps {
  changes: FileChange[];
  users: User[];
  currentLine?: number;
}

export const FileChangeIndicator: React.FC<FileChangeIndicatorProps> = ({
  changes,
  users,
  currentLine
}) => {
  const recentChanges = changes
    .filter(change => Date.now() - change.timestamp < 30000) // Show changes from last 30 seconds
    .sort((a, b) => b.timestamp - a.timestamp);

  const getChangeAtLine = (line: number) => {
    return recentChanges.find(change => 
      line >= change.startLine && line <= change.endLine
    );
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 10) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    return 'recently';
  };

  if (recentChanges.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-30">
      {/* Recent Changes Panel */}
      <div className="bg-white rounded-lg shadow-lg border p-3 w-64">
        <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Recent Changes
        </h4>
        
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {recentChanges.slice(0, 5).map((change, index) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: change.userColor }}
              />
              <div className="flex-1 min-w-0">
                <div className="truncate">
                  <span className="font-medium">{change.userName}</span>
                  <span className="text-gray-600 ml-1">
                    {change.type === 'insert' ? 'added' : 
                     change.type === 'delete' ? 'deleted' : 'modified'}
                  </span>
                  <span className="text-gray-500 ml-1">
                    line {change.startLine}
                    {change.endLine !== change.startLine && `-${change.endLine}`}
                  </span>
                </div>
                <div className="text-gray-400">
                  {formatTimeAgo(change.timestamp)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Current Line Change Indicator */}
      {currentLine && getChangeAtLine(currentLine) && (
        <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-2">
          <div className="text-xs text-blue-800">
            {(() => {
              const change = getChangeAtLine(currentLine)!;
              return (
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: change.userColor }}
                  />
                  <span>
                    <span className="font-medium">{change.userName}</span>
                    {' '}modified this line {formatTimeAgo(change.timestamp)}
                  </span>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

// Hook to track file changes
export const useFileChanges = () => {
  const [changes, setChanges] = React.useState<FileChange[]>([]);

  const addChange = React.useCallback((change: Omit<FileChange, 'timestamp'>) => {
    setChanges(prev => [
      ...prev,
      { ...change, timestamp: Date.now() }
    ]);
  }, []);

  const clearOldChanges = React.useCallback(() => {
    setChanges(prev => 
      prev.filter(change => Date.now() - change.timestamp < 300000) // Keep changes for 5 minutes
    );
  }, []);

  React.useEffect(() => {
    const interval = setInterval(clearOldChanges, 60000); // Clean up every minute
    return () => clearInterval(interval);
  }, [clearOldChanges]);

  return { changes, addChange };
};