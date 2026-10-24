import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { provideRouter, Router, TitleStrategy } from '@angular/router';
import { PortalSeo } from './portal-seo';

@Component({ template: '' })
class Blank {}

describe('PortalSeo', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: 'login',
            title: 'Ingresar al Portal · Itinerantes del Agua',
            data: { seo: { description: 'Ingresa al portal.', index: true } },
            component: Blank,
          },
          { path: 'privada', title: 'Privada', component: Blank },
        ]),
        { provide: TitleStrategy, useClass: PortalSeo },
      ],
    }),
  );

  const tag = (selector: string) => TestBed.inject(Meta).getTag(selector)?.content;
  const canonical = () =>
    document.head.querySelector('link[rel="canonical"]')?.getAttribute('href');

  it('las páginas públicas se indexan con su descripción, canónica y Open Graph', async () => {
    await TestBed.inject(Router).navigateByUrl('/login?returnUrl=%2Fx');
    expect(TestBed.inject(Title).getTitle()).toBe('Ingresar al Portal · Itinerantes del Agua');
    expect(tag('name="robots"')).toBe('index, follow');
    expect(tag('name="description"')).toBe('Ingresa al portal.');
    expect(tag('property="og:title"')).toBe('Ingresar al Portal · Itinerantes del Agua');
    expect(tag('property="og:url"')).toBe('https://portal.itinerantesdelagua.com/login');
    expect(canonical()).toBe('https://portal.itinerantesdelagua.com/login');
  });

  it('las demás páginas no se indexan', async () => {
    await TestBed.inject(Router).navigateByUrl('/privada');
    expect(tag('name="robots"')).toBe('noindex, nofollow');
    expect(canonical()).toBe('https://portal.itinerantesdelagua.com/privada');
    expect(document.head.querySelectorAll('link[rel="canonical"]').length).toBe(1);
  });
});
