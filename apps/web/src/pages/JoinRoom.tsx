import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { TextField } from '../components/TextField';
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

      if (roomId.length < 5) throw new Error("Invalid Room ID");

      // For UX, maybe we just validate existence
      const room = await RoomService.joinRoom(userId, roomId.trim());
      
      addRecentRoom(room, false);
      navigate(`/room/${room.id}`);
    } catch (e: any) {
      console.error(e);
      if (e.message === 'ROOM_EXPIRED') setError(t('error_room_expired'));
      else if (e.message === 'ROOM_NOT_FOUND') setError(t('error_room_not_found'));
      else setError("Failed to join room. Check ID.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex-1 px-4 flex flex-col justify-center pb-20">
        <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-brand-surfaceHighlight rounded-2xl flex items-center justify-center text-brand-DEFAULT">
                 <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
            </div>
        </div>
        
        <h2 className="text-3xl font-bold text-center dark:text-white mb-2">Join a Room</h2>
        <p className="text-center text-gray-500 mb-8">Enter the unique ID to connect instantly.</p>

        <Card className="bg-brand-surface/50 border-brand-border/50">
          <div className="space-y-6">
            <TextField
              placeholder="e.g. echo-8821..."
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              error={error}
              leftIcon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
              }
            />

            <Button isLoading={loading} onClick={handleJoin} disabled={!roomId}>
              {t('join')}
            </Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default JoinRoom;