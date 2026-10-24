import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { provideApi } from '../api-config';
import { AdminApplicationsApi, AdminFollowUpApi } from './admin-applications.api';

const API = 'https://api.test/api/v1/admin/applications';
const FUNNEL = 'https://api.test/api/v1/admin/funnel';

describe('AdminApplicationsApi', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideApi({ baseUrl: 'https://api.test' }),
      ],
    }),
  );

  it('usa la ruta de cada operación', () => {
    const api = TestBed.inject(AdminApplicationsApi);
    const followUp = TestBed.inject(AdminFollowUpApi);
    const http = TestBed.inject(HttpTestingController);
    const confirmed = { emailPreviewConfirmed: true };
    const cases: [() => unknown, string, string][] = [
      [() => api.detail('a1').subscribe(), 'GET', `${API}/a1`],
      [
        () => api.evaluate('a1', { recommendation: 'APPROVE', comment: 'Sólida' }).subscribe(),
        'PUT',
        `${API}/a1/evaluations/me`,
      ],
      [
        () =>
          api
            .scheduleInterview('a1', {
              startsAt: '2026-11-02T16:00:00.000Z',
              endsAt: '2026-11-02T16:30:00.000Z',
              joinUrl: 'https://zoom.us/j/1',
            })
            .subscribe(),
        'POST',
        `${API}/a1/interview`,
      ],
      [
        () => api.completeInterview('a1', { outcome: 'COMPLETED' }).subscribe(),
        'POST',
        `${API}/a1/interview/complete`,
      ],
      [() => api.cancelInterview('a1', {}).subscribe(), 'POST', `${API}/a1/interview/cancel`],
      [() => api.approve('a1', confirmed).subscribe(), 'POST', `${API}/a1/approve`],
      [() => api.reject('a1', confirmed).subscribe(), 'POST', `${API}/a1/reject`],
      [() => api.retryEmail('a1').subscribe(), 'POST', `${API}/a1/retry-email`],
      [() => followUp.detail('a1').subscribe(), 'GET', `${API}/a1/follow-up`],
      [() => followUp.funnel('o1').subscribe(), 'GET', `${FUNNEL}/offers/o1`],
      [
        () => followUp.closeEnrollment('o1', { reason: 'Cupo lleno' }).subscribe(),
        'POST',
        `${FUNNEL}/offers/o1/close-enrollment`,
      ],
      [() => followUp.notes('a1').subscribe(), 'GET', `${API}/a1/notes`],
      [() => followUp.addNote('a1', { body: 'Llamé' }).subscribe(), 'POST', `${API}/a1/notes`],
      [() => followUp.remind('a1').subscribe(), 'POST', `${API}/a1/reminders`],
      [() => followUp.whatsapp('a1').subscribe(), 'POST', `${API}/a1/whatsapp`],
      [
        () =>
          followUp
            .extendDeadline('a1', { responseDueAt: '2026-11-10T06:00:00.000Z', reason: 'Pidió' })
            .subscribe(),
        'POST',
        `${API}/a1/extend-deadline`,
      ],
    ];
    for (const [call, method, url] of cases) {
      call();
      expect(http.expectOne(url).request.method).toBe(method);
    }
    http.verify();
  });

  it('lista las ofertas del embudo y los seguimientos por pestaña', () => {
    const followUp = TestBed.inject(AdminFollowUpApi);
    const http = TestBed.inject(HttpTestingController);
    followUp.offers({ q: 'Diplomado', pageSize: 100 }).subscribe();
    const offers = http.expectOne((r) => r.url === `${FUNNEL}/offers`);
    expect(offers.request.params.get('q')).toBe('Diplomado');
    followUp.followUps('o1', { tab: 'EXPIRED', paymentStarted: false }).subscribe();
    const list = http.expectOne((r) => r.url === `${FUNNEL}/offers/o1/follow-ups`);
    expect(list.request.params.get('tab')).toBe('EXPIRED');
    expect(list.request.params.get('paymentStarted')).toBe('false');
  });

  it('envía los estados separados por coma', () => {
    const http = TestBed.inject(HttpTestingController);
    TestBed.inject(AdminApplicationsApi)
      .list({ kind: 'SCHOLARSHIP', status: ['SUBMITTED', 'IN_REVIEW'], page: 2 })
      .subscribe();
    const req = http.expectOne((r) => r.url === API);
    expect(req.request.params.get('status')).toBe('SUBMITTED,IN_REVIEW');
    expect(req.request.params.get('kind')).toBe('SCHOLARSHIP');
    expect(req.request.params.get('page')).toBe('2');
  });

  it('pide la vista previa con la decisión y el tipo de beca', () => {
    const http = TestBed.inject(HttpTestingController);
    TestBed.inject(AdminApplicationsApi)
      .decisionPreview('a1', { decision: 'APPROVE', assignedScholarshipTypeId: 't1' })
      .subscribe();
    const req = http.expectOne((r) => r.url === `${API}/a1/decision-preview`);
    expect(req.request.params.get('decision')).toBe('APPROVE');
    expect(req.request.params.get('assignedScholarshipTypeId')).toBe('t1');
  });

  it('exporta el CSV sin paginar y con el nombre que envía la API', async () => {
    const http = TestBed.inject(HttpTestingController);
    const file = firstValueFrom(
      TestBed.inject(AdminApplicationsApi).export({ kind: 'OPEN_CALL', page: 3, pageSize: 20 }),
    );
    const req = http.expectOne((r) => r.url === `${API}/export`);
    expect(req.request.responseType).toBe('blob');
    expect(req.request.params.has('page')).toBe(false);
    expect(req.request.params.get('kind')).toBe('OPEN_CALL');
    req.flush(new Blob(['folio'], { type: 'text/csv' }), {
      headers: { 'content-disposition': 'attachment; filename="postulaciones-2026.csv"' },
    });
    expect((await file).fileName).toBe('postulaciones-2026.csv');
  });
});
