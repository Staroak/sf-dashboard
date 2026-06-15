// Day/time context that drives all Monday-only weekend-stats behavior.
//
// Everything weekend-related is gated on this so Tue–Fri renders exactly as before.
//
// Dev/demo overrides (query string), so the Monday view can be seen any day:
//   ?day=mon            force the day of week (sun|mon|tue|wed|thu|fri|sat, or 0-6)
//   ?hour=10            force the hour of day (0-23) — drives the 10am catch-up gate
// When any override is present, `forced` is true (used to make the catch-up reel
// repeatable instead of once-per-Monday).

export interface DayContext {
  /** Local day is Monday (real or forced). */
  isMonday: boolean;
  /** Monday AND local time is 10:00 or later — the weekend catch-up window. */
  isWeekendCatchUpTime: boolean;
  /** A dev override (?day / ?hour) is active. */
  forced: boolean;
}

const DAY_NAMES: Record<string, number> = {
  sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6,
};

function parseDay(value: string): number | null {
  const key = value.trim().toLowerCase();
  if (key in DAY_NAMES) return DAY_NAMES[key];
  const n = Number(key);
  return Number.isInteger(n) && n >= 0 && n <= 6 ? n : null;
}

export function getDayContext(now: Date = new Date(), search?: string): DayContext {
  let day = now.getDay();
  let hour = now.getHours();
  let forced = false;

  const query = search ?? (typeof window !== 'undefined' ? window.location.search : '');
  if (query) {
    const params = new URLSearchParams(query);
    const dayParam = params.get('day');
    const hourParam = params.get('hour');
    if (dayParam !== null) {
      const parsed = parseDay(dayParam);
      if (parsed !== null) { day = parsed; forced = true; }
    }
    if (hourParam !== null) {
      const parsed = Number(hourParam);
      if (Number.isInteger(parsed) && parsed >= 0 && parsed <= 23) { hour = parsed; forced = true; }
    }
  }

  const isMonday = day === 1;
  return {
    isMonday,
    isWeekendCatchUpTime: isMonday && hour >= 10,
    forced,
  };
}

/** Stable per-Monday key for the once-per-Monday localStorage gate. */
export function mondayKey(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10); // YYYY-MM-DD
}
