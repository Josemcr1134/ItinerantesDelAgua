import { Component, computed, effect, inject, input, untracked } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { PageHeader } from '../../../shared/page-header/page-header';
import { AttendanceStore } from './attendance-store';
import { ParticipantAttendance } from './participant-attendance';
import { SessionAttendance } from './session-attendance';

type View = 'sesion' | 'participantes';

/**
 * Asistencia de una oferta (HU-30): "Por sesión" (quién registró, pasar
 * lista, recordar) y "Por participante" (% de cada inscrito). La vista y la
 * sesión van en la URL (`?vista=&sesion=`). Ver requiere `attendance.read`;
 * marcar, desmarcar y recordar, `attendance.write`.
 */
@Component({
  selector: 'adm-attendance-page',
  imports: [RouterLink, PageHeader, SessionAttendance, ParticipantAttendance],
  providers: [AttendanceStore],
  template: `
    <a class="back" [routerLink]="['/ofertas', id()]">
      <svg
        aria-hidden="true"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      {{ store.offerName() ?? 'Volver a la oferta' }}
    </a>

    <adm-page-header
      title="Asistencia"
      lead="El registro abre al terminar cada sesión y cierra tras su ventana. Horas del centro de México."
    />

    <nav class="tabs" aria-label="Vista de asistencia">
      @for (tab of tabs; track tab.view) {
        <a
          class="tabs__tab"
          [class.tabs__tab--active]="view() === tab.view"
          [attr.aria-current]="view() === tab.view ? 'page' : null"
          routerLink="."
          [queryParams]="{ vista: tab.view, sesion: sesion() ?? null }"
          >{{ tab.label }}</a
        >
      }
    </nav>

    @if (view() === 'participantes') {
      <adm-participant-attendance [offerId]="id()" />
    } @else {
      <adm-session-attendance
        [sessionId]="sesion() ?? null"
        (sessionIdChange)="pickSession($event)"
      />
    }
  `,
  styles: `
    :host {
      display: block;
      color: var(--color-raisin-black);
    }
    .back {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      margin-bottom: var(--space-3);
      color: var(--color-primary);
      font-weight: 700;
      text-decoration: none;
    }
    .back:hover {
      text-decoration: underline;
    }
    .tabs {
      display: flex;
      gap: var(--space-2);
      margin: var(--space-4) 0;
      border-bottom: 1px solid color-mix(in srgb, var(--color-primary) 18%, transparent);
    }
    .tabs__tab {
      margin-bottom: -1px;
      padding: var(--space-2) var(--space-3);
      border-bottom: 3px solid transparent;
      color: color-mix(in srgb, var(--color-raisin-black) 70%, transparent);
      font-weight: 700;
      text-decoration: none;
    }
    .tabs__tab:hover {
      color: var(--color-primary);
    }
    .tabs__tab--active {
      border-bottom-color: var(--color-primary);
      color: var(--color-primary);
    }
  `,
})
export default class AttendancePage {
  /** Id de la oferta (`/ofertas/:id/asistencia`). */
  readonly id = input.required<string>();
  /** `?vista=sesion|participantes`. */
  readonly vista = input<string>();
  /** `?sesion=<id>`: sesión elegida en "Por sesión". */
  readonly sesion = input<string>();

  protected readonly store = inject(AttendanceStore);
  private readonly router = inject(Router);

  protected readonly view = computed<View>(() =>
    this.vista() === 'participantes' ? 'participantes' : 'sesion',
  );
  protected readonly tabs: readonly { view: View; label: string }[] = [
    { view: 'sesion', label: 'Por sesión' },
    { view: 'participantes', label: 'Por participante' },
  ];

  constructor() {
    effect(() => {
      const id = this.id();
      untracked(() => this.store.load(id));
    });
  }

  /** La sesión elegida queda en la URL (sin sumar al historial). */
  protected pickSession(sessionId: string | null): void {
    if (sessionId === (this.sesion() ?? null)) return;
    void this.router.navigate([], {
      queryParams: { sesion: sessionId },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
