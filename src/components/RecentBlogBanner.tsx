import { useEffect, useState } from 'react';
import { Newspaper, ArrowRight, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { BlogPost } from '../lib/database.types';

interface RecentBlogBannerProps {
  onOpenBlog: () => void;
}

export function RecentBlogBanner({ onOpenBlog }: RecentBlogBannerProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    loadRecent();
  }, []);

  async function loadRecent() {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('is_published', true)
      .gte('created_at', cutoff)
      .order('created_at', { ascending: false })
      .limit(3);

    if (data) setPosts(data);
  }

  if (posts.length === 0) return null;

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-8" style={{ background: '#fdf6e3' }}>
      <div className="max-w-7xl mx-auto">
        <div
          className="rounded-2xl overflow-hidden border border-amber-300/50 shadow-lg"
          style={{ background: 'linear-gradient(135deg, #fffdf5 0%, #fef3c7 100%)' }}
        >
          <div className="px-5 sm:px-6 py-4 flex items-center justify-between border-b border-amber-300/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-500/15 border border-amber-500/25">
                <Newspaper size={18} className="text-amber-700" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-amber-950">Fresh from the Blog</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500 text-white animate-pulse">
                    New
                  </span>
                </div>
                <p className="text-xs text-amber-800/60">Published in the last 24 hours</p>
              </div>
            </div>
            <button
              onClick={onOpenBlog}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-amber-900 hover:text-amber-700 transition-colors"
            >
              View all
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-amber-300/40">
            {posts.map((post) => {
              const date = new Date(post.created_at);
              const hoursAgo = Math.max(1, Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60)));
              return (
                <button
                  key={post.id}
                  onClick={onOpenBlog}
                  className="text-left p-5 hover:bg-amber-100/40 transition-colors group"
                >
                  {post.image_url && (
                    <div className="aspect-[16/9] rounded-lg overflow-hidden mb-3 bg-amber-100">
                      <img
                        src={post.image_url}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-[11px] text-amber-700/70 mb-1.5">
                    <Calendar size={11} />
                    <span>{hoursAgo === 1 ? '1 hour ago' : `${hoursAgo} hours ago`}</span>
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-amber-950 leading-snug line-clamp-2 group-hover:text-amber-700 transition-colors">
                    {post.title}
                  </h4>
                  <p className="text-xs text-amber-900/60 mt-1.5 line-clamp-2 leading-relaxed">
                    {post.body.slice(0, 120)}
                    {post.body.length > 120 ? '...' : ''}
                  </p>
                </button>
              );
            })}
          </div>

          <button
            onClick={onOpenBlog}
            className="sm:hidden w-full px-5 py-3 text-sm font-semibold text-amber-900 border-t border-amber-300/40 hover:bg-amber-100/40 transition-colors flex items-center justify-center gap-1.5"
          >
            View all posts
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </section>
  );
}
