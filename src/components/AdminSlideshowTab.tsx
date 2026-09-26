import { useState, useEffect, useRef } from 'react';
import { Plus, CreditCard as Edit2, Trash2, ArrowUp, ArrowDown, Eye, EyeOff, Upload, Link } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { SlideshowImage } from '../lib/database.types';

export function AdminSlideshowTab() {
  const [images, setImages] = useState<SlideshowImage[]>([]);
  const [editing, setEditing] = useState<SlideshowImage | null>(null);
  const [formData, setFormData] = useState({
    image_url: '',
    caption: '',
    link_url: '',
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const [imageSource, setImageSource] = useState<'url' | 'file'>('url');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadImages();
  }, []);

  async function loadImages() {
    const { data } = await supabase
      .from('slideshow_images')
      .select('*')
      .order('display_order', { ascending: true });
    if (data) setImages(data);
  }

  async function uploadImage(file: File): Promise<string | null> {
    try {
      setUploadProgress('Uploading image...');
      const ext = file.name.split('.').pop() || 'jpg';
      const fileName = `slideshow-${Date.now()}.${ext}`;
      const { data, error } = await supabase.storage
        .from('videos')
        .upload(fileName, file, { contentType: file.type, cacheControl: '3600' });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('videos').getPublicUrl(data.path);
      setUploadProgress(null);
      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadProgress(null);
      alert('Failed to upload image.');
      return null;
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let imageUrl = formData.image_url;
      if (imageSource === 'file' && selectedFile) {
        const url = await uploadImage(selectedFile);
        if (!url) { setLoading(false); return; }
        imageUrl = url;
      }
      if (!imageUrl.trim()) { alert('Please provide an image.'); setLoading(false); return; }

      const payload = { ...formData, image_url: imageUrl };
      if (editing) {
        const { error } = await supabase
          .from('slideshow_images')
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq('id', editing.id);
        if (error) throw error;
      } else {
        const nextOrder = images.length > 0 ? Math.max(...images.map(img => img.display_order)) + 1 : 0;
        const { error } = await supabase
          .from('slideshow_images')
          .insert([{ ...payload, display_order: nextOrder }]);
        if (error) throw error;
      }
      resetForm();
      loadImages();
    } catch (error) {
      console.error('Error saving slideshow image:', error);
      alert('Error saving slideshow image.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (img: SlideshowImage) => {
    setEditing(img);
    setFormData({
      image_url: img.image_url,
      caption: img.caption,
      link_url: img.link_url,
      is_active: img.is_active,
    });
    setImageSource('url');
    setSelectedFile(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this slideshow image?')) return;
    const { error } = await supabase.from('slideshow_images').delete().eq('id', id);
    if (error) { alert('Error deleting.'); return; }
    loadImages();
  };

  const toggleActive = async (img: SlideshowImage) => {
    await supabase.from('slideshow_images').update({ is_active: !img.is_active, updated_at: new Date().toISOString() }).eq('id', img.id);
    loadImages();
  };

  const moveOrder = async (img: SlideshowImage, direction: 'up' | 'down') => {
    const sorted = [...images].sort((a, b) => a.display_order - b.display_order);
    const idx = sorted.findIndex(s => s.id === img.id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const other = sorted[swapIdx];
    await Promise.all([
      supabase.from('slideshow_images').update({ display_order: other.display_order }).eq('id', img.id),
      supabase.from('slideshow_images').update({ display_order: img.display_order }).eq('id', other.id),
    ]);
    loadImages();
  };

  const resetForm = () => {
    setEditing(null);
    setFormData({ image_url: '', caption: '', link_url: '', is_active: true });
    setImageSource('url');
    setSelectedFile(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">
          {editing ? 'Edit Slideshow Image' : 'Add Slideshow Image'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Image</label>
            <div className="flex rounded-lg overflow-hidden border border-slate-600 mb-3">
              <button
                type="button"
                onClick={() => { setImageSource('url'); setSelectedFile(null); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium transition-colors ${
                  imageSource === 'url' ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-400 hover:text-white hover:bg-slate-600'
                }`}
              >
                <Link size={15} /> Paste URL
              </button>
              <button
                type="button"
                onClick={() => setImageSource('file')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium transition-colors ${
                  imageSource === 'file' ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-400 hover:text-white hover:bg-slate-600'
                }`}
              >
                <Upload size={15} /> Upload
              </button>
            </div>
            {imageSource === 'url' ? (
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="https://..."
              />
            ) : (
              <div>
                <div
                  onClick={() => fileRef.current?.click()}
                  className={`w-full border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                    selectedFile ? 'border-emerald-500 bg-emerald-900/20' : 'border-slate-600 hover:border-emerald-500/50'
                  }`}
                >
                  {selectedFile ? (
                    <div className="flex flex-col items-center gap-2">
                      {selectedFile.type.startsWith('image/') && (
                        <img src={URL.createObjectURL(selectedFile)} alt="Preview" className="h-24 w-auto rounded object-cover" />
                      )}
                      <p className="text-emerald-300 text-sm font-medium truncate max-w-full">{selectedFile.name}</p>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setSelectedFile(null); if (fileRef.current) fileRef.current.value = ''; }}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload size={24} className="text-slate-400" />
                      <p className="text-slate-300 text-sm">Click to choose an image</p>
                      <p className="text-slate-500 text-xs">JPG, PNG, WebP</p>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)} />
              </div>
            )}
          </div>

          {formData.image_url && imageSource === 'url' && (
            <img src={formData.image_url} alt="Preview" className="w-24 h-32 object-cover rounded-xl mx-auto" />
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Caption (optional)</label>
            <input
              type="text"
              value={formData.caption}
              onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g., Morning enrichment time"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Link URL (optional)</label>
            <input
              type="url"
              value={formData.link_url}
              onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="https://www.instagram.com/p/..."
            />
            <p className="text-xs text-slate-500 mt-1">Where should users go when they click on this image?</p>
          </div>

          {uploadProgress && (
            <div className="bg-blue-600/20 border border-blue-600/30 rounded-lg p-3">
              <span className="text-blue-300 text-sm">{uploadProgress}</span>
            </div>
          )}

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-emerald-500 rounded focus:ring-emerald-500 bg-slate-700 border-slate-600"
            />
            <span className="text-sm text-slate-300">Active (visible on site)</span>
          </label>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {editing ? <Edit2 size={18} /> : <Plus size={18} />}
              {loading ? 'Saving...' : editing ? 'Update' : 'Add Image'}
            </button>
            {editing && (
              <button type="button" onClick={resetForm} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Slideshow Images (Reels Fallback)</h3>
        <p className="text-xs text-slate-400 mb-3">
          These images show in the "From Our Reels" marquee when no Instagram posts have thumbnail images. To use Instagram posts instead, add them in the Social tab with a thumbnail URL.
        </p>
        <div className="grid grid-cols-2 gap-3 max-h-[600px] overflow-y-auto">
          {images.map((img, idx) => (
            <div key={img.id} className="bg-slate-700 rounded-lg overflow-hidden">
              <div className="relative aspect-[3/4]">
                <img src={img.image_url} alt={img.caption} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-white text-xs font-medium truncate">{img.caption || 'No caption'}</p>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded mt-1 inline-block ${img.is_active ? 'bg-green-600/30 text-green-300' : 'bg-gray-600/30 text-gray-300'}`}>
                    {img.is_active ? 'Active' : 'Hidden'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between p-2">
                <div className="flex gap-1">
                  <button onClick={() => moveOrder(img, 'up')} disabled={idx === 0} className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-600 disabled:opacity-20"><ArrowUp size={12} /></button>
                  <button onClick={() => moveOrder(img, 'down')} disabled={idx === images.length - 1} className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-600 disabled:opacity-20"><ArrowDown size={12} /></button>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => toggleActive(img)} className="w-6 h-6 rounded flex items-center justify-center text-amber-400 hover:text-amber-300 hover:bg-slate-600">
                    {img.is_active ? <EyeOff size={12} /> : <Eye size={12} />}
                  </button>
                  <button onClick={() => handleEdit(img)} className="w-6 h-6 rounded flex items-center justify-center text-emerald-400 hover:text-emerald-300 hover:bg-slate-600"><Edit2 size={12} /></button>
                  <button onClick={() => handleDelete(img.id)} className="w-6 h-6 rounded flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-slate-600"><Trash2 size={12} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {images.length === 0 && (
          <div className="text-center text-slate-400 py-8">
            No slideshow images yet. Default Instagram reels will show until you add your own.
          </div>
        )}
      </div>
    </div>
  );
}
