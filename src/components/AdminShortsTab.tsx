import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Upload, Link, Eye, EyeOff, Play, Film, List, X } from 'lucide-react';
import { supabase, supabaseAdmin } from '../lib/supabase';
import { isYouTubeUrl, getYouTubeThumbnail } from '../lib/videoUtils';

interface Short {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  category: string;
  is_published: boolean;
  created_at: string;
}

const CATEGORIES = ['general', 'animals', 'highlights', 'behind-the-scenes', 'funny', 'educational'] as const;

export function AdminShortsTab() {
  const [shorts, setShorts] = useState<Short[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [videoSource, setVideoSource] = useState<'url' | 'file'>('url');
  const [thumbSource, setThumbSource] = useState<'url' | 'file'>('url');
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [selectedThumb, setSelectedThumb] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const thumbRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    video_url: '',
    thumbnail_url: '',
    category: 'general',
    is_published: true,
  });

  const [bulkUrls, setBulkUrls] = useState('');
  const [bulkCategory, setBulkCategory] = useState('general');
  const [bulkPublish, setBulkPublish] = useState(true);
  const [bulkProgress, setBulkProgress] = useState<string | null>(null);

  useEffect(() => { loadShorts(); }, []);

  async function loadShorts() {
    setLoading(true);
    const { data } = await supabase
      .from('shorts')
      .select('*')
      .order('created_at', { ascending: false });
    setShorts((data as Short[]) || []);
    setLoading(false);
  }

  async function uploadFile(file: File, folder: string): Promise<string> {
    const ext = file.name.split('.').pop() || 'mp4';
    const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabaseAdmin.storage
      .from('videos')
      .upload(fileName, file, { cacheControl: '3600', upsert: false });
    if (error) throw error;
    const { data } = supabaseAdmin.storage.from('videos').getPublicUrl(fileName);
    return data.publicUrl;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.video_url && !selectedVideo) return;

    setLoading(true);
    setUploadProgress(null);

    let videoUrl = formData.video_url;
    let thumbUrl = formData.thumbnail_url;

    try {
      if (selectedVideo) {
        setUploadProgress('Uploading video...');
        videoUrl = await uploadFile(selectedVideo, 'shorts');
      }
      if (selectedThumb) {
        setUploadProgress('Uploading thumbnail...');
        thumbUrl = await uploadFile(selectedThumb, 'shorts-thumbnails');
      }

      setUploadProgress('Saving...');
      await supabaseAdmin.from('shorts').insert({
        title: formData.title.trim(),
        description: formData.description.trim(),
        video_url: videoUrl,
        thumbnail_url: thumbUrl,
        category: formData.category,
        is_published: formData.is_published,
      });

      setFormData({ title: '', description: '', video_url: '', thumbnail_url: '', category: 'general', is_published: true });
      setSelectedVideo(null);
      setSelectedThumb(null);
      setShowForm(false);
      loadShorts();
    } catch (err: any) {
      alert('Error: ' + (err.message || 'Upload failed'));
    } finally {
      setLoading(false);
      setUploadProgress(null);
    }
  }

  async function handleBulkSubmit(e: React.FormEvent) {
    e.preventDefault();
    const urls = bulkUrls
      .split('\n')
      .map(u => u.trim())
      .filter(u => u.length > 0);

    if (urls.length === 0) return;

    setLoading(true);
    setBulkProgress(`Adding 0/${urls.length}...`);

    const rows = urls.map((url, i) => {
      const thumbUrl = isYouTubeUrl(url) ? (getYouTubeThumbnail(url) || '') : '';
      return {
        title: `Short ${i + 1}`,
        description: '',
        video_url: url,
        thumbnail_url: thumbUrl,
        category: bulkCategory,
        is_published: bulkPublish,
      };
    });

    try {
      const batchSize = 20;
      let added = 0;
      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);
        const { error } = await supabaseAdmin.from('shorts').insert(batch);
        if (error) throw error;
        added += batch.length;
        setBulkProgress(`Added ${added}/${rows.length}...`);
      }

      setBulkUrls('');
      setShowBulk(false);
      setBulkProgress(null);
      loadShorts();
    } catch (err: any) {
      alert('Bulk add error: ' + (err.message || 'Failed'));
    } finally {
      setLoading(false);
      setBulkProgress(null);
    }
  }

  async function togglePublish(short: Short) {
    await supabaseAdmin
      .from('shorts')
      .update({ is_published: !short.is_published })
      .eq('id', short.id);
    loadShorts();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this short?')) return;
    await supabaseAdmin.from('shorts').delete().eq('id', id);
    loadShorts();
  }

  async function handleDeleteAll() {
    if (!confirm(`Delete ALL ${shorts.length} shorts? This cannot be undone.`)) return;
    if (!confirm('Are you really sure? This deletes everything.')) return;
    setLoading(true);
    await supabaseAdmin.from('shorts').delete().neq('id', '');
    loadShorts();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Film size={18} className="text-emerald-400" />
            Shorts
            {shorts.length > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-slate-700 text-xs text-slate-300 font-normal">
                {shorts.length}
              </span>
            )}
          </h3>
          <p className="text-sm text-slate-400 mt-1">Upload short-form videos to showcase on the site</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowBulk(!showBulk); setShowForm(false); }}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold text-sm rounded-lg transition-colors"
          >
            <List size={14} />
            Bulk Add
          </button>
          <button
            onClick={() => { setShowForm(!showForm); setShowBulk(false); }}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm rounded-lg transition-colors"
          >
            <Plus size={14} />
            Add Short
          </button>
        </div>
      </div>

      {/* Bulk add form */}
      {showBulk && (
        <form onSubmit={handleBulkSubmit} className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white">Bulk Add Shorts</h4>
            <button type="button" onClick={() => setShowBulk(false)} className="text-slate-400 hover:text-white">
              <X size={16} />
            </button>
          </div>
          <p className="text-xs text-slate-400">
            Paste one video URL per line (YouTube Shorts, YouTube videos, or direct video URLs). Each will be added as a separate short.
          </p>
          <textarea
            value={bulkUrls}
            onChange={e => setBulkUrls(e.target.value)}
            placeholder={"https://youtube.com/shorts/abc123\nhttps://youtube.com/shorts/def456\nhttps://youtube.com/watch?v=ghi789"}
            rows={8}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm font-mono focus:outline-none focus:border-emerald-500 resize-y"
          />
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">Category</label>
              <select
                value={bulkCategory}
                onChange={e => setBulkCategory(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <label className="flex items-center gap-2 cursor-pointer mt-5">
              <input
                type="checkbox"
                checked={bulkPublish}
                onChange={e => setBulkPublish(e.target.checked)}
                className="accent-emerald-500"
              />
              <span className="text-xs text-slate-300">Publish immediately</span>
            </label>
          </div>

          {bulkProgress && (
            <p className="text-xs text-emerald-400 animate-pulse">{bulkProgress}</p>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading || !bulkUrls.trim()}
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm rounded-lg transition-colors disabled:opacity-40"
            >
              {loading ? 'Adding...' : `Add ${bulkUrls.split('\n').filter(u => u.trim()).length} Shorts`}
            </button>
            <button
              type="button"
              onClick={() => setShowBulk(false)}
              className="px-5 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Single add form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">Title</label>
              <input
                value={formData.title}
                onChange={e => setFormData(f => ({ ...f, title: e.target.value }))}
                placeholder="Short title"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">Category</label>
              <select
                value={formData.category}
                onChange={e => setFormData(f => ({ ...f, category: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-400 mb-1 block">Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
              placeholder="Optional description"
              rows={2}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          {/* Video source */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <label className="text-xs font-medium text-slate-400">Video</label>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setVideoSource('url')}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold ${videoSource === 'url' ? 'bg-emerald-500 text-black' : 'bg-slate-700 text-slate-300'}`}
                >
                  <Link size={10} className="inline mr-1" />URL
                </button>
                <button
                  type="button"
                  onClick={() => setVideoSource('file')}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold ${videoSource === 'file' ? 'bg-emerald-500 text-black' : 'bg-slate-700 text-slate-300'}`}
                >
                  <Upload size={10} className="inline mr-1" />Upload
                </button>
              </div>
            </div>
            {videoSource === 'url' ? (
              <input
                value={formData.video_url}
                onChange={e => setFormData(f => ({ ...f, video_url: e.target.value }))}
                placeholder="https://... (mp4, webm, YouTube)"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            ) : (
              <div>
                <input
                  ref={videoRef}
                  type="file"
                  accept="video/*"
                  onChange={e => setSelectedVideo(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => videoRef.current?.click()}
                  className="w-full px-4 py-3 border-2 border-dashed border-slate-600 rounded-lg text-slate-400 text-sm hover:border-emerald-500 hover:text-emerald-400 transition-colors"
                >
                  {selectedVideo ? selectedVideo.name : 'Click to select a video file'}
                </button>
              </div>
            )}
          </div>

          {/* Thumbnail source */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <label className="text-xs font-medium text-slate-400">Thumbnail (optional)</label>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setThumbSource('url')}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold ${thumbSource === 'url' ? 'bg-emerald-500 text-black' : 'bg-slate-700 text-slate-300'}`}
                >
                  <Link size={10} className="inline mr-1" />URL
                </button>
                <button
                  type="button"
                  onClick={() => setThumbSource('file')}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold ${thumbSource === 'file' ? 'bg-emerald-500 text-black' : 'bg-slate-700 text-slate-300'}`}
                >
                  <Upload size={10} className="inline mr-1" />Upload
                </button>
              </div>
            </div>
            {thumbSource === 'url' ? (
              <input
                value={formData.thumbnail_url}
                onChange={e => setFormData(f => ({ ...f, thumbnail_url: e.target.value }))}
                placeholder="https://... (jpg, png)"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            ) : (
              <div>
                <input
                  ref={thumbRef}
                  type="file"
                  accept="image/*"
                  onChange={e => setSelectedThumb(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => thumbRef.current?.click()}
                  className="w-full px-4 py-3 border-2 border-dashed border-slate-600 rounded-lg text-slate-400 text-sm hover:border-emerald-500 hover:text-emerald-400 transition-colors"
                >
                  {selectedThumb ? selectedThumb.name : 'Click to select a thumbnail'}
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_published}
                onChange={e => setFormData(f => ({ ...f, is_published: e.target.checked }))}
                className="accent-emerald-500"
              />
              <span className="text-xs text-slate-300">Publish immediately</span>
            </label>
          </div>

          {uploadProgress && (
            <p className="text-xs text-emerald-400 animate-pulse">{uploadProgress}</p>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading || (!formData.video_url && !selectedVideo)}
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm rounded-lg transition-colors disabled:opacity-40"
            >
              {loading ? 'Uploading...' : 'Save Short'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-5 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Shorts list */}
      {loading && shorts.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-sm">Loading...</div>
      ) : shorts.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <Film size={40} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">No shorts uploaded yet</p>
        </div>
      ) : (
        <>
          {shorts.length > 3 && (
            <div className="flex justify-end">
              <button
                onClick={handleDeleteAll}
                className="px-3 py-1.5 text-xs font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
              >
                Delete All ({shorts.length})
              </button>
            </div>
          )}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {shorts.map(short => (
              <div key={short.id} className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden group">
                <div className="relative aspect-[9/16] max-h-56 bg-black flex items-center justify-center overflow-hidden">
                  {short.thumbnail_url ? (
                    <img src={short.thumbnail_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <video src={short.video_url} className="w-full h-full object-cover" muted preload="metadata" />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play size={32} className="text-white" />
                  </div>
                  {!short.is_published && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-yellow-500/90 text-black text-[9px] font-bold uppercase">
                      Draft
                    </span>
                  )}
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/60 text-white text-[9px] font-medium">
                    {short.category}
                  </span>
                </div>

                <div className="p-3">
                  <p className="text-sm font-semibold text-white truncate">{short.title || 'Untitled'}</p>
                  {short.description && (
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{short.description}</p>
                  )}
                  <p className="text-[10px] text-slate-500 mt-1 truncate">{short.video_url}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => togglePublish(short)}
                      className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold transition-colors bg-slate-700 hover:bg-slate-600 text-slate-300"
                    >
                      {short.is_published ? <EyeOff size={10} /> : <Eye size={10} />}
                      {short.is_published ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      onClick={() => handleDelete(short.id)}
                      className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold transition-colors bg-red-500/10 hover:bg-red-500/20 text-red-400"
                    >
                      <Trash2 size={10} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
