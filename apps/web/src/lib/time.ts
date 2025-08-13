export const SLOT_MINUTES = 5;

export function toISO(d: Date) {
  return d.toISOString();
}

export function fromISO(iso: string) {
  return new Date(iso);
}

export function addMinutes(d: Date, minutes: number) {
  return new Date(d.getTime() + minutes * 60_000);
}

export function minutesBetween(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / 60_000);
}

export function roundUpToSlot(d: Date, slotMinutes = SLOT_MINUTES) {
  const ms = d.getTime();
  const remainder = ms % (slotMinutes * 60_000);
  if (remainder === 0) return d;
  return new Date(ms + (slotMinutes * 60_000 - remainder));
}

export function startOfDayLocal(d: Date) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function setTimeLocal(base: Date, hours: number, minutes = 0) {
  const d = new Date(base);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

export function clampToWorkday(d: Date, startHour: number, endHour: number) {
  const start = setTimeLocal(d, startHour);
  const end = setTimeLocal(d, endHour);
  if (d < start) return start;
  if (d > end) return addMinutes(end, SLOT_MINUTES); // move to just after day end
  return d;
}

export function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && bStart < aEnd;
}
