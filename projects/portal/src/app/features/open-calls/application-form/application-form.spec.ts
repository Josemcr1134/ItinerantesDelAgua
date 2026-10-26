import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideAuth } from 'auth';
import { apiErrorInterceptor, ApplicationDetailDto, provideApi } from 'data-access';
import { ApplicationForm } from './application-form';

const API = 'https://api.test/api/v1';
const draft = (answers: object = {}) =>
  ({
    id: 'a1',
    status: 'DRAFT',
    editable: true,
    updatedAt: '2026-10-26T19:30:00.000Z',
    offer: { id: 'o1', name: 'Siembra de Agua' },
    applicant: {
      fullName: 'Ana Pérez',
      countryName: 'México',
      divisionName: 'Oaxaca',
      municipalityName: 'Oaxaca de Juárez',
    },
    answers: {
      eligibilityConfirmed: false,
      organization: null,
      organizationRole: null,
      experience: null,
      motivation: null,
      canTravel: null,
      evidenceLinks: [],
      termsAccepted: false,
      ...answers,
    },
    documents: [],
    form: {
      eligibility: { text: 'mujeres lideresas', requiresTravel: true },
      interviewNotice: true,
      limits: {
        answerMinLength: 300,
        answerMaxLength: 2000,
        maxFiles: 10,
        maxLinks: 5,
        image: { mimeTypes: ['image/png'] },
        video: { mimeTypes: ['video/mp4'] },
      },
    },
  }) as unknown as ApplicationDetailDto;

describe('ApplicationForm', () => {
  async function render(application = draft()) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([apiErrorInterceptor])),
        provideHttpClientTesting(),
        provideApi({ baseUrl: 'https://api.test' }),
        provideAuth({ platformName: 'Portal' }),
      ],
    });
    const fixture = TestBed.createComponent(ApplicationForm);
    fixture.componentRef.setInput('application', application);
    fixture.componentRef.setInput('timezone', 'America/Mexico_City');
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const type = (selector: string, value: string) => {
      const field = host.querySelector<HTMLInputElement | HTMLTextAreaElement>(selector)!;
      field.value = value;
      field.dispatchEvent(new Event('input'));
    };
    return { fixture, host, type, http: TestBed.inject(HttpTestingController) };
  }

  it('toma los datos del perfil (sin editarlos) y guarda las respuestas del borrador', async () => {
    const { fixture, host, type, http } = await render();
    expect(host.querySelector<HTMLInputElement>('#app-name')?.value).toBe('Ana Pérez');
    expect(host.querySelector<HTMLInputElement>('#app-name')?.readOnly).toBe(true);

    type('#app-org', ' Colectivo Agua Viva ');
    type('#app-experience', 'Experiencia');
    host.querySelector<HTMLButtonElement>('.button--outline')!.click();
    const request = http.expectOne(`${API}/me/applications/a1`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toMatchObject({
      organization: 'Colectivo Agua Viva',
      experience: 'Experiencia',
      motivation: null,
      canTravel: null,
      termsAccepted: false,
      evidenceLinks: [],
    });
    request.flush(draft({ organization: 'Colectivo Agua Viva' }));
    await fixture.whenStable();
  });

  it('al enviar incompleto muestra cada pendiente en su campo y conserva lo escrito', async () => {
    const { fixture, host, type, http } = await render();
    type('#app-role', 'Promotora');
    host.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    const saved = http.expectOne(`${API}/me/applications/a1`);
    saved.flush(draft({ organizationRole: 'Promotora' }));
    // Llega la postulación guardada: el formulario no se reinicia.
    fixture.componentRef.setInput('application', draft({ organizationRole: 'Promotora' }));
    await fixture.whenStable();
    http.expectOne(`${API}/me/applications/a1/submit`).flush(
      {
        statusCode: 422,
        code: 'APPLICATION_INCOMPLETE',
        message: 'Completa los campos pendientes.',
        details: [
          { field: 'experience', code: 'MIN_LENGTH', message: 'Escribe al menos 300 caracteres.' },
          { field: 'termsAccepted', code: 'MUST_ACCEPT', message: 'Debes aceptar los términos.' },
        ],
      },
      { status: 422, statusText: 'Unprocessable Entity' },
    );
    // El rechazo del envío se resuelve en una tarea posterior.
    await new Promise((r) => setTimeout(r));
    await fixture.whenStable();

    const errors = [...host.querySelectorAll('.field__error')].map((e) => e.textContent?.trim());
    expect(errors).toEqual(['Escribe al menos 300 caracteres.', 'Debes aceptar los términos.']);
    expect(host.querySelector('#app-experience')?.getAttribute('aria-invalid')).toBe('true');
    expect(host.querySelector<HTMLInputElement>('#app-role')?.value).toBe('Promotora');
  });
});
