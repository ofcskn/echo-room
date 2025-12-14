
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { RoomService } from '../services/roomService';
import { AuthService } from '../services/authService';
import { addRecentRoom } from '../utils/recentRooms';

const JoinRoom: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState('');

  const handleJoin = async () => {
    if (!roomId.trim()) return;
    setLoading(true);
    setError('');
    
    try {
      const userId = await AuthService.getUserId();
      if (roomId.length < 3) throw new Error("Invalid Room ID");

      const room = await RoomService.joinRoom(userId, roomId.trim());
      addRecentRoom(room, false);
      navigate(`/room/${room.id}`);
    } catch (e: any) {
      console.error(e);
      if (e.message === 'ROOM_EXPIRED') setError(t('error_room_expired'));
      else if (e.message === 'ROOM_NOT_FOUND') setError(t('error_room_not_found'));
      else setError("Room not found or invalid ID.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative z-10">
        
        {/* Back to Home Link - Positioned relative to content area */}
        <div className="absolute top-0 right-4 md:right-0 -mt-8 hidden md:flex items-center">
            <Link to="/" className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
               {t('back_to_home')}
            </Link>
        </div>

        {/* Glow Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-DEFAULT/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

        <div className="w-full max-w-[400px]">
          <div className="bg-white dark:bg-[#0f1316] border border-gray-200 dark:border-[#242e30] rounded-3xl p-8 shadow-2xl relative overflow-hidden transition-colors">
             
             {/* Icon */}
             <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gray-50 dark:bg-[#1a2124] rounded-2xl flex items-center justify-center ring-1 ring-black/5 dark:ring-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                   <svg className="w-8 h-8 text-[#36e27b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                   </svg>
                </div>
             </div>

             <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-3">{t('join_a_room_title')}</h1>
             <p className="text-center text-gray-500 dark:text-gray-400 text-sm mb-8 leading-relaxed px-2">
               {t('join_description')}
             </p>

             <div className="space-y-6">
                {/* Input Field */}
                <div>
                   <div className="relative group">
                      <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center text-gray-400 dark:text-gray-500 group-focus-within:text-[#36e27b] transition-colors pointer-events-none">
                         <span className="text-lg font-mono font-bold opacity-50">#</span>
                      </div>
                      <input 
                         type="text"
                         value={roomId}
                         onChange={(e) => setRoomId(e.target.value)}
                         placeholder={t('room_id_placeholder')}
                         className={`w-full h-12 pl-12 pr-4 bg-gray-50 dark:bg-[#05080a] border ${error ? 'border-red-500' : 'border-gray-200 dark:border-[#242e30]'} rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-[#36e27b] focus:ring-1 focus:ring-[#36e27b] transition-all text-sm font-medium shadow-inner`}
                      />
                   </div>
                   <div className="min-h-[20px] mt-2">
                     <p className="text-[11px] text-gray-500 pl-1">
                        {error ? <span className="text-red-500">{error}</span> : t('invalid_room_id')}
                     </p>
                   </div>
                </div>

                {/* Button */}
                <Button 
                   onClick={handleJoin}
                   isLoading={loading}
                   disabled={!roomId}
                   className="w-full !h-12 bg-[#36e27b] hover:bg-[#2ecf6e] text-black font-bold shadow-[0_0_20px_rgba(54,226,123,0.3)] hover:shadow-[0_0_25px_rgba(54,226,123,0.5)] border-none flex items-center justify-center gap-2 group transition-all"
                >
                   <span>{t('join_room')}</span>
                   <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                   </svg>
                </Button>

                {/* Footer Info */}
                <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400 dark:text-gray-500">
                   <svg className="w-3 h-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                   </svg>
                   <span>{t('rooms_expire_24h')}</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default JoinRoom;
