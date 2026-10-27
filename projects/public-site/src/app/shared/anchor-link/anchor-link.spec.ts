import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AnchorLink } from './anchor-link';

@Component({
  imports: [AnchorLink],
  template: `
    <a pubAnchorLink href="#destino">Ir</a>
    <a pubAnchorLink href="/escuela/oferta">Catálogo</a>
    <section id="destino" tabindex="-1">Destino</section>
  `,
})
class TestHost {}

describe('AnchorLink', () => {
  it('hace scroll a la sección, le da foco y actualiza el hash', async () => {
    const fixture = TestBed.createComponent(TestHost);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const section = host.querySelector<HTMLElement>('#destino')!;
    const scrollIntoView = vi.fn();
    section.scrollIntoView = scrollIntoView;
    window.matchMedia ??= () => ({ matches: false }) as MediaQueryList;

    host.querySelector('a')!.click();

    expect(scrollIntoView).toHaveBeenCalled();
    expect(document.activeElement).toBe(section);
    expect(window.location.hash).toBe('#destino');
  });

  it('a otra página de la landing navega con el Router, sin recargar', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(TestHost);
    await fixture.whenStable();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);

    const link = (fixture.nativeElement as HTMLElement).querySelectorAll('a')[1];
    const event = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 });
    link.dispatchEvent(event);

    expect(navigate).toHaveBeenCalledWith('/escuela/oferta');
    expect(event.defaultPrevented).toBe(true);
  });
});
