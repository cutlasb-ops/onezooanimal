import { useState, useEffect, useMemo, useCallback } from 'react';
import { PawPrint, Radio, Video, Search, Mail } from 'lucide-react';
import { HeroSection } from './components/HeroSection';
import { ContactPage } from './components/ContactPage';
import { supabase } from './lib/supabase';
import { FeedCard } from './components/FeedCard';
import { AdminModal } from './components/AdminModal';
import { SocialMediaWidgets } from './components/SocialMediaWidgets';
import { GameHub } from './components/GameHub';
import { AboutSection } from './components/AboutSection';
import { AnimalEncyclopedia } from './components/AnimalEncyclopedia';
import { MarchMadness } from './components/MarchMadness';
import { BracketGame } from './components/BracketGame';
import { FaunaModal } from './components/fauna/FaunaModal';
import { Header } from './components/Header';
import { AuthModal } from './components/AuthModal';
import { CoinShop } from './components/CoinShop';
import { PromoBanner } from './components/PromoBanner';
import { FeatureShowcase } from './components/FeatureShowcase';
import { ReelsSlideshow } from './components/ReelsSlideshow';
import { ShortsSection } from './components/ShortsSection';
import { BlogPage } from './components/BlogPage';
import { RecentBlogBanner } from './components/RecentBlogBanner';
import GaryChat from './components/GaryChat';
import { AmbientAudioPlayer } from './components/AmbientAudioPlayer';
import { FaunaAdminPanel } from './components/FaunaAdminPanel';
import { BroadcastPlayer } from './components/broadcast/BroadcastPlayer';
import { FeedModal } from './components/FeedModal';
import { OneMeetPage } from './components/OneMeetPage';
import { OneMeetAdmin } from './components/OneMeetAdmin';
import { OneMeetExperiences } from './components/OneMeetExperiences';
import type { AnimalFeed, AnimalCategory } from './lib/database.types';

