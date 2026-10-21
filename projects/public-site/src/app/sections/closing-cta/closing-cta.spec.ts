import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideApi } from 'data-access';
import { TestBed } from '@angular/core/testing';
import { CLOSING_CTA_CONTENT } from '../../content/closing-cta.content';
import { ClosingCta } from './closing-cta';

describe('ClosingCta', () => {
  async function setup() {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideApi({ baseUrl: '' })],
    });
    const fixture = TestBed.createComponent(ClosingCta);
    fixture.componentRef.setInput('content', CLOSING_CTA_CONTENT);
    await fixture.whenStable();
    return { fixture, host: fixture.nativeElement as HTMLElement };
  }

  async function openForm() {
    const ctx = await setup();
    ctx.host.querySelector<HTMLButtonElement>('.closing__cta')!.click();
    await ctx.fixture.whenStable();
    return ctx;
  }

  it('sustituye el bloque por el formulario y lleva el foco al primer campo', async () => {
    const { host } = await openForm();
    expect(host.querySelector('.closing__cta')).toBeNull();
    expect(document.activeElement).toBe(host.querySelector('#contact-name'));
  });

  it('vuelve con Volver y devuelve el foco a Hablemos', async () => {
    const { fixture, host } = await openForm();
    host.querySelector<HTMLButtonElement>('.contact-form__back')!.click();
    await fixture.whenStable();
    expect(host.querySelector('pub-contact-form')).toBeNull();
    expect(document.activeElement).toBe(host.querySelector('.closing__cta'));
  });

  it('también vuelve con Escape', async () => {
    const { fixture, host } = await openForm();
    host
      .querySelector('#contact-email')!
      .dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await fixture.whenStable();
    expect(host.querySelector('pub-contact-form')).toBeNull();
  });
});
