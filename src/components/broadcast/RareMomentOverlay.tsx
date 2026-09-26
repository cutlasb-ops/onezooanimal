import { useEffect, useState } from 'react';
import { AlertCircle, Download, Share2 } from 'lucide-react';

interface RareMomentOverlayProps {
  isActive: boolean;
  behaviorName: string;
  description: string;
  viewerCount: number;
  onCloseRequested: () => void;
  animalName: string;
  avatarEmoji: string;
}

export function RareMomentOverlay({
  isActive,
  behaviorName,
  description,
  viewerCount,
  onCloseRequested,
  animalName,
  avatarEmoji,
}: RareMomentOverlayProps) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isActive) {
      setShowContent(true);
      const timer = setTimeout(() => {
        setShowContent(false);
        setTimeout(onCloseRequested, 500);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [isActive, onCloseRequested]);

  if (!isActive && !showContent) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-500 ${
        showContent ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div className={`relative max-w-2xl w-full transition-all duration-500 ${
        showContent ? 'scale-100' : 'scale-95'
      }`}>
        <div className="bg-gradient-to-br from-red-950 via-slate-900 to-red-950 border-2 border-red-500/60 rounded-2xl overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 animate-pulse" />

          <div className="p-8 text-center space-y-6">
            <div className="flex items-center justify-center gap-4 mb-4">
              <AlertCircle size={48} className="text-red-500 animate-bounce" />
              <div>
                <p className="text-red-400 font-black text-sm uppercase tracking-widest mb-2">Rare Moment Alert</p>
                <p className="text-2xl font-black text-white">{behaviorName.toUpperCase()}</p>
              </div>
              <AlertCircle size={48} className="text-red-500 animate-bounce" />
            </div>

            <p className="text-slate-300 text-lg leading-relaxed max-w-lg mx-auto">{description}</p>

            <div className="bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-600 rounded-lg p-4">
              <p className="text-sm text-slate-300 mb-2">YOU'RE ONE OF</p>
              <p className="text-4xl font-black text-amber-300">{viewerCount.toLocaleString()}</p>
              <p className="text-xs text-slate-400 mt-1">watching {animalName} right now</p>
            </div>

            <div className="flex gap-3 justify-center pt-4">
              <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-lg transition-colors">
                <Download size={18} />
                Clip This Moment
              </button>
              <button className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors">
                <Share2 size={18} />
                Share
              </button>
            </div>

            <p className="text-xs text-slate-500 pt-2">This alert closes automatically</p>
          </div>
        </div>
      </div>
    </div>
  );
}
