import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/Button';
import { ConnectionBanner } from '../components/ConnectionBanner';
import { Layout } from '../components/Layout';
import { MessageBubble, SystemMessage } from '../components/MessageBubble';
import { SettingsModal } from '../components/SettingsModal';
import { TimerBadge } from '../components/TimerBadge';
import { AuthService } from '../services/authService';
import { MessageService } from '../services/messageService';
import { RoomService } from '../services/roomService';
import { MessageRow, RoomRow } from '../types';
import { ambientPlayer, AmbientType } from '../utils/ambientAudio';

const RoomChat: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [room, setRoom] = useState<RoomRow | null>(null);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [connectionStatus, setConnectionStatus] =
    useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  const [isExpired, setIsExpired] = useState(false);
  const [copied, setCopied] = useState(false);
  const [userCount, setUserCount] = useState(1);
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [ambientType, setAmbientType] = useState<AmbientType>('none');
  const [ambientVolume, setAmbientVolume] = useState(0.5);
  const [isSending, setIsSending] = useState(false);

  // If you already have these elsewhere, keep them. If not, wire them similarly.
  const [isMuted, setIsMuted] = useState(false);
  const toggleMute = () => setIsMuted(prev => !prev);

  const subscriptionRef = useRef<{
    roomId: string;
    unsubscribeMessages: () => void;
    unsubscribePresence: () => void;
  } | null>(null);

  const dedupeAndSortMessages = (list: MessageRow[]) => {
    const unique: MessageRow[] = [];

    for (const msg of list) {
      const existingIndex = unique.findIndex(
        m => m.id === msg.id || (msg.client_msg_id && m.client_msg_id === msg.client_msg_id)
      );

      if (existingIndex >= 0) {
        unique[existingIndex] = msg;
      } else {
        unique.push(msg);
      }
    }

    return unique.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  };

  const upsertMessage = (msg: MessageRow) => {
    setMessages(prev => {
      const next = [...prev];
      const existingIndex = next.findIndex(
        m => m.id === msg.id || (msg.client_msg_id && m.client_msg_id === msg.client_msg_id)
      );

      if (existingIndex >= 0) {
        next[existingIndex] = msg;
      } else {
        next.push(msg);
      }

      return dedupeAndSortMessages(next);
    });
  };

  /* ---------- lifecycle ---------- */

  useEffect(() => {
    if (!roomId) return;

    let cancelled = false;

    const init = async () => {
      await AuthService.ensureAuthenticated();
      const uid = await AuthService.getUserId();
      if (cancelled) return;

      setCurrentUserId(uid);

      const r = await RoomService.getRoom(roomId);
      if (cancelled) return;

      if (!r) {
        navigate('/');
        return;
      }

      if (r.status !== 'active' || new Date(r.expires_at) <= new Date()) {
        navigate(`/room/${roomId}/ended`);
        return;
      }


      if (cancelled) return;

      setRoom(r);

      const initial = await MessageService.loadMessages(roomId);
      if (!cancelled) setMessages(dedupeAndSortMessages(initial));

      subscriptionRef.current?.unsubscribeMessages?.();
      subscriptionRef.current?.unsubscribePresence?.();

      const unsubMessages = MessageService.subscribe(
        roomId,
        upsertMessage,
        status => {
          if (status === 'SUBSCRIBED') setConnectionStatus('connected');
          else if (status === 'CHANNEL_ERROR') setConnectionStatus('disconnected');
          else setConnectionStatus('connecting');
        }
      );

      const unsubPresence = MessageService.subscribeToPresence(roomId, setUserCount);

      subscriptionRef.current = {
        roomId,
        unsubscribeMessages: unsubMessages,
        unsubscribePresence: unsubPresence
      };
    };

    init();

    return () => {
      cancelled = true;
      subscriptionRef.current?.unsubscribeMessages?.();
      subscriptionRef.current?.unsubscribePresence?.();
      subscriptionRef.current = null;
    };
  }, [roomId, navigate]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* ---------- send (fixes the keydown typing bug) ---------- */

  const sendMessage = async () => {
    if (!text.trim() || !roomId || isExpired || isSending) return;

    const content = text.trim();
    setText('');
    setIsSending(true);

    const clientMsgId = crypto.randomUUID();

    try {
      const persisted = await MessageService.sendMessage(roomId, content, clientMsgId);

      // In case the realtime event arrives slightly later (or is delayed),
      // reconcile the acknowledged row through the same state pipeline.
      upsertMessage(persisted);
    } catch {
      setText(content);
    } finally {
      setIsSending(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessage();
  };

  /* ---------- handlers ---------- */

  const handleExitRequest = () => {
    if (isExpired || connectionStatus !== 'connected') navigate('/');
    else setShowLeaveConfirmation(true);
  };

  const handleCopyId = () => {
    if (!room) return;
    navigator.clipboard.writeText(room.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const onExpire = () => {
    setIsExpired(true);
    navigate(`/room/${roomId}/ended`, { state: { messageCount: messages.length } });
  };

  /* ---------- ambient ---------- */

  useEffect(() => {
    if (ambientType === 'none') ambientPlayer.stop();
    else {
      ambientPlayer.setVolume(ambientVolume);
      ambientPlayer.play(ambientType);
    }
    return () => ambientPlayer.stop();
  }, [ambientType, ambientVolume]);

  useEffect(() => {
    ambientPlayer.setVolume(ambientVolume);
  }, [ambientVolume]);

  /* ---------- render ---------- */

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Initializing…
      </div>
    );
  }

  return (
    <Layout>
      {/* Connection Status Banner - Fixed below header level */}
      {connectionStatus !== 'connected' && (
        <div className="absolute top-20 left-0 w-full z-40 px-4 pointer-events-none flex justify-center animate-fade-in">
          <div className="w-full max-w-sm rounded-lg overflow-hidden shadow-lg backdrop-blur-md pointer-events-auto border border-white/5">
            <ConnectionBanner status={connectionStatus} />
          </div>
        </div>
      )}

      {/* Fixed Header Overlay */}
      <div className="absolute top-0 left-0 w-full px-4 py-4 z-20 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto bg-white/80 dark:bg-brand-bg/80 backdrop-blur-md rounded-full border border-gray-200 dark:border-white/5 p-1 flex items-center gap-2 pr-2 shadow-lg transition-colors">
          <button
            onClick={handleExitRequest}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-brand-surfaceHighlight flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
            title={t('leave_room_tooltip')}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>

          <div className="flex flex-col pl-1">
            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold leading-none">
              {t('secure_label')}
            </span>
            <span className="text-xs text-gray-900 dark:text-white font-mono leading-none">
              {room.id.slice(0, 8)}
            </span>
          </div>

          <div className="w-px h-5 bg-gray-300 dark:bg-white/10 mx-0.5" />

          <button
            onClick={handleCopyId}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-400 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            title={t('copy_id')}
          >
            {copied ? (
              <svg className="w-4 h-4 text-brand-DEFAULT" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
          <div className="hidden md:flex font-mono text-xs md:text-sm px-3 py-2 rounded-full border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-black/60 shadow-lg backdrop-blur-md text-gray-600 dark:text-gray-300 items-center gap-2 h-[38px] md:h-[42px] transition-colors">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                clipRule="evenodd"
              />
            </svg>
            <span>{messages.length}</span>
          </div>

          <div className="font-mono text-xs md:text-sm px-3 py-2 rounded-full border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-black/60 shadow-lg backdrop-blur-md text-gray-600 dark:text-gray-300 flex items-center gap-2 h-[38px] md:h-[42px] transition-colors">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <span>{userCount}</span>
          </div>

          <button
            onClick={() => setShowSettings(true)}
            className="h-[38px] md:h-[42px] w-[38px] md:w-[42px] rounded-full border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-black/60 shadow-lg backdrop-blur-md flex items-center justify-center transition-all text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10"
            title={t('settings')}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          <button
            onClick={toggleMute}
            className={`h-[38px] md:h-[42px] w-[38px] md:w-[42px] rounded-full border shadow-lg backdrop-blur-md flex items-center justify-center transition-all ${
              isMuted
                ? 'bg-red-500/10 border-red-500/30 text-red-500 dark:text-red-400 hover:bg-red-500/20'
                : 'bg-white/80 dark:bg-black/60 border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10'
            }`}
            title={isMuted ? t('unmute') : t('mute')}
          >
            {isMuted ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                  clipRule="evenodd"
                />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
              </svg>
            )}
          </button>

          <TimerBadge expiresAt={room.expires_at} onExpire={onExpire} />
        </div>
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-DEFAULT/5 via-transparent to-transparent pointer-events-none" />

      <div className="flex-1 overflow-y-auto px-4 pt-20 pb-4 space-y-4 bg-transparent z-10 scroll-smooth">
        <SystemMessage text={t('session_started')} />
        {messages.map(m => (
          <MessageBubble key={`${m.id}-${m.client_msg_id}`} message={m} isSelf={m.sender_id === currentUserId} />
        ))}
        <div ref={bottomRef} className="h-1" />
      </div>

      <div className="p-4 pt-0 z-20 shrink-0">
        <div
          className={`relative bg-white/80 dark:bg-brand-surface/80 backdrop-blur-xl border rounded-3xl p-1.5 shadow-2xl transition-all duration-300 ${
            isSending ? 'border-brand-DEFAULT/30 shadow-[0_0_15px_rgba(54,226,123,0.1)]' : 'border-gray-200 dark:border-white/5'
          }`}
        >
          <form onSubmit={handleSend} className="flex gap-2 items-end">
            <button
              type="button"
              className="h-12 w-12 rounded-full text-gray-400 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 flex items-center justify-center transition-colors"
              disabled
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>

            <textarea
              ref={textareaRef}
              className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 min-h-[48px] max-h-32 py-3 focus:outline-none resize-none"
              placeholder={t('type_message')}
              rows={1}
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={async e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  await sendMessage(); // fixes TS + preserves behavior
                }
              }}
              disabled={isExpired || connectionStatus !== 'connected'}
            />

            <button
              type="submit"
              disabled={(!text.trim() && !isSending) || isExpired || connectionStatus !== 'connected'}
              className="h-12 w-12 rounded-full bg-[#36e27b] text-[#05080a] font-bold flex items-center justify-center disabled:opacity-50 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-600 hover:bg-[#2ecf6e] transition-all shadow-[0_0_15px_rgba(54,226,123,0.3)]"
            >
              {isSending ? (
                <svg className="animate-spin h-5 w-5 text-[#05080a]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <svg className="w-5 h-5 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </form>
        </div>
      </div>

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        currentAmbient={ambientType}
        onAmbientChange={setAmbientType}
        volume={ambientVolume}
        onVolumeChange={setAmbientVolume}
      />

      {showLeaveConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-[#0f1316] border border-gray-200 dark:border-[#242e30] rounded-2xl p-6 shadow-2xl animate-slide-up">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('leave_room_title')}</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
              {text.trim().length > 0 && (
                <span className="text-amber-500 dark:text-amber-400 block mb-2 font-medium">
                  {t('unsent_message_warning')}
                </span>
              )}
              {t('leave_room_desc')}
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowLeaveConfirmation(false)}
                className="!h-12 border-gray-200 dark:border-[#242e30] text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                fullWidth
              >
                {t('cancel')}
              </Button>
              <Button variant="danger" onClick={() => navigate('/')} className="!h-12" fullWidth>
                {t('leave')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default RoomChat;
