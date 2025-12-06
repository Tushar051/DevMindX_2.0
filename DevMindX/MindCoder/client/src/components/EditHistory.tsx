import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { HistoryIcon, UserIcon, XIcon } from 'lucide-react';

interface EditHistoryProps {
  lineAuthors: Map<number, { userId: string; username: string; color: string }>;
  users: Array<{ id: string; username: string; color: string }>;
  onClose?: () => void;
}

export function EditHistory({ lineAuthors, users, onClose }: EditHistoryProps) {
  // Group edits by user
  const editsByUser = new Map<string, number[]>();
  
  lineAuthors.forEach((author, lineNumber) => {
    const existing = editsByUser.get(author.userId) || [];
    existing.push(lineNumber);
    editsByUser.set(author.userId, existing);
  });

  // Calculate contribution percentage
  const totalLines = lineAuthors.size;
  const contributions = Array.from(editsByUser.entries()).map(([userId, lines]) => {
    const user = users.find(u => u.id === userId);
    return {
      userId,
      username: user?.username || 'Unknown',
      color: user?.color || '#888',
      lines: lines.length,
      percentage: totalLines > 0 ? Math.round((lines.length / totalLines) * 100) : 0
    };
  }).sort((a, b) => b.lines - a.lines);

  return (
    <div className="h-full flex flex-col bg-[#252526] border-l border-gray-700">
      {/* Header */}
      <div className="p-3 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HistoryIcon className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-semibold text-white">Edit History</span>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
              <XIcon className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Contributors */}
      <ScrollArea className="flex-1 p-3">
        {contributions.length === 0 ? (
          <div className="text-center text-gray-500 text-xs py-8">
            No edits tracked yet
          </div>
        ) : (
          <div className="space-y-3">
            {contributions.map((contrib) => (
              <div key={contrib.userId} className="bg-gray-800 rounded p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: contrib.color }}
                  />
                  <span className="text-sm font-medium text-white">
                    {contrib.username}
                  </span>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Lines edited</span>
                    <span className="text-white font-medium">{contrib.lines}</span>
                  </div>
                  
                  <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${contrib.percentage}%`,
                        backgroundColor: contrib.color
                      }}
                    />
                  </div>
                  
                  <div className="text-xs text-gray-400 text-right">
                    {contrib.percentage}% contribution
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Legend */}
      <div className="p-3 border-t border-gray-700">
        <div className="text-xs text-gray-400 space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            <span>Line highlight = Last editor</span>
          </div>
          <div className="flex items-center gap-2">
            <UserIcon className="w-3 h-3" />
            <span>Hover line numbers for details</span>
          </div>
        </div>
      </div>
    </div>
  );
}
