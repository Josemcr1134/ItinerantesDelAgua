import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideAuth, SessionStore } from 'auth';
import { apiErrorInterceptor, provideApi } from 'data-access';
import ProfilePage from './profile-page';

const API = 'https://api.test/api/v1';
const profile = {
  id: 'u1',
  fullName: 'Jesús Pérez',
  username: 'jesus',
  email: 'jesus@correo.com',
  phone: { countryCode: '+52', number: '5512345678' },
  location: {
    countryCode: 'MX',
    countryName: 'México',
    divisionId: 'd1',
    divisionName: 'Oaxaca',
    municipalityId: 'm1',
    municipalityName: 'Oaxaca de Juárez',
  },
  timezone: 'America/Mexico_City',
  currency: 'MXN',
  roles: ['PARTICIPANT'],
  status: 'ACTIVE',
};
const COUNTRIES = [
  {
    code: 'MX',
    name: 'México',
    phoneCode: '+52',
    phoneMinLength: 10,
    phoneMaxLength: 10,
    hasDivisions: true,
    divisionLabel: 'Estado',
    municipalityLabel: 'Municipio',
    currency: 'MXN',
  },
];

describe('ProfilePage', () => {
  async function render(pestana?: string) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([apiErrorInterceptor])),
        provideHttpClientTesting(),
        provideApi({ baseUrl: 'https://api.test' }),
        provideAuth({ platformName: 'Portal' }),
      ],
    });
    const fixture = TestBed.createComponent(ProfilePage);
    if (pestana) fixture.componentRef.setInput('pestana', pestana);
    TestBed.tick();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne(`${API}/me`).flush(profile);
    await new Promise((r) => setTimeout(r));
    TestBed.tick();
    const host = fixture.nativeElement as HTMLElement;
    return { fixture, http, host };
  }

  /** Catálogos de ubicación de la pestaña de datos personales. */
  async function flushCatalogs(http: HttpTestingController) {
    http.expectOne(`${API}/locations/countries`).flush({ data: COUNTRIES });
    await new Promise((r) => setTimeout(r));
    TestBed.tick();
    http
      .expectOne(`${API}/locations/countries/MX/divisions`)
      .flush({ data: [{ id: 'd1', code: '20', name: 'Oaxaca', hasMunicipalities: true }] });
    await new Promise((r) => setTimeout(r));
    TestBed.tick();
    http
      .expectOne(`${API}/locations/divisions/d1/municipalities`)
      .flush({ data: [{ id: 'm1', code: '067', name: 'Oaxaca de Juárez' }] });
  }

  it('datos personales: usuario y correo de solo lectura; guarda y actualiza la sesión', async () => {
    const { fixture, http, host } = await render();
    await flushCatalogs(http);
    await fixture.whenStable();

    expect(host.querySelector('.tab--on')?.textContent?.trim()).toBe('Datos personales');
    expect(host.querySelector<HTMLInputElement>('#profile-username')?.readOnly).toBe(true);
    expect(host.querySelector<HTMLInputElement>('#profile-email')?.value).toBe('jesus@correo.com');
    expect(host.querySelector<HTMLSelectElement>('#profile-division')?.value).toBe('d1');
    expect(host.querySelector<HTMLSelectElement>('#profile-municipality')?.value).toBe('m1');

    const name = host.querySelector<HTMLInputElement>('#profile-name')!;
    name.value = '  Jesús   Pérez Gómez ';
    name.dispatchEvent(new Event('input'));
    host.querySelector<HTMLFormElement>('form')!.dispatchEvent(new Event('submit'));
    const request = http.expectOne(`${API}/me`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({
      fullName: 'Jesús Pérez Gómez',
      phone: { countryCode: '+52', number: '5512345678' },
      location: { countryCode: 'MX', divisionId: 'd1', municipalityId: 'm1' },
    });
    request.flush({ ...profile, fullName: 'Jesús Pérez Gómez' });
    await new Promise((r) => setTimeout(r));
    expect(TestBed.inject(SessionStore).user()?.fullName).toBe('Jesús Pérez Gómez');
  });

  it('seguridad: valida que la confirmación coincida y marca la contraseña actual incorrecta', async () => {
    const { fixture, http, host } = await render('seguridad');
    await fixture.whenStable();
    const type = (id: string, value: string) => {
      const input = host.querySelector<HTMLInputElement>(`#profile-${id}`)!;
      input.value = value;
      input.dispatchEvent(new Event('input'));
    };
    type('currentPassword', 'vieja123');
    type('newPassword', 'Agua2026segura');
    type('confirmPassword', 'Otra2026');
    host.querySelector<HTMLFormElement>('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    expect(host.querySelector('#profile-confirmPassword-error')?.textContent?.trim()).toBe(
      'Las contraseñas no coinciden.',
    );
    http.expectNone(`${API}/me/password`);

    type('confirmPassword', 'Agua2026segura');
    host.querySelector<HTMLFormElement>('form')!.dispatchEvent(new Event('submit'));
    http
      .expectOne(`${API}/me/password`)
      .flush(
        { statusCode: 400, code: 'AUTH_CURRENT_PASSWORD_INVALID', message: 'Incorrecta' },
        { status: 400, statusText: 'Bad Request' },
      );
    await new Promise((r) => setTimeout(r));
    await fixture.whenStable();
    expect(host.querySelector('#profile-currentPassword-error')?.textContent?.trim()).toBe(
      'La contraseña actual no es correcta.',
    );
  });

  it('zona horaria: guarda la zona elegida', async () => {
    const { fixture, http, host } = await render('zona');
    http.expectOne(`${API}/timezones`).flush({
      zones: [
        {
          id: 'America/Mexico_City',
          label: 'Ciudad de México',
          countryCode: 'MX',
          utcOffset: '-06:00',
          offsetMinutes: -360,
        },
        {
          id: 'America/Bogota',
          label: 'Bogotá',
          countryCode: 'CO',
          utcOffset: '-05:00',
          offsetMinutes: -300,
        },
      ],
    });
    await fixture.whenStable();
    const select = host.querySelector<HTMLSelectElement>('#profile-timezone')!;
    select.value = 'America/Bogota';
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    host.querySelector<HTMLFormElement>('form')!.dispatchEvent(new Event('submit'));
    const request = http.expectOne(`${API}/me/timezone`);
    expect(request.request.body).toEqual({ timezone: 'America/Bogota' });
  });
});
