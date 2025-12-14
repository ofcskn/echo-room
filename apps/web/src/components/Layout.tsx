
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  
  // Detect if we are in an active room chat (not ended, not create/join)
  const isChatRoom = location.pathname.startsWith('/room/') && !location.pathname.endsWith('/ended');

  const toggleLang = () => {
    const langs = ['en', 'tr', 'es', 'fr'];
    const current = langs.indexOf(i18n.language);
    const next = langs[(current + 1) % langs.length];
    i18n.changeLanguage(next);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Hide global header on chat room for immersive experience
  const showHeader = !isChatRoom;
  const showFooter = !isChatRoom;

  return (
    <div className={`flex flex-col items-center bg-gray-50 dark:bg-brand-bg text-gray-900 dark:text-brand-text transition-colors duration-200 ${isChatRoom ? 'h-[100dvh] overflow-hidden' : 'min-h-screen'}`}>
      {showHeader && (
        <header className="w-full max-w-2xl p-4 md:p-6 flex justify-between items-center z-10 shrink-0">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white group-hover:text-brand-DEFAULT transition-colors">EchoRoom</span>
          </Link>
          <div className="flex gap-4 text-xs font-semibold text-gray-500 dark:text-brand-muted tracking-wide">
            {/* Additional header items if needed */}
          </div>
        </header>
      )}
      
      <main className={`w-full max-w-2xl flex flex-col relative ${isChatRoom ? 'h-full overflow-hidden' : 'flex-1'}`}>
        {children}
      </main>

      {showFooter && (
        <footer className="w-full max-w-2xl p-6 text-center space-y-4 shrink-0">
          <div className="flex justify-center gap-3">
            <button onClick={toggleLang} className="text-xs font-bold text-gray-400 dark:text-gray-500 hover:text-brand-DEFAULT uppercase transition-colors border border-gray-200 dark:border-white/10 px-3 py-1.5 rounded-full bg-white dark:bg-brand-surface shadow-sm">
              {i18n.language}
            </button>
            <button 
              onClick={toggleTheme} 
              className="flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-brand-DEFAULT transition-colors border border-gray-200 dark:border-white/10 w-[30px] h-[30px] rounded-full bg-white dark:bg-brand-surface shadow-sm"
              title="Toggle Theme"
            >
              {theme === 'dark' ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-400 dark:text-gray-600">
              © {new Date().getFullYear()} EchoRoom Protocol. Secure & Ephemeral.
            </p>
            <p className="text-[10px] text-gray-400">
              <Link to="/privacy" className="hover:text-brand-DEFAULT underline decoration-gray-600 hover:decoration-brand-DEFAULT transition-all">Privacy Policy</Link>
            </p>
          </div>
        </footer>
      )}
    </div>
  );
};
