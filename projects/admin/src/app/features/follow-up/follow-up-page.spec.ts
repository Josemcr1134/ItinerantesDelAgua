import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SessionStore } from 'auth';
import {
  apiErrorInterceptor,
  FollowUpItemDto,
  OfferFunnelDto,
  Permission,
  provideApi,
  UserProfileDto,
} from 'data-access';
import { AlertService } from 'ui-kit';
import { AdminAccess } from '../../core/access/admin-access';
import FollowUpPage from './follow-up-page';

const API = 'https://api.test/api/v1/admin';
const tick = () => new Promise((r) => setTimeout(r));

const offer = {
  id: 'o1',
  name: 'Diplomado en Ecotecnologías del Agua',
  type: 'DIPLOMA' as const,
  startsAt: null,
  applications: 40,
  enrollments: 20,
};

const funnel: OfferFunnelDto = {
  offer,
  stages: [
    {
      key: 'APPLIED',
      label: 'Postulados',
      count: 40,
      percentOfApplied: 100,
      percentOfPrevious: 100,
    },
    { key: 'APPROVED', label: 'Aprobados', count: 30, percentOfApplied: 75, percentOfPrevious: 75 },
    {
      key: 'PAYMENT_STARTED',
      label: 'Con pago iniciado',
      count: 24,
      percentOfApplied: 60,
      percentOfPrevious: 80,
    },
    { key: 'ENROLLED', label: 'Inscritos', count: 20, percentOfApplied: 50, percentOfPrevious: 83 },
  ],
  conversionPercent: 50,
  inReview: 4,
  pendingPayment: 6,
  pendingConfirmation: 1,
  expired: 2,
  notSelected: 3,
  dueSoon: 1,
  directEnrollments: 0,
};

const item = (id: string, extra: Partial<FollowUpItemDto> = {}): FollowUpItemDto => ({
  applicationId: id,
  folio: `BEC-${id}`,
  kind: 'SCHOLARSHIP',
  status: 'APPROVED_PENDING_PAYMENT',
  name: `Persona ${id}`,
  email: `${id}@example.com`,
  phone: { countryCode: '+52', number: '5512345678', whatsappUrl: 'https://wa.me/525512345678' },
  countryCode: 'MX',
  assignedLevel: null,
  assignedPercent: null,
  balance: { amountCents: 510000, currency: 'MXN' },
  responseDueAt: '2026-10-28T16:00:00.000Z',
  remainingDays: 5,
  dueSoon: false,
  pendingTransfer: false,
  paymentStarted: false,
  lastContactAt: null,
  lastOutcome: null,
  canRemind: true,
  remindAvailableAt: null,
  ...extra,
});

describe('FollowUpPage', () => {
  async function setup(permissions: Permission[]) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([apiErrorInterceptor])),
        provideHttpClientTesting(),
        provideApi({ baseUrl: 'https://api.test' }),
        { provide: AlertService, useValue: { open: () => Promise.resolve(true) } },
      ],
    });
    const http = TestBed.inject(HttpTestingController);
    TestBed.inject(SessionStore).setUser({ id: 'me', roles: [] } as unknown as UserProfileDto);
    const loaded = TestBed.inject(AdminAccess).load();
    http
      .expectOne(`${API}/me`)
      .flush({ user: { id: 'me', email: '', fullName: 'Ana' }, roles: [], permissions });
    await loaded;
    http.expectOne(`${API}/roles`).flush({ data: [] });
    const fixture = TestBed.createComponent(FollowUpPage);
    await fixture.whenStable();
    const settle = async () => {
      await tick();
      await fixture.whenStable();
    };
    http
      .expectOne((r) => r.url === `${API}/funnel/offers`)
      .flush({ data: [offer], meta: { page: 1, pageSize: 100, total: 1, totalPages: 1 } });
    await settle();
    http.expectOne(`${API}/funnel/offers/o1`).flush(funnel);
    const list = http.expectOne((r) => r.url === `${API}/funnel/offers/o1/follow-ups`);
    expect(list.request.params.get('tab')).toBe('PENDING');
    list.flush({
      data: [item('a1', { dueSoon: true, remainingDays: 1 }), item('a2', { canRemind: false })],
      meta: { page: 1, pageSize: 20, total: 2, totalPages: 1 },
    });
    await settle();
    const host = fixture.nativeElement as HTMLElement;
    const button = (text: string, root: ParentNode = document) =>
      [...root.querySelectorAll<HTMLButtonElement>('button')].find((b) =>
        b.textContent?.trim().startsWith(text),
      );
    return { fixture, http, host, settle, button };
  }

  it('abre la oferta más reciente con su embudo y las personas sin pagar', async () => {
    const { host } = await setup(['admin.access', 'followup.read']);
    expect(host.textContent).toContain('50%');
    expect(host.textContent).toContain('Con pago iniciado');
    expect(host.querySelector('tbody tr.due-soon')?.textContent).toContain('Vence en 1 día');
    // Solo lectura: sin acciones de contacto ni cierre de inscripciones.
    expect(host.querySelector('tbody button')).toBeNull();
    expect(host.textContent).not.toContain('Cerrar inscripciones');
  });

  it('recuerda por correo y recarga la lista; el recordatorio respeta el límite diario', async () => {
    const { http, host, settle, button } = await setup([
      'admin.access',
      'followup.read',
      'followup.manage',
    ]);
    const rows = host.querySelectorAll('tbody tr');
    expect(button('Recordar', rows[1])!.disabled).toBe(true);
    button('Recordar', rows[0])!.click();
    await settle();
    http.expectOne(`${API}/applications/a1/reminders`).flush({
      sentAt: '2026-10-23T16:00:00.000Z',
      nextAvailableAt: '2026-10-24T16:00:00.000Z',
      emailStatus: 'SENT',
      note: {},
    });
    await settle();
    http
      .expectOne((r) => r.url === `${API}/funnel/offers/o1/follow-ups`)
      .flush({
        data: [],
        meta: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
      });
    await settle();
    expect(host.querySelector('adm-follow-up-list .adm-notice')?.textContent).toContain(
      'Persona a1: se envió el recordatorio',
    );
  });

  it('filtra por pago iniciado y cierra inscripciones (motivo opcional)', async () => {
    const { fixture, http, host, settle, button } = await setup([
      'admin.access',
      'followup.read',
      'followup.manage',
    ]);
    const started = host.querySelector<HTMLSelectElement>('#follow-up-started')!;
    started.value = 'true';
    started.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    await settle();
    const filtered = http.expectOne((r) => r.url === `${API}/funnel/offers/o1/follow-ups`);
    expect(filtered.request.params.get('paymentStarted')).toBe('true');

    button('Cerrar inscripciones', host)!.click();
    await settle();
    document.querySelector<HTMLFormElement>('dialog[open] form')!.requestSubmit();
    await settle();
    const close = http.expectOne(`${API}/funnel/offers/o1/close-enrollment`);
    expect(close.request.body).toEqual({});
  });
});
