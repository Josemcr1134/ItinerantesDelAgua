import {
  CalendarItemDto,
  ClassroomDto,
  ClassroomModuleDto,
  FinalProjectDto,
  FormationCardDto,
  MaterialModuleDto,
  MaterialResourceDto,
  ModuleStatus,
  OfferModality,
  OfferOrigin,
  OfferType,
  PortalVenueDto,
  SessionAttendanceDto,
  SessionCardDto,
  SessionJoinDto,
} from 'data-access';

// Datos de prueba de "Formación" (solo desarrollo). Las fechas se calculan
// desde "ahora" para que siempre haya una sesión en curso, próximas y pasadas.

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;
const iso = (ms: number) => new Date(ms).toISOString();
/** Hora de CDMX (UTC−6) del día `days` desde hoy. */
const cdmxAt = (days: number, hour: number, minute = 0) => {
  const now = new Date();
  return Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + days,
    hour + 6,
    minute,
  );
};

/** Origen de las URLs "firmadas" de prueba (archivos del propio portal). */
const asset = (path: string) => `${location.origin}/assets/${path}`;

interface MockOffer {
  readonly id: string;
  readonly name: string;
  readonly type: OfferType;
  readonly modality: OfferModality;
  readonly origin: OfferOrigin;
  readonly cohortLabel: string;
  readonly cover: string | null;
  readonly teachers: readonly string[];
  readonly modules: readonly string[];
  /** Semana de la primera sesión respecto a hoy (negativa = ya empezó). */
  readonly firstWeek: number;
  readonly sessionHour: number;
  readonly suspended?: boolean;
  readonly finished?: boolean;
  readonly venue?: PortalVenueDto;
  /** La próxima sesión ya abrió su acceso (empieza en 5 min). */
  readonly liveNow?: boolean;
}

export const MOCK_OFFERS: readonly MockOffer[] = [
  {
    id: 'mock-eco',
    name: 'Diplomado en Ecotecnologías del Agua',
    type: 'DIPLOMA',
    modality: 'ONLINE_LIVE',
    origin: 'NAS',
    cohortLabel: '2026-2',
    cover: null,
    teachers: ['Lucía Hernández', 'Mateo Rivas Calderón'],
    modules: [
      'El agua en el territorio',
      'Captación de agua de lluvia',
      'Humedales construidos',
      'Baños secos y saneamiento',
    ],
    firstWeek: -5,
    sessionHour: 18,
    liveNow: true,
  },
  {
    id: 'mock-bio',
    name: 'Diplomado en Bioingeniería del Agua',
    type: 'DIPLOMA',
    modality: 'ONLINE_LIVE',
    origin: 'MOODLE',
    cohortLabel: '2025-2',
    cover: 'assets/formation/cover-river.webp',
    teachers: ['Ana Sofía Méndez'],
    modules: ['Ríos vivos', 'Restauración de cauces', 'Bioingeniería en laderas'],
    firstWeek: -14,
    sessionHour: 10,
    finished: true,
  },
  {
    id: 'mock-lluvia',
    name: 'Curso de Cosecha de Lluvia en Escuelas',
    type: 'COURSE',
    modality: 'ONLINE_LIVE',
    origin: 'NAS',
    cohortLabel: '2026-3',
    cover: 'assets/formation/cover-corn.webp',
    teachers: ['Mateo Rivas Calderón'],
    modules: ['Diagnóstico de la escuela', 'Diseño del sistema', 'Cuidado y mantenimiento'],
    firstWeek: 0.43,
    sessionHour: 17,
  },
  {
    id: 'mock-huertos',
    name: 'Curso de Huertos Comunitarios',
    type: 'COURSE',
    modality: 'ONLINE_LIVE',
    origin: 'NAS',
    cohortLabel: '2026-2',
    cover: 'assets/formation/cover-pot.webp',
    teachers: ['Rosa Tzul'],
    modules: ['Suelo vivo', 'Semillas nativas'],
    firstWeek: -3,
    sessionHour: 11,
    suspended: true,
  },
  {
    id: 'mock-banos',
    name: 'Taller de Baños Secos',
    type: 'WORKSHOP',
    modality: 'IN_PERSON',
    origin: 'NAS',
    cohortLabel: 'Oaxaca · noviembre',
    cover: null,
    teachers: ['Colectivo Tierra y Agua'],
    modules: ['Teoría y diseño', 'Construcción en sitio'],
    firstWeek: -0.14,
    sessionHour: 9,
    venue: {
      name: 'Centro Comunitario San Andrés',
      address: 'Calle Hidalgo 12, San Andrés Huayápam',
      city: 'Oaxaca',
      mapsUrl: 'https://maps.google.com/?q=San+Andr%C3%A9s+Huay%C3%A1pam',
    },
  },
];

