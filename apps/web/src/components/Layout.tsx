
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const location = useLocation();
  const isHome = location.pathname === '/';
  
  // Detect if we are in an active room chat (not ended, not create/join)
  const isChatRoom = location.pathname.startsWith('/room/') && !location.pathname.endsWith('/ended');

  const toggleLang = () => {
    const langs = ['en', 'tr', 'es', 'fr'];
    const current = langs.indexOf(i18n.language);
    const next = langs[(current + 1) % langs.length];
    i18n.changeLanguage(next);
  };

  // Hide global header on chat room for immersive experience
  const showHeader = !isChatRoom;

  return (
    <div className={`flex flex-col items-center bg-gray-50 dark:bg-brand-bg text-gray-900 dark:text-brand-text transition-colors duration-200 ${isChatRoom ? 'h-[100dvh] overflow-hidden' : 'min-h-screen'}`}>
      {showHeader && (
        <header className="w-full max-w-2xl p-4 md:p-6 flex justify-between items-center z-10 shrink-0">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-brand-DEFAULT text-black flex items-center justify-center font-bold text-lg shadow-[0_0_15px_rgba(54,226,123,0.3)] group-hover:scale-105 transition-transform">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 3V21M8 8V16M16 8V16M4 11V13M20 11V13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight group-hover:text-brand-DEFAULT transition-colors">EchoRoom</span>
          </Link>
          <div className="flex gap-4 text-xs font-semibold text-gray-500 dark:text-brand-muted tracking-wide">
            <button onClick={toggleLang} className="hover:text-brand-DEFAULT uppercase transition-colors">
              {i18n.language}
            </button>
            {/* Theme toggle hidden as we enforce dark mainly, but keep logic if needed or auto */}
          </div>
        </header>
      )}
      
      <main className={`w-full max-w-2xl flex flex-col relative ${isChatRoom ? 'h-full overflow-hidden' : 'flex-1'}`}>
        {children}
      </main>

      {isHome && (
        <footer className="w-full max-w-2xl p-6 text-center space-y-2 shrink-0">
          <p className="text-xs text-gray-400 dark:text-gray-600">
            © {new Date().getFullYear()} EchoRoom Protocol. Secure & Ephemeral.
          </p>
          <p className="text-[10px] text-gray-400">
            <Link to="/privacy" className="hover:text-brand-DEFAULT underline decoration-gray-600 hover:decoration-brand-DEFAULT transition-all">Privacy Policy</Link>
          </p>
        </footer>
      )}
    </div>
  );
};
