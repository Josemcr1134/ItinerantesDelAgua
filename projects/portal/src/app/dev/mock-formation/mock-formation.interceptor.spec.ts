import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { mockFormationInterceptor } from './mock-formation.interceptor';

const API = 'https://api.test/api/v1';

describe('mockFormationInterceptor', () => {
  function setup(enabled: boolean) {
    if (enabled) localStorage.setItem('portal.mock.formacion', '1');
    else localStorage.removeItem('portal.mock.formacion');
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([mockFormationInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    return { http: TestBed.inject(HttpClient), backend: TestBed.inject(HttpTestingController) };
  }

  afterEach(() => localStorage.removeItem('portal.mock.formacion'));

  it('apagado: todo va a la API real', () => {
    const { http, backend } = setup(false);
    http.get(`${API}/me/enrollments`).subscribe();
    backend.expectOne(`${API}/me/enrollments`);
  });

  it('encendido: responde Mi formación y el aula con datos de prueba', async () => {
    const { http, backend } = setup(true);
    const courses = await firstValueFrom(
      http.get<{ data: { offer: { type: string } }[] }>(`${API}/me/enrollments`, {
        params: { type: 'COURSE', phase: 'ACTIVE' },
      }),
    );
    expect(courses.data.length).toBeGreaterThan(0);
    expect(courses.data.every((f) => f.offer.type === 'COURSE')).toBe(true);

    const classroom = await firstValueFrom(
      http.get<{ nextSession: { join: { state: string } } }>(`${API}/me/classrooms/mock-eco`),
    );
    expect(classroom.nextSession.join.state).toBe('OPEN');

    await expect(
      firstValueFrom(http.get(`${API}/me/classrooms/mock-huertos`)),
    ).rejects.toMatchObject({
      status: 403,
      error: { code: 'ENROLLMENT_SUSPENDED' },
    });

    // Lo que no es de Formación sigue yendo a la API.
    http.get(`${API}/library`).subscribe();
    backend.expectOne(`${API}/library`);
  });
});
