import { NotificationCategory, NotificationDto } from 'data-access';
import { addDays, dayKeyIn, formatDay, timeIn, todayIn } from '../calendar/calendar-time';

/** Grupos de la API (HU-13), con su ruta en el filtro (`?categoria=`). */
export const NOTIFICATION_CATEGORIES: readonly {
  readonly value: NotificationCategory;
  readonly slug: string;
  readonly label: string;
}[] = [
  { value: 'TRAINING', slug: 'formacion', label: 'Formación' },
  { value: 'APPLICATIONS', slug: 'postulaciones', label: 'Postulaciones y becas' },
  { value: 'PAYMENTS', slug: 'pagos', label: 'Pagos' },
  { value: 'GENERAL', slug: 'general', label: 'General' },
];

export const categoryOfSlug = (slug: string | undefined): NotificationCategory | undefined =>
  NOTIFICATION_CATEGORIES.find((c) => c.slug === slug)?.value;

/** "ahora", "hace 5 min", "hace 3 h", "ayer, 18:30" o "12 oct" (en la zona). */
export function relativeTime(iso: string, timeZone: string, now = new Date()): string {
  const minutes = Math.floor((now.getTime() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return 'ahora';
  if (minutes < 60) return `hace ${minutes} min`;
  const day = dayKeyIn(iso, timeZone);
  const today = dayKeyIn(now, timeZone);
  if (day === today) return `hace ${Math.floor(minutes / 60)} h`;
  if (day === addDays(today, -1)) return `ayer, ${timeIn(iso, timeZone)}`;
  const sameYear = day.slice(0, 4) === today.slice(0, 4);
  return new Intl.DateTimeFormat('es', {
    timeZone,
    day: 'numeric',
    month: 'short',
    ...(sameYear ? {} : { year: 'numeric' }),
  })
    .format(new Date(iso))
    .replace(/\./g, '')
    .replace(/ de /g, ' ');
}

export interface NotificationGroup {
  readonly key: string;
  readonly label: string;
  readonly items: readonly NotificationDto[];
}

/** Fijadas primero ("Importantes"); el resto, por día ("Hoy", "Ayer", "Lunes, 12 de octubre"). */
export function groupByDay(
  notifications: readonly NotificationDto[],
  timeZone: string,
): NotificationGroup[] {
  const today = todayIn(timeZone);
  const yesterday = addDays(today, -1);
  const groups: { key: string; label: string; items: NotificationDto[] }[] = [];
  const pinned = notifications.filter((n) => n.pinned);
  if (pinned.length) groups.push({ key: 'pinned', label: 'Importantes', items: pinned });
  for (const notification of notifications) {
    if (notification.pinned) continue;
    const key = dayKeyIn(notification.createdAt, timeZone);
    let group = groups.find((g) => g.key === key);
    if (!group) {
      const label = key === today ? 'Hoy' : key === yesterday ? 'Ayer' : formatDay(key);
      group = { key, label, items: [] };
      groups.push(group);
    }
    group.items.push(notification);
  }
  return groups;
}

/**
 * Ruta del portal para la acción de una notificación. La API manda rutas
 * del frontend con el prefijo `/portal` (el portal vive en la raíz de su
 * dominio); un enlace completo se abre tal cual.
 */
export function notificationTarget(
  path: string,
): { readonly external: string } | { readonly url: string } {
  if (/^https?:\/\//i.test(path)) return { external: path };
  const url = path.replace(/^\/portal(?=\/|$)/, '') || '/';
  return { url: url.startsWith('/') ? url : `/${url}` };
}
