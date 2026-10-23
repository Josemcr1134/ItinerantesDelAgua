import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { AdminAttendanceApi, ParticipantAttendanceDto, requestState } from 'data-access';
import { firstValueFrom } from 'rxjs';
import { saveFile } from '../../../core/download';
import { ErrorPresenter } from '../../../core/error-presenter';
import { debounced } from '../../../core/signals/debounced';
import { FilterBar } from '../../../shared/filters/filter-bar';
import { FilterOption, FilterSelect } from '../../../shared/filters/filter-select';
import { SearchField } from '../../../shared/filters/search-field';
import { Person } from '../../../shared/person/person';
import { RequestState } from '../../../shared/request-state/request-state';
import { ENROLLMENT_STATUS_LABELS } from './attendance-labels';
import { AttendanceStore } from './attendance-store';

/**
 * Asistencia "Por participante" (HU-30): % de cada inscrito sobre las
 * sesiones ya realizadas (no canceladas), con alerta visual bajo el umbral.
 */
@Component({
  selector: 'adm-participant-attendance',
  imports: [FilterBar, FilterSelect, SearchField, Person, RequestState],
  templateUrl: './participant-attendance.html',
  styleUrl: './attendance.scss',
})
export class ParticipantAttendance {
  readonly offerId = input.required<string>();

  protected readonly store = inject(AttendanceStore);
  private readonly api = inject(AdminAttendanceApi);
  private readonly errors = inject(ErrorPresenter);
  protected readonly enrollmentLabels = ENROLLMENT_STATUS_LABELS;

  protected readonly searchText = signal('');
  private readonly search = debounced(this.searchText);
  protected readonly countryCode = signal('');
  protected readonly below = signal<'true' | ''>('');
  protected readonly belowOptions: FilterOption<'true'>[] = [
    { value: 'true', label: 'Bajo el umbral' },
  ];
  protected readonly activeFilters = computed(
    () => (this.countryCode() ? 1 : 0) + (this.below() ? 1 : 0),
  );
  private readonly query = computed(() => ({
    q: this.search().trim() || undefined,
    countryCode: this.countryCode() || undefined,
    belowThreshold: this.below() ? true : undefined,
  }));

  protected readonly participants = requestState<ParticipantAttendanceDto>();
  protected readonly exporting = signal(false);

  constructor() {
    effect(() => {
      const offerId = this.offerId();
      const query = this.query();
      untracked(() => void this.participants.run(this.api.participants(offerId, query)));
    });
  }

  protected reload(): void {
    void this.participants.run(this.api.participants(this.offerId(), this.query()));
  }

  protected clearFilters(): void {
    this.searchText.set('');
    this.countryCode.set('');
    this.below.set('');
  }

  protected async exportCsv(): Promise<void> {
    this.exporting.set(true);
    try {
      const file = await firstValueFrom(this.api.exportParticipants(this.offerId(), this.query()));
      saveFile(file.blob, file.fileName);
    } catch (error) {
      void this.errors.present(error, { title: 'No se pudo exportar' });
    } finally {
      this.exporting.set(false);
    }
  }
}
