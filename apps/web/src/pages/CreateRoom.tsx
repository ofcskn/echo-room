import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { RoomService } from '../services/roomService';
import { AuthService } from '../services/authService';
import { addRecentRoom } from '../utils/recentRooms';

const TTL_OPTIONS = [
  { label: '5', sub: 'MIN', value: 300 },
  { label: '10', sub: 'MIN', value: 600 },
  { label: '15', sub: 'MIN', value: 900 },
  { label: '30', sub: 'MIN', value: 1800 },
];

const CreateRoom: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedTTL, setSelectedTTL] = useState(300);

  const handleCreate = async () => {
    setLoading(true);
    try {
      const userId = await AuthService.getUserId();
      const room = await RoomService.createRoom(userId, selectedTTL);
      addRecentRoom(room, true);
      navigate(`/room/${room.id}`);
    } catch (e) {
      console.error(e);
      alert("Failed to create room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex-1 px-4 flex flex-col justify-center pb-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold dark:text-white mb-2">Start a temporary <br/><span className="text-brand-DEFAULT">conversation.</span></h2>
          <p className="text-gray-500">No profiles. No history. Just chat.</p>
        </div>

        <Card className="bg-gradient-to-b from-white to-gray-50 dark:from-brand-surface dark:to-black">
          <div className="flex items-center gap-2 mb-6 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {t('room_ttl')}
          </div>
          
          <div className="grid grid-cols-4 gap-3 mb-10">
            {TTL_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSelectedTTL(opt.value)}
                className={`aspect-square rounded-2xl flex flex-col items-center justify-center border-2 transition-all ${
                  selectedTTL === opt.value
                    ? 'bg-[#36e27b] border-[#36e27b] text-[#05080a] shadow-[0_0_20px_rgba(54,226,123,0.2)] scale-105'
                    : 'bg-transparent border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
              >
                <span className="text-xl md:text-2xl font-bold">{opt.label}</span>
                <span className="text-[10px] font-bold opacity-60">{opt.sub}</span>
              </button>
            ))}
          </div>

          <Button isLoading={loading} onClick={handleCreate}>
            {t('create_room')} →
          </Button>
          <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-4">
            Rooms expire and are permanently deleted.
          </p>
        </Card>
      </div>
    </Layout>
  );
};

export default CreateRoom;