// --- Sesiones ------------------------------------------------------------------

/** Una sesión por módulo y semana (los talleres, cada día). */
function sessionsOf(offer: MockOffer): SessionCardDto[] {
  const step = offer.type === 'WORKSHOP' ? 1 : 7;
  const firstDay = Math.round(offer.firstWeek * 7);
  const now = Date.now();
  const slots = offer.modules.flatMap((title, index) =>
    [0, 1].map((half) => ({
      title,
      index,
      half,
      start: cdmxAt(firstDay + (index * 2 + half) * step, offer.sessionHour),
    })),
  );
  // La sesión "en vivo": la primera que no ha terminado empieza en 5 minutos.
  if (offer.liveNow) {
    const live = slots.find((slot) => slot.start + 2 * 60 * MINUTE > now);
    if (live) live.start = now + 5 * MINUTE;
  }
  return slots.map(({ title, index, half, start }) => {
    const number = index + 1;
    const end = start + 2 * 60 * MINUTE;
    const past = end < now;
    const cancelled = offer.id === 'mock-eco' && number === 1 && half === 1;
    const id = `${offer.id}-s${number}${half ? 'b' : 'a'}`;
    const join: SessionJoinDto = cancelled
      ? { state: 'CANCELLED', opensAt: iso(start - 10 * MINUTE), url: null }
      : offer.modality === 'IN_PERSON'
        ? { state: 'IN_PERSON', opensAt: iso(start - 10 * MINUTE), url: null }
        : past
          ? { state: 'ENDED', opensAt: iso(start - 10 * MINUTE), url: null }
          : start - 10 * MINUTE <= now
            ? {
                state: 'OPEN',
                opensAt: iso(start - 10 * MINUTE),
                url: 'https://zoom.us/j/000000000',
              }
            : { state: 'NOT_YET', opensAt: iso(start - 10 * MINUTE), url: null };
    const attended = past && !cancelled && (index + half) % 3 !== 2;
    const attendance = cancelled
      ? 'NOT_APPLICABLE'
      : !past
        ? 'NOT_APPLICABLE'
        : end > now - 8 * DAY
          ? 'PENDING'
          : attended
            ? 'REGISTERED'
            : 'NOT_REGISTERED';
    return {
      id,
      offer: {
        id: offer.id,
        slug: offer.id,
        name: offer.name,
        type: offer.type,
        modality: offer.modality,
      },
      module: { id: `${offer.id}-m${number}`, number, title },
      teacherNames: [...offer.teachers],
      startsAt: iso(start),
      endsAt: iso(end),
      timezone: 'America/Mexico_City',
      status: cancelled ? 'CANCELLED' : 'SCHEDULED',
      category: 'TRAINING',
      originalStartsAt: offer.id === 'mock-eco' && number === 4 && !half ? iso(start - DAY) : null,
      changeReason: cancelled
        ? 'Fallas de conexión del equipo docente'
        : offer.id === 'mock-eco' && number === 4 && !half
          ? 'Cambio por día festivo'
          : null,
      platform: offer.modality === 'IN_PERSON' ? null : 'ZOOM',
      venue: offer.venue ?? null,
      join,
      recording: {
        state:
          cancelled || offer.modality === 'IN_PERSON'
            ? 'NOT_APPLICABLE'
            : !past
              ? 'AFTER_SESSION'
              : end > now - 8 * DAY
                ? 'PENDING'
                : 'AVAILABLE',
        url: past && end <= now - 8 * DAY ? 'https://vimeo.com/76979871' : null,
      },
      // El esquema publicado de `attendance` quedó con el de administración
      // (mismo nombre en la API): se manda la forma que usa el portal.
      attendance: { status: attendance } as unknown as SessionAttendanceDto,
    } satisfies SessionCardDto;
  });
}

// --- Inscripciones (Mi formación) -------------------------------------------------

function progressOf(sessions: readonly SessionCardDto[]) {
  const scheduled = sessions.filter((s) => s.status !== 'CANCELLED');
  const attended = scheduled.filter(
    (s) => (s.attendance as unknown as { status: string }).status === 'REGISTERED',
  ).length;
  const percent = scheduled.length ? Math.round((attended / scheduled.length) * 100) : 0;
  return { attendedSessions: attended, scheduledSessions: scheduled.length, percent };
}

function nextOf(sessions: readonly SessionCardDto[]): SessionCardDto | null {
  const now = Date.now();
  return (
    sessions
      .filter((s) => s.status !== 'CANCELLED' && new Date(s.endsAt).getTime() > now)
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt))[0] ?? null
  );
}

