
import React from 'react';
import { MessageRow } from '../types';

interface MessageBubbleProps {
  message: MessageRow;
  isSelf: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isSelf }) => {
  const time = new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`flex w-full ${isSelf ? 'justify-end' : 'justify-start'} group animate-slide-up mb-1`}>
      <div 
        className={`max-w-[85%] md:max-w-[70%] px-4 py-2 text-sm md:text-base shadow-sm relative transition-all ${
          isSelf 
            ? 'bg-[#36e27b] text-[#05080a] rounded-2xl rounded-tr-sm font-medium' 
            : 'bg-white dark:bg-brand-surfaceHighlight text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-white/5 rounded-2xl rounded-tl-sm'
        }`}
      >
        <div className="flex flex-col min-w-[3rem]">
          <p className="leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
          <div className={`text-[10px] mt-0.5 flex items-center justify-end gap-1 select-none ${isSelf ? 'text-[#05080a]/60 font-semibold' : 'text-gray-400 dark:text-gray-500'}`}>
            <span>{time}</span>
            {isSelf && (
              // Visual styling for "sent" state. 
              // Without backend read-receipt support, we display a single checkmark.
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const SystemMessage: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex justify-center my-6 opacity-75">
    <span className="bg-gray-200/50 dark:bg-brand-surface/40 backdrop-blur-sm text-gray-500 dark:text-gray-400 text-[10px] uppercase tracking-widest px-4 py-1 rounded-full border border-gray-200 dark:border-white/5">
      {text}
    </span>
  </div>
);
