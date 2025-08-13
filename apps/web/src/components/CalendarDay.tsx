"use client";

import React, { useMemo } from 'react';
import { useSchedule } from "../lib/store";
import { fromISO } from "../lib/time";
import { Box, Paper, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

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

  return (
    <Paper variant="outlined" sx={{ display: 'flex', width: '100%', overflow: 'auto' }}>
      {/* Time labels */}
      <Box sx={{ width: 64, flexShrink: 0, borderRight: theme => `1px solid ${theme.palette.divider}`, bgcolor: 'action.hover' }}>
        {hours.map((h, idx) => (
          <Box key={h} sx={{ position: 'relative', height: `${60 * pxPerMin}px` }}>
            <Typography variant="caption" sx={{ position: 'absolute', left: 6, top: idx===0? 0 : -10, opacity: 0.7 }}>{h}:00</Typography>
            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, bgcolor: 'divider' }} />
          </Box>
        ))}
      </Box>

      {/* Grid and events */}
      <Box sx={{ position: 'relative', flex: 1, height: `${totalMins * pxPerMin}px` }}>
        {/* Hour lines */}
        {hours.map((h) => (
          <Box key={h} sx={{ position: 'absolute', left: 0, right: 0, top: `${(h*60 - startMins) * pxPerMin}px`, height: 1, bgcolor: 'divider' }} />
        ))}

        {/* Now line if within workday */}
        {nowMins >= startMins && nowMins <= endMins && (
          <Box sx={{ position: 'absolute', left: 0, right: 0, top: `${(nowMins - startMins) * pxPerMin}px` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'error.main' }} />
              <Box sx={{ height: 1, bgcolor: 'error.main', flex: 1 }} />
            </Box>
          </Box>
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
            <Paper
              key={evt.id}
              variant="outlined"
              sx={(theme) => ({
                position: 'absolute',
                left: 8,
                right: 8,
                top,
                height,
                minHeight: 22,
                overflow: 'hidden',
                backgroundColor: alpha(theme.palette.primary.main, 0.15),
                borderColor: theme.palette.primary.light,
              })}
            >
              <Typography variant="caption" sx={{ px: 1, pt: 0.5, fontWeight: 600, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.title}</Typography>
              <Typography variant="caption" sx={{ px: 1, opacity: 0.7 }}>{task.durationMinutes} min</Typography>
            </Paper>
          );
        })}
      </Box>
    </Paper>
  );
}
