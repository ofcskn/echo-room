
import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import Home from './src/pages/Home';
import CreateRoom from './src/pages/CreateRoom';
import JoinRoom from './src/pages/JoinRoom';
import RoomChat from './src/pages/RoomChat';
import RoomEnded from './src/pages/RoomEnded';
import Privacy from './src/pages/Privacy';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App: React.FC = () => {
  // Theme initialization
  useEffect(() => {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <HashRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateRoom />} />
        <Route path="/join" element={<JoinRoom />} />
        <Route path="/room/:roomId" element={<RoomChat />} />
        <Route path="/room/:roomId/ended" element={<RoomEnded />} />
        <Route path="/privacy" element={<Privacy />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
