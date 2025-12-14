
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './Button';
import { AmbientType } from '../utils/ambientAudio';
import { useTheme } from '../contexts/ThemeContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAmbient: AmbientType;
  onAmbientChange: (type: AmbientType) => void;
  volume: number;
  onVolumeChange: (val: number) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  currentAmbient, 
  onAmbientChange,
  volume,
  onVolumeChange
}) => {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-[#0f1316] border border-[#242e30] rounded-2xl p-6 shadow-2xl animate-slide-up relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-brand-DEFAULT" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            {t('settings')}
        </h3>

        {/* Theme Section */}
        <div className="mb-6">
           <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">{t('theme')}</h4>
           <div className="grid grid-cols-3 gap-2">
               {(['light', 'dark', 'system'] as const).map((tMode) => (
                   <button 
                       key={tMode}
                       onClick={() => setTheme(tMode)}
                       className={`h-12 rounded-xl text-sm font-medium transition-all border ${theme === tMode ? 'bg-brand-DEFAULT/10 border-brand-DEFAULT text-brand-DEFAULT shadow-[0_0_15px_rgba(54,226,123,0.1)]' : 'bg-[#1a2124] border-transparent text-gray-400 hover:text-white hover:bg-[#242e30]'}`}
                   >
                       {t(tMode)}
                   </button>
               ))}
           </div>
        </div>

        {/* Ambient Sounds Section */}
        <div className="space-y-4">
            <div>
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">{t('ambient_sounds')}</h4>
                <div className="grid grid-cols-3 gap-2">
                    <button 
                        onClick={() => onAmbientChange('none')}
                        className={`h-12 rounded-xl text-sm font-medium transition-all border ${currentAmbient === 'none' ? 'bg-brand-DEFAULT/10 border-brand-DEFAULT text-brand-DEFAULT shadow-[0_0_15px_rgba(54,226,123,0.1)]' : 'bg-[#1a2124] border-transparent text-gray-400 hover:text-white hover:bg-[#242e30]'}`}
                    >
                        {t('sound_off')}
                    </button>
                    <button 
                        onClick={() => onAmbientChange('rain')}
                        className={`h-12 rounded-xl text-sm font-medium transition-all border ${currentAmbient === 'rain' ? 'bg-brand-DEFAULT/10 border-brand-DEFAULT text-brand-DEFAULT shadow-[0_0_15px_rgba(54,226,123,0.1)]' : 'bg-[#1a2124] border-transparent text-gray-400 hover:text-white hover:bg-[#242e30]'}`}
                    >
                        {t('sound_rain')}
                    </button>
                    <button 
                        onClick={() => onAmbientChange('static')}
                        className={`h-12 rounded-xl text-sm font-medium transition-all border ${currentAmbient === 'static' ? 'bg-brand-DEFAULT/10 border-brand-DEFAULT text-brand-DEFAULT shadow-[0_0_15px_rgba(54,226,123,0.1)]' : 'bg-[#1a2124] border-transparent text-gray-400 hover:text-white hover:bg-[#242e30]'}`}
                    >
                        {t('sound_static')}
                    </button>
                </div>
            </div>

            {/* Volume Slider */}
            {currentAmbient !== 'none' && (
                <div className="pt-2 animate-fade-in">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-gray-500">{t('volume')}</span>
                        <span className="text-xs font-mono text-brand-DEFAULT">{Math.round(volume * 100)}%</span>
                    </div>
                    <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.01"
                        value={volume}
                        onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-[#242e30] rounded-full appearance-none cursor-pointer accent-brand-DEFAULT hover:accent-brand-hover focus:outline-none focus:ring-2 focus:ring-brand-DEFAULT/50"
                    />
                </div>
            )}
        </div>

        <div className="mt-8">
             <Button fullWidth onClick={onClose} className="!h-10 text-sm">
                Done
             </Button>
        </div>
      </div>
    </div>
  );
};
