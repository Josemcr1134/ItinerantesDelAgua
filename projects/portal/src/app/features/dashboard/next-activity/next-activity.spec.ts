import { TestBed } from '@angular/core/testing';
import { CalendarItemDto } from 'data-access';
import { NextActivity } from './next-activity';

const session = (allDay = false) =>
  ({
    id: 's1',
    title: 'Clase 3',
    startsAt: '2026-10-26T00:00:00.000Z', // 18:00 en CDMX
    allDay,
    offer: { id: 'o1', name: 'Diplomado en Ecotecnologías' },
    venue: null,
    join: { state: 'LINK_PENDING', opensAt: null, url: null },
  }) as unknown as CalendarItemDto;

describe('NextActivity', () => {
  function render(activity: CalendarItemDto, timezone: string) {
    const fixture = TestBed.createComponent(NextActivity);
    fixture.componentRef.setInput('activity', activity);
    fixture.componentRef.setInput('timezone', timezone);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('fuera de CDMX muestra también la hora de CDMX (HU-11)', () => {
    const host = render(session(), 'Europe/Madrid');
    expect(host.querySelector('.card__when')?.textContent).toContain('01:00');
    expect(host.querySelector('.card__cdmx')?.textContent).toBe('18:00 hora CDMX');
  });

  it('en CDMX o en una actividad de todo el día, solo la hora de la persona', () => {
    expect(render(session(), 'America/Mexico_City').querySelector('.card__cdmx')).toBeNull();
    expect(render(session(true), 'Europe/Madrid').querySelector('.card__cdmx')).toBeNull();
  });
});
