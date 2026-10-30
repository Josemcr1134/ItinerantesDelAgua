import { TestBed } from '@angular/core/testing';
import { Signature } from './signature';

describe('Signature', () => {
  it('firma "Hecho por DJR Solutions" con enlace al WhatsApp en otra pestaña', async () => {
    const fixture = TestBed.createComponent(Signature);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.textContent?.replace(/\s+/g, ' ').trim()).toBe('Hecho por DJR Solutions');
    const link = host.querySelector('a')!;
    expect(link.getAttribute('href')).toBe('https://wa.me/573004139456');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener');
  });
});