function App() {
  const [feeds, setFeeds] = useState<AnimalFeed[]>([]);
  const [categories, setCategories] = useState<AnimalCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [feedTypeFilter, setFeedTypeFilter] = useState<'all' | 'live' | 'looped'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [gameOpen, setGameOpen] = useState(false);
  const [encyclopediaOpen, setEncyclopediaOpen] = useState(false);
  const [faunaOpen, setFaunaOpen] = useState(false);
  const [marchMadnessOpen, setMarchMadnessOpen] = useState(false);
  const [bracketOpen, setBracketOpen] = useState(() => {
    return window.location.pathname === '/bracket';
  });
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [coinShopOpen, setCoinShopOpen] = useState(false);
  const [faunaAdminOpen, setFaunaAdminOpen] = useState(false);
  const [page, setPage] = useState<'home' | 'about' | 'contact' | 'blog' | 'onemeet' | 'onemeet-admin' | 'onemeet-experiences'>(() => {
    const path = window.location.pathname.toLowerCase();
    if (path === '/onemeet/admin') return 'onemeet-admin';
    if (path === '/onemeet/experiences') return 'onemeet-experiences';
    if (path === '/onemeet') return 'onemeet';
    return 'home';
  });
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [sharedFeed, setSharedFeed] = useState<AnimalFeed | null>(null);
  const [sharedReferrer, setSharedReferrer] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('s');
    if (!slug) return;
    (async () => {
      const { data: share } = await supabase
        .from('feed_shares' as never)
        .select('*')
        .eq('id', slug)
        .maybeSingle() as unknown as { data: { feed_id: string; referrer_name: string; click_count: number } | null };
      if (!share) return;
      const { data: feed } = await supabase
        .from('animal_feeds')
        .select('*')
        .eq('id', share.feed_id)
        .maybeSingle();
      if (feed) {
        setSharedFeed(feed);
        setSharedReferrer(share.referrer_name || null);
        await supabase
          .from('feed_shares' as never)
          .update({ click_count: (share.click_count || 0) + 1 } as never)
          .eq('id', slug);
      }
    })();
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setBracketOpen(window.location.pathname === '/bracket');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  async function loadData() {
    try {
      const [categoriesResult, feedsResult] = await Promise.all([
        supabase.from('animal_categories').select('*').order('name'),
        supabase.from('animal_feeds').select('*').order('created_at', { ascending: false })
      ]);

      if (categoriesResult.data) setCategories(categoriesResult.data);
      if (feedsResult.data) setFeeds(feedsResult.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredFeeds = useMemo(() => feeds.filter(feed => {
    const matchesCategory = !selectedCategory || feed.category_id === selectedCategory;
    const matchesFeedType = feedTypeFilter === 'all' || feed.feed_type === feedTypeFilter;
    const lowerQuery = searchQuery.toLowerCase();
    const matchesSearch = feed.title.toLowerCase().includes(lowerQuery) ||
                         feed.description.toLowerCase().includes(lowerQuery);
    return matchesCategory && matchesFeedType && matchesSearch;
  }), [feeds, selectedCategory, feedTypeFilter, searchQuery]);

  const handleCategorySelect = useCallback((id: string | null) => setSelectedCategory(id), []);
  const handleFeedTypeFilter = useCallback((type: 'all' | 'live' | 'looped') => setFeedTypeFilter(type), []);

  const openBracket = useCallback(() => {
    setBracketOpen(true);
    window.history.pushState(null, '', '/bracket');
  }, []);

  const closeBracket = useCallback(() => {
    setBracketOpen(false);
    if (window.location.pathname === '/bracket') {
      window.history.pushState(null, '', '/');
    }
  }, []);

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: '#050505' }}>
      <a href="#main-content" className="skip-to-content">Skip to content</a>
      {page === 'about' && <AboutSection onBack={() => setPage('home')} />}
      {page === 'contact' && <ContactPage onBack={() => setPage('home')} />}
      {page === 'blog' && <BlogPage onBack={() => setPage('home')} />}
      {page === 'onemeet' && (
        <OneMeetPage onBack={() => { setPage('home'); window.history.pushState(null, '', '/'); }} />
      )}
      {page === 'onemeet-admin' && (
        <OneMeetAdmin onBack={() => { setPage('onemeet'); window.history.pushState(null, '', '/OneMeet'); }} />
      )}
      {page === 'onemeet-experiences' && (
        <OneMeetExperiences onBack={() => { setPage('onemeet'); window.history.pushState(null, '', '/OneMeet'); }} />
      )}
      {!page.startsWith('onemeet') && <div
        className="fixed inset-0 z-0 opacity-[0.18] pointer-events-none"
        style={{
          backgroundImage: 'url(/image%20copy%20copy%20copy%20copy.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'grayscale(0.35) contrast(1.05)',
          transform: 'translateZ(0)',
        }}
        aria-hidden="true"
      />}
      {!page.startsWith('onemeet') && <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(1200px 600px at 15% -10%, rgba(214,162,58,0.12), transparent 60%),' +
            'radial-gradient(1000px 500px at 110% 10%, rgba(255,179,71,0.08), transparent 60%),' +
            'linear-gradient(180deg, rgba(5,5,5,0.85) 0%, rgba(11,18,13,0.92) 50%, rgba(5,5,5,0.98) 100%)',
        }}
        aria-hidden="true"
      />}
      {!page.startsWith('onemeet') && <div
        className="fixed inset-0 z-0 pointer-events-none mix-blend-overlay opacity-[0.06]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
        aria-hidden="true"
      />}

      {!page.startsWith('onemeet') && <div className="relative z-10">
      <Header
        onGame={() => setGameOpen(true)}
        onEncyclopedia={() => setEncyclopediaOpen(true)}
        onFauna={() => setFaunaOpen(true)}
        onManageFeeds={() => setAdminModalOpen(true)}
        onFaunaAdmin={() => setFaunaAdminOpen(true)}
        onAbout={() => setPage('about')}
        onContact={() => setPage('contact')}
        onBlog={() => setPage('blog')}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenCoinShop={() => setCoinShopOpen(true)}
        onOneMeet={() => { setPage('onemeet'); window.history.pushState(null, '', '/OneMeet'); }}
      />

      <main id="main-content">
        <HeroSection onAbout={() => setPage('about')} />

        <RecentBlogBanner onOpenBlog={() => setPage('blog')} />

        <PromoBanner onOpenCoinShop={() => setCoinShopOpen(true)} onOpenGameZone={() => setGameOpen(true)} />

        <ShortsSection />

        <FeatureShowcase />

        <ReelsSlideshow />

        <section id="feeds" className="relative">

          <div
            className="px-4 sm:px-6 lg:px-8 py-16"
            style={{
              background:
                'linear-gradient(180deg, rgba(5,5,5,0) 0%, rgba(11,18,13,0.85) 20%, rgba(11,18,13,0.95) 80%, rgba(5,5,5,1) 100%)',
            }}
          >
            <div className="max-w-7xl mx-auto mb-10 text-center">
              <p className="text-xs tracking-[0.4em] text-[#d6a23a] uppercase mb-3">Live From The Wild</p>
              <h2 className="text-4xl md:text-6xl font-bold text-[#f8f6f2] leading-tight">
                Enter the <span className="text-[#d6a23a]">Wild</span>
              </h2>
              <p className="text-[#b8b4aa] mt-4 max-w-xl mx-auto">
                Real-time wildlife broadcasts from across the planet.
              </p>
            </div>
          <div className="max-w-7xl mx-auto relative">

            <div className="mb-8 space-y-4">
              <div className="relative max-w-xl mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-600/20 to-yellow-600/20 rounded-lg blur-xl"></div>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-500 z-10" size={20} aria-hidden="true" />
                  <input
                    type="search"
                    placeholder="Search for animals..."
                    aria-label="Search for animals"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-black/40 backdrop-blur-xl border border-[#d6a23a]/25 rounded-full text-[#f8f6f2] placeholder-[#b8b4aa]/60 focus:outline-none focus:ring-2 focus:ring-[#d6a23a]/40 focus:border-transparent shadow-[0_8px_40px_rgba(0,0,0,0.5)] relative"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={() => handleFeedTypeFilter('all')}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors relative overflow-hidden group ${
                    feedTypeFilter === 'all'
                      ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white shadow-lg shadow-amber-600/50'
                      : 'bg-black/40 backdrop-blur text-[#f8f6f2] hover:bg-black/60 border border-[#d6a23a]/25'
                  }`}
                >
                  <span className="relative z-10">All Feeds</span>
                  {feedTypeFilter !== 'all' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-600/0 via-amber-600/10 to-amber-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  )}
                </button>
                <button
                  onClick={() => handleFeedTypeFilter('live')}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 relative overflow-hidden group ${
                    feedTypeFilter === 'live'
                      ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg shadow-red-600/50'
                      : 'bg-black/40 backdrop-blur text-[#f8f6f2] hover:bg-black/60 border border-[#d6a23a]/25'
                  }`}
                >
                  <Radio size={16} className="relative z-10" />
                  <span className="relative z-10">Live Only</span>
                  {feedTypeFilter !== 'live' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-600/10 to-red-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  )}
                </button>
                <button
                  onClick={() => handleFeedTypeFilter('looped')}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 relative overflow-hidden group ${
                    feedTypeFilter === 'looped'
                      ? 'bg-gradient-to-r from-amber-700 to-yellow-700 text-white shadow-lg shadow-amber-700/50'
                      : 'bg-black/40 backdrop-blur text-[#f8f6f2] hover:bg-black/60 border border-[#d6a23a]/25'
                  }`}
                >
                  <Video size={16} className="relative z-10" />
                  <span className="relative z-10">Videos</span>
                  {feedTypeFilter !== 'looped' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-600/0 via-amber-600/10 to-amber-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  )}
                </button>
              </div>

              <div className="flex flex-wrap gap-2 justify-center">
                <button
                  onClick={() => handleCategorySelect(null)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors relative overflow-hidden group ${
                    selectedCategory === null
                      ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white shadow-md shadow-amber-600/40'
                      : 'bg-black/40 backdrop-blur text-[#f8f6f2] hover:bg-black/60 border border-[#d6a23a]/25'
                  }`}
                >
                  <span className="relative z-10">All Categories</span>
                  {selectedCategory !== null && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                  )}
                </button>
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors relative overflow-hidden group ${
                      selectedCategory === category.id
                        ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white shadow-md shadow-amber-600/40'
                        : 'bg-black/40 backdrop-blur text-[#f8f6f2] hover:bg-black/60 border border-[#d6a23a]/25'
                    }`}
                  >
                    <span className="relative z-10">{category.name}</span>
                    {selectedCategory !== category.id && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="text-center py-20" role="status" aria-label="Loading animal feeds">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-500 border-t-transparent mx-auto" aria-hidden="true"></div>
                <p className="text-[#d6a23a] mt-4">Loading amazing animals...</p>
              </div>
            ) : filteredFeeds.length === 0 ? (
              <div className="text-center py-20">
                <PawPrint className="text-amber-800/50 mx-auto mb-4" size={64} />
                <p className="text-amber-300/80 text-lg">No feeds found matching your criteria</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="list" aria-label="Animal feeds">
                {filteredFeeds.map(feed => (
                  <div key={feed.id} role="listitem">
                    <FeedCard feed={feed} onNeedAuth={() => setAuthModalOpen(true)} onNeedCoins={() => setCoinShopOpen(true)} />
                  </div>
                ))}
              </div>
            )}
          </div>
          </div>
        </section>

        <SocialMediaWidgets />
      </main>

      <footer className="bg-gradient-to-b from-amber-950 to-stone-950 border-t border-amber-900/30 py-10 px-4" role="contentinfo">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img
              src="/image%20copy%20copy%20copy.png"
              alt="OneZoo Logo"
              className="h-12 w-12 rounded-lg object-cover ring-2 ring-amber-700/30"
            />
            <span className="text-amber-100 font-bold text-xl">OneZoo</span>
          </div>
          <p className="text-amber-300/70 text-sm">
            Connecting people with wildlife through technology
          </p>

          <div className="flex items-center justify-center gap-4 mt-5">
            <a
              href="https://www.linkedin.com/company/onezooanimals/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="OneZoo on LinkedIn"
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{ background: 'rgba(180,130,30,0.1)', border: '1px solid rgba(180,130,30,0.25)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(180,130,30,0.25)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(180,130,30,0.1)'; }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect width="4" height="12" x="2" y="9" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </a>

            <a
              href="https://www.instagram.com/onezoozookeeper/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="OneZoo on Instagram"
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{ background: 'rgba(180,130,30,0.1)', border: '1px solid rgba(180,130,30,0.25)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(180,130,30,0.25)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(180,130,30,0.1)'; }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </a>

            <a
              href="https://www.tiktok.com/@onezoozookeeper"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="OneZoo on TikTok"
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{ background: 'rgba(180,130,30,0.1)', border: '1px solid rgba(180,130,30,0.25)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(180,130,30,0.25)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(180,130,30,0.1)'; }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-amber-400">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.49a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.72a8.19 8.19 0 0 0 4.76 1.52V6.79a4.83 4.83 0 0 1-1-.1z" />
              </svg>
            </a>

            <a
              href="mailto:zookeeper@onezoo.com"
              aria-label="Email zookeeper@onezoo.com"
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{ background: 'rgba(180,130,30,0.1)', border: '1px solid rgba(180,130,30,0.25)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(180,130,30,0.25)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(180,130,30,0.1)'; }}
            >
              <Mail size={18} className="text-amber-400" />
            </a>
          </div>

          <a
            href="mailto:zookeeper@onezoo.com"
            className="inline-block mt-3 text-amber-400/70 text-xs hover:text-amber-300 transition-colors"
          >
            zookeeper@onezoo.com
          </a>

          <p className="text-amber-400/50 text-xs mt-4">
            &copy; 2026 OneZoo. All rights reserved.
          </p>
        </div>
      </footer>

      <AdminModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        categories={categories}
        onFeedAdded={loadData}
      />

      <GameHub
        isOpen={gameOpen}
        onClose={() => setGameOpen(false)}
      />

      <AnimalEncyclopedia
        isOpen={encyclopediaOpen}
        onClose={() => setEncyclopediaOpen(false)}
        feeds={feeds}
      />

      <FaunaModal
        isOpen={faunaOpen}
        onClose={() => setFaunaOpen(false)}
      />

      <MarchMadness
        isOpen={marchMadnessOpen}
        onClose={() => setMarchMadnessOpen(false)}
      />
      <BracketGame
        isOpen={bracketOpen}
        onClose={closeBracket}
      />

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      <CoinShop isOpen={coinShopOpen} onClose={() => setCoinShopOpen(false)} onNeedAuth={() => { setCoinShopOpen(false); setAuthModalOpen(true); }} />

      <GaryChat />
      <AmbientAudioPlayer />

      <FaunaAdminPanel isOpen={faunaAdminOpen} onClose={() => setFaunaAdminOpen(false)} />

      <BroadcastPlayer
        isOpen={broadcastOpen}
        onClose={() => setBroadcastOpen(false)}
        animalId="demo-panda-001"
        animalName="Bao Bao"
        animalSpecies="Giant Panda"
        avatarName="Keeper Maya"
        avatarEmoji="🐼"
      />

      {sharedFeed && (
        <>
          {sharedReferrer && (
            <div
              className="fixed top-4 left-1/2 -translate-x-1/2 z-[220] px-4 py-2 rounded-full text-sm font-semibold shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#fff',
                boxShadow: '0 8px 24px rgba(245,158,11,0.4)',
              }}
            >
              Shared by {sharedReferrer}
            </div>
          )}
          <FeedModal
            feed={sharedFeed}
            onClose={() => {
              setSharedFeed(null);
              setSharedReferrer(null);
              const url = new URL(window.location.href);
              url.searchParams.delete('s');
              window.history.replaceState(null, '', url.pathname + (url.search ? url.search : ''));
            }}
            onNeedAuth={() => setAuthModalOpen(true)}
            onNeedCoins={() => setCoinShopOpen(true)}
          />
        </>
      )}
      </div>}
    </div>
  );
}

export default App;
