const DAY_MS = 24 * 60 * 60 * 1000;

/** Fecha `AAAA-MM-DD` en UTC. Es la que usa el backoffice para "hoy" y los nombres de archivo. */
export function utcDateStamp(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

/** Fecha `AAAA-MM-DD` en hora local. Es la que usa el portal de cliente para el parte del día. */
export function localDateStamp(date: Date = new Date()): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Diferencia en días (con decimales) entre una fecha `AAAA-MM-DD` y `now`. */
export function daysUntil(isoDate: string, now: Date = new Date()): number {
  return (new Date(isoDate).getTime() - now.getTime()) / DAY_MS;
}

/** Diferencia en días naturales completos entre hoy y una fecha `AAAA-MM-DD`. */
export function calendarDaysUntil(isoDate: string, now: Date = new Date()): number {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const target = new Date(isoDate);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / DAY_MS);
}

export function formatDateTime(date: Date = new Date()): string {
  return date.toLocaleString("es-ES");
}

export function formatDate(date: Date = new Date()): string {
  return date.toLocaleDateString("es-ES");
}

export function formatTime(date: Date = new Date()): string {
  return date.toLocaleTimeString();
}
