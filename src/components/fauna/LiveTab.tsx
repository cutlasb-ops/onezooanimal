import { Radio, Calendar } from 'lucide-react';
import { EventCard } from './EventCard';
import type { FaunaAnimal, FaunaEvent } from './faunaData';

interface LiveTabProps {
  schedule: FaunaEvent[];
  animals: FaunaAnimal[];
}

export function LiveTab({ schedule, animals }: LiveTabProps) {
  const liveEvents = schedule.filter(e => e.status === "live");
  const upcomingEvents = schedule.filter(e => e.status === "upcoming");

  return (
    <div>
      {liveEvents.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Radio size={12} className="text-emerald-400 animate-pulse" />
            <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-emerald-400">
              Happening now
            </p>
          </div>
          {liveEvents.map(ev => <EventCard key={ev.id} ev={ev} animals={animals} expanded />)}
        </div>
      )}
      {upcomingEvents.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={12} className="text-amber-200/40" />
            <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-amber-200/40">
              Upcoming
            </p>
          </div>
          {upcomingEvents.map(ev => <EventCard key={ev.id} ev={ev} animals={animals} />)}
        </div>
      )}
    </div>
  );
}
