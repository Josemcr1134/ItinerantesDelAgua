import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideAuth } from 'auth';
import { ApplicationCardDto, provideApi } from 'data-access';
import { ScholarshipTracker } from './scholarship-tracker';

const step = (key: string, state: string) => ({ key, state, at: null });
const base = {
  id: 'a1',
  folio: 'BEC-2027-0142',
  kind: 'SCHOLARSHIP',
  offer: { id: 'o1', name: 'Diplomado en Ecotecnologías del Agua', cohortLabel: '2027-1' },
  submittedAt: '2026-12-02T15:00:00.000Z',
  updatedAt: '2026-12-02T15:00:00.000Z',
  requiresAction: true,
  interview: null,
  scholarshipResult: null,
  response: null,
};
const approved = {
  ...base,
  status: 'APPROVED_PENDING_PAYMENT',
  action: { type: 'PAY_BALANCE', enabled: true, reason: null, dueAt: null },
  timeline: [
    step('SUBMITTED', 'DONE'),
    step('IN_REVIEW', 'DONE'),
    step('INTERVIEW', 'SKIPPED'),
    step('RESULT', 'DONE'),
    step('PAYMENT', 'CURRENT'),
    step('ENROLLED', 'UPCOMING'),
  ],
  scholarshipResult: {
    requestedScholarshipType: { name: 'Aguas Libres', minPercent: 50, maxPercent: 50 },
    assignedScholarshipType: { name: 'Aguas Libres', minPercent: 50, maxPercent: 50 },
    assignedPercent: 50,
    originalAmount: { amountCents: 58500, currency: 'USD' },
    balance: { amountCents: 29250, currency: 'USD' },
    dueAt: '2026-12-27T15:00:00.000Z',
  },
} as unknown as ApplicationCardDto;
const interview = {
  ...base,
  status: 'INTERVIEW_SCHEDULED',
  action: { type: 'JOIN_INTERVIEW', enabled: false, reason: 'INTERVIEW_NOT_OPEN_YET', dueAt: null },
  timeline: [step('SUBMITTED', 'DONE'), step('IN_REVIEW', 'DONE'), step('INTERVIEW', 'CURRENT')],
  interview: {
    startsAt: '2027-01-07T16:00:00.000Z',
    endsAt: '2027-01-07T16:30:00.000Z',
    join: { state: 'NOT_YET', url: null },
  },
} as unknown as ApplicationCardDto;

describe('ScholarshipTracker', () => {
  async function render(application: ApplicationCardDto) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideApi({ baseUrl: 'https://api.test' }),
        provideAuth({ platformName: 'Portal' }),
      ],
    });
    const fixture = TestBed.createComponent(ScholarshipTracker);
    fixture.componentRef.setInput('application', application);
    fixture.componentRef.setInput('timezone', 'America/Bogota');
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('aprobada: avance sin los pasos omitidos, saldo con descuento y pago deshabilitado', async () => {
    const host = await render(approved);
    const steps = [...host.querySelectorAll('.stepper__step')];
    expect(steps.map((s) => s.getAttribute('data-state'))).toEqual([
      'DONE',
      'DONE',
      'DONE',
      'CURRENT',
      'UPCOMING',
    ]);
    expect(steps[3].textContent).toContain('Pago');
    const figures = [...host.querySelectorAll('.figures dd')].map((d) => d.textContent?.trim());
    expect(figures).toEqual(['$585 USD', '50% / 50%', '−$292.50 USD', '$292.50 USD']);
    expect(host.textContent).toContain('Fecha límite de pago: 27 dic 2026');
    const pay = host.querySelector<HTMLButtonElement>('.action:not(.action--outline)')!;
    expect(pay.textContent?.trim()).toBe('Pagar saldo');
    expect(pay.disabled).toBe(true);
    expect(host.querySelector('.action--outline')?.textContent?.trim()).toBe('Ver postulación');
  });

  it('entrevista: hora en su zona y en CDMX, y [Entrar] hasta 10 min antes', async () => {
    const host = await render(interview);
    expect(host.querySelector('.box')?.textContent?.replace(/\s+/g, ' ')).toContain(
      'jue 7 ene 2027 · 11:00 (tu zona: Bogota) — 10:00 CDMX',
    );
    const join = host.querySelector<HTMLButtonElement>('button.action--outline')!;
    expect(join.disabled).toBe(true);
    expect(host.querySelector('.tracker__reason')?.textContent).toContain('10 min antes');
  });
});
