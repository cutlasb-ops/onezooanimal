import { useState, useEffect } from 'react';
import { Plus, CreditCard as Edit2, Trash2, Eye, EyeOff, ArrowUp, ArrowDown, Coins, Zap, Star, Crown, Sparkles, Megaphone, Gift, Tag, Heart, Ticket, type LucideIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { PromoBanner } from '../lib/database.types';

const ICON_OPTIONS: { value: string; label: string; Icon: LucideIcon }[] = [
  { value: 'coins', label: 'Coins', Icon: Coins },
  { value: 'zap', label: 'Zap', Icon: Zap },
  { value: 'star', label: 'Star', Icon: Star },
  { value: 'crown', label: 'Crown', Icon: Crown },
  { value: 'sparkles', label: 'Sparkles', Icon: Sparkles },
  { value: 'megaphone', label: 'Megaphone', Icon: Megaphone },
  { value: 'gift', label: 'Gift', Icon: Gift },
  { value: 'tag', label: 'Tag', Icon: Tag },
  { value: 'heart', label: 'Heart', Icon: Heart },
  { value: 'ticket', label: 'Ticket', Icon: Ticket },
];

const GRADIENT_PRESETS = [
  { label: 'Forest Green', value: 'linear-gradient(135deg, #1a3c2a 0%, #0f2318 40%, #1a3520 100%)' },
  { label: 'Warm Amber', value: 'linear-gradient(135deg, #2a1f0a 0%, #1a1508 40%, #2a1d0e 100%)' },
  { label: 'Deep Blue', value: 'linear-gradient(135deg, #0a1a2e 0%, #081422 40%, #0e1f33 100%)' },
  { label: 'Bold Red', value: 'linear-gradient(135deg, #2e0a0a 0%, #1a0808 40%, #2a0e0e 100%)' },
  { label: 'Royal Purple', value: 'linear-gradient(135deg, #1a0a2e 0%, #120822 40%, #1e0e33 100%)' },
  { label: 'Midnight', value: 'linear-gradient(135deg, #0a0a1a 0%, #080812 40%, #0e0e20 100%)' },
];

const ACCENT_PRESETS = [
  { label: 'Amber', value: '#f59e0b' },
  { label: 'Orange', value: '#d97706' },
  { label: 'Blue', value: '#2563eb' },
  { label: 'Red', value: '#dc2626' },
  { label: 'Green', value: '#16a34a' },
  { label: 'Purple', value: '#7c3aed' },
  { label: 'Pink', value: '#ec4899' },
  { label: 'Cyan', value: '#06b6d4' },
];

const DEFAULT_FORM = {
  headline: '',
  subtext: '',
  badge_label: 'NEW',
  button_text: 'Get Coins',
  button_action: 'open_coin_shop',
  button_link: '',
  gradient: GRADIENT_PRESETS[0].value,
  accent_color: ACCENT_PRESETS[0].value,
  icon_name: 'coins',
  display_order: 0,
  is_active: true,
};

export function AdminPromoTab() {
  const [banners, setBanners] = useState<PromoBanner[]>([]);
  const [editing, setEditing] = useState<PromoBanner | null>(null);
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBanners();
  }, []);

  async function loadBanners() {
    const { data } = await supabase
      .from('promo_banners')
      .select('*')
      .order('display_order', { ascending: true });
    if (data) setBanners(data);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.headline.trim()) {
      alert('Please enter a headline.');
      return;
    }
    setLoading(true);
    try {
      if (editing) {
        const { error } = await supabase
          .from('promo_banners')
          .update({ ...formData, updated_at: new Date().toISOString() })
          .eq('id', editing.id);
        if (error) throw error;
      } else {
        const nextOrder = banners.length > 0 ? Math.max(...banners.map(b => b.display_order)) + 1 : 0;
        const { error } = await supabase
          .from('promo_banners')
          .insert([{ ...formData, display_order: nextOrder }]);
        if (error) throw error;
      }
      resetForm();
      loadBanners();
    } catch (error) {
      console.error('Error saving promo banner:', error);
      alert('Error saving promo banner. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (banner: PromoBanner) => {
    setEditing(banner);
    setFormData({
      headline: banner.headline,
      subtext: banner.subtext,
      badge_label: banner.badge_label,
      button_text: banner.button_text,
      button_action: banner.button_action,
      button_link: banner.button_link,
      gradient: banner.gradient,
      accent_color: banner.accent_color,
      icon_name: banner.icon_name,
      display_order: banner.display_order,
      is_active: banner.is_active,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this promo banner?')) return;
    try {
      const { error } = await supabase.from('promo_banners').delete().eq('id', id);
      if (error) throw error;
      loadBanners();
    } catch (error) {
      console.error('Error deleting banner:', error);
      alert('Error deleting promo banner.');
    }
  };

  const toggleActive = async (banner: PromoBanner) => {
    try {
      const { error } = await supabase
        .from('promo_banners')
        .update({ is_active: !banner.is_active, updated_at: new Date().toISOString() })
        .eq('id', banner.id);
      if (error) throw error;
      loadBanners();
    } catch (error) {
      console.error('Error toggling active:', error);
    }
  };

  const moveOrder = async (banner: PromoBanner, direction: 'up' | 'down') => {
    const sorted = [...banners].sort((a, b) => a.display_order - b.display_order);
    const idx = sorted.findIndex(b => b.id === banner.id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const other = sorted[swapIdx];
    try {
      await Promise.all([
        supabase.from('promo_banners').update({ display_order: other.display_order }).eq('id', banner.id),
        supabase.from('promo_banners').update({ display_order: banner.display_order }).eq('id', other.id),
      ]);
      loadBanners();
    } catch (error) {
      console.error('Error reordering:', error);
    }
  };

  const resetForm = () => {
    setEditing(null);
    setFormData(DEFAULT_FORM);
  };

  const selectedIconOption = ICON_OPTIONS.find(o => o.value === formData.icon_name);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">
          {editing ? 'Edit Promo Banner' : 'Add Promo Banner'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Headline</label>
            <input
              type="text"
              required
              value={formData.headline}
              onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g., Get 500 Coins for $4.99!"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Subtext</label>
            <textarea
              value={formData.subtext}
              onChange={(e) => setFormData({ ...formData, subtext: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Supporting description..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Badge Label</label>
              <input
                type="text"
                value={formData.badge_label}
                onChange={(e) => setFormData({ ...formData, badge_label: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g., NEW, SALE, HOT"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Button Text</label>
              <input
                type="text"
                value={formData.button_text}
                onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g., Get Coins, Learn More"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Button Action</label>
            <select
              value={formData.button_action}
              onChange={(e) => setFormData({ ...formData, button_action: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="open_coin_shop">Open Coin Shop</option>
              <option value="open_link">Open External Link</option>
            </select>
          </div>

          {formData.button_action === 'open_link' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Link URL</label>
              <input
                type="url"
                value={formData.button_link}
                onChange={(e) => setFormData({ ...formData, button_link: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="https://..."
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Icon</label>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map(opt => {
                const IconComp = opt.Icon;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon_name: opt.value })}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      formData.icon_name === opt.value
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white'
                    }`}
                    title={opt.label}
                  >
                    <IconComp size={14} />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Background Gradient</label>
            <div className="grid grid-cols-3 gap-2">
              {GRADIENT_PRESETS.map(preset => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setFormData({ ...formData, gradient: preset.value })}
                  className={`rounded-lg p-2 text-xs font-medium text-white text-center transition-all ${
                    formData.gradient === preset.value ? 'ring-2 ring-emerald-400 ring-offset-1 ring-offset-slate-800' : ''
                  }`}
                  style={{ background: preset.value }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={formData.gradient}
              onChange={(e) => setFormData({ ...formData, gradient: e.target.value })}
              className="w-full mt-2 px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Or paste a custom CSS gradient..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Accent Color</label>
            <div className="flex flex-wrap gap-2">
              {ACCENT_PRESETS.map(preset => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setFormData({ ...formData, accent_color: preset.value })}
                  className={`w-8 h-8 rounded-lg transition-all ${
                    formData.accent_color === preset.value ? 'ring-2 ring-white ring-offset-1 ring-offset-slate-800 scale-110' : 'hover:scale-105'
                  }`}
                  style={{ background: preset.value }}
                  title={preset.label}
                />
              ))}
              <input
                type="color"
                value={formData.accent_color}
                onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                className="w-8 h-8 rounded-lg cursor-pointer border border-slate-600"
                title="Custom color"
              />
            </div>
          </div>

          <div
            className="rounded-xl overflow-hidden relative"
            style={{ background: formData.gradient, minHeight: 80 }}
          >
            <div className="absolute top-0 left-0 h-full w-1" style={{ background: formData.accent_color }} />
            <div className="flex items-center gap-3 p-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `${formData.accent_color}20`, border: `1px solid ${formData.accent_color}30` }}
              >
                {selectedIconOption && <selectedIconOption.Icon size={20} style={{ color: formData.accent_color }} />}
              </div>
              <div className="flex-1 min-w-0">
                <span
                  className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full"
                  style={{ background: `${formData.accent_color}20`, color: formData.accent_color }}
                >
                  {formData.badge_label || 'BADGE'}
                </span>
                <p className="text-sm font-bold text-white mt-1 truncate">{formData.headline || 'Headline preview...'}</p>
                <p className="text-xs text-white/40 truncate">{formData.subtext || 'Subtext preview...'}</p>
              </div>
              <span
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-white shrink-0"
                style={{ background: formData.accent_color }}
              >
                {formData.button_text || 'Button'}
              </span>
            </div>
          </div>

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
              {loading ? 'Saving...' : editing ? 'Update Banner' : 'Add Banner'}
            </button>
            {editing && (
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
        <h3 className="text-lg font-semibold text-white mb-4">Active Promo Banners</h3>
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {banners.map((banner, idx) => (
            <div
              key={banner.id}
              className="rounded-lg overflow-hidden"
              style={{ border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div
                className="relative p-3"
                style={{ background: banner.gradient }}
              >
                <div className="absolute top-0 left-0 h-full w-1" style={{ background: banner.accent_color }} />
                <div className="flex items-center gap-3 pl-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{banner.headline}</p>
                    <p className="text-xs text-white/40 truncate">{banner.subtext}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded ${banner.is_active ? 'bg-green-600/20 text-green-400' : 'bg-gray-600/20 text-gray-400'}`}>
                        {banner.is_active ? 'Active' : 'Hidden'}
                      </span>
                      <span className="text-[10px] text-white/30">Order: {banner.display_order}</span>
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded font-bold"
                        style={{ background: `${banner.accent_color}30`, color: banner.accent_color }}
                      >
                        {banner.badge_label}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <div className="flex gap-1">
                      <button
                        onClick={() => moveOrder(banner, 'up')}
                        disabled={idx === 0}
                        className="w-6 h-6 rounded flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-20"
                        title="Move up"
                      >
                        <ArrowUp size={12} />
                      </button>
                      <button
                        onClick={() => moveOrder(banner, 'down')}
                        disabled={idx === banners.length - 1}
                        className="w-6 h-6 rounded flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-20"
                        title="Move down"
                      >
                        <ArrowDown size={12} />
                      </button>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => toggleActive(banner)}
                        className="w-6 h-6 rounded flex items-center justify-center text-amber-400/70 hover:text-amber-300 hover:bg-white/10 transition-colors"
                        title={banner.is_active ? 'Hide' : 'Show'}
                      >
                        {banner.is_active ? <EyeOff size={12} /> : <Eye size={12} />}
                      </button>
                      <button
                        onClick={() => handleEdit(banner)}
                        className="w-6 h-6 rounded flex items-center justify-center text-emerald-400/70 hover:text-emerald-300 hover:bg-white/10 transition-colors"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => handleDelete(banner.id)}
                        className="w-6 h-6 rounded flex items-center justify-center text-red-400/70 hover:text-red-300 hover:bg-white/10 transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {banners.length === 0 && (
            <div className="text-center text-slate-400 py-8">
              No promo banners yet. The default coin promotions will show until you add your own.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
