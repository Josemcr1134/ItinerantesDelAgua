import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideAuth } from 'auth';
import { apiErrorInterceptor, provideApi } from 'data-access';
import { PageHeading } from '../../core/page-heading/page-heading';
import ClassroomPage from './classroom-page';

const API = 'https://api.test/api/v1/me/classrooms/o1';
const soon = (minutes: number) => new Date(Date.now() + minutes * 60_000).toISOString();

const classroom = (extra: object = {}) => ({
  enrollment: {
    id: 'e1',
    status: 'ACTIVE',
    phase: 'ACTIVE',
    origin: 'NAS',
    enrolledAt: soon(-9000),
  },
  offer: {
    id: 'o1',
    slug: 'eco',
    name: 'Diplomado en Ecotecnologías del Agua',
    type: 'DIPLOMA',
    modality: 'ONLINE_LIVE',
    coverImageUrl: null,
    cohortLabel: '2027-1',
    startsAt: null,
    endsAt: null,
    totalHours: 60,
    venue: null,
    teachers: [{ fullName: 'Lucía Hernández', photoUrl: null }],
  },
  progress: { attendedSessions: 3, scheduledSessions: 5, percent: 60 },
  welcome: {
    preStart: false,
    message: null,
    firstSessionStartsAt: null,
    whatsapp: { available: true, url: 'https://chat.whatsapp.com/x', availableFrom: null },
  },
  nextSession: {
    id: 's4',
    offer: { id: 'o1', name: 'Diplomado' },
    module: { id: 'm2', number: 2, title: 'Cuencas' },
    teacherNames: [],
    startsAt: soon(5),
    endsAt: soon(125),
    timezone: 'America/Mexico_City',
    status: 'SCHEDULED',
    venue: null,
    join: { state: 'OPEN', opensAt: soon(-5), url: 'https://zoom.us/j/1' },
  },
  modules: [],
  finalProject: {
    dueAt: soon(60 * 24 * 30),
    guidelines: 'Presenta tu ecotecnia.',
    submissionState: 'OPEN',
    acceptedMimeTypes: ['application/pdf'],
    maxBytes: 20_971_520,
    submission: null,
  },
  ...extra,
});

const materials = {
  modules: [
    {
      id: 'm1',
      number: 1,
      title: 'Introducción',
      description: null,
      status: 'COMPLETED',
      teacherNames: [],
      presentation: null,
      preReadings: [],
      activities: [],
      recordings: [],
    },
    {
      id: 'm2',
      number: 2,
      title: 'Cuencas',
      description: 'El agua en el territorio.',
      status: 'IN_PROGRESS',
      teacherNames: ['Lucía Hernández'],
      presentation: {
        id: 'r1',
        type: 'PRESENTATION',
        title: 'Presentación del módulo 2',
        description: null,
        kind: 'FILE',
        url: null,
        fileName: 'modulo-2.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 2_516_582,
        activityDueAt: null,
      },
      preReadings: [
        {
          id: 'r2',
          type: 'PRE_READING',
          title: 'Cuencas de México',
          description: null,
          kind: 'EXTERNAL_LINK',
          url: 'https://example.com/cuencas',
          fileName: null,
          mimeType: null,
          sizeBytes: null,
          activityDueAt: null,
        },
      ],
      activities: [],
      recordings: [
        {
          sessionId: 's3',
          startsAt: soon(-60 * 24 * 7),
          endsAt: soon(-60 * 24 * 7 + 120),
          state: 'PENDING',
          url: null,
        },
      ],
    },
  ],
};

