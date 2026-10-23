import {
  afterRenderEffect,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  model,
  signal,
  untracked,
} from '@angular/core';
import {
  AdminAttendanceApi,
  ATTENDANCE_STATUS_VALUES,
  AttendanceStatus,
  SessionAttendanceDto,
  SessionAttendanceRowDto,
  requestState,
} from 'data-access';
import { firstValueFrom } from 'rxjs';
import { saveFile } from '../../../core/download';
import { ErrorPresenter } from '../../../core/error-presenter';
import { debounced } from '../../../core/signals/debounced';
import { FilterBar } from '../../../shared/filters/filter-bar';
import { Notice } from '../../../shared/notice/notice';
import { FilterSelect, optionsFrom } from '../../../shared/filters/filter-select';
import { SearchField } from '../../../shared/filters/search-field';
import { Person } from '../../../shared/person/person';
import { RequestState } from '../../../shared/request-state/request-state';
import { formatDateTime } from '../../../shared/format/format';
import {
  SESSION_STATE_LABELS,
  SESSION_STATE_TONES,
  sessionDayTitle,
  formatSessionTime,
} from '../sessions/session-labels';
import {
  ATTENDANCE_SOURCE_LABELS,
  ATTENDANCE_STATUS_LABELS,
  ATTENDANCE_STATUS_TONES,
} from './attendance-labels';
import { ReasonDialog } from '../../../shared/reason-dialog/reason-dialog';
import { AttendanceStore } from './attendance-store';

type AttendanceAction = 'mark' | 'unmark';

/** Estados que se pueden marcar a mano. */
const MARKABLE: readonly AttendanceStatus[] = ['PENDING', 'NOT_REGISTERED'];

/**
 * Asistencia "Por sesión" (HU-30): chips de las sesiones, resumen, filtros y
 * cada inscrito con su estado. Con `attendance.write`: pasar lista (marcar
 * a varias con motivo), desmarcar y recordar a pendientes.
 */
@Component({
  selector: 'adm-session-attendance',
  imports: [FilterBar, Notice, FilterSelect, SearchField, Person, RequestState, ReasonDialog],
  templateUrl: './session-attendance.html',
  styleUrl: './attendance.scss',
})
export class SessionAttendance {
  /** Sesión elegida (se refleja en la URL). */
  readonly sessionId = model<string | null>(null);

  protected readonly store = inject(AttendanceStore);
  private readonly api = inject(AdminAttendanceApi);
  private readonly errors = inject(ErrorPresenter);

  protected readonly statusLabels = ATTENDANCE_STATUS_LABELS;
  protected readonly statusTones = ATTENDANCE_STATUS_TONES;
  protected readonly sourceLabels = ATTENDANCE_SOURCE_LABELS;
  protected readonly stateLabels = SESSION_STATE_LABELS;
  protected readonly stateTones = SESSION_STATE_TONES;
  protected readonly dayTitle = sessionDayTitle;
  protected readonly formatTime = formatSessionTime;
  protected readonly formatDateTime = formatDateTime;

  // --- Filtros ---
  protected readonly searchText = signal('');
  private readonly search = debounced(this.searchText);
  protected readonly status = signal<AttendanceStatus | ''>('');
  protected readonly countryCode = signal('');
  protected readonly statusOptions = optionsFrom(
    ATTENDANCE_STATUS_VALUES.filter((s) => s !== 'NOT_APPLICABLE'),
    ATTENDANCE_STATUS_LABELS,
  );
  protected readonly activeFilters = computed(
    () => (this.status() ? 1 : 0) + (this.countryCode() ? 1 : 0),
  );
  private readonly query = computed(() => ({
    q: this.search().trim() || undefined,
    status: this.status() || undefined,
    countryCode: this.countryCode() || undefined,
  }));

  protected readonly attendance = requestState<SessionAttendanceDto>();
  protected readonly chip = computed(
    () => this.store.chips().find((c) => c.sessionId === this.sessionId()) ?? null,
  );
  protected readonly cancelled = computed(() => this.chip()?.state === 'CANCELLED');
  protected readonly canWrite = computed(() => this.store.canWrite() && !this.cancelled());

  // --- Selección para marcar ---
  protected readonly selected = signal<ReadonlySet<string>>(new Set());
  protected readonly markable = computed(() =>
    (this.attendance.data()?.rows ?? []).filter((r) => MARKABLE.includes(r.status)),
  );
  protected readonly allSelected = computed(
    () => this.markable().length > 0 && this.markable().every((r) => this.selected().has(r.userId)),
  );

