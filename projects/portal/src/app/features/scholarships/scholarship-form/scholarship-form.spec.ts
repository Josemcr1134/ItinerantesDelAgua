import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideAuth } from 'auth';
import {
  apiErrorInterceptor,
  ApplicationDetailDto,
  provideApi,
  SKIP_GLOBAL_LOADER,
} from 'data-access';
import { AUTOSAVE_DELAY_MS, ScholarshipForm } from './scholarship-form';

const API = 'https://api.test/api/v1';
const type = (id: string, name: string, percent: number, balanceCents: number) => ({
  scholarshipTypeId: id,
  scholarshipType: {
    id,
    key: id,
    name,
    minPercent: percent,
    maxPercent: percent,
    requiresInterview: false,
  },
  estimatedBalance: { minAmountCents: balanceCents, maxAmountCents: balanceCents, currency: 'USD' },
  availableRecipients: 10,
  isFull: false,
});
const draft = (answers: object = {}) =>
  ({
    id: 'a1',
    status: 'DRAFT',
    editable: true,
    updatedAt: '2026-10-26T15:42:00.000Z',
    offer: {
      id: 'o1',
      slug: 'eco',
      name: 'Diplomado en Ecotecnologías del Agua',
      cohortLabel: '2027-1',
    },
    applicant: {
      fullName: 'Ana Pérez',
      email: 'ana@correo.com',
      phone: { countryCode: '+57', number: '3001234567' },
      countryName: 'Colombia',
    },
    answers: {
      age: 34,
      requestedScholarshipTypeId: null,
      intentLetter: null,
      evidenceLinks: [],
      termsAccepted: false,
      ...answers,
    },
    documents: [],
    form: {
      window: { state: 'OPEN', closesAt: '2026-12-15T23:59:00.000Z' },
      price: { amountCents: 58500, currency: 'USD' },
      scholarshipTypes: [type('t1', 'Agua Viva', 10, 52650), type('t3', 'Aguas Libres', 50, 29250)],
      limits: {
        letterMinLength: 800,
        letterMaxLength: 4000,
        minFiles: 1,
        maxFiles: 10,
        maxLinks: 5,
        image: { mimeTypes: ['image/jpeg', 'image/png'], maxBytes: 10_485_760 },
        video: { mimeTypes: ['video/mp4', 'video/quicktime'], maxBytes: 104_857_600 },
      },
    },
  }) as unknown as ApplicationDetailDto;

describe('ScholarshipForm', () => {
  async function render() {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([apiErrorInterceptor])),
        provideHttpClientTesting(),
        provideApi({ baseUrl: 'https://api.test' }),
        provideAuth({ platformName: 'Portal' }),
      ],
    });
    const fixture = TestBed.createComponent(ScholarshipForm);
    fixture.componentRef.setInput('application', draft());
    fixture.componentRef.setInput('timezone', 'America/Bogota');
    TestBed.tick();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne(`${API}/locations/countries`).flush({ data: [] });
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const type = (selector: string, value: string) => {
      const field = host.querySelector<HTMLInputElement | HTMLTextAreaElement>(selector)!;
      field.value = value;
      field.dispatchEvent(new Event('input'));
    };
    return { fixture, host, type, http };
  }

  it('precarga el contacto del perfil y estima el saldo del nivel elegido', async () => {
    const { fixture, host } = await render();
    expect(host.querySelector<HTMLInputElement>('#sch-email')?.readOnly).toBe(true);
    expect(host.querySelector<HTMLInputElement>('#sch-phone')?.value).toBe('3001234567');
    expect(host.querySelector<HTMLInputElement>('#sch-age')?.value).toBe('34');
    expect(host.querySelector('.drop__hint')?.textContent).toContain(
      'JPG/PNG hasta 10 MB · MP4/MOV hasta 100 MB',
    );
    expect(host.querySelector('.estimate')?.textContent).toContain('Elige un nivel');

    host.querySelectorAll<HTMLInputElement>('.level input')[1].click();
    await fixture.whenStable();
    expect(host.querySelector('.estimate__level')?.textContent?.trim()).toBe(
      'Nivel: Aguas Libres 50%',
    );
    expect(host.querySelector('.estimate__amount')?.textContent?.trim()).toBe('$292.50 USD');
    expect(host.querySelector('.chip')?.textContent?.trim()).toBe('20 becas disponibles');
  });

  it('guarda el borrador solo al dejar de escribir, sin el loader general', async () => {
    const { type, http } = await render();
    vi.useFakeTimers();
    try {
      type('#sch-letter', 'Cuido el manantial de mi comunidad.');
      vi.advanceTimersByTime(AUTOSAVE_DELAY_MS - 100);
      http.expectNone(`${API}/me/applications/a1`);
      type('#sch-letter', 'Cuido el manantial de mi comunidad desde 2019.');
      vi.advanceTimersByTime(AUTOSAVE_DELAY_MS);
    } finally {
      vi.useRealTimers();
    }
    const request = http.expectOne(`${API}/me/applications/a1`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.context.get(SKIP_GLOBAL_LOADER)).toBe(true);
    expect(request.request.body).toMatchObject({
      phone: { countryCode: '+57', number: '3001234567' },
      age: 34,
      intentLetter: 'Cuido el manantial de mi comunidad desde 2019.',
    });
    request.flush(draft({ intentLetter: 'Cuido el manantial de mi comunidad desde 2019.' }));
  });

  it('al postular incompleto muestra cada pendiente en su campo', async () => {
    const { fixture, host, http } = await render();
    host.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    http.expectOne(`${API}/me/applications/a1`).flush(draft());
    await new Promise((r) => setTimeout(r));
    http.expectOne(`${API}/me/applications/a1/submit`).flush(
      {
        statusCode: 422,
        code: 'APPLICATION_INCOMPLETE',
        message: 'Completa los campos pendientes.',
        details: [
          { field: 'requestedScholarshipTypeId', code: 'REQUIRED', message: 'Elige un nivel.' },
          {
            field: 'intentLetter',
            code: 'MIN_LENGTH',
            message: 'Escribe al menos 800 caracteres.',
          },
          { field: 'documents', code: 'MIN_FILES', message: 'Sube al menos un archivo.' },
        ],
      },
      { status: 422, statusText: 'Unprocessable Entity' },
    );
    await new Promise((r) => setTimeout(r));
    await fixture.whenStable();

    const errors = [...host.querySelectorAll('.field__error')].map((e) => e.textContent?.trim());
    expect(errors).toEqual([
      'Elige un nivel.',
      'Escribe al menos 800 caracteres.',
      'Sube al menos un archivo.',
    ]);
    expect(host.querySelector('#sch-letter')?.getAttribute('aria-invalid')).toBe('true');
    expect(host.querySelector('.form__error')?.textContent?.trim()).toBe(
      'Completa los campos pendientes.',
    );
  });
});
