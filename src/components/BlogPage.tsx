import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, User, Heart, Share2, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { BlogPost } from '../lib/database.types';

interface BlogPageProps {
  onBack: () => void;
}

const DONATION_AMOUNTS = [5, 10, 25, 50];

function DonationBanner() {
  const [selectedAmount, setSelectedAmount] = useState<number>(10);
  const [customAmount, setCustomAmount] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [donating, setDonating] = useState(false);

  const handleDonate = async () => {
    const amount = useCustom ? parseFloat(customAmount) : selectedAmount;
    if (!amount || amount < 1) {
      alert('Please enter a valid donation amount (minimum $1).');
      return;
    }
    setDonating(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-donation`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ amount, origin: window.location.origin }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        alert(data.error || 'Failed to start donation. Please try again.');
        setDonating(false);
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      alert('Something went wrong. Please try again.');
      setDonating(false);
    }
  };

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a3c2a 0%, #0d2e14 50%, #14391b 100%)' }}>
      <div className="p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.25)' }}>
            <Heart size={22} className="text-amber-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-1">Help Keep OneZoo Running</h3>
            <p className="text-sm text-white/50 leading-relaxed mb-4">
              Your donation helps us maintain live animal cams, create educational content, and support wildlife conservation efforts around the world.
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              {DONATION_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  onClick={() => { setSelectedAmount(amt); setUseCustom(false); }}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    !useCustom && selectedAmount === amt
                      ? 'bg-amber-500 text-gray-900 shadow-lg shadow-amber-500/30'
                      : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  ${amt}
                </button>
              ))}
              <button
                onClick={() => setUseCustom(true)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  useCustom
                    ? 'bg-amber-500 text-gray-900 shadow-lg shadow-amber-500/30'
                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                }`}
              >
                Other
              </button>
            </div>

            {useCustom && (
              <div className="mb-4">
                <div className="relative w-48">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 font-bold text-sm">$</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Amount"
                    className="w-full pl-7 pr-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-white/30"
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleDonate}
              disabled={donating}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-60 disabled:hover:scale-100"
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#1a1a1a',
                boxShadow: '0 4px 15px rgba(245,158,11,0.3)',
              }}
            >
              <Heart size={15} />
              {donating ? 'Redirecting...' : `Donate $${useCustom ? (customAmount || '0') : selectedAmount}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SocialShareRow() {
  return (
    <div className="flex items-center gap-3 pt-4 border-t border-amber-200/50">
      <span className="text-xs font-semibold text-amber-700/50 uppercase tracking-wider">Share</span>
      <div className="flex gap-2">
        <a
          href="https://www.instagram.com/onezoozookeeper/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on Instagram"
          className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{ background: 'rgba(180,83,9,0.08)', border: '1px solid rgba(180,83,9,0.15)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-amber-700">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
        </a>
        <a
          href="https://www.tiktok.com/@onezoozookeeper"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on TikTok"
          className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{ background: 'rgba(180,83,9,0.08)', border: '1px solid rgba(180,83,9,0.15)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-amber-700">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.49a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.72a8.19 8.19 0 0 0 4.76 1.52V6.79a4.83 4.83 0 0 1-1-.1z" />
          </svg>
        </a>
        <a
          href="https://www.linkedin.com/company/onezooanimals/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on LinkedIn"
          className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{ background: 'rgba(180,83,9,0.08)', border: '1px solid rgba(180,83,9,0.15)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-700">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
            <rect width="4" height="12" x="2" y="9" />
            <circle cx="4" cy="4" r="2" />
          </svg>
        </a>
        <a
          href="mailto:zookeeper@onezoo.com"
          aria-label="Share via email"
          className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{ background: 'rgba(180,83,9,0.08)', border: '1px solid rgba(180,83,9,0.15)' }}
        >
          <Mail size={14} className="text-amber-700" />
        </a>
      </div>
    </div>
  );
}

function BlogCard({ post }: { post: BlogPost }) {
  const [expanded, setExpanded] = useState(false);
  const date = new Date(post.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const isLong = post.body.length > 400;
  const displayBody = expanded || !isLong ? post.body : post.body.slice(0, 400) + '...';

  return (
    <article className="rounded-2xl overflow-hidden border border-amber-200/60 transition-all hover:shadow-xl hover:shadow-amber-900/5" style={{ background: 'rgba(255,252,240,0.95)' }}>
      {post.image_url && (
        <div className="aspect-[16/9] overflow-hidden">
          <img
            src={post.image_url}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            loading="lazy"
          />
        </div>
      )}
      <div className="p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-3 text-xs text-amber-700/60">
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {date}
          </span>
          <span className="w-1 h-1 rounded-full bg-amber-400/50" />
          <span className="flex items-center gap-1">
            <User size={12} />
            {post.author_name}
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-amber-950 mb-3 leading-tight">{post.title}</h2>

        <div className="text-amber-900/70 text-sm leading-relaxed whitespace-pre-line">
          {displayBody}
        </div>

        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-3 text-sm font-semibold text-amber-700 hover:text-amber-600 transition-colors"
          >
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}

        <SocialShareRow />
      </div>
    </article>
  );
}

export function BlogPage({ onBack }: BlogPageProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    loadPosts();
  }, []);

  async function loadPosts() {
    try {
      const { data } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (data) setPosts(data);
    } catch (error) {
      console.error('Error loading blog posts:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto" style={{ background: '#fdf6e3' }}>
      <div className="sticky top-0 z-10 backdrop-blur-md border-b border-amber-200/50" style={{ background: 'rgba(253,246,227,0.92)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-amber-800 hover:text-amber-600 transition-colors font-semibold text-sm"
          >
            <ArrowLeft size={18} />
            Back
          </button>
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-amber-950">OneZoo Blog</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center mb-10">
          <h2
            className="text-3xl sm:text-4xl font-bold mb-3"
            style={{
              background: 'linear-gradient(to right, #92400e, #b45309, #92400e)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Wildlife Stories
          </h2>
          <p className="text-amber-800/60 max-w-lg mx-auto">
            Behind the scenes of our animal cams, conservation news, and fun facts about the creatures we love.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent mx-auto" />
            <p className="text-amber-700 mt-4 text-sm">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <Share2 className="text-amber-400/40 mx-auto mb-4" size={48} />
            <p className="text-amber-800/50 text-lg">No blog posts yet</p>
            <p className="text-amber-700/40 text-sm mt-2">Check back soon for wildlife stories and updates!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {posts.map(post => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        )}

        <div className="mt-12">
          <DonationBanner />
        </div>
      </div>
    </div>
  );
}
