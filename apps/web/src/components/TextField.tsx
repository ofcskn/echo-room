import React from 'react';

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export const TextField: React.FC<TextFieldProps> = ({ label, error, className = '', leftIcon, ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}
        <input
          className={`w-full h-12 md:h-14 ${leftIcon ? 'pl-11' : 'px-4'} pr-4 rounded-xl bg-gray-50 dark:bg-brand-surfaceHighlight border border-gray-200 dark:border-brand-border text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-DEFAULT focus:border-transparent transition-all ${error ? 'border-red-500 focus:ring-red-500' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
        <span className="w-1 h-1 rounded-full bg-red-500"></span>
        {error}
      </p>}
    </div>
  );
};