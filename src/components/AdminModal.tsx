import { useState, useEffect, useRef } from 'react';
import { X, Plus, CreditCard as Edit2, Trash2, Instagram, Download, Upload, Youtube, FileVideo, Link, Eye, EyeOff } from 'lucide-react';
import { supabase, supabaseAdmin } from '../lib/supabase';
import { isYouTubeUrl, getYouTubeThumbnail, getYouTubeVideoId } from '../lib/videoUtils';
import { SocialMediaPost } from '../lib/socialMediaUtils';
import { AdminPromoTab } from './AdminPromoTab';
import { AdminFeaturesTab } from './AdminFeaturesTab';
import { AdminSlideshowTab } from './AdminSlideshowTab';
import { AdminAudioTab } from './AdminAudioTab';
import { AdminVoicesTab } from './AdminVoicesTab';
import { AdminShortsTab } from './AdminShortsTab';
import type { AnimalFeed, AnimalCategory, BlogPost } from '../lib/database.types';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: AnimalCategory[];
  onFeedAdded: () => void;
}

export function AdminModal({ isOpen, onClose, categories, onFeedAdded }: AdminModalProps) {
  const [activeTab, setActiveTab] = useState<'feeds' | 'social' | 'blog' | 'promos' | 'features' | 'slideshow' | 'audio' | 'voices' | 'shorts'>('feeds');
  const [feeds, setFeeds] = useState<AnimalFeed[]>([]);
  const [editingFeed, setEditingFeed] = useState<AnimalFeed | null>(null);
  const [categoryInput, setCategoryInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    video_url: '',
    thumbnail_url: '',
    category_id: '',
    feed_type: 'looped' as 'live' | 'looped',
  });
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [videoSource, setVideoSource] = useState<'url' | 'file'>('url');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [thumbnailSource, setThumbnailSource] = useState<'url' | 'file'>('url');
  const [selectedThumbnailFile, setSelectedThumbnailFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailFileInputRef = useRef<HTMLInputElement>(null);

  const [socialPosts, setSocialPosts] = useState<SocialMediaPost[]>([]);
  const [editingSocialPost, setEditingSocialPost] = useState<SocialMediaPost | null>(null);
  const [socialFormData, setSocialFormData] = useState({
    platform: 'instagram' as 'instagram' | 'tiktok' | 'youtube',
    post_url: '',
    video_url: '',
    thumbnail_url: '',
  });
  const [socialLoading, setSocialLoading] = useState(false);

  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [editingBlogPost, setEditingBlogPost] = useState<BlogPost | null>(null);
  const [blogFormData, setBlogFormData] = useState({
    title: '',
    body: '',
    image_url: '',
    author_name: 'OneZoo Team',
    is_published: false,
  });
  const [blogLoading, setBlogLoading] = useState(false);
  const [blogImageSource, setBlogImageSource] = useState<'url' | 'file'>('url');
  const [selectedBlogImage, setSelectedBlogImage] = useState<File | null>(null);
  const blogImageRef = useRef<HTMLInputElement>(null);
  const [blogUnlocked, setBlogUnlocked] = useState(false);
  const [blogPasswordInput, setBlogPasswordInput] = useState('');
  const [blogPasswordError, setBlogPasswordError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadFeeds();
      loadSocialPosts();
      loadBlogPosts();
    }
  }, [isOpen]);

  useEffect(() => {
    if (formData.video_url && isYouTubeUrl(formData.video_url) && !formData.thumbnail_url) {
      const thumbnail = getYouTubeThumbnail(formData.video_url);
      if (thumbnail) {
        setFormData(prev => ({ ...prev, thumbnail_url: thumbnail }));
      }
    }
  }, [formData.video_url]);

  async function loadFeeds() {
    const { data } = await supabase
      .from('animal_feeds')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setFeeds(data);
  }

  async function loadSocialPosts() {
    const { data } = await supabase
      .from('social_media_posts')
      .select('*')
      .order('display_order', { ascending: true });
    if (data) setSocialPosts(data);
  }

  async function downloadAndUploadVideo(videoUrl: string): Promise<string | null> {
    try {
      setUploadProgress('Downloading video...');

      const response = await fetch(videoUrl);
      if (!response.ok) throw new Error('Failed to download video');

      const blob = await response.blob();
      const fileExtension = blob.type.split('/')[1] || 'mp4';
      const fileName = `video-${Date.now()}.${fileExtension}`;

      setUploadProgress('Uploading to storage...');

      const { data, error } = await supabase.storage
        .from('videos')
        .upload(fileName, blob, {
          contentType: blob.type,
          cacheControl: '3600',
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(data.path);

      setUploadProgress(null);
      return publicUrl;
    } catch (error) {
      console.error('Error downloading/uploading video:', error);
      setUploadProgress(null);
      alert('Failed to download and upload video. Please check the URL and try again.');
      return null;
    }
  }

  async function uploadLocalFile(file: File): Promise<string | null> {
    try {
      setUploadProgress('Uploading video...');
      const ext = file.name.split('.').pop() || 'mp4';
      const fileName = `video-${Date.now()}.${ext}`;

      const { data, error } = await supabase.storage
        .from('videos')
        .upload(fileName, file, {
          contentType: file.type,
          cacheControl: '3600',
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(data.path);

      setUploadProgress(null);
      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadProgress(null);
      alert('Failed to upload video. Please try again.');
      return null;
    }
  }

  async function uploadThumbnailFile(file: File): Promise<string | null> {
    try {
      setUploadProgress('Uploading thumbnail...');
      const ext = file.name.split('.').pop() || 'jpg';
      const fileName = `thumbnail-${Date.now()}.${ext}`;

      const { data, error } = await supabase.storage
        .from('videos')
        .upload(fileName, file, {
          contentType: file.type,
          cacheControl: '3600',
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(data.path);

      setUploadProgress(null);
      return publicUrl;
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
      setUploadProgress(null);
      alert('Failed to upload thumbnail. Please try again.');
      return null;
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const trimmedCategory = categoryInput.trim();
      if (!trimmedCategory) {
        alert('Please enter a category name.');
        setLoading(false);
        return;
      }

      let resolvedCategoryId = formData.category_id;
      const existing = categories.find(c => c.name.toLowerCase() === trimmedCategory.toLowerCase());
      if (existing) {
        resolvedCategoryId = existing.id;
      } else {
        const { data: newCat, error: catError } = await supabaseAdmin
          .from('animal_categories')
          .insert({ name: trimmedCategory, description: '', icon: '🐾' })
          .select()
          .single();
        if (catError) throw catError;
        resolvedCategoryId = newCat.id;
        onFeedAdded();
      }

      let videoUrl = formData.video_url;

      if (videoSource === 'file' && selectedFile) {
        const uploadedUrl = await uploadLocalFile(selectedFile);
        if (!uploadedUrl) {
          setLoading(false);
          return;
        }
        videoUrl = uploadedUrl;
      }

      let thumbnailUrl = formData.thumbnail_url;

      if (thumbnailSource === 'file' && selectedThumbnailFile) {
        const uploadedUrl = await uploadThumbnailFile(selectedThumbnailFile);
        if (!uploadedUrl) {
          setLoading(false);
          return;
        }
        thumbnailUrl = uploadedUrl;
      }

      if (!videoUrl) {
        alert('Please provide a video URL or upload a video file before saving.');
        setLoading(false);
        return;
      }

      const feedData = {
        ...formData,
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        category_id: resolvedCategoryId,
        is_active: true,
      };

      if (editingFeed) {
        const { error } = await supabaseAdmin
          .from('animal_feeds')
          .update({
            ...feedData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingFeed.id);

        if (error) throw error;
      } else {
        const { error } = await supabaseAdmin
          .from('animal_feeds')
          .insert([feedData]);

        if (error) throw error;
      }

      resetForm();
      await loadFeeds();
      onFeedAdded();
      setUploadProgress(editingFeed ? 'Feed updated! It now appears on the homepage.' : 'Feed added! It now appears on the homepage.');
      setTimeout(() => setUploadProgress(null), 3500);
    } catch (error: unknown) {
      console.error('Error saving feed:', error);
      const msg = error instanceof Error ? error.message : (error as { message?: string })?.message ?? String(error);
      alert(`Error saving feed: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (feed: AnimalFeed) => {
    setEditingFeed(feed);
    const cat = categories.find(c => c.id === feed.category_id);
    setCategoryInput(cat ? cat.name : '');
    setFormData({
      title: feed.title,
      description: feed.description,
      video_url: feed.video_url,
      thumbnail_url: feed.thumbnail_url,
      category_id: feed.category_id,
      feed_type: feed.feed_type,
    });
    setVideoSource('url');
    setSelectedFile(null);
    setThumbnailSource('url');
    setSelectedThumbnailFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (thumbnailFileInputRef.current) thumbnailFileInputRef.current.value = '';
  };

  const handleDelete = async (feedId: string) => {
    if (!confirm('Are you sure you want to delete this feed?')) return;

    try {
      const { error } = await supabaseAdmin
        .from('animal_feeds')
        .delete()
        .eq('id', feedId);

      if (error) throw error;

      loadFeeds();
      onFeedAdded();
    } catch (error) {
      console.error('Error deleting feed:', error);
      alert('Error deleting feed. Please try again.');
    }
  };

  const resetForm = () => {
    setEditingFeed(null);
    setCategoryInput('');
    setFormData({
      title: '',
      description: '',
      video_url: '',
      thumbnail_url: '',
      category_id: '',
      feed_type: 'looped',
    });
    setVideoSource('url');
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setThumbnailSource('url');
    setSelectedThumbnailFile(null);
    if (thumbnailFileInputRef.current) thumbnailFileInputRef.current.value = '';
  };

  const handleSocialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSocialLoading(true);

    try {
      if (socialFormData.platform === 'instagram' && !socialFormData.post_url.includes('/p/')) {
        alert('Please enter a valid Instagram post URL. It should look like:\nhttps://www.instagram.com/p/ABC123/\n\nProfile URLs (like /onezoozookeeper/) will not work.');
        setSocialLoading(false);
        return;
      }

      if (socialFormData.platform === 'youtube') {
        const id = getYouTubeVideoId(socialFormData.post_url);
        if (!id) {
          alert('Please enter a valid YouTube Shorts URL. It should look like:\nhttps://www.youtube.com/shorts/VIDEO_ID\n\nRegular watch URLs (youtube.com/watch?v=...) also work.');
          setSocialLoading(false);
          return;
        }
      }

      let postData = { ...socialFormData };

      if (socialFormData.platform === 'tiktok') {
        setUploadProgress('Downloading TikTok video...');

        try {
          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/download-tiktok-video`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ tiktokUrl: socialFormData.post_url }),
            }
          );

          if (!response.ok) {
            throw new Error('Failed to download TikTok video');
          }

          const result = await response.json();

          if (result.error) {
            throw new Error(result.error);
          }

          postData.video_url = result.videoUrl;
          if (result.thumbnailUrl && !postData.thumbnail_url) {
            postData.thumbnail_url = result.thumbnailUrl;
          }
        } catch (error) {
          console.error('Error processing TikTok video:', error);
          alert('Failed to download and upload video. Please check the URL and try again.');
          setUploadProgress(null);
          setSocialLoading(false);
          return;
        }

        setUploadProgress(null);
      }

      if (editingSocialPost) {
        const { error } = await supabaseAdmin
          .from('social_media_posts')
          .update(postData)
          .eq('id', editingSocialPost.id);

        if (error) throw error;
      } else {
        const { error } = await supabaseAdmin
          .from('social_media_posts')
          .insert([postData]);

        if (error) throw error;
      }

      resetSocialForm();
      loadSocialPosts();
    } catch (error) {
      console.error('Error saving social post:', error);
      alert('Error saving social media post. Please try again.');
    } finally {
      setSocialLoading(false);
    }
  };

  const handleSocialEdit = (post: SocialMediaPost) => {
    setEditingSocialPost(post);
    setSocialFormData({
      platform: post.platform,
      post_url: post.post_url,
      video_url: post.video_url || '',
      thumbnail_url: post.thumbnail_url || '',
    });
  };

  const handleSocialDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this social media post?')) return;

    try {
      const { error } = await supabaseAdmin
        .from('social_media_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      loadSocialPosts();
    } catch (error) {
      console.error('Error deleting social post:', error);
      alert('Error deleting social media post. Please try again.');
    }
  };

  const resetSocialForm = () => {
    setEditingSocialPost(null);
    setSocialFormData({
      platform: 'instagram',
      post_url: '',
      video_url: '',
      thumbnail_url: '',
    });
    setUploadProgress(null);
  };

  async function loadBlogPosts() {
    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setBlogPosts(data);
  }

  async function uploadBlogImage(file: File): Promise<string | null> {
    try {
      setUploadProgress('Uploading image...');
      const ext = file.name.split('.').pop() || 'jpg';
      const fileName = `blog-${Date.now()}.${ext}`;
      const { data, error } = await supabase.storage
        .from('videos')
        .upload(fileName, file, { contentType: file.type, cacheControl: '3600' });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('videos').getPublicUrl(data.path);
      setUploadProgress(null);
      return publicUrl;
    } catch (error) {
      console.error('Error uploading blog image:', error);
      setUploadProgress(null);
      alert('Failed to upload image. Please try again.');
      return null;
    }
  }

  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBlogLoading(true);
    try {
      let imageUrl = blogFormData.image_url;
      if (blogImageSource === 'file' && selectedBlogImage) {
        const uploaded = await uploadBlogImage(selectedBlogImage);
        if (!uploaded) { setBlogLoading(false); return; }
        imageUrl = uploaded;
      }
      const payload = { ...blogFormData, image_url: imageUrl };
      if (editingBlogPost) {
        const { error } = await supabaseAdmin.from('blog_posts').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', editingBlogPost.id);
        if (error) throw error;
      } else {
        const { error } = await supabaseAdmin.from('blog_posts').insert([payload]);
        if (error) throw error;
      }
      resetBlogForm();
      loadBlogPosts();
    } catch (error) {
      console.error('Error saving blog post:', error);
      alert('Error saving blog post. Please try again.');
    } finally {
      setBlogLoading(false);
    }
  };

  const handleBlogEdit = (post: BlogPost) => {
    setEditingBlogPost(post);
    setBlogFormData({
      title: post.title,
      body: post.body,
      image_url: post.image_url,
      author_name: post.author_name,
      is_published: post.is_published,
    });
    setBlogImageSource('url');
    setSelectedBlogImage(null);
    if (blogImageRef.current) blogImageRef.current.value = '';
  };

  const handleBlogDelete = async (id: string) => {
    if (!confirm('Delete this blog post?')) return;
    try {
      const { error } = await supabaseAdmin.from('blog_posts').delete().eq('id', id);
      if (error) throw error;
      loadBlogPosts();
    } catch (error) {
      console.error('Error deleting blog post:', error);
      alert('Error deleting blog post.');
    }
  };

  const toggleBlogPublish = async (post: BlogPost) => {
    try {
      const { error } = await supabaseAdmin.from('blog_posts').update({ is_published: !post.is_published, updated_at: new Date().toISOString() }).eq('id', post.id);
      if (error) throw error;
      loadBlogPosts();
    } catch (error) {
      console.error('Error toggling publish:', error);
    }
  };

  const resetBlogForm = () => {
    setEditingBlogPost(null);
    setBlogFormData({ title: '', body: '', image_url: '', author_name: 'OneZoo Team', is_published: false });
    setBlogImageSource('url');
    setSelectedBlogImage(null);
    if (blogImageRef.current) blogImageRef.current.value = '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">Admin Dashboard</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex border-b border-slate-700 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {(['feeds', 'social', 'blog', 'shorts', 'promos', 'features', 'slideshow', 'audio', 'voices'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`shrink-0 px-5 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'text-emerald-400 border-b-2 border-emerald-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'feeds' ? 'Feeds' : tab === 'social' ? 'Social' : tab === 'blog' ? 'Blog' : tab === 'shorts' ? 'Shorts' : tab === 'promos' ? 'Promos' : tab === 'features' ? 'Features' : tab === 'slideshow' ? 'Slideshow' : tab === 'audio' ? 'Audio' : 'Voices'}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'feeds' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  {editingFeed ? 'Edit Feed' : 'Add New Feed'}
                </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g., Lion Pride Live Cam"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Description
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Brief description of the feed"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Video Source
                  </label>
                  <div className="flex rounded-lg overflow-hidden border border-slate-600 mb-3">
                    <button
                      type="button"
                      onClick={() => { setVideoSource('url'); setSelectedFile(null); }}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium transition-colors ${
                        videoSource === 'url'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-700 text-slate-400 hover:text-white hover:bg-slate-600'
                      }`}
                    >
                      <Link size={15} />
                      Paste URL
                    </button>
                    <button
                      type="button"
                      onClick={() => { setVideoSource('file'); }}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium transition-colors ${
                        videoSource === 'file'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-700 text-slate-400 hover:text-white hover:bg-slate-600'
                      }`}
                    >
                      <Upload size={15} />
                      Upload File
                    </button>
                  </div>

                  {videoSource === 'url' ? (
                    <div>
                      <div className="relative flex items-center">
                        {formData.video_url && isYouTubeUrl(formData.video_url)
                          ? <Youtube size={16} className="absolute left-3 text-red-400 pointer-events-none" />
                          : <FileVideo size={16} className="absolute left-3 text-slate-400 pointer-events-none" />
                        }
                        <input
                          type="url"
                          required={videoSource === 'url'}
                          value={formData.video_url}
                          onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                          className="w-full pl-9 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="https://youtube.com/watch?v=... or https://example.com/video.mp4"
                        />
                      </div>
                      {formData.video_url && (
                        <p className="text-xs text-slate-400 mt-1">
                          {isYouTubeUrl(formData.video_url)
                            ? '✓ YouTube video — will embed directly'
                            : '✓ Direct video link — will be downloaded and hosted'}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`w-full border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                          selectedFile
                            ? 'border-emerald-500 bg-emerald-900/20'
                            : 'border-slate-600 hover:border-emerald-500/50 hover:bg-slate-700/50'
                        }`}
                      >
                        {selectedFile ? (
                          <div className="flex flex-col items-center gap-2">
                            <FileVideo size={28} className="text-emerald-400" />
                            <p className="text-emerald-300 font-medium text-sm truncate max-w-full px-2">{selectedFile.name}</p>
                            <p className="text-slate-400 text-xs">{(selectedFile.size / 1024 / 1024).toFixed(1)} MB</p>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                              className="text-xs text-red-400 hover:text-red-300 mt-1"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <Upload size={28} className="text-slate-400" />
                            <p className="text-slate-300 text-sm font-medium">Click to choose a video file</p>
                            <p className="text-slate-500 text-xs">MP4, MOV, WebM, AVI supported</p>
                          </div>
                        )}
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/mp4,video/quicktime,video/webm,video/x-msvideo,video/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0] ?? null;
                          setSelectedFile(file);
                        }}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Thumbnail (optional for YouTube)
                  </label>
                  <div className="flex rounded-lg overflow-hidden border border-slate-600 mb-3">
                    <button
                      type="button"
                      onClick={() => { setThumbnailSource('url'); setSelectedThumbnailFile(null); }}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium transition-colors ${
                        thumbnailSource === 'url'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-700 text-slate-400 hover:text-white hover:bg-slate-600'
                      }`}
                    >
                      <Link size={15} />
                      Paste URL
                    </button>
                    <button
                      type="button"
                      onClick={() => { setThumbnailSource('file'); }}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium transition-colors ${
                        thumbnailSource === 'file'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-700 text-slate-400 hover:text-white hover:bg-slate-600'
                      }`}
                    >
                      <Upload size={15} />
                      Upload File
                    </button>
                  </div>

                  {thumbnailSource === 'url' ? (
                    <input
                      type="url"
                      value={formData.thumbnail_url}
                      onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="https://images.pexels.com/..."
                    />
                  ) : (
                    <div>
                      <div
                        onClick={() => thumbnailFileInputRef.current?.click()}
                        className={`w-full border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                          selectedThumbnailFile
                            ? 'border-emerald-500 bg-emerald-900/20'
                            : 'border-slate-600 hover:border-emerald-500/50 hover:bg-slate-700/50'
                        }`}
                      >
                        {selectedThumbnailFile ? (
                          <div className="flex flex-col items-center gap-2">
                            {selectedThumbnailFile.type.startsWith('image/') && (
                              <img
                                src={URL.createObjectURL(selectedThumbnailFile)}
                                alt="Thumbnail preview"
                                className="h-20 w-auto rounded object-cover"
                              />
                            )}
                            <p className="text-emerald-300 font-medium text-sm truncate max-w-full px-2">{selectedThumbnailFile.name}</p>
                            <p className="text-slate-400 text-xs">{(selectedThumbnailFile.size / 1024).toFixed(0)} KB</p>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setSelectedThumbnailFile(null); if (thumbnailFileInputRef.current) thumbnailFileInputRef.current.value = ''; }}
                              className="text-xs text-red-400 hover:text-red-300 mt-1"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <Upload size={22} className="text-slate-400" />
                            <p className="text-slate-300 text-sm font-medium">Click to choose an image</p>
                            <p className="text-slate-500 text-xs">JPG, PNG, WebP, GIF supported</p>
                          </div>
                        )}
                      </div>
                      <input
                        ref={thumbnailFileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif,image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0] ?? null;
                          setSelectedThumbnailFile(file);
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    required
                    value={categoryInput}
                    onChange={(e) => {
                      setCategoryInput(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                    placeholder="e.g., Big Cats, Birds, Marine Life..."
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  {showSuggestions && categoryInput.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-slate-700 border border-slate-600 rounded-lg shadow-xl overflow-hidden">
                      {categories
                        .filter(c => c.name.toLowerCase().includes(categoryInput.toLowerCase()))
                        .map(cat => (
                          <button
                            key={cat.id}
                            type="button"
                            onMouseDown={() => {
                              setCategoryInput(cat.name);
                              setFormData(f => ({ ...f, category_id: cat.id }));
                              setShowSuggestions(false);
                            }}
                            className="w-full text-left px-4 py-2 text-white hover:bg-slate-600 transition-colors text-sm"
                          >
                            {cat.name}
                          </button>
                        ))
                      }
                      {!categories.some(c => c.name.toLowerCase() === categoryInput.toLowerCase()) && (
                        <div className="px-4 py-2 text-emerald-400 text-xs italic border-t border-slate-600">
                          New category "{categoryInput}" will be created
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Feed Type
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="live"
                        checked={formData.feed_type === 'live'}
                        onChange={(e) => setFormData({ ...formData, feed_type: e.target.value as 'live' | 'looped' })}
                        className="text-emerald-500 focus:ring-emerald-500"
                      />
                      <span className="text-slate-300">Live Feed</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="looped"
                        checked={formData.feed_type === 'looped'}
                        onChange={(e) => setFormData({ ...formData, feed_type: e.target.value as 'live' | 'looped' })}
                        className="text-emerald-500 focus:ring-emerald-500"
                      />
                      <span className="text-slate-300">Looped Video</span>
                    </label>
                  </div>
                </div>

                {uploadProgress && (
                  <div className="bg-blue-600/20 border border-blue-600/30 rounded-lg p-3 flex items-center gap-2">
                    <Download size={18} className="text-blue-400 animate-pulse" />
                    <span className="text-blue-300 text-sm">{uploadProgress}</span>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {editingFeed ? <Edit2 size={18} /> : <Plus size={18} />}
                    {loading ? 'Saving...' : editingFeed ? 'Update Feed' : 'Add Feed'}
                  </button>
                  {editingFeed && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Existing Feeds</h3>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {feeds.map((feed) => (
                  <div
                    key={feed.id}
                    className="bg-slate-700 rounded-lg p-4 flex items-start justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white truncate">{feed.title}</h4>
                      <p className="text-sm text-slate-400 truncate">{feed.description}</p>
                      <div className="flex gap-2 mt-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          feed.feed_type === 'live'
                            ? 'bg-red-600/20 text-red-400'
                            : 'bg-blue-600/20 text-blue-400'
                        }`}>
                          {feed.feed_type}
                        </span>
                        <span className="text-xs text-slate-500">
                          {isYouTubeUrl(feed.video_url) ? 'YouTube' : 'Video'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(feed)}
                        className="text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(feed.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          )}

          {activeTab === 'social' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  {editingSocialPost ? 'Edit Social Post' : 'Add Social Media Post'}
                </h3>
                <form onSubmit={handleSocialSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Platform
                    </label>
                    <select
                      value={socialFormData.platform}
                      onChange={(e) => setSocialFormData({ ...socialFormData, platform: e.target.value as 'instagram' | 'tiktok' | 'youtube' })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="instagram">Instagram</option>
                      <option value="tiktok">TikTok</option>
                      <option value="youtube">YouTube Shorts</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Post URL
                    </label>
                    <input
                      type="url"
                      required
                      value={socialFormData.post_url}
                      onChange={(e) => setSocialFormData({ ...socialFormData, post_url: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder={
                        socialFormData.platform === 'instagram'
                          ? 'https://www.instagram.com/p/ABC123...'
                          : socialFormData.platform === 'youtube'
                          ? 'https://www.youtube.com/shorts/VIDEO_ID'
                          : 'https://www.tiktok.com/@username/video/123...'
                      }
                    />
                    <p className="text-xs text-slate-400 mt-2">
                      {socialFormData.platform === 'instagram'
                        ? 'Must be a SINGLE POST URL (with /p/ in it), NOT a profile URL. Example: https://www.instagram.com/p/ABC123/'
                        : socialFormData.platform === 'youtube'
                        ? 'Paste a YouTube Shorts URL. The short will auto-play and cycle in the "From Our Shorts" section on the homepage.'
                        : 'Paste the full URL to a TikTok video (e.g., https://www.tiktok.com/@username/video/1234567890)'}
                    </p>
                    {socialFormData.platform === 'instagram' && (
                      <div className="bg-amber-900/20 border border-amber-600/30 rounded px-3 py-2 mt-2">
                        <p className="text-xs text-amber-300/90">
                          <strong>How to get a post URL:</strong>
                          <br />
                          1. Open Instagram and find the post you want to embed
                          <br />
                          2. Click the three dots (...) on the post
                          <br />
                          3. Click "Copy link"
                          <br />
                          4. Paste it here
                        </p>
                      </div>
                    )}
                  </div>

                  {socialFormData.platform === 'instagram' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Thumbnail Image URL (for Reels marquee)
                      </label>
                      <input
                        type="url"
                        value={socialFormData.thumbnail_url}
                        onChange={(e) => setSocialFormData({ ...socialFormData, thumbnail_url: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="https://images.pexels.com/... or upload URL"
                      />
                      <p className="text-xs text-slate-400 mt-1">
                        This image appears in the "From Our Reels" scrolling marquee on the homepage. If left empty, the post won't appear in the marquee.
                      </p>
                    </div>
                  )}

                  {socialFormData.platform === 'tiktok' && (
                    <div className="bg-blue-900/20 border border-blue-600/30 rounded px-3 py-2">
                      <p className="text-xs text-blue-300/90">
                        <strong>How it works:</strong>
                        <br />
                        Just paste the TikTok post URL above. The video will be automatically downloaded and hosted on our platform. No need to provide direct video links!
                      </p>
                    </div>
                  )}

                  {uploadProgress && (
                    <div className="bg-blue-600/20 border border-blue-600/30 rounded-lg p-3 flex items-center gap-2">
                      <Download size={18} className="text-blue-400 animate-pulse" />
                      <span className="text-blue-300 text-sm">{uploadProgress}</span>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={socialLoading}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {editingSocialPost ? <Edit2 size={18} /> : <Plus size={18} />}
                      {socialLoading ? 'Saving...' : editingSocialPost ? 'Update Post' : 'Add Post'}
                    </button>
                    {editingSocialPost && (
                      <button
                        type="button"
                        onClick={resetSocialForm}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Active Social Posts</h3>
                <div className="space-y-3">
                  {socialPosts.map((post) => (
                    <div
                      key={post.id}
                      className="bg-slate-700 rounded-lg p-4 flex items-start justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {post.platform === 'instagram' ? (
                            <Instagram size={18} className="text-pink-400" />
                          ) : post.platform === 'youtube' ? (
                            <Youtube size={18} className="text-red-500" />
                          ) : (
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                              <path
                                d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"
                                fill="#00F2EA"
                              />
                            </svg>
                          )}
                          <span className="font-semibold text-white capitalize">{post.platform}</span>
                        </div>
                        <p className="text-sm text-slate-400 truncate">{post.post_url}</p>
                        <span className={`text-xs px-2 py-1 rounded mt-2 inline-block ${
                          post.is_active ? 'bg-green-600/20 text-green-400' : 'bg-gray-600/20 text-gray-400'
                        }`}>
                          {post.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSocialEdit(post)}
                          className="text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleSocialDelete(post.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {socialPosts.length === 0 && (
                    <div className="text-center text-slate-400 py-8">
                      No social media posts configured yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'promos' && <AdminPromoTab />}

          {activeTab === 'features' && <AdminFeaturesTab />}

          {activeTab === 'slideshow' && <AdminSlideshowTab />}

          {activeTab === 'audio' && <AdminAudioTab />}

          {activeTab === 'voices' && <AdminVoicesTab />}

          {activeTab === 'shorts' && <AdminShortsTab />}

          {activeTab === 'blog' && !blogUnlocked && (
            <div className="max-w-md mx-auto py-12">
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-8">
                <h3 className="text-xl font-bold text-white mb-2">Blog Access Locked</h3>
                <p className="text-slate-400 text-sm mb-6">Enter the password to manage blog posts.</p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (blogPasswordInput === 'onezoo') {
                      setBlogUnlocked(true);
                      setBlogPasswordError(false);
                      setBlogPasswordInput('');
                    } else {
                      setBlogPasswordError(true);
                    }
                  }}
                  className="space-y-4"
                >
                  <input
                    type="password"
                    value={blogPasswordInput}
                    onChange={(e) => {
                      setBlogPasswordInput(e.target.value);
                      setBlogPasswordError(false);
                    }}
                    placeholder="Password"
                    autoFocus
                    className={`w-full px-4 py-3 bg-slate-700 border rounded-lg text-white focus:outline-none focus:ring-2 ${
                      blogPasswordError
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-slate-600 focus:ring-emerald-500'
                    }`}
                  />
                  {blogPasswordError && (
                    <p className="text-sm text-red-400">Incorrect password. Try again.</p>
                  )}
                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-lg transition-colors"
                  >
                    Unlock
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'blog' && blogUnlocked && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  {editingBlogPost ? 'Edit Blog Post' : 'New Blog Post'}
                </h3>
                <form onSubmit={handleBlogSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
                    <input
                      type="text"
                      required
                      value={blogFormData.title}
                      onChange={(e) => setBlogFormData({ ...blogFormData, title: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="e.g., Meet Our New Tiger Cubs!"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Body</label>
                    <textarea
                      required
                      value={blogFormData.body}
                      onChange={(e) => setBlogFormData({ ...blogFormData, body: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Write your blog post content here..."
                      rows={8}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Cover Image</label>
                    <div className="flex rounded-lg overflow-hidden border border-slate-600 mb-3">
                      <button
                        type="button"
                        onClick={() => { setBlogImageSource('url'); setSelectedBlogImage(null); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium transition-colors ${
                          blogImageSource === 'url' ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-400 hover:text-white hover:bg-slate-600'
                        }`}
                      >
                        <Link size={15} /> Paste URL
                      </button>
                      <button
                        type="button"
                        onClick={() => setBlogImageSource('file')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium transition-colors ${
                          blogImageSource === 'file' ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-400 hover:text-white hover:bg-slate-600'
                        }`}
                      >
                        <Upload size={15} /> Upload
                      </button>
                    </div>

                    {blogImageSource === 'url' ? (
                      <input
                        type="url"
                        value={blogFormData.image_url}
                        onChange={(e) => setBlogFormData({ ...blogFormData, image_url: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="https://images.pexels.com/..."
                      />
                    ) : (
                      <div>
                        <div
                          onClick={() => blogImageRef.current?.click()}
                          className={`w-full border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                            selectedBlogImage ? 'border-emerald-500 bg-emerald-900/20' : 'border-slate-600 hover:border-emerald-500/50 hover:bg-slate-700/50'
                          }`}
                        >
                          {selectedBlogImage ? (
                            <div className="flex flex-col items-center gap-2">
                              {selectedBlogImage.type.startsWith('image/') && (
                                <img src={URL.createObjectURL(selectedBlogImage)} alt="Preview" className="h-20 w-auto rounded object-cover" />
                              )}
                              <p className="text-emerald-300 font-medium text-sm truncate max-w-full px-2">{selectedBlogImage.name}</p>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setSelectedBlogImage(null); if (blogImageRef.current) blogImageRef.current.value = ''; }}
                                className="text-xs text-red-400 hover:text-red-300 mt-1"
                              >
                                Remove
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-2">
                              <Upload size={22} className="text-slate-400" />
                              <p className="text-slate-300 text-sm font-medium">Click to choose an image</p>
                              <p className="text-slate-500 text-xs">JPG, PNG, WebP, GIF</p>
                            </div>
                          )}
                        </div>
                        <input
                          ref={blogImageRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif,image/*"
                          className="hidden"
                          onChange={(e) => setSelectedBlogImage(e.target.files?.[0] ?? null)}
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Author</label>
                    <input
                      type="text"
                      value={blogFormData.author_name}
                      onChange={(e) => setBlogFormData({ ...blogFormData, author_name: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={blogFormData.is_published}
                      onChange={(e) => setBlogFormData({ ...blogFormData, is_published: e.target.checked })}
                      className="w-4 h-4 text-emerald-500 rounded focus:ring-emerald-500 bg-slate-700 border-slate-600"
                    />
                    <span className="text-sm text-slate-300">Publish immediately</span>
                  </label>

                  {uploadProgress && (
                    <div className="bg-blue-600/20 border border-blue-600/30 rounded-lg p-3 flex items-center gap-2">
                      <Download size={18} className="text-blue-400 animate-pulse" />
                      <span className="text-blue-300 text-sm">{uploadProgress}</span>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={blogLoading}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {editingBlogPost ? <Edit2 size={18} /> : <Plus size={18} />}
                      {blogLoading ? 'Saving...' : editingBlogPost ? 'Update Post' : 'Create Post'}
                    </button>
                    {editingBlogPost && (
                      <button type="button" onClick={resetBlogForm} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-4">All Blog Posts</h3>
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {blogPosts.map((post) => (
                    <div key={post.id} className="bg-slate-700 rounded-lg p-4 flex items-start justify-between gap-3">
                      <div className="flex gap-3 flex-1 min-w-0">
                        {post.image_url && (
                          <img src={post.image_url} alt="" className="w-16 h-12 rounded object-cover shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-white truncate">{post.title}</h4>
                          <p className="text-sm text-slate-400 truncate">{post.body.slice(0, 80)}</p>
                          <div className="flex gap-2 mt-2">
                            <span className={`text-xs px-2 py-1 rounded ${post.is_published ? 'bg-green-600/20 text-green-400' : 'bg-yellow-600/20 text-yellow-400'}`}>
                              {post.is_published ? 'Published' : 'Draft'}
                            </span>
                            <span className="text-xs text-slate-500">{post.author_name}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => toggleBlogPublish(post)} className="text-amber-400 hover:text-amber-300 transition-colors" title={post.is_published ? 'Unpublish' : 'Publish'}>
                          {post.is_published ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        <button onClick={() => handleBlogEdit(post)} className="text-emerald-400 hover:text-emerald-300 transition-colors">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleBlogDelete(post.id)} className="text-red-400 hover:text-red-300 transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {blogPosts.length === 0 && (
                    <div className="text-center text-slate-400 py-8">No blog posts yet</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
