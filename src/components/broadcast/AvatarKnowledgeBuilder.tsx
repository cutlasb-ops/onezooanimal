import { useState } from 'react';
import { X, Plus, Trash2, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AvatarKnowledgeBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  animalId?: string;
}

interface AnimalData {
  name: string;
  species: string;
  ageYears: number;
  avatarName: string;
  avatarPersonality: string;
  avatarEmoji: string;
  avatarColor: string;
  catchphrase: string;
  timezone: string;
  feedingSchedule: string[];
  typicalActiveHours: number[];
  conservationStatus: string;
  habitatInfo: string;
  dietInfo: string;
  socialStructure: string;
  funFacts: string[];
  behaviors: Array<{
    name: string;
    description: string;
    meaning: string;
    frequency: string;
    timeOfDay: string[];
  }>;
}

const defaultAnimalData: AnimalData = {
  name: '',
  species: '',
  ageYears: 0,
  avatarName: '',
  avatarPersonality: 'enthusiastic educator',
  avatarEmoji: '🐾',
  avatarColor: '#0a2a1a',
  catchphrase: 'Let\'s explore!',
  timezone: 'UTC',
  feedingSchedule: [],
  typicalActiveHours: [],
  conservationStatus: '',
  habitatInfo: '',
  dietInfo: '',
  socialStructure: '',
  funFacts: [],
  behaviors: [],
};