export function mockFormation(offer: MockOffer): FormationCardDto {
  const sessions = sessionsOf(offer);
  const next = offer.finished ? null : nextOf(sessions);
  const progress = offer.finished
    ? { attendedSessions: sessions.length - 1, scheduledSessions: sessions.length, percent: 92 }
    : progressOf(sessions);
  return {
    enrollmentId: `${offer.id}-enrollment`,
    status: offer.suspended ? 'SUSPENDED' : offer.finished ? 'COMPLETED' : 'ACTIVE',
    phase: offer.finished ? 'COMPLETED' : 'ACTIVE',
    origin: offer.origin,
    canContinue: !offer.suspended,
    offer: {
      id: offer.id,
      slug: offer.id,
      name: offer.name,
      type: offer.type,
      modality: offer.modality,
      coverImageUrl: offer.cover,
      cohortLabel: offer.cohortLabel,
      startsAt: sessions[0]?.startsAt ?? null,
      endsAt: sessions[sessions.length - 1]?.endsAt ?? null,
      venue: offer.venue ?? null,
    },
    progress,
    nextSession: next ? { id: next.id, startsAt: next.startsAt, endsAt: next.endsAt } : null,
    scheduleStatus: offer.finished
      ? 'FINISHED'
      : next
        ? 'HAS_NEXT_SESSION'
        : 'NO_UPCOMING_SESSIONS',
    enrolledAt: iso(cdmxAt(-60, 12)),
  };
}

// --- Aula --------------------------------------------------------------------------

function moduleStatus(
  offer: MockOffer,
  sessions: readonly SessionCardDto[],
  number: number,
): ModuleStatus {
  if (offer.finished) return 'COMPLETED';
  const own = sessions.filter((s) => s.module?.number === number);
  const now = Date.now();
  if (own.every((s) => new Date(s.endsAt).getTime() < now)) return 'COMPLETED';
  if (own.some((s) => new Date(s.startsAt).getTime() < now) || own.includes(nextOf(sessions)!)) {
    return 'IN_PROGRESS';
  }
  return 'UPCOMING';
}

const file = (
  id: string,
  type: MaterialResourceDto['type'],
  title: string,
  fileName: string,
  sizeBytes: number,
  extra: Partial<MaterialResourceDto> = {},
): MaterialResourceDto => ({
  id,
  type,
  title,
  description: null,
  kind: 'FILE',
  url: null,
  fileName,
  mimeType: 'application/pdf',
  sizeBytes,
  activityDueAt: null,
  ...extra,
});

export function mockMaterials(offer: MockOffer): MaterialModuleDto[] {
  const sessions = sessionsOf(offer);
  return offer.modules.map((title, index) => {
    const number = index + 1;
    const status = moduleStatus(offer, sessions, number);
    const id = `${offer.id}-m${number}`;
    const published = status !== 'UPCOMING';
    return {
      id,
      number,
      title,
      description:
        number === 2 ? 'Diseño y cálculo para viviendas, escuelas y espacios comunitarios.' : null,
      status,
      teacherNames: [offer.teachers[index % offer.teachers.length]],
      presentation: published
        ? file(
            `${id}-p`,
            'PRESENTATION',
            `Presentación del módulo ${number}`,
            `modulo-${number}.pdf`,
            2_516_582,
          )
        : null,
      preReadings: published
        ? [
            file(
              `${id}-r1`,
              'PRE_READING',
              `Lectura: ${title}`,
              `lectura-modulo-${number}.pdf`,
              5_400_000,
              {
                description: 'Capítulos 1 a 3.',
              },
            ),
            {
              ...file(`${id}-r2`, 'PRE_READING', 'Video de apoyo', '', 0),
              kind: 'EXTERNAL_LINK',
              url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
              fileName: null,
              mimeType: null,
              sizeBytes: null,
            },
          ]
        : [],
      activities:
        published && number % 2 === 0
          ? [
              file(
                `${id}-a1`,
                'ACTIVITY',
                'Actividad práctica del módulo',
                'hoja-de-trabajo.xlsx',
                358_400,
                {
                  description: 'Resuélvela con tu comunidad y comparte el resultado en el grupo.',
                  activityDueAt: iso(cdmxAt(4, 23, 59)),
                },
              ),
            ]
          : [],
      recordings: sessions
        .filter((s) => s.module?.number === number && s.status !== 'CANCELLED')
        .map((s) => ({
          sessionId: s.id,
          startsAt: s.startsAt,
          endsAt: s.endsAt,
          state: s.recording.state,
          url: s.recording.url,
        })),
    };
  });
}

/** Entrega de prueba (se reemplaza al subir otra en esta pestaña). */
let submittedProject: FinalProjectDto['submission'] = null;