  // --- Acciones ---
  protected readonly busy = signal(false);
  protected readonly exporting = signal(false);
  protected readonly dialogOpen = signal(false);
  protected readonly dialogAction = signal<AttendanceAction>('mark');
  protected readonly dialogRows = signal<readonly SessionAttendanceRowDto[]>([]);
  /** "Se registra la asistencia de Ana como «Manual»." */
  protected readonly dialogLead = computed(() => {
    const rows = this.dialogRows();
    const who = rows.length === 1 ? rows[0].fullName : `${rows.length} personas`;
    return this.dialogAction() === 'mark'
      ? `Se registra la asistencia de ${who} como «Manual».`
      : `Se borra el registro de asistencia de ${who} y su porcentaje se recalcula.`;
  });
  protected readonly notice = signal('');

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    // El chip de la sesión elegida queda a la vista (en móvil la fila se desplaza).
    afterRenderEffect(() => {
      this.sessionId();
      this.store.chips();
      this.host.nativeElement
        .querySelector('.chip--active')
        ?.scrollIntoView?.({ block: 'nearest', inline: 'center' });
    });
    // Sin sesión elegida (o una que no existe), se abre la más relevante.
    effect(() => {
      if (!this.store.chipsLoaded()) return;
      const id = this.sessionId();
      if (!id || !this.store.chips().some((c) => c.sessionId === id)) {
        untracked(() => this.sessionId.set(this.store.defaultSessionId()));
      }
    });
    effect(() => {
      const id = this.sessionId();
      const query = this.query();
      untracked(() => {
        this.selected.set(new Set());
        if (id) void this.attendance.run(this.api.sessionAttendance(id, query));
      });
    });
    // Al cambiar de sesión se limpia el aviso.
    effect(() => {
      this.sessionId();
      untracked(() => this.notice.set(''));
    });
  }

  protected reload(): void {
    const id = this.sessionId();
    if (id) void this.attendance.run(this.api.sessionAttendance(id, this.query()));
  }

  protected clearFilters(): void {
    this.searchText.set('');
    this.status.set('');
    this.countryCode.set('');
  }

  protected isMarkable(row: SessionAttendanceRowDto): boolean {
    return MARKABLE.includes(row.status);
  }

  protected toggle(row: SessionAttendanceRowDto, checked: boolean): void {
    this.selected.update((set) => {
      const next = new Set(set);
      if (checked) next.add(row.userId);
      else next.delete(row.userId);
      return next;
    });
  }

  protected clearSelection(): void {
    this.selected.set(new Set());
  }

  protected toggleAll(checked: boolean): void {
    this.selected.set(checked ? new Set(this.markable().map((r) => r.userId)) : new Set());
  }

  protected openMark(rows: readonly SessionAttendanceRowDto[]): void {
    this.dialogAction.set('mark');
    this.dialogRows.set(rows);
    this.dialogOpen.set(true);
  }

  protected openMarkSelected(): void {
    const rows = this.markable().filter((r) => this.selected().has(r.userId));
    if (rows.length) this.openMark(rows);
  }

  protected openUnmark(row: SessionAttendanceRowDto): void {
    this.dialogAction.set('unmark');
    this.dialogRows.set([row]);
    this.dialogOpen.set(true);
  }

  protected async confirm(reason: string): Promise<void> {
    const id = this.sessionId();
    if (!id) return;
    const body = { userIds: this.dialogRows().map((r) => r.userId), reason };
    const message = await this.run(async () => {
      if (this.dialogAction() === 'mark') {
        const result = await firstValueFrom(this.api.mark(id, body));
        return (
          `Se marcó la asistencia de ${people(result.marked)}.` +
          (result.alreadyRegistered === 1
            ? ' 1 persona ya estaba registrada.'
            : result.alreadyRegistered
              ? ` ${result.alreadyRegistered} personas ya estaban registradas.`
              : '')
        );
      }
      const result = await firstValueFrom(this.api.unmark(id, body));
      return `Se desmarcó la asistencia de ${people(result.unmarked)}.`;
    });
    if (message === null) return;
    this.dialogOpen.set(false);
    this.notice.set(message);
    this.reload();
    void this.store.reloadChips();
  }

  protected async remind(): Promise<void> {
    const id = this.sessionId();
    if (!id) return;
    const result = await this.run(() => firstValueFrom(this.api.remind(id)));
    if (result) {
      this.notice.set(
        result.notified
          ? `Se envió el recordatorio a ${people(result.notified)} sin registro.`
          : 'No se envió ningún recordatorio: las personas pendientes ya recibieron uno hoy.',
      );
    }
  }

  protected async exportCsv(): Promise<void> {
    const id = this.sessionId();
    if (!id) return;
    this.exporting.set(true);
    try {
      const file = await firstValueFrom(this.api.exportSession(id, this.query()));
      saveFile(file.blob, file.fileName);
    } catch (error) {
      void this.errors.present(error, { title: 'No se pudo exportar' });
    } finally {
      this.exporting.set(false);
    }
  }

  private async run<T>(task: () => Promise<T>): Promise<T | null> {
    this.busy.set(true);
    try {
      return await task();
    } catch (error) {
      void this.errors.present(error);
      return null;
    } finally {
      this.busy.set(false);
    }
  }
}

/** "1 persona" / "3 personas". */
function people(count: number): string {
  return `${count} ${count === 1 ? 'persona' : 'personas'}`;
}
