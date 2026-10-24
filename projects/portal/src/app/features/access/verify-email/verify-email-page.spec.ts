import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideAuth } from 'auth';
import { apiErrorInterceptor, provideApi } from 'data-access';
import VerifyEmailPage from './verify-email-page';

const API = 'https://api.test/api/v1';

describe('VerifyEmailPage', () => {
  it('sin el estado del registro pide el correo y muestra los intentos restantes', async () => {
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
    expect(request.request.body).toEqual({ email: 'ana@correo.com', code: '123456' });
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
  });
});
