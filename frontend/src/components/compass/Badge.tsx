import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  color?: 'green' | 'amber' | 'red' | 'blue' | 'slate';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ children, color = 'slate', size = 'md' }) => {
  const colors = {
    green: "bg-emerald-100 text-emerald-800",
    amber: "bg-amber-100 text-amber-800",
    red: "bg-rose-100 text-rose-800",
    blue: "bg-blue-100 text-blue-800",
    slate: "bg-slate-100 text-slate-800"
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm"
  };

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${colors[color]} ${sizes[size]}`}>
      {children}
    </span>
  );
};
