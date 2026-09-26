import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X, Menu, User, ChevronDown, Clock, MapPin, Gamepad2, BookOpen, Settings, Coins, LogOut, Leaf } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

interface HeaderProps {
  onGame: () => void;
  onEncyclopedia: () => void;
  onFauna: () => void;
  onManageFeeds: () => void;
  onFaunaAdmin: () => void;
  onAbout: () => void;
  onContact: () => void;
  onBlog: () => void;
  onOpenAuth: () => void;
  onOpenCoinShop: () => void;
  onOneMeet?: () => void;
}

export function Header({
  onGame,
  onEncyclopedia,
  onFauna,
  onManageFeeds,
  onFaunaAdmin,
  onAbout,
  onContact,
  onBlog,
  onOpenAuth,
  onOpenCoinShop,
  onOneMeet,
}: HeaderProps) {
  const { user, profile, signOut } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoursOpen, setHoursOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const hoursRef = useRef<HTMLDivElement>(null);
  const exploreRef = useRef<HTMLDivElement>(null);
  const mobileCloseRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    if (mobileMenuOpen && mobileCloseRef.current) {
      mobileCloseRef.current.focus();
    }
  }, [mobileMenuOpen]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (hoursRef.current && !hoursRef.current.contains(e.target as Node)) {
        setHoursOpen(false);
      }
      if (exploreRef.current && !exploreRef.current.contains(e.target as Node)) {
        setExploreOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setSearchOpen(false);
      setMobileMenuOpen(false);
      setHoursOpen(false);
      setExploreOpen(false);
      setUserMenuOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [handleEscape]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <>
      <header className="sticky top-0 z-50 flex flex-col" role="banner">
        <div className="w-full h-11 flex justify-center border-b border-white/10 relative z-[3]" style={{ background: '#1a4a22' }}>
          <div className="w-full max-w-[1440px] px-4 sm:px-6 lg:px-10 flex items-center justify-between h-full">
            <div className="flex items-center h-full">
              <div className="flex items-center gap-1.5 text-white">
                <MapPin size={14} className="text-amber-300" aria-hidden="true" />
                <span className="text-xs font-semibold tracking-wide hidden sm:inline">OneZoo Wildlife Network</span>
                <span className="text-xs font-semibold tracking-wide sm:hidden">OneZoo</span>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-5 h-full text-white">
              <div ref={hoursRef} className="relative">
                <button
                  onClick={() => { setHoursOpen(!hoursOpen); setExploreOpen(false); }}
                  aria-expanded={hoursOpen}
                  aria-haspopup="true"
                  aria-label="Stream schedule"
                  className="flex items-center gap-1.5 text-xs font-semibold hover:opacity-80 transition-opacity"
                >
                  <Clock size={13} className="hidden sm:block" aria-hidden="true" />
                  <span className="hidden sm:inline">Stream Schedule</span>
                  <span className="sm:hidden">Schedule</span>
                  <ChevronDown size={12} aria-hidden="true" className={`transition-transform ${hoursOpen ? 'rotate-180' : ''}`} />
                </button>

                {hoursOpen && (
                  <div role="menu" className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl z-[110] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-gray-100" style={{ background: 'linear-gradient(135deg, #1a4a22, #2d6a34)' }}>
                      <p className="text-xs text-emerald-200 font-medium">{dateStr}</p>
                      <h3 className="text-white font-bold mt-0.5">Live Stream Hours</h3>
                    </div>
                    <div className="p-4 space-y-4">
                      {[
                        { name: 'Safari Cams', hours: '6:00 AM - 8:00 PM EST', status: 'Live Now' },
                        { name: 'Aquarium Feeds', hours: '24/7 Streaming', status: 'Live Now' },
                        { name: 'Nocturnal Cams', hours: '7:00 PM - 6:00 AM EST', status: 'Starts at 7 PM' },
                      ].map((stream) => (
                        <div key={stream.name} className="flex gap-3" role="menuitem">
                          <div className="w-8 h-8 shrink-0 bg-emerald-50 rounded-full flex items-center justify-center" aria-hidden="true">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                          </div>
                          <div className="flex-grow">
                            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">{stream.name}</p>
                            <p className="text-sm font-bold text-gray-900">{stream.hours}</p>
                            <p className="text-xs text-emerald-600 mt-0.5">{stream.status}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="h-4 w-px bg-white/20 hidden sm:block" aria-hidden="true" />

              <button
                onClick={() => { setSearchOpen(true); setHoursOpen(false); setExploreOpen(false); }}
                className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Open search"
              >
                <Search size={15} aria-hidden="true" />
              </button>

              {user ? (
                <div ref={userMenuRef} className="relative hidden sm:block">
                  <button
                    onClick={() => { setUserMenuOpen(!userMenuOpen); setHoursOpen(false); setExploreOpen(false); }}
                    className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-white/10 transition-colors"
                    aria-label="User menu"
                  >
                    <div className="w-6 h-6 rounded-full bg-amber-600 flex items-center justify-center text-[10px] font-bold text-white">
                      {(profile?.display_name || user.email || '?')[0].toUpperCase()}
                    </div>
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-300">
                      <Coins size={11} />
                      {profile?.coin_balance?.toLocaleString() ?? 0}
                    </span>
                  </button>
                  {userMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl z-[110] overflow-hidden" role="menu">
                      <div className="p-3 border-b border-gray-100" style={{ background: 'linear-gradient(135deg, #1a4a22, #2d6a34)' }}>
                        <p className="text-white font-bold text-sm truncate">{profile?.display_name || 'User'}</p>
                        <p className="text-emerald-200 text-xs truncate">{user.email}</p>
                        <div className="flex items-center gap-1.5 mt-2 text-amber-300">
                          <Coins size={13} />
                          <span className="text-sm font-bold">{profile?.coin_balance?.toLocaleString() ?? 0} coins</span>
                        </div>
                      </div>
                      <div className="p-1.5">
                        <button
                          onClick={() => { onOpenCoinShop(); setUserMenuOpen(false); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-amber-50 transition-colors text-left text-sm font-semibold text-gray-700"
                          role="menuitem"
                        >
                          <Coins size={15} className="text-amber-500" />
                          Buy Coins
                        </button>
                        <button
                          onClick={() => { signOut(); setUserMenuOpen(false); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors text-left text-sm font-semibold text-gray-700"
                          role="menuitem"
                        >
                          <LogOut size={15} className="text-red-500" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="p-1.5 rounded-full hover:bg-white/10 transition-colors hidden sm:flex"
                  aria-label="Sign in"
                >
                  <User size={15} aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          {searchOpen && (
            <div className="absolute inset-0 z-[5] flex items-center justify-center px-4 sm:px-10 transition-all duration-150" style={{ background: '#1a4a22' }} role="search">
              <div className="w-full max-w-[640px] flex items-center gap-3">
                <div className="relative flex-grow">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" aria-hidden="true" />
                  <input
                    ref={searchInputRef}
                    type="search"
                    placeholder="Search OneZoo..."
                    aria-label="Search OneZoo"
                    className="w-full bg-white/20 text-white placeholder-white/60 font-semibold py-2.5 pl-11 pr-4 rounded-xl border-none focus:ring-2 focus:ring-white/50 outline-none text-sm"
                  />
                </div>
                <button onClick={() => setSearchOpen(false)} className="p-2 text-white hover:bg-white/10 rounded-full" aria-label="Close search">
                  <X size={20} aria-hidden="true" />
                </button>
              </div>
            </div>
          )}
        </div>

        <nav className="w-full flex justify-center relative z-[4]" style={{ background: 'linear-gradient(180deg, #0d2e14, #14391b)' }} aria-label="Main navigation">
          <div className="w-full max-w-[1440px] px-4 sm:px-6 lg:px-10 flex items-center justify-between h-16">
            <div className="flex items-center gap-6 lg:gap-8 h-full">
              <a href="#" onClick={scrollToTop} className="flex items-center gap-2.5 shrink-0 group" aria-label="OneZoo home">
                <img
                  src="/image%20copy%20copy%20copy.png"
                  alt="OneZoo"
                  className="h-10 w-10 rounded-lg object-cover transition-transform group-hover:scale-105"
                  width={40}
                  height={40}
                />
                <div className="hidden sm:block">
                  <span className="text-xl font-bold bg-gradient-to-r from-amber-200 to-yellow-300 bg-clip-text text-transparent tracking-tight">OneZoo</span>
                </div>
              </a>

              <div className="hidden lg:flex items-center gap-1 h-full" role="menubar">
                <a href="#feeds" className="nav-link-hover text-white/85 hover:text-white px-3 py-2 text-sm font-semibold transition-colors rounded-lg hover:bg-white/5" role="menuitem">
                  Feeds
                </a>
                <button onClick={onAbout} className="nav-link-hover text-white/85 hover:text-white px-3 py-2 text-sm font-semibold transition-colors rounded-lg hover:bg-white/5" role="menuitem">
                  About
                </button>
                <button onClick={onContact} className="nav-link-hover text-white/85 hover:text-white px-3 py-2 text-sm font-semibold transition-colors rounded-lg hover:bg-white/5" role="menuitem">
                  Contact
                </button>
                <button onClick={onBlog} className="nav-link-hover text-white/85 hover:text-white px-3 py-2 text-sm font-semibold transition-colors rounded-lg hover:bg-white/5" role="menuitem">
                  Blogs
                </button>
                <button onClick={onFauna} className="nav-link-hover text-white/85 hover:text-white px-3 py-2 text-sm font-semibold transition-colors rounded-lg hover:bg-white/5 flex items-center gap-1.5" role="menuitem">
                  <Leaf size={14} className="text-emerald-400" />
                  Fauna
                </button>
                {onOneMeet && (
                  <button
                    onClick={onOneMeet}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold transition-all rounded-lg hover:scale-[1.02]"
                    style={{ background: 'rgba(224,124,94,0.15)', color: '#e07c5e', border: '1px solid rgba(224,124,94,0.3)' }}
                    role="menuitem"
                  >
                    OneMeet
                  </button>
                )}

                <div ref={exploreRef} className="relative">
                  <button
                    onClick={() => { setExploreOpen(!exploreOpen); setHoursOpen(false); }}
                    aria-expanded={exploreOpen}
                    aria-haspopup="true"
                    className="nav-link-hover text-white/85 hover:text-white px-3 py-2 text-sm font-semibold transition-colors rounded-lg hover:bg-white/5 flex items-center gap-1"
                    role="menuitem"
                  >
                    Explore
                    <ChevronDown size={14} aria-hidden="true" className={`transition-transform ${exploreOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {exploreOpen && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl z-[110] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200" role="menu">
                      <div className="p-2">
                        {[
                          { label: 'Fauna', icon: Leaf, action: onFauna, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                          { label: 'Animal Battle', icon: Gamepad2, action: onGame, color: 'text-amber-600', bg: 'bg-amber-50' },
                          { label: 'Animal Encyclopedia', icon: BookOpen, action: onEncyclopedia, color: 'text-sky-600', bg: 'bg-sky-50' },
                        ].map((item) => (
                          <button
                            key={item.label}
                            onClick={() => { item.action(); setExploreOpen(false); }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left group"
                            role="menuitem"
                          >
                            <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`} aria-hidden="true">
                              <item.icon size={16} />
                            </div>
                            <span className="text-sm font-semibold text-gray-800">{item.label}</span>
                          </button>
                        ))}
                      </div>
                      <div className="border-t border-gray-100 p-2">
                        <button
                          onClick={() => { onManageFeeds(); setExploreOpen(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left group"
                          role="menuitem"
                        >
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 group-hover:scale-110 transition-transform" aria-hidden="true">
                            <Settings size={16} />
                          </div>
                          <span className="text-sm font-semibold text-gray-600">Manage Feeds</span>
                        </button>
                        <button
                          onClick={() => { onFaunaAdmin(); setExploreOpen(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left group"
                          role="menuitem"
                        >
                          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform" aria-hidden="true">
                            <Leaf size={16} />
                          </div>
                          <span className="text-sm font-semibold text-gray-600">Fauna Settings</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {user && (
                <button
                  onClick={onOpenCoinShop}
                  className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-sm transition-all hover:scale-[1.02] active:scale-95"
                  style={{ background: 'rgba(217,119,6,0.15)', color: '#fbbf24', border: '1px solid rgba(217,119,6,0.3)' }}
                >
                  <Coins size={14} />
                  Buy Coins
                </button>
              )}
              <a
                href="#feeds"
                className="hidden sm:inline-flex items-center bg-amber-400 hover:bg-amber-300 text-gray-900 px-5 py-2 rounded-full font-bold text-sm tracking-wide shadow-lg shadow-amber-500/20 transition-all hover:shadow-amber-400/30 hover:scale-[1.02] active:scale-95"
              >
                Watch Live
              </a>

              <button
                onClick={() => { setMobileMenuOpen(true); setHoursOpen(false); setExploreOpen(false); }}
                className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Open menu"
                aria-expanded={mobileMenuOpen}
              >
                <Menu size={22} aria-hidden="true" />
              </button>
            </div>
          </div>
        </nav>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[200]" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} aria-hidden="true" />
          <div className="absolute top-0 right-0 h-full w-[300px] max-w-[85vw] shadow-2xl overflow-y-auto flex flex-col animate-in slide-in-from-right duration-300" style={{ background: 'linear-gradient(180deg, #0d2e14, #112a16)' }}>
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <img src="/image%20copy%20copy%20copy.png" alt="OneZoo" className="h-8 w-8 rounded-lg object-cover" width={32} height={32} />
                <span className="text-lg font-bold text-amber-300">OneZoo</span>
              </div>
              <button ref={mobileCloseRef} onClick={() => setMobileMenuOpen(false)} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors" aria-label="Close menu">
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <nav className="flex-1 p-4 space-y-1" aria-label="Mobile navigation">
              <a href="#feeds" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl text-white/85 hover:text-white hover:bg-white/5 transition-colors font-semibold text-sm">
                Feeds
              </a>
              <button onClick={() => { onAbout(); setMobileMenuOpen(false); }} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-white/85 hover:text-white hover:bg-white/5 transition-colors font-semibold text-sm text-left">
                About
              </button>
              <button onClick={() => { setMobileMenuOpen(false); onContact(); }} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-white/85 hover:text-white hover:bg-white/5 transition-colors font-semibold text-sm text-left">
                Contact
              </button>
              <button onClick={() => { onBlog(); setMobileMenuOpen(false); }} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-white/85 hover:text-white hover:bg-white/5 transition-colors font-semibold text-sm text-left">
                Blogs
              </button>
              {onOneMeet && (
                <button
                  onClick={() => { onOneMeet(); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl font-bold text-sm text-left transition-all"
                  style={{ background: 'rgba(224,124,94,0.1)', color: '#e07c5e', border: '1px solid rgba(224,124,94,0.2)' }}
                >
                  OneMeet
                </button>
              )}
              <div className="pt-3 pb-1">
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold px-3" aria-hidden="true">Explore</p>
              </div>

              {[
                { label: 'Fauna', icon: Leaf, action: onFauna, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                { label: 'Animal Battle', icon: Gamepad2, action: onGame, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                { label: 'Animal Encyclopedia', icon: BookOpen, action: onEncyclopedia, color: 'text-sky-400', bg: 'bg-sky-500/10' },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => { item.action(); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-white/85 hover:text-white hover:bg-white/5 transition-colors font-semibold text-sm text-left"
                >
                  <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center ${item.color}`} aria-hidden="true">
                    <item.icon size={16} />
                  </div>
                  {item.label}
                </button>
              ))}

              <div className="pt-3 pb-1">
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold px-3" aria-hidden="true">Admin</p>
              </div>
              <button
                onClick={() => { onManageFeeds(); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-white/85 hover:text-white hover:bg-white/5 transition-colors font-semibold text-sm text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/50" aria-hidden="true">
                  <Settings size={16} />
                </div>
                Manage Feeds
              </button>
              <button
                onClick={() => { onFaunaAdmin(); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-white/85 hover:text-white hover:bg-white/5 transition-colors font-semibold text-sm text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400" aria-hidden="true">
                  <Leaf size={16} />
                </div>
                Fauna Settings
              </button>
            </nav>

            <div className="p-4 border-t border-white/10 space-y-2">
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-3 py-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-sm font-bold text-white">
                      {(profile?.display_name || user.email || '?')[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{profile?.display_name || 'User'}</p>
                      <p className="text-xs text-amber-400 flex items-center gap-1">
                        <Coins size={10} /> {profile?.coin_balance?.toLocaleString() ?? 0} coins
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => { onOpenCoinShop(); setMobileMenuOpen(false); }}
                    className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl font-bold text-sm tracking-wide transition-all"
                    style={{ background: 'rgba(217,119,6,0.15)', color: '#fbbf24', border: '1px solid rgba(217,119,6,0.3)' }}
                  >
                    <Coins size={14} /> Buy Coins
                  </button>
                  <button
                    onClick={() => { signOut(); setMobileMenuOpen(false); }}
                    className="flex items-center justify-center gap-2 w-full px-5 py-2.5 rounded-xl font-bold text-sm text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { onOpenAuth(); setMobileMenuOpen(false); }}
                    className="flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-gray-900 px-5 py-3 rounded-xl font-bold text-sm tracking-wide transition-all w-full"
                  >
                    <User size={14} /> Sign In / Sign Up
                  </button>
                </>
              )}
              <a
                href="#feeds"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center bg-white/5 hover:bg-white/10 text-white px-5 py-3 rounded-xl font-bold text-sm tracking-wide transition-all w-full border border-white/10"
              >
                Watch Live
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
