import {
  HttpErrorResponse,
  HttpEvent,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { DashboardDto, FormationCardDto, participantAttendance } from 'data-access';
import { delay, map, Observable, of, throwError } from 'rxjs';
import {
  MOCK_OFFERS,
  mockClassroom,
  mockFileUrl,
  mockFormation,
  mockMaterials,
  mockNextActivity,
  mockMySessions,
  mockProgress,
  mockSessionById,
  mockSessions,
  registerMockAttendance,
  setMockSubmission,
} from './mock-formation.data';
import {
  mockCheckout,
  mockHistory,
  mockPaidPayment,
  mockPlans,
  mockQuote,
  mockSummary,
} from './mock-payments.data';

/** Interruptor guardado en este navegador (`?mock=formacion` lo activa, `?mock=off` lo apaga). */
const STORAGE_KEY = 'portal.mock.formacion';
/** "Storage" de prueba para la entrega del proyecto final. */
const MOCK_STORAGE = 'https://mock-storage.local/';

/** Lee el interruptor (y lo actualiza si la URL trae `?mock=`). */
export function mockFormationEnabled(): boolean {
  try {
    const flag = new URLSearchParams(location.search).get('mock');
    if (flag === 'formacion') localStorage.setItem(STORAGE_KEY, '1');
    if (flag === 'off') localStorage.removeItem(STORAGE_KEY);
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

let announced = false;

/**
 * SOLO DESARROLLO (lo registra `environment.development.ts`; producción no
 * lo incluye). Con el interruptor activo responde con datos de prueba
 * "Mi formación" (`/me/enrollments`), el aula (`/me/classrooms/…`), las
 * sesiones y la asistencia (`/me/sessions/…`), los pagos (`/me/payments/…`,
 * con un "Stripe" simulado) y el bloque de formaciones del dashboard; todo lo demás va a la API real.
 */
export const mockFormationInterceptor: HttpInterceptorFn = (req, next) => {
  if (!mockFormationEnabled()) return next(req);
  if (!announced) {
    announced = true;
    console.info(
      '%c[mock] Formación con datos de prueba. Desactívalo con ?mock=off',
      'color:#399f71;font-weight:bold',
    );
  }

  if (req.url.startsWith(MOCK_STORAGE)) return reply(req, null);
  const path = new URL(req.url, location.origin).pathname;

  if (path.endsWith('/api/v1/me/enrollments') && req.method === 'GET') return enrollments(req);

  if (path.endsWith('/api/v1/me/dashboard')) {
    return next(req).pipe(
      map((event) => (event instanceof HttpResponse ? withMockFormations(event) : event)),
    );
  }

  const match = path.match(/\/api\/v1\/me\/classrooms\/([^/]+)(\/.*)?$/);
  if (match) return classroom(req, match[1], match[2] ?? '');

  if (path.includes('/api/v1/me/payments')) return payments(req, path);

  const session = path.match(/\/api\/v1\/me\/sessions(?:\/([^/]+)(\/attendance)?)?$/);
  if (session) return sessions(req, session[1], !!session[2]);

  return next(req);
};

// --- Respuestas ---------------------------------------------------------------------

function reply<T>(req: HttpRequest<unknown>, body: T, status = 200): Observable<HttpEvent<T>> {
  return of(new HttpResponse({ status, body, url: req.url })).pipe(delay(250));
}

function fail(req: HttpRequest<unknown>, status: number, code: string, message: string) {
  return throwError(
    () =>
      new HttpErrorResponse({
        status,
        url: req.url,
        error: { statusCode: status, code, message, details: [], requestId: 'mock' },
      }),
  ).pipe(delay(250));
}

function enrollments(req: HttpRequest<unknown>) {
  const types = (req.params.getAll('type') ?? []).flatMap((t) => t.split(','));
  const phase = req.params.get('phase') ?? 'ACTIVE';
  const page = Number(req.params.get('page') ?? 1);
  const pageSize = Number(req.params.get('pageSize') ?? 12);
  const all: FormationCardDto[] = MOCK_OFFERS.map(mockFormation).filter(
    (f) =>
      (!types.length || types.includes(f.offer.type)) && (phase === 'ALL' || f.phase === phase),
  );
  return reply(req, {
    data: all.slice((page - 1) * pageSize, page * pageSize),
    meta: { page, pageSize, total: all.length, totalPages: Math.ceil(all.length / pageSize) },
  });
}

function withMockFormations(response: HttpResponse<unknown>): HttpResponse<unknown> {
  const body = response.body as DashboardDto | null;
  if (!body) return response;
  const active = MOCK_OFFERS.map(mockFormation).filter((f) => f.phase === 'ACTIVE');
  return response.clone({
    body: {
      ...body,
      nextActivity: mockNextActivity() ?? body.nextActivity,
      formations: { items: active.slice(0, 3), total: active.length },
      failedBlocks: body.failedBlocks.filter((b) => b !== 'formations' && b !== 'nextActivity'),
    } satisfies DashboardDto,
  });
}

function classroom(req: HttpRequest<unknown>, offerId: string, rest: string) {
  const offer = MOCK_OFFERS.find((o) => o.id === offerId);
  if (!offer) return fail(req, 404, 'NOT_FOUND', 'No encontramos esta formación.');
  if (offer.suspended) {
    return fail(
      req,
      403,
      'ENROLLMENT_SUSPENDED',
      'Tu acceso está suspendido por un pago pendiente.',
    );
  }
  if (!rest) return reply(req, mockClassroom(offer));
  if (rest === '/materials') return reply(req, { modules: mockMaterials(offer) });
  if (rest === '/sessions') {
    const scope = req.params.get('scope') === 'PAST' ? 'PAST' : 'UPCOMING';
    const data = mockSessions(offer, scope);
    return reply(req, {
      data,
      meta: { page: 1, pageSize: data.length, total: data.length, totalPages: 1 },
    });
  }
  if (rest.startsWith('/resources/') || rest === '/final-project/download') {
    return reply(req, {
      kind: 'FILE',
      url: mockFileUrl(),
      expiresAt: null,
      fileName: 'archivo.pdf',
    });
  }
  if (rest === '/final-project/upload-url') {
    const body = req.body as { contentType: string };
    return reply(req, {
      uploadUrl: `${MOCK_STORAGE}final-project`,
      method: 'PUT',
      headers: { 'Content-Type': body.contentType },
      key: 'mock-key',
      expiresAt: new Date(Date.now() + 600_000).toISOString(),
    });
  }
  if (rest === '/final-project' && req.method === 'PUT') {
    const body = req.body as { fileName?: string };
    setMockSubmission(body.fileName ?? 'proyecto-final.pdf', 1_843_200);
    return reply(req, mockClassroom(offer).finalProject);
  }
  return fail(req, 404, 'NOT_FOUND', 'No existe');
}

function sessions(req: HttpRequest<unknown>, id: string | undefined, attendance: boolean) {
  if (!id) {
    const scope = req.params.get('scope') === 'PAST' ? 'PAST' : 'UPCOMING';
    const data = mockMySessions(scope, req.params.get('offerId') ?? undefined);
    return reply(req, {
      data,
      meta: { page: 1, pageSize: data.length, total: data.length, totalPages: 1 },
    });
  }
  const found = mockSessionById(id);
  if (!found) return fail(req, 404, 'NOT_FOUND', 'No encontramos esta sesión.');
  if (found.offer.suspended) {
    return fail(
      req,
      403,
      'ENROLLMENT_SUSPENDED',
      'Tu acceso está suspendido por un pago pendiente.',
    );
  }
  if (!attendance) return reply(req, found.session);
  if (req.method !== 'POST') return fail(req, 404, 'NOT_FOUND', 'No existe');

  // Registro (HU-18): solo dentro de la ventana, una vez.
  const a = participantAttendance(found.session);
  const meta = { opensAt: a?.opensAt, closesAt: a?.closesAt, registeredAt: a?.registeredAt };
  const error = (status: number, code: string, message: string) =>
    throwError(
      () =>
        new HttpErrorResponse({
          status,
          url: req.url,
          error: { statusCode: status, code, message, details: [], meta, requestId: 'mock' },
        }),
    ).pipe(delay(250));
  if (found.session.status === 'CANCELLED')
    return error(422, 'SESSION_CANCELLED', 'La sesión fue cancelada.');
  if (a?.status === 'REGISTERED') {
    return error(409, 'ATTENDANCE_ALREADY_REGISTERED', 'Tu asistencia ya estaba registrada.');
  }
  if (a?.windowState === 'NOT_OPEN_YET') {
    return error(422, 'ATTENDANCE_NOT_OPEN_YET', 'El registro abre al terminar la sesión.');
  }
  if (!a?.canRegister) {
    return error(
      422,
      'ATTENDANCE_WINDOW_CLOSED',
      'El registro de asistencia para esta sesión está cerrado.',
    );
  }
  const body = req.body as { attended?: boolean; comment?: string };
  if (body.attended !== true) {
    return error(400, 'VALIDATION_ERROR', 'Marca «Asistí a la sesión» para registrarla.');
  }
  registerMockAttendance(id, body.comment?.trim() || null);
  const updated = mockSessionById(id)!;
  return reply(req, { session: updated.session, progress: mockProgress(updated.offer) }, 201);
}

function payments(req: HttpRequest<unknown>, path: string) {
  const rest = path.slice(path.indexOf('/api/v1/me/payments') + '/api/v1/me/payments'.length);
  if (rest === '/quote') {
    return reply(req, mockQuote(req.params.get('offerId'), req.params.get('applicationId')));
  }
  if (rest === '/checkout') {
    return reply(
      req,
      mockCheckout(
        req.body as { offerId?: string; applicationId?: string; installmentCount?: number },
      ),
      201,
    );
  }
  if (rest === '/summary') return reply(req, mockSummary());
  if (rest === '/plans') return reply(req, mockPlans());
  if (rest === '') {
    const data = mockHistory();
    return reply(req, {
      data,
      meta: { page: 1, pageSize: data.length, total: data.length, totalPages: 1 },
    });
  }
  if (rest.endsWith('/card-update')) {
    return reply(
      req,
      {
        checkoutUrl: `${location.origin}/perfil/pagos?cardUpdate=success`,
        expiresAt: new Date().toISOString(),
      },
      201,
    );
  }
  if (rest.endsWith('/pay-now')) return reply(req, mockPlans().data[0]);
  if (rest === '/transfers/upload-url') {
    return reply(
      req,
      {
        uploadUrl: `${MOCK_STORAGE}transfer`,
        method: 'PUT',
        headers: { 'Content-Type': (req.body as { contentType: string }).contentType },
        key: 'mock-transfer',
        expiresAt: new Date().toISOString(),
      },
      201,
    );
  }
  if (rest === '/transfers') {
    const body = req.body as {
      applicationId: string;
      declaredAmountCents: number;
      trackingKey: string;
    };
    return reply(
      req,
      {
        ...mockPaidPayment('mock-transfer'),
        status: 'PENDING_VALIDATION',
        method: 'BANK_TRANSFER',
        applicationId: body.applicationId,
        receiptAvailable: false,
      },
      201,
    );
  }
  if (rest.endsWith('/cancel')) return reply(req, null);
  if (rest.endsWith('/receipt')) {
    return reply(req, new Blob(['Comprobante de prueba'], { type: 'application/pdf' }));
  }
  if (rest.endsWith('/transfer-proof')) {
    return reply(req, { kind: 'FILE', url: mockFileUrl(), expiresAt: null, fileName: 'spei.pdf' });
  }
  const id = rest.slice(1);
  return reply(req, mockPaidPayment(id));
}
