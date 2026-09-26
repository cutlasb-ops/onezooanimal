import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { FeatureSection } from '../lib/database.types';

const DEFAULT_SECTIONS: FeatureSection[] = [
  {
    id: 'default-1',
    title: 'Live Animal Cams',
    description: 'Watch real animals in their habitats with 24/7 live streams from zoos and sanctuaries around the world. See lions, elephants, penguins, and more -- all from the comfort of your home.',
    image_url: 'https://images.pexels.com/photos/247502/pexels-photo-247502.jpeg?auto=compress&cs=tinysrgb&w=1400',
    display_order: 0,
    is_active: true,
    created_at: '',
    updated_at: '',
  },
  {
    id: 'default-2',
    title: 'Interactive Enrichment',
    description: 'Use OneZoo Coins to interact with animals in real-time. Toss treats, drop toys, spray water, and trigger enrichment activities that keep the animals happy and engaged.',
    image_url: 'https://images.pexels.com/photos/1661535/pexels-photo-1661535.jpeg?auto=compress&cs=tinysrgb&w=1400',
    display_order: 1,
    is_active: true,
    created_at: '',
    updated_at: '',
  },
  {
    id: 'default-3',
    title: 'Community & Chat',
    description: 'Join thousands of animal lovers in our live chat rooms. Share your favorite moments, learn fun facts, and connect with fellow wildlife enthusiasts from around the globe.',
    image_url: 'https://images.pexels.com/photos/1008155/pexels-photo-1008155.jpeg?auto=compress&cs=tinysrgb&w=1400',
    display_order: 2,
    is_active: true,
    created_at: '',
    updated_at: '',
  },
];

export function FeatureShowcase() {
  const [sections, setSections] = useState<FeatureSection[]>(DEFAULT_SECTIONS);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('feature_sections')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (data && data.length > 0) {
        setSections(data);
        setActiveIndex(0);
      }
    })();
  }, []);

  if (sections.length === 0) return null;

  return (
    <div className="w-full" style={{ background: '#fdf6e3' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div
          className="bg-stone-100 rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-[minmax(320px,480px)_1fr] shadow-sm border border-stone-200/60"
          style={{ minHeight: 520 }}
        >
          <div className="p-8 lg:p-12 flex flex-col justify-center">
            <ul className="space-y-0" role="list">
              {sections.map((section, i) => (
                <li
                  key={section.id}
                  className={`border-b border-stone-200/80 last:border-0 ${i === 0 ? '' : ''}`}
                >
                  <h3>
                    <button
                      onClick={() => setActiveIndex(i)}
                      className="w-full flex items-center justify-between py-6 text-left focus:outline-none group"
                      aria-expanded={activeIndex === i}
                    >
                      <span
                        className="text-xl sm:text-2xl font-semibold tracking-tight transition-colors duration-300"
                        style={{ color: activeIndex === i ? '#78350f' : '#44403c' }}
                      >
                        {section.title}
                      </span>
                      <span className="ml-4 shrink-0">
                        <ChevronDown
                          size={22}
                          className="transition-transform duration-300"
                          style={{
                            color: '#a8a29e',
                            transform: activeIndex === i ? 'rotate(180deg)' : 'rotate(0deg)',
                          }}
                        />
                      </span>
                    </button>
                  </h3>
                  <div
                    className="grid transition-all duration-500 ease-in-out"
                    style={{
                      gridTemplateRows: activeIndex === i ? '1fr' : '0fr',
                      opacity: activeIndex === i ? 1 : 0,
                    }}
                  >
                    <div className="overflow-hidden">
                      <p className="pb-6 pr-4 text-base leading-relaxed text-stone-600 max-w-[380px]">
                        {section.description}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative w-full h-full min-h-[320px] lg:min-h-0">
            {sections.map((section, i) => (
              <div
                key={section.id}
                className="absolute inset-0"
                style={{
                  opacity: activeIndex === i ? 1 : 0,
                  transition: 'opacity 700ms ease-in-out',
                  pointerEvents: activeIndex === i ? 'auto' : 'none',
                }}
              >
                <img
                  src={section.image_url}
                  alt={section.title}
                  className="w-full h-full object-cover"
                  loading={i === 0 ? 'eager' : 'lazy'}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
