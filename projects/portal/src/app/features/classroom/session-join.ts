import { Component, computed, input } from '@angular/core';
import { PortalVenueDto, SessionJoinDto } from 'data-access';
import { timeIn } from '../calendar/calendar-time';

/**
 * Acceso a una sesión (HU-12): [Entrar a sesión] desde 10 min antes; antes,
 * deshabilitado con la hora en que abre; presencial, el lugar y "Cómo llegar".
 */
@Component({
  selector: 'portal-session-join',
  template: `
    @let j = join();
    @switch (j.state) {
      @case ('OPEN') {
        @if (j.url) {
          <a class="join" [href]="j.url" target="_blank" rel="noopener">Entrar a sesión</a>
        }
      }
      @case ('NOT_YET') {
        <button type="button" class="join" disabled>Entrar a sesión</button>
        <span class="join__note">Disponible desde las {{ opensAt() }}</span>
      }
      @case ('LINK_PENDING') {
        <span class="join__note">Enlace aún no disponible</span>
      }
      @case ('CANCELLED') {
        <span class="join__note join__note--off">Sesión cancelada</span>
      }
      @case ('ENDED') {
        <span class="join__note">La sesión terminó</span>
      }
      @case ('IN_PERSON') {
        @if (venue()?.mapsUrl; as maps) {
          <a class="join join--outline" [href]="maps" target="_blank" rel="noopener">Cómo llegar</a>
        } @else {
          <span class="join__note">Sesión presencial</span>
        }
      }
    }
  `,
  styles: `
    :host {
      display: inline-flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px 12px;
    }
    .join {
      display: inline-grid;
      place-items: center;
      min-height: 42px;
      padding: 0 22px;
      border: 2px solid var(--color-primary);
      border-radius: 100px;
      background-color: var(--color-primary);
      color: #fff;
      font: inherit;
      font-weight: 700;
      text-decoration: none;
      white-space: nowrap;
      cursor: pointer;
    }
    .join:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
    .join:focus-visible {
      outline: 3px solid var(--color-primary);
      outline-offset: 3px;
    }
    .join--outline {
      background-color: #fff;
      color: var(--color-primary);
    }
    .join__note {
      color: #5a6b60;
      font-size: 0.8125rem;
    }
    .join__note--off {
      color: #9a3a22;
      font-weight: 600;
    }
  `,
})
export class SessionJoin {
  readonly join = input.required<SessionJoinDto>();
  readonly venue = input<PortalVenueDto | null>(null);
  readonly timezone = input.required<string>();

  protected readonly opensAt = computed(() => timeIn(this.join().opensAt, this.timezone()));
}
