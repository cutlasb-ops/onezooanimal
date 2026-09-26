import { useState, useEffect, useRef } from 'react';
import { Plus, CreditCard as Edit2, Trash2, ArrowUp, ArrowDown, Eye, EyeOff, Upload, Link } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { FeatureSection } from '../lib/database.types';

export function AdminFeaturesTab() {
  const [sections, setSections] = useState<FeatureSection[]>([]);
  const [editing, setEditing] = useState<FeatureSection | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    display_order: 0,
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const [imageSource, setImageSource] = useState<'url' | 'file'>('url');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSections();
  }, []);

  async function loadSections() {
    const { data } = await supabase
      .from('feature_sections')
      .select('*')
      .order('display_order', { ascending: true });
    if (data) setSections(data);
  }

  async function uploadImage(file: File): Promise<string | null> {
    try {
      setUploadProgress('Uploading image...');
      const ext = file.name.split('.').pop() || 'jpg';
      const fileName = `feature-${Date.now()}.${ext}`;
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
    if (!formData.title.trim()) { alert('Please enter a title.'); return; }
    setLoading(true);
    try {
      let imageUrl = formData.image_url;
      if (imageSource === 'file' && selectedFile) {
        const url = await uploadImage(selectedFile);
        if (!url) { setLoading(false); return; }
        imageUrl = url;
      }
      const payload = { ...formData, image_url: imageUrl };
      if (editing) {
        const { error } = await supabase
          .from('feature_sections')
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq('id', editing.id);
        if (error) throw error;
      } else {
        const nextOrder = sections.length > 0 ? Math.max(...sections.map(s => s.display_order)) + 1 : 0;
        const { error } = await supabase
          .from('feature_sections')
          .insert([{ ...payload, display_order: nextOrder }]);
        if (error) throw error;
      }
      resetForm();
      loadSections();
    } catch (error) {
      console.error('Error saving feature section:', error);
      alert('Error saving feature section.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (section: FeatureSection) => {
    setEditing(section);
    setFormData({
      title: section.title,
      description: section.description,
      image_url: section.image_url,
      display_order: section.display_order,
      is_active: section.is_active,
    });
    setImageSource('url');
    setSelectedFile(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this feature section?')) return;
    const { error } = await supabase.from('feature_sections').delete().eq('id', id);
    if (error) { alert('Error deleting.'); return; }
    loadSections();
  };

  const toggleActive = async (section: FeatureSection) => {
    await supabase.from('feature_sections').update({ is_active: !section.is_active, updated_at: new Date().toISOString() }).eq('id', section.id);
    loadSections();
  };

  const moveOrder = async (section: FeatureSection, direction: 'up' | 'down') => {
    const sorted = [...sections].sort((a, b) => a.display_order - b.display_order);
    const idx = sorted.findIndex(s => s.id === section.id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const other = sorted[swapIdx];
    await Promise.all([
      supabase.from('feature_sections').update({ display_order: other.display_order }).eq('id', section.id),
      supabase.from('feature_sections').update({ display_order: section.display_order }).eq('id', other.id),
    ]);
    loadSections();
  };

  const resetForm = () => {
    setEditing(null);
    setFormData({ title: '', description: '', image_url: '', display_order: 0, is_active: true });
    setImageSource('url');
    setSelectedFile(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">
          {editing ? 'Edit Feature Section' : 'Add Feature Section'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g., Live Animal Cams"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Detailed description shown when expanded..."
              rows={4}
            />
          </div>

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
                placeholder="https://images.pexels.com/..."
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
                        <img src={URL.createObjectURL(selectedFile)} alt="Preview" className="h-16 w-auto rounded object-cover" />
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
                      <Upload size={20} className="text-slate-400" />
                      <p className="text-slate-300 text-sm">Click to choose an image</p>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)} />
              </div>
            )}
          </div>

          {formData.image_url && imageSource === 'url' && (
            <img src={formData.image_url} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
          )}

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
              {loading ? 'Saving...' : editing ? 'Update' : 'Add Section'}
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
        <h3 className="text-lg font-semibold text-white mb-4">Feature Sections</h3>
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {sections.map((section, idx) => (
            <div key={section.id} className="bg-slate-700 rounded-lg overflow-hidden">
              <div className="flex gap-3 p-3">
                {section.image_url && (
                  <img src={section.image_url} alt="" className="w-20 h-14 rounded object-cover shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-white text-sm truncate">{section.title}</h4>
                  <p className="text-xs text-slate-400 truncate">{section.description.slice(0, 80)}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded ${section.is_active ? 'bg-green-600/20 text-green-400' : 'bg-gray-600/20 text-gray-400'}`}>
                      {section.is_active ? 'Active' : 'Hidden'}
                    </span>
                    <span className="text-[10px] text-slate-500">Order: {section.display_order}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <div className="flex gap-1">
                    <button onClick={() => moveOrder(section, 'up')} disabled={idx === 0} className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-600 disabled:opacity-20"><ArrowUp size={12} /></button>
                    <button onClick={() => moveOrder(section, 'down')} disabled={idx === sections.length - 1} className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-600 disabled:opacity-20"><ArrowDown size={12} /></button>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => toggleActive(section)} className="w-6 h-6 rounded flex items-center justify-center text-amber-400 hover:text-amber-300 hover:bg-slate-600">
                      {section.is_active ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                    <button onClick={() => handleEdit(section)} className="w-6 h-6 rounded flex items-center justify-center text-emerald-400 hover:text-emerald-300 hover:bg-slate-600"><Edit2 size={12} /></button>
                    <button onClick={() => handleDelete(section.id)} className="w-6 h-6 rounded flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-slate-600"><Trash2 size={12} /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {sections.length === 0 && (
            <div className="text-center text-slate-400 py-8">
              No feature sections yet. Default content will show until you add your own.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
