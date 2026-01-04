import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '',
  ...props 
}) => {
  const baseStyles = "h-12 px-6 rounded-xl font-bold text-base transition-transform active:scale-95 flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-blue-600 text-white shadow-lg shadow-blue-200",
    success: "bg-emerald-600 text-white shadow-lg shadow-emerald-200",
    danger: "bg-red-600 text-white shadow-lg shadow-red-200",
    secondary: "bg-slate-100 text-slate-700",
    outline: "border-2 border-slate-200 text-slate-600 bg-transparent"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
