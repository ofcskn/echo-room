import React from 'react';

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-brand-surface rounded-2xl md:rounded-3xl border border-gray-100 dark:border-brand-border p-6 md:p-8 shadow-sm ${className}`}>
      {children}
    </div>
  );
};