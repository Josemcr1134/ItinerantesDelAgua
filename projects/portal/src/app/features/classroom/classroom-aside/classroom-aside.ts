import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { ClassroomDto } from 'data-access';
import { dateTimeIn } from '../../../shared/applications/application-format';
import { cdmxTime, sessionWhen } from '../classroom-format';
import { SessionJoin } from '../session-join';

/**
 * Columna del aula (HU-17): próxima sesión con su acceso y la hora en CDMX,
 * y la bienvenida. Antes de la primera sesión, "Antes de empezar" va
 * destacado; después, queda el grupo de WhatsApp como bloque secundario.
 */
@Component({
  selector: 'portal-classroom-aside',
  imports: [NgTemplateOutlet, SessionJoin],
  template: `
    @let c = classroom();
    @if (c.welcome.preStart) {
      <ng-container *ngTemplateOutlet="welcome" />
    }

    <section class="card" aria-labelledby="next-session-title">
      <h3 id="next-session-title" class="card__label">Próxima sesión</h3>
      @if (c.nextSession; as s) {
        @if (s.module) {
          <p class="card__eyebrow">Módulo {{ s.module.number }}</p>
          <p class="card__title">{{ s.module.title }}</p>
        } @else {
          <p class="card__title">{{ s.offer.name }}</p>
        }
        <p class="card__when">{{ when() }}</p>
        @if (cdmx(); as reference) {
          <p class="card__muted">{{ reference }} (hora de referencia)</p>
        }
        @if (s.venue; as venue) {
          <p class="card__muted">
            {{ venue.name }}{{ venue.address ? ' · ' + venue.address : '' }}
          </p>
        }
        <portal-session-join [join]="s.join" [venue]="s.venue" [timezone]="timezone()" />
      } @else {
        <p class="card__muted">No hay sesiones programadas por ahora.</p>
      }
    </section>

    @if (!c.welcome.preStart) {
      <ng-container *ngTemplateOutlet="welcome" />
    }

    <ng-template #welcome>
      <section
        class="card"
        [class.card--welcome]="c.welcome.preStart"
        aria-labelledby="welcome-title"
      >
        <h3 id="welcome-title" class="card__label">
          {{ c.welcome.preStart ? 'Antes de empezar' : 'Grupo de WhatsApp' }}
        </h3>
        @if (c.welcome.preStart) {
          @if (c.welcome.message) {
            <p class="card__message">{{ c.welcome.message }}</p>
          }
          @if (c.welcome.firstSessionStartsAt; as first) {
            <p class="card__muted">Primera sesión: {{ date(first) }}</p>
          }
        }
        @if (c.welcome.whatsapp.available && c.welcome.whatsapp.url) {
          <a class="whatsapp" [href]="c.welcome.whatsapp.url" target="_blank" rel="noopener">
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4a.5.5 0 0 0 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.1 5.1 0 0 0 1.1 2.7 11.7 11.7 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.7-1.2 2.2 2.2 0 0 0 .2-1.2c-.1-.1-.3-.2-.5-.3Z"
              />
            </svg>
            Unirme al grupo de WhatsApp
          </a>
        } @else if (c.welcome.whatsapp.availableFrom; as from) {
          <p class="card__muted">
            El grupo de WhatsApp estará disponible a partir del {{ date(from) }}.
          </p>
        } @else {
          <p class="card__muted">El equipo compartirá el grupo de WhatsApp pronto.</p>
        }
      </section>
    </ng-template>
  `,
  styleUrl: './classroom-aside.scss',
})
export class ClassroomAside {
  readonly classroom = input.required<ClassroomDto>();
  readonly timezone = input.required<string>();

  protected readonly when = computed(() => {
    const session = this.classroom().nextSession;
    return session ? sessionWhen(session, this.timezone()) : null;
  });
  protected readonly cdmx = computed(() => {
    const session = this.classroom().nextSession;
    return session ? cdmxTime(session.startsAt, this.timezone()) : null;
  });

  protected date(iso: string): string {
    return dateTimeIn(iso, this.timezone());
  }
}
