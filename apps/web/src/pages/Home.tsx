
import { getRecentRooms, RecentRoom } from '@/utils/recentRooms';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Layout } from '../components/Layout';

const Home: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [recents, setRecents] = useState<RecentRoom[]>([]);

  useEffect(() => {
    // Refresh recents on mount
    const r = getRecentRooms();
    setRecents(r);
  }, []);

  return (
    <Layout>
      <div className="flex-1 flex flex-col px-6 py-10 animate-fade-in">
        {/* Hero */}
        <div className="mt-8 mb-16 space-y-6 text-center md:text-left">
          <div className="inline-block px-3 py-1 rounded-full bg-brand-DEFAULT/10 border border-brand-DEFAULT/20 text-brand-DEFAULT text-xs font-semibold tracking-wider mb-2">
            {t('live_and_anonymous')}
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-gray-900 dark:text-white leading-[0.9]">
            {t('chat_without')} <br />
            <span className="text-brand-DEFAULT">{t('a_trace')}</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-lg">
            {t('home_description')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button onClick={() => navigate('/create')} className="md:max-w-xs">
              {t('create_room')}
            </Button>
            <Button variant="secondary" onClick={() => navigate('/join')} className="md:max-w-xs">
              {t('join_room')}
            </Button>
          </div>
        </div>

        {/* Recent Rooms (Local) */}
        {recents.length > 0 && (
          <div className="mt-auto animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {t('recent_rooms_local')}
              </h3>
            </div>
            
            <div className="grid gap-3">
              {recents.map((room) => (
                <div 
                  key={room.id}
                  onClick={() => navigate(`/room/${room.id}`)}
                  className="group flex items-center justify-between p-4 rounded-xl bg-white dark:bg-brand-surface border border-gray-100 dark:border-brand-border hover:border-brand-DEFAULT/50 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${room.isOwner ? 'bg-brand-DEFAULT/10 text-brand-DEFAULT' : 'bg-blue-500/10 text-blue-400'}`}>
                      {room.isOwner ? (
                         <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      ) : (
                         <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      )}
                    </div>
                    <div>
                      <div className="font-mono text-sm dark:text-gray-200">
                        echo-{room.id.slice(0, 4)}-{room.id.slice(-4)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500">
                         {room.isOwner ? t('created_by_you') : t('joined')} • {t('expires_at_prefix')} {new Date(room.expires_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                  </div>
                  <div className="text-gray-300 dark:text-gray-600 group-hover:text-brand-DEFAULT transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Home;
