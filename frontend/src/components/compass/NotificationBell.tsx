import React from 'react';
import { Bell } from 'lucide-react';

interface NotificationBellProps {
  count: number;
  onClick: () => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ count, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="relative p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
    >
      <Bell size={24} />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  );
};
