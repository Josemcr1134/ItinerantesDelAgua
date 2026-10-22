import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminSessionDto } from 'data-access';
import { AlertService, Button } from 'ui-kit';
import { AdminAccess } from '../../../core/access/admin-access';
import { Notice } from '../../../shared/notice/notice';
import { PageHeader } from '../../../shared/page-header/page-header';
import { RequestState } from '../../../shared/request-state/request-state';
import { RowMenu } from '../../../shared/row-menu/row-menu';
import { CALENDAR_CATEGORY_LABELS } from '../offer-labels';
import { GenerateSessionsDialog } from './generate-sessions-dialog';
import { SessionChange, SessionChangeDialog } from './session-change-dialog';
import { SessionFormDialog } from './session-form-dialog';
import {
  sessionDayTitle,
  formatSessionSlot,
  formatSessionTime,
  SESSION_STATE_LABELS,
  SESSION_STATE_TONES,
} from './session-labels';
import { SessionsStore } from './sessions-store';

/**
 * Sesiones de una oferta (HU-29): las videoconferencias de sus clases, con
 * enlaces (participante, anfitrión y grabación), módulo y registro de
 * asistencia. Se generan con la regla de horario o se agregan sueltas; cada
 * una se edita, reprograma, cancela o borra. Ver requiere `offers.read`;
 * cambiar, `offers.write`.
 */
@Component({
  selector: 'adm-sessions-page',
  imports: [
    RouterLink,
    Button,
    Notice,
    PageHeader,
    RequestState,
    RowMenu,
    SessionFormDialog,
    SessionChangeDialog,
    GenerateSessionsDialog,
  ],
  providers: [SessionsStore],
  templateUrl: './sessions-page.html',
  styleUrl: './sessions-page.scss',
})
export default class SessionsPage {
  /** Id de la oferta (`/ofertas/:id/sesiones`). */
  readonly id = input.required<string>();

  protected readonly store = inject(SessionsStore);
  private readonly access = inject(AdminAccess);
  private readonly alerts = inject(AlertService);
  protected readonly canWrite = computed(() => this.access.permissions().has('offers.write'));

  protected readonly stateLabels = SESSION_STATE_LABELS;
  protected readonly stateTones = SESSION_STATE_TONES;
  protected readonly categoryLabels = CALENDAR_CATEGORY_LABELS;
  protected readonly formatDay = sessionDayTitle;
  protected readonly formatTime = formatSessionTime;
  protected readonly formatSlot = formatSessionSlot;

  protected readonly showCancelled = signal(true);
  protected readonly visible = computed(() =>
    this.showCancelled()
      ? this.store.sessions()
      : this.store.sessions().filter((s) => s.status !== 'CANCELLED'),
  );

  // Diálogos
  protected readonly generating = signal(false);
  protected readonly formOpen = signal(false);
  protected readonly editing = signal<AdminSessionDto | null>(null);
  protected readonly changeOpen = signal(false);
  protected readonly changeMode = signal<SessionChange>('reschedule');
  protected readonly changing = signal<AdminSessionDto | null>(null);

  constructor() {
    effect(() => {
      const id = this.id();
      untracked(() => void this.store.load(id));
    });
  }

  /** Número de la sesión entre las no canceladas ("Sesión 3"). */
  protected number(session: AdminSessionDto): number | null {
    if (session.status === 'CANCELLED') return null;
    return (
      this.store
        .sessions()
        .filter((s) => s.status !== 'CANCELLED')
        .indexOf(session) + 1
    );
  }

  protected isBusy(session: AdminSessionDto): boolean {
    return this.store.busyId() === session.id;
  }

  protected openForm(session: AdminSessionDto | null): void {
    this.editing.set(session);
    this.formOpen.set(true);
  }

  protected openChange(session: AdminSessionDto, mode: SessionChange): void {
    this.changing.set(session);
    this.changeMode.set(mode);
    this.changeOpen.set(true);
  }

  /** Solo sin registros de asistencia; si los tiene, se ofrece cancelarla. */
  protected async remove(session: AdminSessionDto): Promise<void> {
    if (session.attendance.registered > 0) {
      await this.alerts.warning(
        'Esta sesión no se puede borrar',
        `Ya tiene ${session.attendance.registered} registros de asistencia. Cancélala en su lugar.`,
      );
      return;
    }
    const ok = await this.alerts.confirm(
      '¿Borrar la sesión?',
      `Se elimina la del ${formatSessionSlot(session.startsAt, session.endsAt)} sin avisar a nadie. ` +
        'Sirve para corregir una generación; para avisar a las personas inscritas, cancélala.',
      { confirmLabel: 'Borrar', variant: 'error' },
    );
    if (ok) await this.store.remove(session);
  }
}
