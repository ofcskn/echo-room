import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  isLoading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  disabled,
  fullWidth = true,
  icon,
  ...props 
}) => {
  const baseStyles = "h-12 md:h-14 rounded-full font-bold transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base active:scale-[0.98]";
  const widthStyles = fullWidth ? "w-full" : "w-auto px-8";
  
  const variants = {
    primary: "bg-[#36e27b] hover:bg-[#2ecf6e] text-[#05080a] shadow-[0_0_20px_rgba(54,226,123,0.2)] hover:shadow-[0_0_25px_rgba(54,226,123,0.4)] border border-transparent",
    secondary: "bg-white dark:bg-brand-surfaceHighlight text-gray-900 dark:text-white border border-gray-200 dark:border-brand-border hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-brand-surface",
    ghost: "bg-transparent text-gray-600 dark:text-brand-muted hover:text-gray-900 dark:hover:text-white",
    danger: "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20"
  };

  return (
    <button 
      className={`${baseStyles} ${widthStyles} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <div className="flex items-center gap-2">
          {icon}
          {children}
        </div>
      )}
    </button>
  );
};