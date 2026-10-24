import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { apiErrorInterceptor, provideApi } from 'data-access';
import { provideAuth } from '../../provide-auth';
import { SESSION_STORAGE, SessionStorage } from '../../session/session-storage';
import { LoginForm, LoginFormAppearance } from './login-form';

const API = 'https://api.test/api/v1';

describe('LoginForm', () => {
  async function setup(inputs: {
    returnUrl?: string;
    showRememberMe?: boolean;
    appearance?: LoginFormAppearance;
  }) {
    const storage: SessionStorage = {
      read: () => null,
      write: () => undefined,
      clear: () => undefined,
    };
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: '**', children: [] }]),
        provideHttpClient(withInterceptors([apiErrorInterceptor])),
        provideHttpClientTesting(),
        provideApi({ baseUrl: 'https://api.test' }),
        provideAuth(),
        { provide: SESSION_STORAGE, useValue: storage },
      ],
    });
    const fixture = TestBed.createComponent(LoginForm);
    for (const [name, value] of Object.entries(inputs)) fixture.componentRef.setInput(name, value);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const type = (selector: string, value: string) => {
      const input = host.querySelector<HTMLInputElement>(selector)!;
      input.value = value;
      input.dispatchEvent(new Event('input'));
    };
    return { fixture, host, type, http: TestBed.inject(HttpTestingController) };
  }

  it('aspecto del portal: sin "Recordarme" y con el botón de contorno', async () => {
    const { host } = await setup({ appearance: 'portal', showRememberMe: false });
    expect(host.classList).toContain('login-form--portal');
    expect(host.querySelector('input[type="checkbox"]')).toBeNull();
    expect(host.querySelector('.submit')?.classList).toContain('ui-button--secondary');
  });

  it('por defecto muestra "Recordarme" y el botón principal', async () => {
    const { host } = await setup({});
    expect(host.querySelector('input[type="checkbox"]')).not.toBeNull();
    expect(host.querySelector('.submit')?.classList).not.toContain('ui-button--secondary');
  });

  it('inicia sesión y vuelve a la ruta interna pedida', async () => {
    const { fixture, host, type, http } = await setup({ returnUrl: '/mis-cursos' });
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl');
    type('#login-email', ' Ana@Correo.com ');
    type('#login-password', 'secreta123');
    host.querySelector<HTMLButtonElement>('.submit')!.click();

    const request = http.expectOne(`${API}/auth/login`);
    expect(request.request.body).toEqual({
      email: 'ana@correo.com',
      password: 'secreta123',
      rememberMe: false,
    });
    request.flush({
      accessToken: 'a',
      accessTokenExpiresAt: new Date(Date.now() + 60_000).toISOString(),
      refreshToken: 'r',
      refreshTokenExpiresAt: new Date(Date.now() + 60_000).toISOString(),
      tokenType: 'Bearer',
      expiresIn: 60,
      user: { id: 'u1', fullName: 'Ana Pérez', roles: ['PARTICIPANT'] },
    });
    await fixture.whenStable();
    expect(navigate).toHaveBeenCalledWith('/mis-cursos');
  });

  it('muestra el error de la API e ignora un returnUrl externo', async () => {
    const { fixture, host, type, http } = await setup({ returnUrl: '//evil.test' });
    type('#login-email', 'ana@correo.com');
    type('#login-password', 'mala');
    host.querySelector<HTMLButtonElement>('.submit')!.click();
    http.expectOne(`${API}/auth/login`).flush(
      {
        statusCode: 401,
        code: 'INVALID_CREDENTIALS',
        message: 'Correo o contraseña incorrectos.',
      },
      { status: 401, statusText: 'Unauthorized' },
    );
    await fixture.whenStable();
    expect(host.querySelector('[role="alert"]')?.textContent).toContain(
      'Correo o contraseña incorrectos.',
    );
    expect(host.querySelector<HTMLInputElement>('#login-password')!.value).toBe('');
  });
});
