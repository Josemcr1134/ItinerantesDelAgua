import { TestBed } from '@angular/core/testing';
import { NAVBAR_CONTENT } from '../../content/navbar.content';
import { Navbar } from './navbar';

describe('Navbar', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Navbar);
    fixture.componentRef.setInput('content', NAVBAR_CONTENT);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const toggle = host.querySelector<HTMLButtonElement>('.navbar__toggle')!;
    return { fixture, host, toggle };
  }

  it('renderiza un enlace por cada sección y el CTA', async () => {
    const { host } = await setup();
    const hrefs = Array.from(host.querySelectorAll('.navbar__link')).map((a) =>
      a.getAttribute('href'),
    );
    expect(hrefs).toEqual([
      '/#objetivos',
      '/#trayectoria',
      '/#itinerantes',
      '/escuela/oferta',
      '#contacto',
    ]);
    expect(host.querySelector('.navbar__cta')?.textContent?.trim()).toBe('Regístrate');
  });

  it('abre y cierra el menú móvil reflejándolo en aria-expanded', async () => {
    const { fixture, toggle } = await setup();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');

    toggle.click();
    await fixture.whenStable();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');

    toggle.click();
    await fixture.whenStable();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });

  it('cierra el menú con Escape y devuelve el foco al botón', async () => {
    const { fixture, toggle } = await setup();
    toggle.click();
    await fixture.whenStable();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await fixture.whenStable();

    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(toggle);
  });

  it('pasa a cápsula flotante al hacer scroll y vuelve arriba', async () => {
    const { fixture, host } = await setup();
    const header = host.querySelector('.navbar')!;
    const scrollTo = async (y: number) => {
      Object.defineProperty(window, 'scrollY', { value: y, configurable: true });
      window.dispatchEvent(new Event('scroll'));
      await fixture.whenStable();
    };

    expect(header.classList).not.toContain('navbar--scrolled');
    await scrollTo(200);
    expect(header.classList).toContain('navbar--scrolled');
    await scrollTo(0);
    expect(header.classList).not.toContain('navbar--scrolled');
  });

  it('cierra el menú al pulsar fuera del header, pero no al pulsar dentro', async () => {
    const { fixture, host, toggle } = await setup();
    toggle.click();
    await fixture.whenStable();

    host.querySelector<HTMLElement>('.navbar__menu')!.click();
    await fixture.whenStable();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');

    document.body.click();
    await fixture.whenStable();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });

  it('marca el menú como abierto solo mientras está desplegado', async () => {
    const { fixture, host, toggle } = await setup();
    const menu = host.querySelector('.navbar__menu')!;
    expect(menu.classList).not.toContain('navbar__menu--open');

    toggle.click();
    await fixture.whenStable();
    expect(menu.classList).toContain('navbar__menu--open');
    expect(host.querySelector('.navbar')!.classList).toContain('navbar--menu-open');
  });
});
