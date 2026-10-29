import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { apiErrorInterceptor, provideApi } from 'data-access';
import { STAFF_ROLES } from '../../auth.config';
import { provideAuth } from '../../provide-auth';
import { SESSION_STORAGE, SessionStorage } from '../../session/session-storage';
import { SessionStore } from '../../session/session.store';
import VerifyEmailPage from './verify-email-page';
import { verifyEmailState } from './verify-email-state';

const API = 'https://api.test/api/v1';
const later = (seconds: number) => new Date(Date.now() + seconds * 1000).toISOString();

describe('VerifyEmailPage (auth)', () => {
  async function setup(otpSent = true) {
    const storage: SessionStorage = {
      read: () => null,
      write: () => undefined,
      clear: () => undefined,
    };
    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [
            { path: 'verificar-correo', component: VerifyEmailPage },
            { path: '**', children: [] },
          ],
          withComponentInputBinding(),
        ),
        provideHttpClient(withInterceptors([apiErrorInterceptor])),
        provideHttpClientTesting(),
        provideApi({ baseUrl: 'https://api.test' }),
        provideAuth({ allowedRoles: STAFF_ROLES, homeUrl: '/inicio' }),
        { provide: SESSION_STORAGE, useValue: storage },
      ],
    });
    const harness = await RouterTestingHarness.create();
    const router = TestBed.inject(Router);
    const state = verifyEmailState({
      email: 'ana@x.org',
      rememberMe: true,
      otpSent,
      maskedEmail: 'a***@x.org',
      codeLength: 6,
      expiresAt: later(600),
      resendAvailableAt: later(30),
    });
    await router.navigateByUrl('/verificar-correo?returnUrl=%2Fpagos', { state });
    harness.detectChanges();
    await harness.fixture.whenStable();
    const host = harness.routeNativeElement as HTMLElement;
    const type = (value: string) => {
      const input = host.querySelector<HTMLInputElement>('#verify-code')!;
      input.value = value;
      input.dispatchEvent(new Event('input'));
    };
    return { harness, router, host, type, http: TestBed.inject(HttpTestingController) };
  }

  it('muestra el correo de la API y espera para reenviar el código', async () => {
    const { host } = await setup();
    expect(host.querySelector('.subtitle')?.textContent).toContain('a***@x.org');
    const resend = host.querySelector<HTMLButtonElement>('.actions .link')!;
    expect(resend.disabled).toBe(true);
    expect(resend.textContent).toContain('Puedes pedir otro código en 0:');
  });

  it('código incorrecto: muestra los intentos restantes', async () => {
    const { harness, host, type, http } = await setup();
    type('12 34 56');
    host.querySelector<HTMLButtonElement>('.submit')!.click();
    http.expectOne(`${API}/auth/verify-email`).flush(
      {
        statusCode: 400,
        code: 'AUTH_OTP_INVALID',
        message: 'El código no es válido.',
        meta: { attemptsRemaining: 2 },
      },
      { status: 400, statusText: 'Bad Request' },
    );
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(host.querySelector('[role="alert"]')?.textContent).toContain('Te quedan 2 intentos.');
  });

  it('al verificar, inicia la sesión y entra al destino', async () => {
    const { harness, router, host, type, http } = await setup();
    type('123456');
    host.querySelector<HTMLButtonElement>('.submit')!.click();
    const request = http.expectOne(`${API}/auth/verify-email`);
    expect(request.request.body).toEqual({
      email: 'ana@x.org',
      code: '123456',
      rememberMe: true,
      startSession: true,
    });
    request.flush({
      verified: true,
      email: 'ana@x.org',
      session: {
        accessToken: 'a',
        tokenType: 'Bearer',
        expiresIn: 900,
        accessTokenExpiresAt: later(900),
        refreshToken: 'r',
        refreshTokenExpiresAt: later(86_400),
        user: { id: 'u1', fullName: 'Ana', roles: ['FINANCE'] },
      },
    });
    await harness.fixture.whenStable();
    expect(TestBed.inject(SessionStore).isAuthenticated()).toBe(true);
    expect(router.url).toBe('/pagos');
  });

  it('sin código nuevo, permite pedir otro al terminar la espera', async () => {
    const { host, http } = await setup(false);
    expect(host.querySelector('.subtitle')?.textContent).toContain('o pide uno nuevo');
    http.verify();
  });

  it('sin el estado del login (al recargar) vuelve al login', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'verificar-correo', component: VerifyEmailPage },
          { path: '**', children: [] },
        ]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideApi({ baseUrl: 'https://api.test' }),
        provideAuth(),
      ],
    });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/verificar-correo');
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/login');
  });
});
