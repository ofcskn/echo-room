import React from 'react';
import { useTranslation } from 'react-i18next';

export const ConnectionBanner: React.FC<{ status: 'connected' | 'connecting' | 'disconnected' }> = ({ status }) => {
  const { t } = useTranslation();
  if (status === 'connected') return null;

  return (
    <div className={`w-full py-1 text-center text-xs font-medium ${
      status === 'connecting' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'
    }`}>
      {status === 'connecting' ? t('connecting') : t('disconnected')}
    </div>
  );
};
