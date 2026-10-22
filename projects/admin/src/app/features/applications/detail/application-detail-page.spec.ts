import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SessionStore } from 'auth';
import {
  AdminApplicationDetailDto,
  apiErrorInterceptor,
  ApplicationStatus,
  Permission,
  provideApi,
  UserProfileDto,
} from 'data-access';
import { AlertService } from 'ui-kit';
import { AdminAccess } from '../../../core/access/admin-access';
import ApplicationDetailPage from './application-detail-page';

const API = 'https://api.test/api/v1';
const APP = `${API}/admin/applications/a1`;

function detail(status: ApplicationStatus, extra: Partial<AdminApplicationDetailDto> = {}) {
  return {
    id: 'a1',
    folio: 'BEC-2026-0041',
    kind: 'SCHOLARSHIP',
    status,
    applicant: { userId: 'p1', name: 'María López', email: 'maria@example.com', countryCode: 'MX' },
    offer: { id: 'o1', name: 'Diplomado en Ecotecnologías del Agua', slug: 'eco' },
    requestedLevel: 'AGUAS_LIBRES',
    assignedLevel: null,
    assignedPercent: null,
    submittedAt: '2026-10-12T16:00:00.000Z',
    requiresInterview: false,
    interview: null,
    evaluationCount: 0,
    myEvaluation: null,
    responseDueAt: null,
    contact: {
      name: 'María López',
      email: 'maria@example.com',
      phoneCountryCode: '+52',
      phoneNumber: '5512345678',
      countryCode: 'MX',
      divisionName: 'Oaxaca',
      municipalityName: 'Oaxaca de Juárez',
      age: 29,
      organization: null,
      organizationRole: null,
      partnerCode: null,
    },
    answers: {
      intentLetter: 'Quiero aprender.',
      experience: null,
      motivation: null,
      canTravel: null,
      eligibilityConfirmed: true,
      evidenceLinks: [],
    },
    documents: [],
    history: [],
    interviews: [],
    evaluations: [],
    evaluationSummary: {
      approve: 0,
      notSelect: 0,
      unsure: 0,
      total: 0,
      mostSuggestedLevel: null,
      label: '',
    },
    myEvaluationDetail: null,
    decision: {
      canDecide: true,
      interviewRequired: false,
      hasCompletedInterview: false,
      blockedReason: null,
      price: { amountCents: 1020000, currency: 'MXN' },
      levels: [
        {
          level: 'AGUAS_LIBRES',
          label: 'Aguas Libres',
          minPercent: 50,
          maxPercent: 50,
          requiresInterview: false,
          balanceAtMaxPercent: { amountCents: 510000, currency: 'MXN' },
        },
      ],
      assignedLevel: null,
      assignedPercent: null,
      balance: null,
      responseDueAt: null,
      decidedAt: null,
      decidedBy: null,
      decisionNote: null,
      emailStatus: null,
    },
    emails: [],
    prevId: null,
    nextId: 'a2',
    reviewStarted: false,
    ...extra,
  } satisfies AdminApplicationDetailDto;
}

const tick = () => new Promise((r) => setTimeout(r));