export function AvatarKnowledgeBuilder({ isOpen, onClose, animalId }: AvatarKnowledgeBuilderProps) {
  const [data, setData] = useState<AnimalData>(defaultAnimalData);
  const [activeTab, setActiveTab] = useState<'profile' | 'behaviors' | 'facts' | 'schedule'>('profile');
  const [saving, setSaving] = useState(false);
  const [newFact, setNewFact] = useState('');
  const [newBehavior, setNewBehavior] = useState({
    name: '',
    description: '',
    meaning: '',
    frequency: '',
    timeOfDay: [],
  });
  const [newFeedTime, setNewFeedTime] = useState('');

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('onezoo_animals')
        .upsert({
          id: animalId,
          name: data.name,
          species: data.species,
          age_years: data.ageYears,
          avatar_name: data.avatarName,
          avatar_personality: data.avatarPersonality,
          avatar_emoji: data.avatarEmoji,
          avatar_color: data.avatarColor,
          catchphrase: data.catchphrase,
          timezone: data.timezone,
          feeding_schedule: data.feedingSchedule,
          typical_active_hours: data.typicalActiveHours,
          knowledge_base: {
            conservationStatus: data.conservationStatus,
            habitatInfo: data.habitatInfo,
            dietInfo: data.dietInfo,
            socialStructure: data.socialStructure,
            funFacts: data.funFacts,
          },
          behavior_patterns: data.behaviors,
        });

      if (!error) {
        alert('Avatar knowledge base saved!');
        onClose();
      }
    } catch (err) {
      console.error('Error saving:', err);
    } finally {
      setSaving(false);
    }
  };

  const addFact = () => {
    if (newFact.trim()) {
      setData({ ...data, funFacts: [...data.funFacts, newFact] });
      setNewFact('');
    }
  };

  const addBehavior = () => {
    if (newBehavior.name.trim()) {
      setData({
        ...data,
        behaviors: [...data.behaviors, newBehavior],
      });
      setNewBehavior({ name: '', description: '', meaning: '', frequency: '', timeOfDay: [] });
    }
  };

  const addFeedTime = () => {
    if (newFeedTime.trim()) {
      setData({
        ...data,
        feedingSchedule: [...data.feedingSchedule, newFeedTime],
      });
      setNewFeedTime('');
    }
  };

  const removeFact = (index: number) => {
    setData({
      ...data,
      funFacts: data.funFacts.filter((_, i) => i !== index),
    });
  };

  const removeBehavior = (index: number) => {
    setData({
      ...data,
      behaviors: data.behaviors.filter((_, i) => i !== index),
    });
  };

  const removeFeedTime = (index: number) => {
    setData({
      ...data,
      feedingSchedule: data.feedingSchedule.filter((_, i) => i !== index),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-700">
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-slate-700 bg-slate-900">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="text-3xl">{data.avatarEmoji}</span>
            Avatar Knowledge Builder
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex gap-2 border-b border-slate-700 mb-6">
            {(['profile', 'behaviors', 'facts', 'schedule'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-medium transition-colors capitalize ${
                  activeTab === tab
                    ? 'text-emerald-400 border-b-2 border-emerald-400'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Animal Name</label>
                  <input
                    type="text"
                    value={data.name}
                    onChange={e => setData({ ...data, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g., Bao Bao"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Species</label>
                  <input
                    type="text"
                    value={data.species}
                    onChange={e => setData({ ...data, species: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g., Giant Panda"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Age (years)</label>
                  <input
                    type="number"
                    value={data.ageYears}
                    onChange={e => setData({ ...data, ageYears: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Avatar Emoji</label>
                  <input
                    type="text"
                    value={data.avatarEmoji}
                    onChange={e => setData({ ...data, avatarEmoji: e.target.value })}
                    maxLength={2}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Avatar Name</label>
                  <input
                    type="text"
                    value={data.avatarName}
                    onChange={e => setData({ ...data, avatarName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g., Keeper Maya"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Personality Type</label>
                  <select
                    value={data.avatarPersonality}
                    onChange={e => setData({ ...data, avatarPersonality: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="enthusiastic educator">Enthusiastic Educator</option>
                    <option value="calm scientist">Calm Scientist</option>
                    <option value="playful storyteller">Playful Storyteller</option>
                    <option value="formal researcher">Formal Researcher</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Catchphrase</label>
                <input
                  type="text"
                  value={data.catchphrase}
                  onChange={e => setData({ ...data, catchphrase: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g., Let's explore!"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Conservation Status</label>
                <textarea
                  value={data.conservationStatus}
                  onChange={e => setData({ ...data, conservationStatus: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g., Vulnerable, population increasing"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Habitat Information</label>
                <textarea
                  value={data.habitatInfo}
                  onChange={e => setData({ ...data, habitatInfo: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Native habitat details..."
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Diet Information</label>
                <textarea
                  value={data.dietInfo}
                  onChange={e => setData({ ...data, dietInfo: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Primary foods, preferences..."
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Social Structure</label>
                <textarea
                  value={data.socialStructure}
                  onChange={e => setData({ ...data, socialStructure: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="How they interact in groups..."
                  rows={2}
                />
              </div>
            </div>
          )}

          {activeTab === 'behaviors' && (
            <div className="space-y-4">
              <div className="bg-slate-700 p-4 rounded-lg space-y-3">
                <h3 className="font-medium text-white">Add New Behavior</h3>
                <input
                  type="text"
                  value={newBehavior.name}
                  onChange={e => setNewBehavior({ ...newBehavior, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Behavior name (e.g., pacing near fence)"
                />
                <textarea
                  value={newBehavior.description}
                  onChange={e => setNewBehavior({ ...newBehavior, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="What it looks like..."
                  rows={2}
                />
                <textarea
                  value={newBehavior.meaning}
                  onChange={e => setNewBehavior({ ...newBehavior, meaning: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="What it means..."
                  rows={2}
                />
                <input
                  type="text"
                  value={newBehavior.frequency}
                  onChange={e => setNewBehavior({ ...newBehavior, frequency: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Frequency (e.g., 3-4 times daily)"
                />
                <button
                  onClick={addBehavior}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 px-4 rounded transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  Add Behavior
                </button>
              </div>

              <div className="space-y-2">
                {data.behaviors.map((behavior, idx) => (
                  <div key={idx} className="bg-slate-700 p-3 rounded flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-white">{behavior.name}</p>
                      <p className="text-sm text-slate-300">{behavior.meaning}</p>
                    </div>
                    <button
                      onClick={() => removeBehavior(idx)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'facts' && (
            <div className="space-y-4">
              <div className="bg-slate-700 p-4 rounded-lg space-y-3">
                <h3 className="font-medium text-white">Add Fun Fact</h3>
                <textarea
                  value={newFact}
                  onChange={e => setNewFact(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter a fun or interesting fact about this animal..."
                  rows={3}
                />
                <button
                  onClick={addFact}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 px-4 rounded transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  Add Fact
                </button>
              </div>

              <div className="space-y-2">
                {data.funFacts.map((fact, idx) => (
                  <div key={idx} className="bg-slate-700 p-3 rounded flex justify-between items-start gap-3">
                    <p className="text-slate-200 text-sm flex-1">{fact}</p>
                    <button
                      onClick={() => removeFact(idx)}
                      className="text-red-400 hover:text-red-300 transition-colors flex-shrink-0"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="space-y-4">
              <div className="bg-slate-700 p-4 rounded-lg space-y-3">
                <h3 className="font-medium text-white">Add Feeding Time</h3>
                <input
                  type="time"
                  value={newFeedTime}
                  onChange={e => setNewFeedTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  onClick={addFeedTime}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 px-4 rounded transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  Add Feeding Time
                </button>
              </div>

              <div className="space-y-2">
                {data.feedingSchedule.map((time, idx) => (
                  <div key={idx} className="bg-slate-700 p-3 rounded flex justify-between items-center">
                    <span className="text-white font-medium">{time}</span>
                    <button
                      onClick={() => removeFeedTime(idx)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="bg-slate-700 p-4 rounded">
                <h3 className="font-medium text-white mb-3">Active Hours (Select multiple)</h3>
                <div className="grid grid-cols-6 gap-2">
                  {Array.from({ length: 24 }).map((_, hour) => (
                    <button
                      key={hour}
                      onClick={() => {
                        const hours = [...data.typicalActiveHours];
                        if (hours.includes(hour)) {
                          setData({ ...data, typicalActiveHours: hours.filter(h => h !== hour) });
                        } else {
                          setData({ ...data, typicalActiveHours: [...hours, hour].sort((a, b) => a - b) });
                        }
                      }}
                      className={`py-2 px-1 rounded text-xs font-medium transition-colors ${
                        data.typicalActiveHours.includes(hour)
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                      }`}
                    >
                      {hour}h
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 flex gap-3 p-6 border-t border-slate-700 bg-slate-900">
          <button
            onClick={onClose}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Avatar'}
          </button>
        </div>
      </div>
    </div>
  );
}
