export type TaskStatus = 'todo' | 'doing' | 'done';

export interface Task {
  id: string;
  title: string;
  startTime?: string; // ISO string; optional for tasks not yet scheduled
  durationMinutes: number; // user-defined duration
  status: TaskStatus;
  createdAt: string; // ISO
  priority?: number; // higher = more important
}

export type EventStatus = 'scheduled' | 'completed' | 'canceled';

export interface CalendarEvent {
  id: string;
  taskId?: string; // link back to task if event represents a task block
  startsAt: string; // ISO
  endsAt: string; // ISO
  status: EventStatus;
  source?: 'manual' | 'system';
}

export interface ScheduleState {
  tasks: Task[];
  events: CalendarEvent[]; // derived from tasks for now (1:1 in MVP)
  nowIso: string; // ISO string for current time
  timezone: string; // IANA TZ, for client render only (MVP)
  workdayStartHour: number; // e.g., 8
  workdayEndHour: number;   // e.g., 18
}
