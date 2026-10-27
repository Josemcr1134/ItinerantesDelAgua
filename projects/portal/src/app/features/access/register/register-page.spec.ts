import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideAuth } from 'auth';
import { apiErrorInterceptor, provideApi } from 'data-access';
import RegisterPage from './register-page';

const API = 'https://api.test/api/v1';
const COUNTRIES = [
  {
    code: 'MX',
    name: 'México',
    phoneCode: '+52',
    phoneMinLength: 10,
    phoneMaxLength: 10,
    hasDivisions: true,
  },
  {
    code: 'GT',
    name: 'Guatemala',
    phoneCode: '+502',
    phoneMinLength: 8,
    phoneMaxLength: 8,
    hasDivisions: false,
  },
];
const DIVISIONS = [{ id: 'd1', code: '09', name: 'Ciudad de México', hasMunicipalities: true }];
const MUNICIPALITIES = [{ id: 'm1', code: '003', name: 'Coyoacán' }];

describe('RegisterPage', () => {
  async function setup() {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: '**', children: [] }]),
        provideHttpClient(withInterceptors([apiErrorInterceptor])),
        provideHttpClientTesting(),
        provideApi({ baseUrl: 'https://api.test' }),
        provideAuth({ platformName: 'Portal' }),
      ],
    });
    const fixture = TestBed.createComponent(RegisterPage);
    const http = TestBed.inject(HttpTestingController);
    const host = fixture.nativeElement as HTMLElement;
    // Sin whenStable(): espera a las peticiones pendientes de los catálogos.
    const settle = async () => {
      TestBed.tick();
      await new Promise((r) => setTimeout(r));
      TestBed.tick();
    };
    await settle();
    http.expectOne(`${API}/locations/countries`).flush({ data: COUNTRIES });
    http
      .expectOne((r) => r.url === `${API}/timezones`)
      .flush({
        officialTimezone: 'America/Mexico_City',
        defaultTimezone: 'America/Mexico_City',
        at: '2026-10-24T00:00:00.000Z',
        zones: [],
        referenceZones: [],
      });
    await settle();
    http.expectOne(`${API}/locations/countries/MX/divisions`).flush({ data: DIVISIONS });
    await settle();
    const $ = <T extends HTMLElement>(s: string) => host.querySelector<T>(s)!;
    const type = (s: string, value: string) => {
      const input = $<HTMLInputElement>(s);
      input.value = value;
      input.dispatchEvent(new Event('input'));
      input.dispatchEvent(new Event('blur'));
    };
    const pick = (s: string, value: string) => {
      const select = $<HTMLSelectElement>(s);
      select.value = value;
      select.dispatchEvent(new Event('change'));
    };
    return { fixture, http, host, settle, $, type, pick };
  }

  it('sin datos marca los campos obligatorios y no envía', async () => {
    const { http, host, settle, $ } = await setup();
    $('.submit').click();
    await settle();
    expect(host.querySelectorAll('.field__error').length).toBe(7);
    http.expectNone(`${API}/auth/register`);
  });

  it('ubicación en cascada: país sin catálogo pasa a texto libre y cambia el indicativo', async () => {
    const { settle, $, pick } = await setup();
    expect($('#reg-division').tagName).toBe('SELECT');
    pick('#reg-country', 'GT');
    await settle();
    expect($('#reg-division').tagName).toBe('INPUT');
    expect($('#reg-municipality').tagName).toBe('INPUT');
    expect($<HTMLSelectElement>('.phone__code select').value).toBe('+502');
  });

  it('crea la cuenta con los datos normalizados y pasa a verificar el correo', async () => {
    const { http, settle, $, type, pick } = await setup();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate');
    pick('#reg-division', 'd1');
    await settle();
    http.expectOne(`${API}/locations/divisions/d1/municipalities`).flush({ data: MUNICIPALITIES });
    await settle();
    pick('#reg-municipality', 'm1');
    type('#reg-full-name', '  María   José ');
    type('#reg-username', 'MariaJose');
    http
      .expectOne(`${API}/auth/availability?username=mariajose`)
      .flush({ username: { value: 'mariajose', valid: true, available: true } });
    type('#reg-email', 'Maria@Correo.com');
    http
      .expectOne(`${API}/auth/availability?email=maria@correo.com`)
      .flush({ email: { value: 'maria@correo.com', valid: true, available: true } });
    type('#reg-phone', '55 1234 5678');
    type('#reg-password', 'Agua2026segura');
    await settle();
    $('.submit').click();
    await settle();

    const request = http.expectOne(`${API}/auth/register`);
    expect(request.request.body).toEqual({
      fullName: 'María José',
      username: 'mariajose',
      email: 'maria@correo.com',
      password: 'Agua2026segura',
      phone: { countryCode: '+52', number: '5512345678' },
      location: { countryCode: 'MX', divisionId: 'd1', municipalityId: 'm1' },
      timezone: expect.any(String),
    });
    const otp = {
      maskedEmail: 'm***@correo.com',
      codeLength: 6,
      expiresAt: '2026-10-24T00:10:00.000Z',
      resendAvailableAt: '2026-10-24T00:00:30.000Z',
    };
    request.flush({ userId: 'u1', email: 'maria@correo.com', status: 'PENDING_VERIFICATION', otp });
    await settle();
    expect(navigate).toHaveBeenCalledWith(['/verificar-correo'], {
      state: { email: 'maria@correo.com', otp },
      queryParams: {},
    });
  });

  it('un usuario ya registrado se marca en su campo', async () => {
    const { http, host, settle, type } = await setup();
    type('#reg-username', 'tomado');
    http
      .expectOne(`${API}/auth/availability?username=tomado`)
      .flush({ username: { value: 'tomado', valid: true, available: false } });
    await settle();
    expect(host.querySelector('#reg-username-error')?.textContent).toContain('ya está registrado');
  });
});
