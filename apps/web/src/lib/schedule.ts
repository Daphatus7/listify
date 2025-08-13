import { CalendarEvent, ScheduleState, Task } from './types';
import { SLOT_MINUTES, addMinutes, clampToWorkday, fromISO, overlaps, roundUpToSlot, setTimeLocal, toISO } from './time';

function isWithinWorkday(d: Date, startHour: number, endHour: number) {
  const start = setTimeLocal(d, startHour);
  const end = setTimeLocal(d, endHour);
  return d >= start && d <= end;
}

export function deriveEventsFromTasks(tasks: Task[], baseDate: Date, startHour: number, endHour: number): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  for (const t of tasks) {
    if (t.status === 'done') continue;
    if (!t.startTime) continue;
    const startsAt = fromISO(t.startTime);
    const endsAt = addMinutes(startsAt, t.durationMinutes);
    if (!isWithinWorkday(startsAt, startHour, endHour)) continue;
    events.push({ id: `evt_${t.id}`,
      taskId: t.id,
      startsAt: toISO(startsAt),
      endsAt: toISO(endsAt),
      status: 'scheduled',
      source: 'system' });
  }
  // Sort by start
  events.sort((a,b)=> fromISO(a.startsAt).getTime() - fromISO(b.startsAt).getTime());
  return events;
}

export function findNextFreeWindow(
  state: ScheduleState,
  desiredStart: Date,
  durationMinutes: number
): { startsAt: Date; endsAt: Date } {
  const { workdayStartHour, workdayEndHour, events } = state;
  // Scan forward in SLOT_MINUTES increments to find a contiguous window
  let cursor = roundUpToSlot(clampToWorkday(desiredStart, workdayStartHour, workdayEndHour));

  // Build occupied windows
  const occupied = events
    .filter(e => e.status === 'scheduled')
    .map(e => ({ s: fromISO(e.startsAt), e: fromISO(e.endsAt) }))
    .sort((a,b)=> a.s.getTime() - b.s.getTime());

  while (true) {
    // if beyond workday, move to next day start
    const dayEnd = setTimeLocal(cursor, workdayEndHour);
    if (addMinutes(cursor, durationMinutes) > dayEnd) {
      // next day start
      const nextDay = new Date(cursor);
      nextDay.setDate(nextDay.getDate() + 1);
      cursor = setTimeLocal(nextDay, workdayStartHour);
      continue;
    }

    const candidateEnd = addMinutes(cursor, durationMinutes);
    const conflict = occupied.find(win => overlaps(cursor, candidateEnd, win.s, win.e));
    if (!conflict) {
      return { startsAt: cursor, endsAt: candidateEnd };
    }
    // Move cursor to end of conflict rounded to slot
    cursor = roundUpToSlot(addMinutes(conflict.e, 0));
  }
}

export function autoPushDownOverdue(state: ScheduleState): ScheduleState {
  const now = fromISO(state.nowIso);
  const events = deriveEventsFromTasks(state.tasks, now, state.workdayStartHour, state.workdayEndHour);
  // For each overdue task, move its startTime to next free slot after now
  const updatedTasks: Task[] = state.tasks.map(t => ({ ...t }));

  for (const evt of events) {
    const endsAt = fromISO(evt.endsAt);
    const task = updatedTasks.find(tt => tt.id === evt.taskId);
    if (!task) continue;
    if (task.status !== 'done' && now > endsAt) {
      // Temporarily remove current event from occupied list by excluding it
      const occupied = events.filter(e => e.id !== evt.id && e.status === 'scheduled');
      const tempState: ScheduleState = { ...state, events: occupied };
      const { startsAt, endsAt } = findNextFreeWindow(tempState, now, task.durationMinutes);
      task.startTime = toISO(startsAt);
    }
  }

  return { ...state, tasks: updatedTasks, events: deriveEventsFromTasks(updatedTasks, now, state.workdayStartHour, state.workdayEndHour) };
}
