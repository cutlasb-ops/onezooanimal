import { useEffect, useState } from 'react';
import { Heart, MessageCircle, Send, Download, Play } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getInstagramEmbedUrl } from '../lib/socialMediaUtils';
import type { SocialMediaPost } from '../lib/socialMediaUtils';

interface TikTokPost {
  video: string;
  thumbnail: string;
  caption: string;
  likes: string;
  views: string;
}

export function SocialMediaWidgets() {
  const [playingVideo, setPlayingVideo] = useState<number | null>(null);
  const [instagramPosts, setInstagramPosts] = useState<SocialMediaPost[]>([]);
  const [tiktokPosts, setTiktokPosts] = useState<TikTokPost[]>([]);

  useEffect(() => {
    loadInstagramPosts();
    loadTikTokPosts();
  }, []);

  useEffect(() => {
    if (window.instgrm && instagramPosts.length > 0) {
      window.instgrm.Embeds.process();
    }
  }, [instagramPosts]);

  async function loadInstagramPosts() {
    const { data } = await supabase
      .from('social_media_posts')
      .select('*')
      .eq('platform', 'instagram')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (data && data.length > 0) {
      setInstagramPosts(data);
    }
  }

  async function loadTikTokPosts() {
    const { data } = await supabase
      .from('social_media_posts')
      .select('*')
      .eq('platform', 'tiktok')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (data && data.length > 0) {
      const posts: TikTokPost[] = data
        .filter(post => post.video_url)
        .map(post => ({
          video: post.video_url || '',
          thumbnail: post.thumbnail_url || 'https://images.pexels.com/photos/3551227/pexels-photo-3551227.jpeg?auto=compress&cs=tinysrgb&w=800',
          caption: post.post_url,
          likes: '0',
          views: '0'
        }));

      setTiktokPosts(posts);
    }
  }

  const handleDownload = async (videoUrl: string, filename: string) => {
    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(https://images.pexels.com/photos/1187009/pexels-photo-1187009.jpeg?auto=compress&cs=tinysrgb&w=1600)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 30%',
          backgroundRepeat: 'no-repeat',
          transform: 'translateZ(0)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, rgba(255,248,220,0.45) 0%, rgba(255,243,190,0.35) 40%, rgba(255,248,220,0.50) 100%)',
        }}
      />
      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-12">
          <h3
            className="text-4xl font-bold mb-4"
            style={{
              background: 'linear-gradient(to right, #b45309, #d97706, #b45309)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 2px 8px rgba(180,83,9,0.3))',
            }}
          >
            Follow Our Journey
          </h3>
          <p className="text-lg" style={{ color: '#78350f', textShadow: '0 1px 3px rgba(255,255,255,0.6)' }}>
            Stay updated with daily animal content on our social media
          </p>
        </div>

        <div className="mb-8 max-w-2xl mx-auto">
          <div
            className="backdrop-blur-md rounded-2xl p-6 shadow-2xl border transition-all relative group overflow-hidden"
            style={{
              background: 'rgba(255,252,235,0.82)',
              border: '1px solid rgba(212,160,20,0.4)',
              boxShadow: '0 8px 40px rgba(180,120,10,0.18)',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 via-blue-600/3 to-sky-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-5">
                <div className="bg-gradient-to-br from-[#0077B5] to-[#005885] p-3 rounded-xl shadow-lg group-hover:scale-105 transition-transform duration-300">
                  <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect width="4" height="12" x="2" y="9" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-amber-900">LinkedIn</h4>
                  <p className="text-amber-700/80 text-sm">OneZoo Animals</p>
                </div>
              </div>
              <div className="rounded-xl overflow-hidden border border-amber-300/40">
                <iframe
                  src="https://www.linkedin.com/embed/feed/update/urn:li:share:7440055956765323264"
                  height="600"
                  width="100%"
                  frameBorder="0"
                  allowFullScreen
                  title="OneZoo LinkedIn Post"
                  style={{ border: 'none', background: '#fff' }}
                />
              </div>
              <a
                href="https://www.linkedin.com/company/onezooanimals/"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full mt-5 bg-gradient-to-r from-[#0077B5] to-[#005885] hover:from-[#0088cc] hover:to-[#0066a0] text-white font-bold py-3.5 px-6 rounded-xl transition-all text-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Follow on LinkedIn
              </a>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div
            className="backdrop-blur-md rounded-2xl p-6 shadow-2xl border transition-all relative group overflow-hidden"
            style={{
              background: 'rgba(255,252,235,0.82)',
              border: '1px solid rgba(212,160,20,0.4)',
              boxShadow: '0 8px 40px rgba(180,120,10,0.18)',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-600/0 via-amber-600/3 to-yellow-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-amber-600 via-orange-500 to-rose-500 p-3 rounded-xl shadow-lg group-hover:scale-105 transition-transform duration-300">
                <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </div>
              <div>
                <h4 className="text-2xl font-bold text-amber-900">Instagram</h4>
                <p className="text-amber-700/80 text-sm">@onezoozookeeper</p>
              </div>
            </div>

            <div className="space-y-4 mb-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-amber-600/50 scrollbar-track-amber-950/20">
              {instagramPosts.length > 0 ? (
                instagramPosts.map((post) => {
                  const embedUrl = getInstagramEmbedUrl(post.post_url);
                  if (!embedUrl) return null;

                  return (
                    <div key={post.id} className="bg-gradient-to-br from-amber-900/50 to-yellow-900/30 rounded-lg overflow-hidden border border-amber-700/30 hover:border-amber-600/50 transition-all">
                      <blockquote
                        className="instagram-media"
                        data-instgrm-permalink={post.post_url}
                        data-instgrm-version="14"
                        style={{
                          background: 'transparent',
                          border: '0',
                          borderRadius: '3px',
                          boxShadow: 'none',
                          margin: '0 auto',
                          maxWidth: '540px',
                          minWidth: '326px',
                          padding: '0',
                          width: '100%'
                        }}
                      >
                        <div style={{ padding: '16px' }}>
                          <a
                            href={post.post_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              background: 'transparent',
                              lineHeight: '0',
                              padding: '0',
                              textAlign: 'center',
                              textDecoration: 'none',
                              width: '100%',
                              display: 'block'
                            }}
                          >
                            View this post on Instagram
                          </a>
                        </div>
                      </blockquote>
                    </div>
                  );
                })
              ) : (
                <div className="bg-amber-50/80 rounded-lg p-8 border border-amber-300/50 text-center">
                  <div className="text-amber-900 text-lg font-semibold mb-3">
                    No Instagram Posts Yet
                  </div>
                  <div className="text-amber-800/70 text-sm mb-4 max-w-sm mx-auto">
                    Add Instagram posts through the admin panel. Go to Manage Feeds → Social Media tab and paste individual post URLs (like https://www.instagram.com/p/ABC123/).
                  </div>
                  <a
                    href="https://www.instagram.com/onezoozookeeper/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-amber-400 hover:text-amber-300 transition-colors font-medium"
                  >
                    Visit @onezoozookeeper →
                  </a>
                </div>
              )}
            </div>

            <a
              href="https://www.instagram.com/onezoozookeeper/"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-gradient-to-r from-amber-600 via-orange-500 to-rose-500 hover:from-amber-500 hover:via-orange-400 hover:to-rose-400 text-white font-bold py-3.5 px-6 rounded-xl transition-all text-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Follow on Instagram
            </a>
            </div>
          </div>

          <div
            className="backdrop-blur-md rounded-2xl p-6 shadow-2xl border transition-all relative group overflow-hidden"
            style={{
              background: 'rgba(255,252,235,0.82)',
              border: '1px solid rgba(212,160,20,0.4)',
              boxShadow: '0 8px 40px rgba(180,120,10,0.18)',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-600/0 via-amber-600/3 to-yellow-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-gray-900 to-black p-3 rounded-xl shadow-lg border border-amber-700/30 group-hover:scale-105 transition-transform duration-300">
                <svg
                  className="w-7 h-7"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"
                    fill="#FCD34D"
                  />
                </svg>
              </div>
              <div>
                <h4 className="text-2xl font-bold text-amber-900">TikTok</h4>
                <p className="text-amber-700/80 text-sm">@onezoozookeeper</p>
              </div>
            </div>

            <div className="space-y-4 mb-6 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-amber-600/50 scrollbar-track-amber-950/20">
              {tiktokPosts.length > 0 ? (
                tiktokPosts.map((post, index) => (
                  <div key={index} className="bg-gradient-to-br from-amber-900/50 to-yellow-900/40 rounded-xl overflow-hidden border border-amber-700/40 hover:border-amber-600/60 transition-all backdrop-blur-sm hover:shadow-xl hover:shadow-amber-900/20 group">
                    <div className="relative aspect-[9/16] max-h-[500px] overflow-hidden bg-black">
                      {playingVideo === index ? (
                        <video
                          className="w-full h-full object-cover"
                          poster={post.thumbnail}
                          controls
                          loop
                          playsInline
                          autoPlay
                          preload="metadata"
                        >
                          <source src={post.video} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        <div
                          className="w-full h-full relative cursor-pointer"
                          onClick={() => setPlayingVideo(index)}
                        >
                          <img
                            src={post.thumbnail}
                            alt={post.caption}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/10 transition-colors">
                            <div className="w-16 h-16 rounded-full bg-black/60 border-2 border-amber-400/80 flex items-center justify-center shadow-xl">
                              <Play size={28} className="text-amber-300 ml-1" />
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex items-end pointer-events-none" style={{ display: playingVideo === index ? 'flex' : 'none' }}>
                        <div className="p-4 w-full pointer-events-auto">
                          <p className="text-amber-50 font-medium text-sm mb-2 leading-relaxed">{post.caption}</p>
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-3 text-amber-200/80">
                              <span className="flex items-center gap-1">
                                <Heart size={16} className="text-amber-400" />
                                {post.likes}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageCircle size={16} />
                                {post.views}
                              </span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(post.video, `onezoo-video-${index + 1}.mp4`);
                              }}
                              className="flex items-center gap-1 bg-amber-600/80 hover:bg-amber-500 text-white px-3 py-1.5 rounded-lg transition-colors shadow-lg"
                              title="Download video"
                            >
                              <Download size={14} />
                              <span className="text-xs font-medium">Download</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="absolute top-4 left-4 pointer-events-none">
                        <img
                          src="/screenshot_2026-02-04_125032.png"
                          alt="OneZoo"
                          className="w-10 h-10 rounded-full object-cover border-2 border-amber-400/70 shadow-lg"
                        />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-amber-50/80 rounded-lg p-8 border border-amber-300/50 text-center">
                  <div className="text-amber-900 text-lg font-semibold mb-3">
                    No TikTok Videos Yet
                  </div>
                  <div className="text-amber-800/70 text-sm mb-4 max-w-sm mx-auto">
                    Add TikTok videos through the admin panel. Go to Manage Feeds → Social Media tab and upload videos with their TikTok URLs.
                  </div>
                  <a
                    href="https://www.tiktok.com/@onezoozookeeper"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-amber-400 hover:text-amber-300 transition-colors font-medium"
                  >
                    Visit @onezoozookeeper →
                  </a>
                </div>
              )}
            </div>

            <a
              href="https://www.tiktok.com/@onezoozookeeper"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-gradient-to-r from-gray-900 to-black hover:from-gray-800 hover:to-gray-900 text-amber-100 font-bold py-3.5 px-6 rounded-xl transition-all text-center shadow-lg hover:shadow-xl border border-amber-700/30 transform hover:-translate-y-0.5"
            >
              Follow on TikTok
            </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