describe('ClassroomPage', () => {
  async function render(seccion?: string) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([apiErrorInterceptor])),
        provideHttpClientTesting(),
        provideApi({ baseUrl: 'https://api.test' }),
        provideAuth({ platformName: 'Portal' }),
      ],
    });
    const fixture = TestBed.createComponent(ClassroomPage);
    fixture.componentRef.setInput('offerId', 'o1');
    if (seccion) fixture.componentRef.setInput('seccion', seccion);
    TestBed.tick();
    return {
      fixture,
      http: TestBed.inject(HttpTestingController),
      host: fixture.nativeElement as HTMLElement,
    };
  }

  it('muestra el encabezado, la próxima sesión y los materiales del módulo en curso', async () => {
    const { fixture, http, host } = await render();
    http.expectOne(API).flush(classroom());
    http.expectOne(`${API}/materials`).flush(materials);
    await fixture.whenStable();

    expect(host.querySelector('.hero__title')?.textContent?.trim()).toBe(
      'Diplomado en Ecotecnologías del Agua',
    );
    expect(host.querySelector('.progress')?.getAttribute('aria-label')).toBe(
      'Asistencia: 60% (3 de 5 sesiones)',
    );
    expect(host.querySelector<HTMLAnchorElement>('portal-session-join a')?.href).toBe(
      'https://zoom.us/j/1',
    );
    const tabs = [...host.querySelectorAll('.tab')].map((t) => t.textContent?.trim());
    expect(tabs).toEqual(['Módulos y materiales', 'Sesiones', 'Proyecto final']);

    const modules = host.querySelectorAll<HTMLDetailsElement>('details.module');
    expect([...modules].map((m) => m.open)).toEqual([false, true]);
    const resources = [...modules[1].querySelectorAll('.resource')].map((r) =>
      r.textContent?.replace(/\s+/g, ' ').trim(),
    );
    expect(resources[0]).toContain('modulo-2.pdf · 2.4 MB');
    expect(resources[0]).toContain('Descargar');
    expect(resources[1]).toContain('Enlace externo');
    expect(resources[2]).toContain('Grabación pendiente');

    const heading = TestBed.inject(PageHeading).current();
    expect(heading.breadcrumb?.map((c) => c.label)).toEqual([
      'Diplomados',
      'Diplomado en Ecotecnologías del Agua',
    ]);
  });

  it('un archivo se abre con su URL temporal en otra pestaña', async () => {
    const { fixture, http, host } = await render();
    http.expectOne(API).flush(classroom());
    http.expectOne(`${API}/materials`).flush(materials);
    await fixture.whenStable();

    const tab = { opener: {}, location: { href: '' }, close: vi.fn() };
    vi.spyOn(window, 'open').mockReturnValue(tab as unknown as Window);
    host.querySelector<HTMLButtonElement>('button.resource__action')!.click();
    http.expectOne(`${API}/resources/r1/access`).flush({
      kind: 'FILE',
      url: 'https://storage.test/modulo-2.pdf',
      expiresAt: soon(10),
      fileName: 'modulo-2.pdf',
    });
    await new Promise((r) => setTimeout(r));
    expect(tab.opener).toBeNull();
    expect(tab.location.href).toBe('https://storage.test/modulo-2.pdf');
  });

  it('sin inscripción explica por qué no puede entrar', async () => {
    const { fixture, http, host } = await render();
    http.expectOne(API).flush(
      {
        statusCode: 403,
        code: 'ENROLLMENT_REQUIRED',
        message: 'Sin inscripción',
        meta: { offerSlug: 'eco' },
      },
      { status: 403, statusText: 'Forbidden' },
    );
    http
      .expectOne(`${API}/materials`)
      .flush(
        { statusCode: 403, code: 'ENROLLMENT_REQUIRED', message: 'Sin inscripción' },
        { status: 403, statusText: 'Forbidden' },
      );
    await new Promise((r) => setTimeout(r));
    await fixture.whenStable();
    expect(host.querySelector('.denied__title')?.textContent?.trim()).toBe(
      'Esta aula es solo para personas inscritas',
    );
    expect(host.querySelector('.hero')).toBeNull();
  });

  it('proyecto final: valida el tipo de archivo antes de subirlo', async () => {
    const { fixture, http, host } = await render('proyecto');
    http.expectOne(API).flush(classroom());
    await fixture.whenStable();
    expect(host.querySelector('.project__guidelines')?.textContent).toContain(
      'Presenta tu ecotecnia.',
    );

    const input = host.querySelector<HTMLInputElement>('.drop input')!;
    const files = { 0: new File(['x'], 'foto.png', { type: 'image/png' }), length: 1 };
    Object.defineProperty(input, 'files', { value: files });
    input.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(host.querySelector('.project__error')?.textContent?.trim()).toBe(
      'Sube un archivo PDF, DOCX, PPTX o ZIP.',
    );
    http.expectNone(`${API}/final-project/upload-url`);
  });
});
