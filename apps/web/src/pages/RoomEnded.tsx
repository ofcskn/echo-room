
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';

const RoomEnded: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { messageCount?: number; duration?: string; endTime?: string } | null;

  // Defaults to match screenshot for visual fidelity if no real data
  const messageCount = state?.messageCount ?? 42;
  const duration = state?.duration ?? '00:45';
  const endTime = state?.endTime ?? '10:34';

  return (
    <Layout>
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-20 pt-10 animate-fade-in">
        
        {/* Icon */}
        <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-[#1a2124] flex items-center justify-center mb-8 shadow-2xl relative ring-1 ring-black/5 dark:ring-white/5">
             <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-[#1a2124] rounded-full">
                <svg className="w-8 h-8 text-brand-DEFAULT" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.071 10.929a4 4 0 00-5.656 0l-1.1 1.1" />
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19L19 5" />
                </svg>
             </div>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight text-center">{t('room_ended_title')}</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-12 text-center max-w-sm text-lg leading-relaxed">
          {t('room_ended_message')}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-lg mb-12">
            {/* Messages */}
            <div className="bg-white dark:bg-[#1a2124] rounded-2xl p-4 md:p-6 text-center border border-gray-200 dark:border-white/5 flex flex-col justify-center items-center shadow-lg transition-colors">
                <div className="flex items-center gap-2 mb-2 text-gray-500 dark:text-[#566571] text-[10px] font-bold tracking-widest uppercase">
                    <svg className="w-3 h-3 text-[#36e27b]" fill="currentColor" viewBox="0 0 20 20"><path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/><path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"/></svg>
                    {t('stats_messages')}
                </div>
                <div className="text-2xl md:text-3xl font-bold text-brand-DEFAULT">{messageCount}</div>
            </div>

            {/* Duration */}
            <div className="bg-white dark:bg-[#1a2124] rounded-2xl p-4 md:p-6 text-center border border-gray-200 dark:border-white/5 flex flex-col justify-center items-center shadow-lg transition-colors">
                <div className="flex items-center gap-2 mb-2 text-gray-500 dark:text-[#566571] text-[10px] font-bold tracking-widest uppercase">
                     <svg className="w-3 h-3 text-[#36e27b]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                     {t('stats_duration')}
                </div>
                <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{duration}</div>
            </div>

            {/* Ended At */}
            <div className="bg-white dark:bg-[#1a2124] rounded-2xl p-4 md:p-6 text-center border border-gray-200 dark:border-white/5 flex flex-col justify-center items-center shadow-lg transition-colors">
                <div className="flex items-center gap-2 mb-2 text-gray-500 dark:text-[#566571] text-[10px] font-bold tracking-widest uppercase">
                    <svg className="w-3 h-3 text-[#36e27b]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {t('stats_ended')}
                </div>
                <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{endTime}</div>
            </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 w-full max-w-sm justify-center mb-16">
            <Button 
                onClick={() => navigate('/create')} 
                icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>}
                className="flex-1 shadow-[0_0_20px_rgba(54,226,123,0.1)]"
            >
                {t('new_room')}
            </Button>
            <Button 
                variant="secondary" 
                onClick={() => navigate('/')}
                className="flex-1 bg-white dark:bg-transparent border-gray-200 dark:border-white/10 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 hover:border-gray-300 dark:hover:border-white/20"
            >
                {t('back_to_home')}
            </Button>
        </div>
        
        <div className="text-center space-y-1 opacity-60">
             <p className="text-gray-400 dark:text-gray-500 text-xs">{t('archive_warning_1')}</p>
             <p className="text-gray-400 dark:text-gray-500 text-xs">{t('archive_warning_2')}</p>
        </div>
      </div>
    </Layout>
  );
};

export default RoomEnded;
