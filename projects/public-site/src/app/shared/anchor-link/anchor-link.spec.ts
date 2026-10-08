import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AnchorLink } from './anchor-link';

@Component({
  imports: [AnchorLink],
  template: `
    <a pubAnchorLink href="#destino">Ir</a>
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
});