describe('ApplicationDetailPage', () => {
  async function setup(permissions: Permission[], first: AdminApplicationDetailDto) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([apiErrorInterceptor])),
        provideHttpClientTesting(),
        provideApi({ baseUrl: 'https://api.test' }),
        {
          provide: AlertService,
          useValue: { open: () => Promise.resolve(true), confirm: () => Promise.resolve(true) },
        },
      ],
    });
    const http = TestBed.inject(HttpTestingController);
    TestBed.inject(SessionStore).setUser({ id: 'me', roles: [] } as unknown as UserProfileDto);
    const loaded = TestBed.inject(AdminAccess).load();
    http
      .expectOne(`${API}/admin/me`)
      .flush({ user: { id: 'me', email: '', fullName: 'Ana' }, roles: [], permissions });
    await loaded;
    http.expectOne(`${API}/admin/roles`).flush({ data: [] });

    const fixture = TestBed.createComponent(ApplicationDetailPage);
    fixture.componentRef.setInput('id', 'a1');
    await fixture.whenStable();
    http.expectOne(APP).flush(first);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const button = (text: string, root: ParentNode = host) =>
      [...root.querySelectorAll<HTMLButtonElement>('button')].find((b) =>
        b.textContent?.trim().startsWith(text),
      );
    const settle = async () => {
      await tick();
      await fixture.whenStable();
    };
    return { fixture, http, host, button, settle };
  }

  it('avisa si al abrirla pasó a «En revisión» y muestra sus datos', async () => {
    const { host } = await setup(
      ['admin.access', 'applications.read', 'applications.evaluate'],
      detail('IN_REVIEW', { reviewStarted: true }),
    );
    expect(host.querySelector('h1')?.textContent).toContain('María López');
    expect(host.querySelector('.adm-notice')?.textContent).toContain('En revisión');
    expect(host.textContent).toContain('Quiero aprender.');
  });

  it('solo lectura: sin evaluar, agendar ni decidir', async () => {
    const { host, button } = await setup(
      ['admin.access', 'applications.read'],
      detail('IN_REVIEW'),
    );
    expect(host.querySelector('#eval-comment')).toBeNull();
    expect(button('Agendar entrevista')).toBeUndefined();
    expect(button('Aprobar')).toBeUndefined();
  });

  it('guarda mi evaluación con PUT', async () => {
    const { http, host, button, settle } = await setup(
      ['admin.access', 'applications.read', 'applications.evaluate'],
      detail('IN_REVIEW'),
    );
    const radio = [...host.querySelectorAll<HTMLInputElement>('input[name=recommendation]')].find(
      (i) => i.closest('label')?.textContent?.includes('Tengo dudas'),
    )!;
    radio.click();
    await settle();
    button('Guardar mi evaluación')!.click();
    await settle();
    const req = http.expectOne(`${APP}/evaluations/me`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({
      recommendation: 'UNSURE',
      suggestedLevel: null,
      comment: null,
    });
  });

  it('decide solo tras ver y confirmar la vista previa del correo', async () => {
    const { http, button, settle } = await setup(
      ['admin.access', 'applications.read', 'applications.decide'],
      detail('IN_REVIEW'),
    );
    button('Aprobar')!.click();
    await settle();
    // Se preselecciona el nivel solicitado.
    button('Ver vista previa')!.click();
    await settle();
    const preview = http.expectOne((r) => r.url === `${APP}/decision-preview`);
    expect(preview.request.params.get('assignedLevel')).toBe('AGUAS_LIBRES');
    preview.flush({
      decision: 'APPROVE',
      status: 'APPROVED_PENDING_PAYMENT',
      assignedLevel: 'AGUAS_LIBRES',
      assignedPercent: 50,
      balance: { amountCents: 510000, currency: 'MXN' },
      responseDueAt: '2026-10-29T06:00:00.000Z',
      interviewRequired: false,
      blockedReason: null,
      email: { subject: 'Tu beca fue aprobada', body: 'Saldo: $5,100.00 MXN' },
    });
    await settle();

    const dialog = document.querySelector('dialog[open]')!;
    expect(dialog.textContent).toContain('Tu beca fue aprobada');
    expect(button('Registrar decisión', dialog)!.disabled).toBe(true);
    dialog.querySelector<HTMLInputElement>('input[name=confirmed]')!.click();
    await settle();
    button('Registrar decisión', dialog)!.click();
    await settle();

    const approve = http.expectOne(`${APP}/approve`);
    expect(approve.request.body).toEqual({
      assignedLevel: 'AGUAS_LIBRES',
      emailPreviewConfirmed: true,
    });
  });

  it('con la decisión aprobada carga el seguimiento y reintenta el correo fallido', async () => {
    const approved = detail('APPROVED_PENDING_PAYMENT', {
      decision: {
        ...detail('IN_REVIEW').decision,
        canDecide: false,
        decidedAt: '2026-10-21T16:00:00.000Z',
        emailStatus: 'FAILED',
      },
      emails: [
        {
          notificationId: 'n1',
          type: 'SCHOLARSHIP_APPROVED',
          title: 'Tu beca fue aprobada',
          emailStatus: 'FAILED',
          emailSentAt: null,
          createdAt: '2026-10-21T16:00:00.000Z',
        },
      ],
    });
    const { http, button, settle } = await setup(
      ['admin.access', 'applications.read', 'applications.decide', 'followup.read'],
      approved,
    );
    await settle();
    http.expectOne(`${APP}/follow-up`);

    button('Reintentar envío')!.click();
    await settle();
    const retry = http.expectOne(`${APP}/retry-email`);
    expect(retry.request.body).toEqual({ notificationId: 'n1' });
  });
});
