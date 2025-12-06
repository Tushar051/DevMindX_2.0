import React from 'react';

interface User {
  id: string;
  name: string;
  color: string;
  cursor?: {
    line: number;
    column: number;
  };
}

interface UserPresenceProps {
  users: User[];
  maxVisible?: number;
}

export const UserPresence: React.FC<UserPresenceProps> = ({ 
  users, 
  maxVisible = 5 
}) => {
  const visibleUsers = users.slice(0, maxVisible);
  const hiddenCount = Math.max(0, users.length - maxVisible);

  return (
    <div className="flex items-center gap-1">
      {visibleUsers.map((user) => (
        <div
          key={user.id}
          className="relative group"
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium border-2 border-white shadow-sm cursor-pointer"
            style={{ backgroundColor: user.color }}
            title={user.name}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
          
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
            {user.name}
            {user.cursor && (
              <div className="text-xs text-gray-300">
                Line {user.cursor.line}, Col {user.cursor.column}
              </div>
            )}
          </div>
        </div>
      ))}
      
      {hiddenCount > 0 && (
        <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-white text-xs font-medium border-2 border-white shadow-sm">
          +{hiddenCount}
        </div>
      )}
      
      {users.length === 0 && (
        <div className="text-sm text-gray-400">
          No other users online
        </div>
      )}
    </div>
  );
};