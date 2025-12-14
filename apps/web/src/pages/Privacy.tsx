
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { useTranslation } from 'react-i18next';

const Privacy: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Ensure top scroll on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-[#05080a] text-[#e2e8f0] font-sans selection:bg-[#36e27b] selection:text-black">
      
      {/* Navigation */}
      <nav className="w-full border-b border-[#242e30]/50 bg-[#05080a]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-[#36e27b] transition-colors">EchoRoom</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <Link to="/" className="hover:text-white transition-colors">{t('nav_home')}</Link>
            <span className="hover:text-white transition-colors cursor-pointer">{t('nav_features')}</span>
            <span className="text-white">{t('nav_privacy')}</span>
            <Button onClick={() => navigate('/create')} className="!h-10 !px-6 text-sm">
              {t('create_room')}
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-24 pb-20 px-6 text-center overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#36e27b]/10 rounded-full blur-[120px] -z-10" />

        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
          <div className="inline-block mb-4">
            <span className="text-[#36e27b] text-xs font-bold tracking-[0.2em] uppercase border-b border-[#36e27b]/30 pb-1">
              {t('privacy_tagline')}
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
            {t('privacy_hero_title_1')}<br />
            <span className="text-[#36e27b]">{t('privacy_hero_title_2')}</span>
          </h1>
          
          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            {t('privacy_hero_desc')}
          </p>
          
          <div className="pt-8 flex justify-center">
            <Button onClick={() => navigate('/create')} className="!px-10">
              {t('start_anonymous_chat')}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 pb-32">
        
        {/* Sidebar / Table of Contents */}
        <aside className="hidden lg:block lg:col-span-3 space-y-8 sticky top-32 h-fit">
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">{t('contents')}</h3>
            <ul className="space-y-3 text-sm font-medium border-l border-[#242e30]">
              {[
                { id: 'intro', label: t('intro') },
                { id: 'collection', label: t('data_collection') },
                { id: 'storage', label: t('data_storage') },
                { id: 'security', label: t('security') },
                { id: 'third-parties', label: t('third_parties') },
                { id: 'contact', label: t('contact_us') },
              ].map((item, i) => (
                <li key={item.id} className="-ml-px">
                  <button 
                    onClick={() => scrollToSection(item.id)}
                    className={`block pl-4 py-1 text-left border-l-2 transition-colors ${i === 0 ? 'border-[#36e27b] text-[#36e27b]' : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-700'}`}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Download Card */}
          <div className="bg-[#0f1316] rounded-xl p-5 border border-[#242e30] space-y-3">
            <div className="flex items-center gap-2 text-[#36e27b] text-xs font-bold uppercase">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              {t('download')}
            </div>
            <p className="text-sm text-gray-400">{t('download_desc')}</p>
            <button className="w-full py-2 bg-[#1a2124] hover:bg-[#242e30] border border-[#242e30] rounded-lg text-xs font-medium transition-colors">
              {t('download_pdf')}
            </button>
          </div>
        </aside>

        {/* Main Text Content */}
        <main className="col-span-1 lg:col-span-9 space-y-16">
          
          {/* Introduction */}
          <section id="intro" className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1a2124] border border-[#242e30] text-xs text-gray-400">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {t('last_updated')}
            </div>
            
            <h2 className="text-3xl font-bold text-white">{t('commitment_title')}</h2>
            <p className="text-gray-400 leading-relaxed text-lg">
              {t('commitment_desc')}
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#0f1316] border border-[#242e30] p-6 rounded-2xl relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-bold text-gray-500 uppercase">{t('ip_logging')}</span>
                  <svg className="w-5 h-5 text-[#36e27b]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div className="text-2xl font-bold text-white group-hover:text-[#36e27b] transition-colors">{t('disabled')}</div>
              </div>
              
              <div className="bg-[#0f1316] border border-[#242e30] p-6 rounded-2xl relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-bold text-gray-500 uppercase">{t('auto_delete')}</span>
                  <svg className="w-5 h-5 text-[#36e27b]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div className="text-2xl font-bold text-white group-hover:text-[#36e27b] transition-colors">{t('24_hours')}</div>
              </div>

              <div className="bg-[#0f1316] border border-[#242e30] p-6 rounded-2xl relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-bold text-gray-500 uppercase">{t('pii_stored')}</span>
                  <svg className="w-5 h-5 text-[#36e27b]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                </div>
                <div className="text-2xl font-bold text-white group-hover:text-[#36e27b] transition-colors">{t('zero')}</div>
              </div>
            </div>
          </section>

          {/* Section 1 */}
          <section id="collection" className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-[#36e27b] text-black font-bold flex items-center justify-center">1</div>
              <h3 className="text-2xl font-bold text-white">{t('info_not_collect')}</h3>
            </div>
            
            <div className="bg-[#0f1316] border border-[#242e30] rounded-3xl p-8">
              <p className="text-gray-400 mb-8">
                {t('info_not_collect_desc')}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                {[
                  t('no_real_name'),
                  t('no_phone'),
                  t('no_gps'),
                  t('no_device_id')
                ].map(item => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center shrink-0">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                    </div>
                    <span className="text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section id="storage" className="space-y-6">
             <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-[#36e27b] text-black font-bold flex items-center justify-center">2</div>
              <h3 className="text-2xl font-bold text-white">{t('temp_storage')}</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#0f1316] border border-[#242e30] rounded-3xl p-8 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#36e27b]/10 text-[#36e27b] flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>
                </div>
                <h4 className="text-xl font-bold text-white">{t('ram_only')}</h4>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {t('ram_only_desc')}
                </p>
              </div>
              <div className="bg-[#0f1316] border border-[#242e30] rounded-3xl p-8 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#36e27b]/10 text-[#36e27b] flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </div>
                <h4 className="text-xl font-bold text-white">{t('auto_expiration')}</h4>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {t('auto_expiration_desc')}
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section id="security" className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-[#36e27b] text-black font-bold flex items-center justify-center">3</div>
              <h3 className="text-2xl font-bold text-white">{t('encryption_transport')}</h3>
            </div>
            
            <div className="text-gray-400 text-lg leading-relaxed space-y-4 border-l-2 border-[#242e30] pl-6">
              <p>{t('encryption_desc_1')}</p>
              <p>{t('encryption_desc_2')}</p>
            </div>
          </section>

          {/* Section 4 */}
          <section id="third-parties" className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-[#36e27b] text-black font-bold flex items-center justify-center">4</div>
              <h3 className="text-2xl font-bold text-white">{t('third_parties_cookies')}</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-4 items-start bg-[#0f1316] p-6 rounded-2xl border border-[#242e30]">
                <div className="w-10 h-10 rounded-full bg-[#1a2124] flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                </div>
                <div>
                  <h4 className="text-white font-bold mb-1">{t('no_cookies')}</h4>
                  <p className="text-sm text-gray-400">{t('no_cookies_desc')}</p>
                </div>
              </div>

              <div className="flex gap-4 items-start bg-[#0f1316] p-6 rounded-2xl border border-[#242e30]">
                <div className="w-10 h-10 rounded-full bg-[#1a2124] flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                </div>
                <div>
                  <h4 className="text-white font-bold mb-1">{t('no_selling')}</h4>
                  <p className="text-sm text-gray-400">{t('no_selling_desc')}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Bottom CTA */}
          <div className="pt-12 text-center" id="contact">
            <h2 className="text-2xl font-bold text-white mb-2">{t('questions_title')}</h2>
            <p className="text-gray-400 mb-8">{t('questions_desc')}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="secondary" className="bg-[#1a2124] border-[#242e30] text-white hover:bg-[#242e30] !h-12">
                {t('read_whitepaper')}
              </Button>
              <Button className="!h-12">
                {t('contact_support')}
              </Button>
            </div>
          </div>

        </main>
      </div>

      {/* Footer */}
      <footer className="bg-[#020304] border-t border-[#242e30] py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
               <span className="font-bold text-white">EchoRoom</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              {t('welcome')}
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-white mb-6 text-sm">{t('footer_product')}</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><Link to="/create" className="hover:text-[#36e27b] transition-colors">{t('create_room')}</Link></li>
              <li><span className="hover:text-[#36e27b] transition-colors cursor-pointer">{t('nav_features')}</span></li>
              <li><span className="hover:text-[#36e27b] transition-colors cursor-pointer">{t('footer_download_app')}</span></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6 text-sm">{t('footer_legal')}</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><Link to="/privacy" className="text-[#36e27b]">{t('nav_privacy')}</Link></li>
              <li><span className="hover:text-[#36e27b] transition-colors cursor-pointer">{t('footer_tos')}</span></li>
              <li><span className="hover:text-[#36e27b] transition-colors cursor-pointer">{t('footer_transparency')}</span></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6 text-sm">{t('footer_connect')}</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><a href="#" className="hover:text-[#36e27b] transition-colors">{t('footer_twitter')}</a></li>
              <li><a href="#" className="hover:text-[#36e27b] transition-colors">{t('footer_github')}</a></li>
              <li><a href="#" className="hover:text-[#36e27b] transition-colors">{t('footer_email')}</a></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto pt-8 border-t border-[#242e30] flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600">
          <div>{t('rights_reserved')}</div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#36e27b]"></span>
            {t('systems_operational')}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Privacy;
