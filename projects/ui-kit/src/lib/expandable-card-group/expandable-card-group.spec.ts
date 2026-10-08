import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardPanel, CardPanelDefault } from './card-panel';
import { ExpandableCardGroup } from './expandable-card-group';
import { ExpandableItem } from './expandable-item';

const ITEMS: readonly ExpandableItem[] = ['a', 'b', 'c'].map((id) => ({
  id,
  image: { src: 'card.png', alt: '' },
  title: `Título ${id}`,
  description: `Descripción ${id}`,
}));

@Component({
  imports: [ExpandableCardGroup, CardPanel, CardPanelDefault],
  template: `
    <ui-expandable-card-group
      [items]="items"
      groupLabel="Grupo"
      openLabel="Ver"
      closeLabel="Cerrar"
    >
      <ng-template uiCardPanelDefault><p class="content">Por defecto</p></ng-template>
      <ng-template uiCardPanel="a"><p class="content">Panel a</p></ng-template>
      <ng-template uiCardPanel="b"><p class="content">Panel b</p></ng-template>
      <ng-template uiCardPanel="c"><p class="content">Panel c</p></ng-template>
    </ui-expandable-card-group>
  `,
})
class TestHost {
  readonly items = ITEMS;
}

describe('ExpandableCardGroup', () => {
  let fixture: ComponentFixture<TestHost>;
  let host: HTMLElement;

  const triggers = () => Array.from(host.querySelectorAll<HTMLButtonElement>('.card__trigger'));
  const panelText = () => host.querySelector('.panel .content')?.textContent?.trim();

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestHost);
    host = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  it('muestra el panel por defecto y todos los botones colapsados', () => {
    expect(panelText()).toBe('Por defecto');
    const panelId = host.querySelector('.panel')!.id;
    for (const trigger of triggers()) {
      expect(trigger.getAttribute('aria-expanded')).toBe('false');
      expect(trigger.getAttribute('aria-controls')).toBe(panelId);
    }
    expect(triggers()[0].getAttribute('aria-label')).toBe('Ver: Título a');
  });

  it('muestra el contenido de la tarjeta pulsada y solo una activa a la vez', async () => {
    triggers()[1].click();
    await fixture.whenStable();
    expect(panelText()).toBe('Panel b');
    expect(triggers()[1].getAttribute('aria-expanded')).toBe('true');
    expect(triggers()[1].getAttribute('aria-label')).toBe('Cerrar: Título b');

    triggers()[2].click();
    await fixture.whenStable();
    expect(panelText()).toBe('Panel c');
    expect(triggers().map((t) => t.getAttribute('aria-expanded'))).toEqual([
      'false',
      'false',
      'true',
    ]);
  });

  it('vuelve al contenido por defecto al pulsar de nuevo la tarjeta activa', async () => {
    triggers()[0].click();
    await fixture.whenStable();
    triggers()[0].click();
    await fixture.whenStable();
    expect(panelText()).toBe('Por defecto');
    expect(triggers()[0].getAttribute('aria-expanded')).toBe('false');
  });

  it('navega entre botones con flechas, Home y End', () => {
    const press = (target: HTMLElement, key: string) =>
      target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));

    triggers()[0].focus();
    press(triggers()[0], 'ArrowRight');
    expect(document.activeElement).toBe(triggers()[1]);
    press(triggers()[1], 'End');
    expect(document.activeElement).toBe(triggers()[2]);
    press(triggers()[2], 'ArrowRight');
    expect(document.activeElement).toBe(triggers()[0]);
    press(triggers()[0], 'Home');
    expect(document.activeElement).toBe(triggers()[0]);
  });

  it('abre la tarjeta indicada en initialId al cargar', async () => {
    const f = TestBed.createComponent(ExpandableCardGroup);
    f.componentRef.setInput('items', ITEMS);
    f.componentRef.setInput('groupLabel', 'Grupo');
    f.componentRef.setInput('openLabel', 'Ver');
    f.componentRef.setInput('closeLabel', 'Cerrar');
    f.componentRef.setInput('initialId', 'b');
    await f.whenStable();
    const buttons = (f.nativeElement as HTMLElement).querySelectorAll('.card__trigger');
    expect(buttons[1].getAttribute('aria-expanded')).toBe('true');
  });
});
