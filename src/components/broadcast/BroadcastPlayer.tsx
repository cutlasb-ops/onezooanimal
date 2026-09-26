import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { BroadcastScoreBug } from './BroadcastScoreBug';
import { BroadcastOverlay, ActivityMeter, StatLine } from './BroadcastOverlay';
import { RareMomentOverlay } from './RareMomentOverlay';
import { AvatarChatPanel } from './AvatarChatPanel';
import { ConservationTracker } from './ConservationTracker';
import { KeeperMomentTrigger } from './KeeperMomentTrigger';

interface BroadcastPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  animalId: string;
  animalName: string;
  animalSpecies: string;
  avatarName: string;
  avatarEmoji: string;
  streamUrl?: string;
  isKeeperView?: boolean;
}

interface RareMomentState {
  isActive: boolean;
  type: string;
  name: string;
  description: string;
}

export function BroadcastPlayer({
  isOpen,
  onClose,
  animalId,
  animalName,
  animalSpecies,
  avatarName,
  avatarEmoji,
  streamUrl = 'https://via.placeholder.com/1280x720?text=Live+Stream',
  isKeeperView = false,
}: BroadcastPlayerProps) {
  const [isLive, setIsLive] = useState(true);
  const [timeActive, setTimeActive] = useState('1h 23m');
  const [viewerCount, setViewerCount] = useState(2847);
  const [activityLevel, setActivityLevel] = useState(65);
  const [feedingEvents, setFeedingEvents] = useState(3);
  const [rareBehaviors, setRareBehaviors] = useState(1);
  const [treatCount, setTreatCount] = useState(847);
  const [conservationMilestone, setConservationMilestone] = useState('Top 5% Day');
  const [rareMoment, setRareMoment] = useState<RareMomentState>({
    isActive: false,
    type: '',
    name: '',
    description: '',
  });

  useEffect(() => {
    if (!isOpen) return;

    const timerInterval = setInterval(() => {
      const minutes = Math.floor(Math.random() * 60);
      const hours = Math.floor(Math.random() * 3);
      setTimeActive(`${hours}h ${minutes}m`);
      setViewerCount(prev => prev + Math.floor(Math.random() * 100 - 50));
      setActivityLevel(prev => Math.min(100, Math.max(0, prev + Math.floor(Math.random() * 20 - 10))));
    }, 5000);

    return () => clearInterval(timerInterval);
  }, [isOpen]);

  const handleMomentTriggered = (moment: any) => {
    setRareMoment({
      isActive: true,
      type: moment.type,
      name: moment.name,
      description: moment.description,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <span className="text-3xl">{avatarEmoji}</span>
          {animalName} - LIVE
          <span className="inline-block w-3 h-3 rounded-full bg-red-500 animate-pulse" />
        </h1>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
          <X size={28} />
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden gap-4 p-4">
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex-1 bg-black rounded-lg overflow-hidden border border-slate-700 relative">
            <img
              src={streamUrl}
              alt={`${animalName} live stream`}
              className="w-full h-full object-cover"
            />

            <BroadcastScoreBug
              animalName={animalName}
              animalSpecies={animalSpecies}
              timeActive={timeActive}
              mood="PLAYFUL"
              viewerCount={viewerCount}
              avatarEmoji={avatarEmoji}
            />

            <ActivityMeter activityLevel={activityLevel} />

            <StatLine
              feedingEvents={feedingEvents}
              rareBehaviors={rareBehaviors}
              treatCount={treatCount}
              conservationMilestone={conservationMilestone}
            />

            <ConservationTracker
              animalName={animalName}
              species={animalSpecies}
              raisedToday={847}
              raisedTotal={12847}
              treatsDonated={847}
              treesPlanted={847}
              wildPopulation={1864}
              populationTrend={17}
              isCollapsed={true}
            />

            <RareMomentOverlay
              isActive={rareMoment.isActive}
              behaviorName={rareMoment.name}
              description={rareMoment.description}
              viewerCount={viewerCount}
              onCloseRequested={() =>
                setRareMoment({
                  isActive: false,
                  type: '',
                  name: '',
                  description: '',
                })
              }
              animalName={animalName}
              avatarEmoji={avatarEmoji}
            />
          </div>
        </div>

        <div className="w-96 flex flex-col gap-4">
          <AvatarChatPanel
            animalId={animalId}
            sessionId="session-123"
            isLive={isLive}
            animalName={animalName}
            avatarName={avatarName}
            avatarEmoji={avatarEmoji}
          />

          {isKeeperView && (
            <KeeperMomentTrigger
              animalId={animalId}
              sessionId="session-123"
              animalName={animalName}
              onMomentTriggered={handleMomentTriggered}
            />
          )}
        </div>
      </div>

      <div className="px-4 py-3 bg-slate-900 border-t border-slate-700 flex items-center justify-between text-sm">
        <div className="flex gap-4">
          <span className="text-slate-400">
            Viewers: <span className="text-white font-bold">{viewerCount.toLocaleString()}</span>
          </span>
          <span className="text-slate-400">
            Treats: <span className="text-white font-bold">{treatCount}</span>
          </span>
          <span className="text-slate-400">
            Feeding Events: <span className="text-white font-bold">{feedingEvents}</span>
          </span>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded transition-colors">
            Clip Stream
          </button>
          <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded transition-colors">
            Share
          </button>
        </div>
      </div>
    </div>
  );
}
