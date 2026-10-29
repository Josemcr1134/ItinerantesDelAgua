import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideAuth, SessionStore } from 'auth';
import { apiErrorInterceptor, provideApi } from 'data-access';
import VerifyEmailPage from './verify-email-page';

const API = 'https://api.test/api/v1';

describe('VerifyEmailPage', () => {
  it('sin el estado del registro pide el correo, muestra los intentos restantes y limpia el rojo al reintentar', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([apiErrorInterceptor])),
        provideHttpClientTesting(),
        provideApi({ baseUrl: 'https://api.test' }),
        provideAuth({ platformName: 'Portal' }),
      ],
    });
    const fixture = TestBed.createComponent(VerifyEmailPage);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const type = (s: string, value: string) => {
      const input = host.querySelector<HTMLInputElement>(s)!;
      input.value = value;
      input.dispatchEvent(new Event('input'));
    };
    type('#verify-email', 'Ana@Correo.com');
    type('#verify-code', '12 34 56');
    host.querySelector<HTMLButtonElement>('.submit')!.click();

    const request = TestBed.inject(HttpTestingController).expectOne(`${API}/auth/verify-email`);
    expect(request.request.body).toEqual({
      email: 'ana@correo.com',
      code: '123456',
      startSession: true,
      rememberMe: false,
    });
    request.flush(
      {
        statusCode: 400,
        code: 'AUTH_OTP_INVALID',
        message: 'El código no es válido.',
        meta: { attemptsRemaining: 4 },
      },
      { status: 400, statusText: 'Bad Request' },
    );
    await fixture.whenStable();
    expect(host.querySelector('[role="alert"]')?.textContent).toContain('Te quedan 4 intentos.');
    // Casillas en rojo hasta escribir el siguiente código.
    const code = () => host.querySelector('portal-code-input')!;
    expect(code().classList).toContain('code--invalid');
    type('#verify-code', '7');
    await fixture.whenStable();
    expect(code().classList).not.toContain('code--invalid');
  });

  it('al verificar, inicia la sesión y entra directo al destino', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([apiErrorInterceptor])),
        provideHttpClientTesting(),
        provideApi({ baseUrl: 'https://api.test' }),
        provideAuth({ platformName: 'Portal', homeUrl: '/inicio' }),
      ],
    });
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const fixture = TestBed.createComponent(VerifyEmailPage);
    fixture.componentRef.setInput('returnUrl', '/inscripcion/eco');
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    for (const [selector, value] of [
      ['#verify-email', 'ana@correo.com'],
      ['#verify-code', '123456'],
    ]) {
      const input = host.querySelector<HTMLInputElement>(selector)!;
      input.value = value;
      input.dispatchEvent(new Event('input'));
    }
    host.querySelector<HTMLButtonElement>('.submit')!.click();
    const later = (s: number) => new Date(Date.now() + s * 1000).toISOString();
    TestBed.inject(HttpTestingController)
      .expectOne(`${API}/auth/verify-email`)
      .flush({
        verified: true,
        email: 'ana@correo.com',
        session: {
          accessToken: 'a',
          tokenType: 'Bearer',
          expiresIn: 900,
          accessTokenExpiresAt: later(900),
          refreshToken: 'r',
          refreshTokenExpiresAt: later(86_400),
          user: { id: 'u1', fullName: 'Ana', roles: ['PARTICIPANT'] },
        },
      });
    await fixture.whenStable();
    expect(TestBed.inject(SessionStore).isAuthenticated()).toBe(true);
    expect(navigate).toHaveBeenCalledWith('/inscripcion/eco');
  });
});
