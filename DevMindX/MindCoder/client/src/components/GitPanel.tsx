import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GitBranchIcon, GitCommitIcon, GitPullRequestIcon, RefreshCwIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GitPanelProps {
  projectName: string;
  onClose: () => void;
}

export function GitPanel({ projectName, onClose }: GitPanelProps) {
  const { toast } = useToast();
  const [commitMessage, setCommitMessage] = useState('');
  const [branch, setBranch] = useState('main');
  const [commits, setCommits] = useState<Array<{ id: string; message: string; author: string; date: string }>>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const initGit = () => {
    setIsInitialized(true);
    toast({
      title: 'Git Initialized',
      description: 'Repository initialized successfully'
    });
  };

  const handleCommit = () => {
    if (!commitMessage.trim()) {
      toast({
        title: 'Commit Failed',
        description: 'Please enter a commit message',
        variant: 'destructive'
      });
      return;
    }

    const newCommit = {
      id: `commit-${Date.now()}`,
      message: commitMessage,
      author: 'You',
      date: new Date().toLocaleString()
    };

    setCommits([newCommit, ...commits]);
    setCommitMessage('');

    toast({
      title: 'Committed',
      description: `Changes committed to ${branch}`
    });
  };

  return (
    <div className="h-full flex flex-col bg-[#252526] border-l border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <GitBranchIcon className="w-5 h-5 text-green-400" />
            <span className="font-semibold text-white">Git Control</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>×</Button>
        </div>

        {!isInitialized ? (
          <Button onClick={initGit} className="w-full bg-green-600 hover:bg-green-700">
            Initialize Repository
          </Button>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <GitBranchIcon className="w-4 h-4" />
              <span className="text-gray-300">Branch: {branch}</span>
            </div>
          </div>
        )}
      </div>

      {isInitialized && (
        <>
          {/* Commit Section */}
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">Commit Changes</h3>
            <Input
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder="Commit message..."
              className="mb-2 bg-gray-800 border-gray-600 text-white"
              onKeyDown={(e) => e.key === 'Enter' && handleCommit()}
            />
            <Button onClick={handleCommit} className="w-full bg-blue-600 hover:bg-blue-700" size="sm">
              <GitCommitIcon className="w-4 h-4 mr-2" />
              Commit
            </Button>
          </div>

          {/* Commit History */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="p-3 border-b border-gray-700 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-300">History</span>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <RefreshCwIcon className="w-3 h-3" />
              </Button>
            </div>

            <ScrollArea className="flex-1 p-3">
              {commits.length === 0 ? (
                <div className="text-center text-gray-500 text-sm py-8">
                  No commits yet
                </div>
              ) : (
                <div className="space-y-3">
                  {commits.map((commit) => (
                    <div key={commit.id} className="bg-gray-800 rounded p-3 text-sm">
                      <div className="flex items-start gap-2 mb-1">
                        <GitCommitIcon className="w-4 h-4 text-green-400 mt-0.5" />
                        <div className="flex-1">
                          <div className="text-white font-medium mb-1">{commit.message}</div>
                          <div className="text-xs text-gray-400">
                            {commit.author} • {commit.date}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Actions */}
          <div className="p-3 border-t border-gray-700 space-y-2">
            <Button variant="outline" className="w-full border-gray-600 text-sm" size="sm">
              <GitPullRequestIcon className="w-4 h-4 mr-2" />
              Pull Changes
            </Button>
            <Button variant="outline" className="w-full border-gray-600 text-sm" size="sm">
              Push to Remote
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
