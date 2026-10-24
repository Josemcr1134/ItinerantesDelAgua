import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
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
    expect(host.querySelector('.card__register-link')?.getAttribute('href')).toBe('/registro');
  });

  it('la ilustración es decorativa (oculta a lectores de pantalla)', async () => {
    const host = await render();
    for (const img of Array.from(host.querySelectorAll('.scene img, .corner img'))) {
      expect(img.getAttribute('alt')).toBe('');
      expect(img.closest('[aria-hidden="true"]')).not.toBeNull();
    }
  });
});
