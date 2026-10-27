import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideAuth } from 'auth';
import { provideApi } from 'data-access';
import LoginPage from './login-page';

describe('LoginPage (portal)', () => {
  async function render() {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideApi({ baseUrl: 'https://api.test' }),
        provideAuth({ platformName: 'Portal' }),
      ],
    });
    const fixture = TestBed.createComponent(LoginPage);
    fixture.componentRef.setInput('returnUrl', '/mis-cursos');
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('muestra el título, el formulario del portal y el enlace al registro', async () => {
    const host = await render();
    expect(host.querySelector('h1')?.textContent).toContain('Ingresar al Portal');
    const form = host.querySelector('auth-login-form');
    expect(form?.classList).toContain('login-form--portal');
    expect(form?.querySelector('input[type="checkbox"]')).toBeNull();
    // Quien se registra desde aquí vuelve al mismo destino.
    expect(host.querySelector('.switch a')?.getAttribute('href')).toBe(
      '/registro?returnUrl=%2Fmis-cursos',
    );
  });

  it('la ilustración es decorativa (oculta a lectores de pantalla)', async () => {
    const host = await render();
    for (const img of Array.from(host.querySelectorAll('.scene img, .corner img'))) {
      expect(img.getAttribute('alt')).toBe('');
      expect(img.closest('[aria-hidden="true"]')).not.toBeNull();
    }
  });

  it('cuenta sin verificar: va a validar el correo conservando el destino', async () => {
    await render();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(LoginPage);
    fixture.componentRef.setInput('returnUrl', '/inscripcion/eco?accion=APPLY_SCHOLARSHIP');
    await fixture.whenStable();
    fixture.debugElement
      .query((el) => el.name === 'auth-login-form')
      .triggerEventHandler('emailNotVerified', {
        email: 'ana@correo.com',
        otpSent: true,
        expiresAt: '2026-10-27T00:10:00.000Z',
        resendAvailableAt: '2026-10-27T00:00:30.000Z',
      });
    expect(navigate).toHaveBeenCalledWith(['/verificar-correo'], {
      state: {
        email: 'ana@correo.com',
        otp: {
          maskedEmail: 'a***@correo.com',
          codeLength: 6,
          expiresAt: '2026-10-27T00:10:00.000Z',
          resendAvailableAt: '2026-10-27T00:00:30.000Z',
        },
      },
      queryParams: { returnUrl: '/inscripcion/eco?accion=APPLY_SCHOLARSHIP' },
    });
  });
});
