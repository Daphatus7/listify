"use client";

import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { ScheduleState, Task } from './types';
import { toISO } from './time';
import { autoPushDownOverdue, deriveEventsFromTasks, findNextFreeWindow } from './schedule';

function makeId(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// Initial demo data
function initialTasks(now: Date): Task[] {
  const baseIso = toISO(now);
  return [
    { id: makeId('task'), title: 'Write spec', durationMinutes: 30, status: 'todo' as const, createdAt: baseIso, startTime: toISO(new Date(now.getTime() + 5 * 60_000)), priority: 2 },
    { id: makeId('task'), title: 'Email replies', durationMinutes: 20, status: 'todo' as const, createdAt: baseIso, startTime: toISO(new Date(now.getTime() + 45 * 60_000)), priority: 1 },
  ];
}

const defaultState: ScheduleState = {
  tasks: [],
  events: [],
  nowIso: toISO(new Date()),
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  workdayStartHour: 8,
  workdayEndHour: 18,
};

type Action =
  | { type: 'tick'; nowIso: string }
  | { type: 'init' }
  | { type: 'addTask'; title: string; durationMinutes: number; startTime?: string }
  | { type: 'removeTask'; id: string }
  | { type: 'editTask'; id: string; patch: Partial<Omit<Task, 'id' | 'createdAt'>> }
  | { type: 'completeTask'; id: string };

function reducer(state: ScheduleState, action: Action): ScheduleState {
  switch (action.type) {
    case 'init': {
      const now = new Date();
      const tasks = initialTasks(now);
      const events = deriveEventsFromTasks(tasks, now, state.workdayStartHour, state.workdayEndHour);
      return { ...state, tasks, events, nowIso: toISO(now) };
    }
    case 'tick': {
      const next = { ...state, nowIso: action.nowIso };
      // Auto push-down overdue tasks every tick
      return autoPushDownOverdue(next);
    }
    case 'addTask': {
      const t: Task = {
        id: makeId('task'),
        title: action.title,
        durationMinutes: action.durationMinutes,
        status: 'todo' as const,
        createdAt: state.nowIso,
        startTime: action.startTime,
        priority: 0,
      };
      let tasks = [...state.tasks, t];
      // If no startTime was provided, schedule it to the next available slot starting now
      if (!t.startTime) {
        const tempState: ScheduleState = {
          ...state,
          tasks,
          events: deriveEventsFromTasks(tasks, new Date(state.nowIso), state.workdayStartHour, state.workdayEndHour),
        };
        const { startsAt } = findNextFreeWindow(tempState, new Date(state.nowIso), t.durationMinutes);
        tasks = tasks.map(x => (x.id === t.id ? { ...x, startTime: toISO(startsAt) } : x));
      }
      const events = deriveEventsFromTasks(tasks, new Date(state.nowIso), state.workdayStartHour, state.workdayEndHour);
      return { ...state, tasks, events };
    }
    case 'removeTask': {
      const tasks = state.tasks.filter(t => t.id !== action.id);
      const events = deriveEventsFromTasks(tasks, new Date(state.nowIso), state.workdayStartHour, state.workdayEndHour);
      return { ...state, tasks, events };
    }
    case 'editTask': {
      const tasks = state.tasks.map(t => (t.id === action.id ? { ...t, ...action.patch } : t));
      const events = deriveEventsFromTasks(tasks, new Date(state.nowIso), state.workdayStartHour, state.workdayEndHour);
      return { ...state, tasks, events };
    }
    case 'completeTask': {
      const tasks = state.tasks.map(t => (t.id === action.id ? { ...t, status: 'done' as const } : t));
      const events = deriveEventsFromTasks(tasks, new Date(state.nowIso), state.workdayStartHour, state.workdayEndHour);
      return { ...state, tasks, events };
    }
    default:
      return state;
  }
}

const StoreCtx = createContext<{ state: ScheduleState; dispatch: React.Dispatch<Action> } | null>(null);

export function ScheduleProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, defaultState);

  useEffect(() => {
    dispatch({ type: 'init' });
  }, []);

  // Tick every 20s for now-line and overdue push-down (MVP)
  useEffect(() => {
    const tick = () => dispatch({ type: 'tick', nowIso: toISO(new Date()) });
    const id = setInterval(tick, 20_000);
    tick();
    return () => clearInterval(id);
  }, []);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useSchedule() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error('useSchedule must be used within ScheduleProvider');
  return ctx;
}
