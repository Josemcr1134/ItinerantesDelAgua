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

  it('saluda con nombre y primer apellido y muestra las siete secciones', async () => {
    const { host } = await render();
    expect(host.querySelector('.greeting__text')?.textContent).toContain('Hola, Jesús Pérez');
    const labels = [...host.querySelectorAll('.nav__label')].map((l) => l.textContent?.trim());
    expect(labels).toEqual([
      'Dashboard',
      'Formación',
      'Catálogo',
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

  it('Formación se despliega con Diplomados, Cursos, Talleres y Eventos', async () => {
    const { fixture, host } = await render();
    const group = [...host.querySelectorAll<HTMLButtonElement>('button.nav__link')].find((b) =>
      b.textContent?.includes('Formación'),
    )!;
    expect(group.getAttribute('aria-expanded')).toBe('false');
    expect(host.querySelector('.subnav')).toBeNull();

    group.click();
    await fixture.whenStable();
    expect(group.getAttribute('aria-expanded')).toBe('true');
    const links = [...host.querySelectorAll<HTMLAnchorElement>('.subnav__link')];
    expect(links.map((l) => [l.textContent?.trim(), l.getAttribute('href')])).toEqual([
      ['Diplomados', '/formacion/diplomados'],
      ['Cursos', '/formacion/cursos'],
      ['Talleres', '/formacion/talleres'],
      ['Eventos', '/formacion/eventos'],
    ]);
  });

  it('en móvil, la barra inferior lleva a las secciones principales y "Más" abre el menú', async () => {
    const { fixture, host } = await render();
    const items = [...host.querySelectorAll<HTMLElement>('.tabbar .tabbar__item')];
    expect(items.map((i) => i.textContent?.trim())).toEqual([
      'Inicio',
      'Formación',
      'Catálogo',
      'Calendario',
      'Más',
    ]);
    expect(items.slice(0, 4).map((i) => i.getAttribute('href'))).toEqual([
      '/',
      '/formacion',
      '/catalogo',
      '/calendario',
    ]);

    const more = items[4] as HTMLButtonElement;
    expect(more.getAttribute('aria-expanded')).toBe('false');
    more.click();
    await fixture.whenStable();
    expect(more.getAttribute('aria-expanded')).toBe('true');
    expect(host.querySelector('#portal-sidebar')?.classList).toContain('sidebar--open');

    // Escape lo cierra y el foco vuelve a "Más".
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await fixture.whenStable();
    expect(more.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(more);
  });
});
