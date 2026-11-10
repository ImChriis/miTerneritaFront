import { environment } from '../../../environments/environment.developer';
import { Event } from '../models/event.model';

export type EventCategory = 'concierto' | 'fiesta' | 'evento';

export const CATEGORY_LABEL: Record<EventCategory, string> = {
  concierto: 'Concierto',
  fiesta: 'Fiesta',
  evento: 'Evento'
};

export const CATEGORY_ICON: Record<EventCategory, string> = {
  concierto: 'pi pi-microphone',
  fiesta: 'pi pi-sparkles',
  evento: 'pi pi-star'
};

const CONCERT_RE = /concierto|en vivo|live|tour|gira|banda|acústic|acustic|sinf[oó]n|orquesta|tributo|recital|unplugged/i;
const PARTY_RE = /fiesta|party|halloween|rumba|\bdj\b|after|costume|carnaval|neon|reggaet/i;

/** Construye la URL completa de una imagen guardada en el backend. */
export function eventImage(path?: string | null): string {
  if (!path) return '';
  if (/^https?:\/\//i.test(path) || /^(assets\/|\/)/.test(path)) return path;
  return `${environment.apiImg}/${path}`;
}

/**
 * La API envía la fecha como 'YYYY-MM-DD'. `new Date('2026-10-29')` la interpreta en UTC
 * y en Venezuela (UTC-4) se muestra un día antes, por eso se construye en hora local.
 */
export function parseEventDate(value: string | Date | null | undefined): Date {
  if (!value) return new Date(NaN);
  if (value instanceof Date) return value;
  const [y, m, d] = value.slice(0, 10).split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

/** Un evento es pasado cuando su día ya terminó. */
export function isPastEvent(event: Pick<Event, 'date'>, now = new Date()): boolean {
  const day = parseEventDate(event.date as any);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return day.getTime() < today.getTime();
}

/**
 * Usa `event.category` si el backend lo envía; si no, la deduce del nombre/descripción.
 * Recomendado: agregar la columna `category` en la tabla de eventos.
 */
export function eventCategory(event: Partial<Event>): EventCategory {
  const raw = (event.category ?? '').toString().toLowerCase().trim();
  if (raw.startsWith('concier')) return 'concierto';
  if (raw.startsWith('fiest') || raw === 'party') return 'fiesta';
  if (raw) return 'evento';

  const text = `${event.name ?? ''} ${stripHtml(event.description ?? '')}`;
  if (CONCERT_RE.test(text)) return 'concierto';
  if (PARTY_RE.test(text)) return 'fiesta';
  return 'evento';
}

/** '15:15:00' -> '3:15 PM' */
export function formatTime12(time?: string | null): string {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  if (Number.isNaN(h)) return time;
  const suffix = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m || 0).padStart(2, '0')} ${suffix}`;
}

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Ordena por fecha ascendente (próximos primero). */
export function byDateAsc(a: Event, b: Event) {
  return parseEventDate(a.date as any).getTime() - parseEventDate(b.date as any).getTime();
}

/** Fecha y hora locales del cierre de venta -> ISO para el backend; null si falta alguna. */
export const cierreVentaIso = (fecha?: string, hora?: string): string | null =>
  fecha && hora ? new Date(`${fecha}T${hora}`).toISOString() : null;

/** ISO del backend -> { cierreFecha: 'YYYY-MM-DD', cierreHora: 'HH:mm' } en hora local. */
export function partirCierreVenta(iso?: string | null): { cierreFecha: string; cierreHora: string } {
  const d = iso ? new Date(iso) : null;
  if (!d || isNaN(d.getTime())) return { cierreFecha: '', cierreHora: '' };
  const p = (n: number) => String(n).padStart(2, '0');
  return { cierreFecha: `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`, cierreHora: `${p(d.getHours())}:${p(d.getMinutes())}` };
}
