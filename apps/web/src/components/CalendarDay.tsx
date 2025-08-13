"use client";

import React, { useMemo } from 'react';
import { useSchedule } from "../lib/store";
import { fromISO } from "../lib/time";

function minutesIntoDay(d: Date) {
  return d.getHours() * 60 + d.getMinutes();
}

export default function CalendarDay() {
  const { state } = useSchedule();
  const startHour = state.workdayStartHour;
  const endHour = state.workdayEndHour;
  const hours = useMemo(() => Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i), [startHour, endHour]);

  const now = fromISO(state.nowIso);
  const nowMins = minutesIntoDay(now);
  const startMins = startHour * 60;
  const endMins = endHour * 60;
  const totalMins = endMins - startMins;

  const events = state.events;

  const pxPerMin = 2; // 1 minute = 2px -> 10 hours = 1200px
  const colWidth = 260;

  return (
    <div className="flex w-full overflow-auto border rounded">
      {/* Time labels */}
      <div className="w-16 shrink-0 border-r bg-black/2 dark:bg-white/2">
        {hours.map((h, idx) => (
          <div key={h} className="relative" style={{ height: `${60 * pxPerMin}px` }}>
            <div className={`absolute ${idx===0? 'top-0':'-top-[10px]'} left-1 text-xs opacity-70`}>{h}:00</div>
            <div className="w-full h-px bg-black/10 dark:bg-white/10 absolute top-0 left-0" />
          </div>
        ))}
      </div>

      {/* Grid and events */}
      <div className="relative flex-1" style={{ height: `${totalMins * pxPerMin}px` }}>
        {/* Hour lines */}
        {hours.map((h) => (
          <div key={h} className="absolute left-0 right-0" style={{ top: `${(h*60 - startMins) * pxPerMin}px`, height: 1 }}>
            <div className="w-full h-px bg-black/10 dark:bg-white/10" />
          </div>
        ))}

        {/* Now line if within workday */}
        {nowMins >= startMins && nowMins <= endMins && (
          <div className="absolute left-0 right-0" style={{ top: `${(nowMins - startMins) * pxPerMin}px` }}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-600" />
              <div className="h-px bg-red-600 flex-1" />
            </div>
          </div>
        )}

        {/* Events */}
        {events.map(evt => {
          const s = fromISO(evt.startsAt);
          const e = fromISO(evt.endsAt);
          const top = (minutesIntoDay(s) - startMins) * pxPerMin;
          const height = (e.getTime() - s.getTime()) / 60000 * pxPerMin;
          const task = state.tasks.find(t => t.id === evt.taskId);
          if (!task) return null;
          return (
            <div key={evt.id} className="absolute left-2 right-2 rounded border bg-blue-500/15 dark:bg-blue-400/15 border-blue-400/50 overflow-hidden" style={{ top, height, minHeight: 22 }}>
              <div className="text-xs px-2 py-1 font-medium truncate">{task.title}</div>
              <div className="text-[10px] opacity-70 px-2">{task.durationMinutes} min</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
