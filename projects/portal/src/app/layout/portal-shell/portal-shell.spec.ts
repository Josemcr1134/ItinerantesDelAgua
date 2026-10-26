import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideAuth, SessionStore } from 'auth';
import { provideApi, UserProfileDto } from 'data-access';
import PortalShell from './portal-shell';

describe('PortalShell', () => {
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
    const later = new Date(Date.now() + 3_600_000).toISOString();
    TestBed.inject(SessionStore).start(
      {
        accessToken: 'a',
        accessTokenExpiresAt: later,
        refreshToken: 'r',
        refreshTokenExpiresAt: later,
      },
      {
        id: 'u1',
        fullName: 'Jesús Pérez Gómez',
        roles: ['PARTICIPANT'],
      } as unknown as UserProfileDto,
    );
    const fixture = TestBed.createComponent(PortalShell);
    await fixture.whenStable();
    return { fixture, host: fixture.nativeElement as HTMLElement };
  }

  beforeEach(() => localStorage.removeItem('portal.sidebar.collapsed'));

  it('saluda con nombre y primer apellido y muestra las seis secciones', async () => {
    const { host } = await render();
    expect(host.querySelector('.greeting__text')?.textContent).toContain('Hola, Jesús Pérez');
    const labels = [...host.querySelectorAll('.nav__label')].map((l) => l.textContent?.trim());
    expect(labels).toEqual([
      'Dashboard',
      'Formación',
      'Biblioteca',
      'Calendario',
      'Convocatorias',
      'Becas',
    ]);
  });

  it('contrae el menú y lo recuerda en este navegador', async () => {
    const { fixture, host } = await render();
    const toggle = host.querySelector<HTMLButtonElement>('.sidebar__collapse')!;
    expect(toggle.getAttribute('aria-label')).toBe('Contraer menú');
    toggle.click();
    await fixture.whenStable();
    expect(host.classList).toContain('shell--collapsed');
    expect(toggle.getAttribute('aria-label')).toBe('Expandir menú');
    expect(localStorage.getItem('portal.sidebar.collapsed')).toBe('1');

    TestBed.resetTestingModule();
    const again = await render();
    expect(again.host.classList).toContain('shell--collapsed');
  });

  it('el menú de la cuenta se abre desde el saludo y se cierra con Escape', async () => {
    const { fixture, host } = await render();
    host.querySelector<HTMLButtonElement>('.greeting__button')!.click();
    await fixture.whenStable();
    expect(host.querySelector('#account-menu-header')?.textContent).toContain('Cerrar sesión');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await fixture.whenStable();
    expect(host.querySelector('#account-menu-header')).toBeNull();
  });
});
