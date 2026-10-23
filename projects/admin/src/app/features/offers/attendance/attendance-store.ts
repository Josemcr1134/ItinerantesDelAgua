import { computed, inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AdminAttendanceApi,
  AdminOffersApi,
  AttendanceSessionChipDto,
  CatalogsApi,
  requestState,
} from 'data-access';
import { catchError, map, of } from 'rxjs';
import { AdminAccess } from '../../../core/access/admin-access';

/**
 * Estado compartido de la asistencia de una oferta: sesiones con su registro
 * (chips), nombre de la oferta y países. Se provee en la página.
 */
@Injectable()
export class AttendanceStore {
  private readonly api = inject(AdminAttendanceApi);
  private readonly offersApi = inject(AdminOffersApi);
  private readonly access = inject(AdminAccess);

  private readonly chipsRequest = requestState<readonly AttendanceSessionChipDto[]>();
  private readonly offerRequest = requestState<string | null>();

  readonly chips = computed(() => this.chipsRequest.data() ?? []);
  readonly chipsLoaded = computed(() => this.chipsRequest.data() !== null);
  readonly chipsError = computed(() => this.chipsRequest.error());
  readonly offerName = computed(() => this.offerRequest.data() ?? null);
  readonly canWrite = computed(() => this.access.can('attendance.write'));

  private readonly countries = toSignal(
    inject(CatalogsApi)
      .countries()
      .pipe(
        map((r) => r.data),
        catchError(() => of([])),
      ),
    { initialValue: [] },
  );
  readonly countryOptions = computed(() =>
    this.countries().map((c) => ({ value: c.code, label: c.name })),
  );
  private readonly countryNames = computed(
    () => new Map(this.countries().map((c) => [c.code, c.name])),
  );

  private offerId = '';

  load(offerId: string): void {
    this.offerId = offerId;
    this.reloadChips();
    // El nombre es solo para el encabezado (requiere `offers.read`).
    void this.offerRequest.run(
      this.offersApi.detail(offerId).pipe(
        map((offer) => offer.name),
        catchError(() => of(null)),
      ),
    );
  }

  /** Los conteos cambian al marcar o desmarcar. */
  reloadChips(): Promise<unknown> {
    return this.chipsRequest.run(this.api.chips(this.offerId).pipe(map((r) => r.data)));
  }

  countryName(code: string): string {
    return this.countryNames().get(code) ?? code;
  }

  /**
   * Sesión que se abre por defecto: la de registro abierto más reciente; si
   * no, la última cerrada; si no, la primera programada.
   */
  defaultSessionId(): string | null {
    const chips = this.chips();
    const last = (state: AttendanceSessionChipDto['state']) =>
      [...chips].reverse().find((c) => c.state === state);
    return (
      (
        last('REGISTRATION_OPEN') ??
        last('CLOSED') ??
        chips.find((c) => c.state === 'SCHEDULED') ??
        chips[0] ??
        null
      )?.sessionId ?? null
    );
  }
}
