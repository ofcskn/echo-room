import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export const RoomIdPill: React.FC<{ roomId: string }> = ({ roomId }) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={copy}
      className="group flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-brand-surface rounded-full border border-gray-200 dark:border-brand-border hover:border-brand-DEFAULT/50 transition-colors"
    >
      <span className="text-xs font-mono text-gray-600 dark:text-gray-300">
        ID: {roomId.slice(0, 8)}...
      </span>
      {copied ? (
         <span className="text-xs text-brand-DEFAULT font-medium">{t('id_copied')}</span>
      ) : (
        <svg className="w-3.5 h-3.5 text-gray-400 group-hover:text-brand-DEFAULT" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
    </button>
  );
};
