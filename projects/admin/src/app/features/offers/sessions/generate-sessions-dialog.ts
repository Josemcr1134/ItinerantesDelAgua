import { Component, computed, effect, inject, model, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AdminOfferDetailDto,
  GenerateSessionsBody,
  ImportantDateKind,
  SessionPreviewDto,
} from 'data-access';
import { Button, Dialog, DialogActions } from 'ui-kit';
import { DateListField } from '../shared/date-list-field';
import { WeekdayPicker } from '../shared/weekday-picker';
import { isoToZonedInput } from '../shared/zoned-time';
import {
  EXCLUSION_REASON_LABELS,
  sessionDayTitle,
  formatSessionTime,
  IMPORTANT_DATE_LABELS,
  MEETING_URL,
} from './session-labels';
import { SessionsStore } from './sessions-store';

/** Fechas importantes que se ofrecen marcadas (la apertura de inscripciones, no). */
const DEFAULT_IMPORTANT_DATES: readonly ImportantDateKind[] = [
  'ENROLLMENT_CLOSES',
  'OFFER_STARTS',
  'SCHOLARSHIP_DEADLINE',
  'FINAL_PROJECT',
];

/** "2026-11-09" (CDMX) de una fecha ISO. */
const zonedDate = (iso: string | null) => isoToZonedInput(iso).slice(0, 10);

/**
 * "Crear sesiones" (HU-29) en dos pasos: regla, excepciones, rango y
 * enlaces; después la vista previa (nuevas, excluidas y en conflicto) y la
 * confirmación, que crea todas o ninguna.
 */
@Component({
  selector: 'adm-generate-sessions-dialog',
  imports: [FormsModule, Button, Dialog, DialogActions, WeekdayPicker, DateListField],
  templateUrl: './generate-sessions-dialog.html',
  styleUrl: './sessions-dialogs.scss',
})
export class GenerateSessionsDialog {
  readonly open = model(false);

  protected readonly store = inject(SessionsStore);
  protected readonly busy = computed(() => this.store.busyId() !== null);
  protected readonly exclusionLabels = EXCLUSION_REASON_LABELS;
  protected readonly importantLabels = IMPORTANT_DATE_LABELS;
  protected readonly formatDay = sessionDayTitle;
  protected readonly formatTime = formatSessionTime;

  // --- Regla y excepciones ---
  protected readonly weekdays = signal<readonly number[]>([]);
  protected readonly startTime = signal('');
  protected readonly endTime = signal('');
  protected readonly excludedDates = signal<readonly string[]>([]);
  protected readonly excludeHolidays = signal(true);
  protected readonly startDate = signal('');
  protected readonly endDate = signal('');
  protected readonly joinUrl = signal('');
  protected readonly hostUrl = signal('');
  protected readonly assignModules = signal(true);
  protected readonly importantDates = signal<readonly ImportantDateKind[]>([]);

  protected readonly preview = signal<SessionPreviewDto | null>(null);
  protected readonly submitted = signal(false);

  /** Fechas importantes que la oferta tiene (las demás no se pueden crear). */
  protected readonly availableDates = computed(() => {
    const offer = this.store.offer();
    return offer ? availableImportantDates(offer) : [];
  });

  protected readonly errors = computed(() => {
    const errors: Partial<Record<'weekdays' | 'time' | 'range' | 'join' | 'host', string>> = {};
    if (!this.weekdays().length) errors.weekdays = 'Elige al menos un día.';
    if (!this.startTime() || !this.endTime() || this.endTime() <= this.startTime()) {
      errors.time = 'Elige la hora de inicio y una de fin posterior.';
    }
    if (!this.startDate() || !this.endDate() || this.endDate() < this.startDate()) {
      errors.range = 'Elige el primer y el último día (el último no puede ser anterior).';
    }
    if (this.joinUrl().trim() && !MEETING_URL.test(this.joinUrl().trim())) {
      errors.join = 'Usa un enlace https de zoom.us o meet.google.com.';
    }
    if (this.hostUrl().trim() && !MEETING_URL.test(this.hostUrl().trim())) {
      errors.host = 'Usa un enlace https de zoom.us o meet.google.com.';
    }
    return errors;
  });
  protected readonly valid = computed(() => !Object.keys(this.errors()).length);

  protected readonly createLabel = computed(() => {
    const n = this.preview()?.summary.sessionCount ?? 0;
    return n === 1 ? 'Crear 1 sesión' : `Crear ${n} sesiones`;
  });

  constructor() {
    effect(() => {
      if (!this.open()) return;
      untracked(() => this.reset());
    });
  }

  protected isImportant(kind: ImportantDateKind): boolean {
    return this.importantDates().includes(kind);
  }

  protected toggleImportant(kind: ImportantDateKind, checked: boolean): void {
    this.importantDates.update((list) =>
      checked ? [...list, kind] : list.filter((k) => k !== kind),
    );
  }

  protected async showPreview(): Promise<void> {
    this.submitted.set(true);
    if (!this.valid()) return;
    const preview = await this.store.previewGeneration(this.body());
    if (preview) this.preview.set(preview);
  }

  protected async confirm(): Promise<void> {
    if (!this.preview()?.canConfirm) return;
    const result = await this.store.generate(this.body());
    if (result) this.open.set(false);
  }

  private body(): GenerateSessionsBody {
    const online = this.store.online();
    return {
      rule: {
        weekdays: [...this.weekdays()],
        startTime: this.startTime(),
        endTime: this.endTime(),
        excludedDates: [...this.excludedDates()],
        excludeMexicanHolidays: this.excludeHolidays(),
      },
      startDate: this.startDate(),
      endDate: this.endDate(),
      joinUrl: (online && this.joinUrl().trim()) || undefined,
      hostUrl: (online && this.hostUrl().trim()) || undefined,
      assignModules: this.store.modules().length ? this.assignModules() : false,
      importantDates: [...this.importantDates()],
    };
  }

  private reset(): void {
    const offer = this.store.offer();
    const rule = offer?.schedule.scheduleRule;
    this.weekdays.set(rule?.weekdays ?? []);
    this.startTime.set(rule?.startTime ?? '');
    this.endTime.set(rule?.endTime ?? '');
    this.excludedDates.set(rule?.excludedDates ?? []);
    this.excludeHolidays.set(rule?.excludeMexicanHolidays ?? true);
    this.startDate.set(zonedDate(offer?.schedule.startsAt ?? null));
    this.endDate.set(zonedDate(offer?.schedule.endsAt ?? null));
    this.joinUrl.set('');
    this.hostUrl.set('');
    this.assignModules.set(true);
    this.importantDates.set(
      this.availableDates().filter((kind) => DEFAULT_IMPORTANT_DATES.includes(kind)),
    );
    this.preview.set(null);
    this.submitted.set(false);
  }
}

/** Fechas importantes que se pueden crear: las que la oferta tiene definidas. */
function availableImportantDates(offer: AdminOfferDetailDto): ImportantDateKind[] {
  const s = offer.schedule;
  const p = offer.originPricing;
  const has: Record<ImportantDateKind, boolean> = {
    ENROLLMENT_OPENS: !!s.enrollmentOpensAt,
    ENROLLMENT_CLOSES: !!s.enrollmentClosesAt,
    OFFER_STARTS: !!s.startsAt,
    SCHOLARSHIP_DEADLINE: p.scholarshipEnabled && !!p.scholarshipClosesAt,
    FINAL_PROJECT: !!s.finalProjectDueAt,
  };
  return (Object.keys(has) as ImportantDateKind[]).filter((kind) => has[kind]);
}
