import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Cursor {
  userId: string;
  username?: string;
  color?: string;
  x: number;
  y: number;
}

interface LiveCursorsProps {
  cursors: Cursor[];
}

export function LiveCursors({ cursors }: LiveCursorsProps) {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {cursors.map((cursor) => (
          <motion.div
            key={cursor.userId}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              left: cursor.x,
              top: cursor.y,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* Cursor pointer */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
            >
              <path
                d="M5.65376 12.3673L11.6538 18.3673L13.6538 10.3673L19.6538 8.36729L5.65376 12.3673Z"
                fill={cursor.color || '#6B7280'}
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            
            {/* Username label */}
            <div
              className="absolute top-6 left-0 px-2 py-1 rounded text-xs font-medium text-white whitespace-nowrap"
              style={{ backgroundColor: cursor.color || '#6B7280' }}
            >
              {cursor.username || cursor.userId}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
