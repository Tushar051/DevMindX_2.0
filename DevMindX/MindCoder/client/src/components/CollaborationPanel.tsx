import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users, UserPlus, Copy, Check, Circle
} from 'lucide-react';

interface CollaborationUser {
  userId: string;
  username?: string;
  color?: string;
}

interface CollaborationPanelProps {
  users: CollaborationUser[];
  sessionId: string;
  isConnected: boolean;
  inviteCode?: string;
  onInvite?: () => void;
}

export function CollaborationPanel({ users, sessionId, isConnected, inviteCode, onInvite }: CollaborationPanelProps) {
  const [showInvite, setShowInvite] = useState(false);
  const [copied, setCopied] = useState(false);

  const inviteLink = inviteCode ? `Join code: ${inviteCode}` : `${window.location.origin}/collaborate/${sessionId}`;

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(inviteCode || inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="bg-gray-800/50 border-gray-700 h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            <span className="text-lg">Collaboration</span>
            <span className="text-sm text-gray-400">({users.length + 1})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowInvite(!showInvite)}
              className="border-purple-500/50 hover:bg-purple-500/10"
            >
              <UserPlus className="w-4 h-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Invite Section */}
        <AnimatePresence>
          {showInvite && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3"
            >
              <p className="text-gray-300 text-xs mb-2">Share this link:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inviteLink}
                  readOnly
                  className="flex-1 bg-gray-900/50 border border-gray-700 rounded px-2 py-1 text-xs text-gray-300 font-mono"
                />
                <Button
                  size="sm"
                  onClick={handleCopyInvite}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* User Presence */}
        <div className="flex items-center gap-2 pb-2 border-b border-gray-700">
          <div className="flex -space-x-2">
            {users.slice(0, 5).map((user) => (
              <div
                key={user.userId}
                className="w-8 h-8 rounded-full border-2 border-gray-800 flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: user.color || '#6B7280' }}
                title={user.username || user.userId}
              >
                {(user.username || user.userId).charAt(0).toUpperCase()}
              </div>
            ))}
            {users.length > 5 && (
              <div className="w-8 h-8 rounded-full border-2 border-gray-800 bg-gray-700 flex items-center justify-center text-white text-xs">
                +{users.length - 5}
              </div>
            )}
          </div>
        </div>

        {/* User List */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {/* Current User */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  You
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">You (Host)</p>
                  <p className="text-gray-400 text-xs">Active</p>
                </div>
              </div>
              <Circle className="w-2 h-2 text-green-400 fill-green-400" />
            </div>
          </motion.div>

          {/* Other Users */}
          {users.map((user, index) => (
            <motion.div
              key={user.userId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-gray-900/50 border border-gray-700 rounded-lg p-3 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: user.color || '#6B7280' }}
                  >
                    {(user.username || user.userId).charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{user.username || user.userId}</p>
                    <p className="text-gray-400 text-xs">Active</p>
                  </div>
                </div>
                <Circle className="w-2 h-2 text-green-400 fill-green-400" />
              </div>
            </motion.div>
          ))}

          {users.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No other users online</p>
              <p className="text-gray-500 text-xs mt-1">Invite teammates to collaborate</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