export function setMockSubmission(fileName: string, sizeBytes: number): void {
  submittedProject = {
    fileName,
    mimeType: 'application/pdf',
    sizeBytes,
    submittedAt: iso(Date.now()),
  };
}

function finalProjectOf(offer: MockOffer): FinalProjectDto | null {
  if (offer.type !== 'DIPLOMA') return null;
  return {
    dueAt: iso(offer.finished ? cdmxAt(-20, 23, 59) : cdmxAt(45, 23, 59)),
    guidelines:
      'Diseña una ecotecnia para tu comunidad (captación de lluvia, filtro o baño seco).\n' +
      'Incluye: diagnóstico del territorio, propuesta, materiales y costos, y un plan de cuidado.',
    submissionState: offer.finished ? 'CLOSED' : 'OPEN',
    acceptedMimeTypes: [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/zip',
    ],
    maxBytes: 20_971_520,
    submission: offer.finished
      ? {
          fileName: 'proyecto-final-restauracion.pdf',
          mimeType: 'application/pdf',
          sizeBytes: 4_310_000,
          submittedAt: iso(cdmxAt(-22, 20)),
        }
      : submittedProject,
  };
}

export function mockClassroom(offer: MockOffer): ClassroomDto {
  const card = mockFormation(offer);
  const sessions = sessionsOf(offer);
  const next = offer.finished ? null : nextOf(sessions);
  const preStart = new Date(sessions[0]?.startsAt ?? 0).getTime() > Date.now();
  const modules: ClassroomModuleDto[] = mockMaterials(offer).map((m) => ({
    id: m.id,
    number: m.number,
    title: m.title,
    description: m.description,
    status: m.status,
    teacherNames: m.teacherNames,
    resourceCounts: {
      presentation: m.presentation ? 1 : 0,
      preReadings: m.preReadings.length,
      activities: m.activities.length,
      recordings: m.recordings.filter((r) => r.state === 'AVAILABLE').length,
    },
  }));
  return {
    enrollment: {
      id: card.enrollmentId,
      status: card.status,
      phase: card.phase,
      origin: offer.origin,
      enrolledAt: card.enrolledAt,
    },
    offer: {
      ...card.offer,
      totalHours: offer.type === 'DIPLOMA' ? 60 : offer.type === 'COURSE' ? 12 : 8,
      teachers: offer.teachers.map((fullName) => ({ fullName, photoUrl: null })),
    },
    progress: card.progress,
    welcome: {
      preStart,
      message: preStart
        ? '¡Te damos la bienvenida! Antes de la primera sesión, revisa la presentación del módulo 1 y únete al grupo de WhatsApp de tu cohorte.'
        : null,
      firstSessionStartsAt: sessions[0]?.startsAt ?? null,
      whatsapp: preStart
        ? { available: false, url: null, availableFrom: iso(cdmxAt(1, 9)) }
        : { available: true, url: 'https://chat.whatsapp.com/', availableFrom: null },
    },
    nextSession: next,
    modules,
    finalProject: finalProjectOf(offer),
  };
}

export function mockSessions(offer: MockOffer, scope: 'UPCOMING' | 'PAST'): SessionCardDto[] {
  const now = Date.now();
  const sessions = sessionsOf(offer);
  return scope === 'PAST'
    ? sessions
        .filter((s) => new Date(s.endsAt).getTime() <= now)
        .sort((a, b) => b.startsAt.localeCompare(a.startsAt))
    : sessions
        .filter((s) => new Date(s.endsAt).getTime() > now)
        .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

/** "Próxima actividad" del dashboard: la siguiente sesión de las formaciones de prueba. */
export function mockNextActivity(): CalendarItemDto | null {
  const next = MOCK_OFFERS.filter((o) => !o.finished && !o.suspended)
    .map((offer) => nextOf(sessionsOf(offer)))
    .filter((s): s is SessionCardDto => !!s)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))[0];
  if (!next) return null;
  return {
    id: next.id,
    source: 'SESSION',
    kind: 'SESSION',
    title: next.module ? `Módulo ${next.module.number} · ${next.module.title}` : next.offer.name,
    description: null,
    category: 'TRAINING',
    startsAt: next.startsAt,
    endsAt: next.endsAt,
    allDay: false,
    timezone: next.timezone,
    status: next.status,
    offer: next.offer,
    module: next.module,
    venue: next.venue,
    location: null,
    join: next.join,
    link: { kind: 'CLASSROOM', offerId: next.offer.id, slug: next.offer.slug, applicationId: null },
  };
}

/** Archivo que se abre al "descargar" un material o la entrega de prueba. */
export const mockFileUrl = () => asset('images/og-image.png');
