import React, { useEffect, useState } from 'react';

export const TimerBadge: React.FC<{ expiresAt: string; onExpire: () => void }> = ({ expiresAt, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(expiresAt).getTime();
      const diff = end - now;

      if (diff <= 0) {
        clearInterval(interval);
        setTimeLeft('00:00');
        onExpire();
        return;
      }

      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${m.toString().padStart(2, '0')} : ${s.toString().padStart(2, '0')}`);
      setIsWarning(diff < 60000); // Less than 1 min
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  return (
    <div className={`font-mono text-xs md:text-sm px-4 py-2 rounded-full border shadow-lg backdrop-blur-md transition-colors ${
      isWarning 
        ? 'text-red-500 border-red-500/50 bg-red-950/80 animate-pulse' 
        : 'text-brand-DEFAULT border-brand-DEFAULT/20 bg-black/60'
    }`}>
      {timeLeft || '-- : --'}
    </div>
  );
};