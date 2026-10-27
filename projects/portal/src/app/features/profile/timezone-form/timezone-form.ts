import { Component, computed, inject, input, linkedSignal, output, signal } from '@angular/core';
import { ProfileApi, toApiError, UserProfileDto } from 'data-access';
import { firstValueFrom } from 'rxjs';
import { AlertService } from 'ui-kit';
import { detectTimezone, timezoneOptions } from '../../../shared/location/location-form';
import { timeIn } from '../../calendar/calendar-time';
import { PROFILE_TEXTS } from '../profile-texts';

/**
 * Zona horaria (HU-14 / HU-11): la zona en que el portal muestra sesiones y
 * fechas, con la hora actual de ejemplo y un atajo a la del navegador.
 */
@Component({
  selector: 'portal-timezone-form',
  template: `
    <form class="panel" novalidate (submit)="$event.preventDefault(); save()">
      <div class="field">
        <label class="field__label" for="profile-timezone">{{ t.label }}</label>
        <span class="select">
          <select
            id="profile-timezone"
            class="field__input"
            [value]="zone()"
            (change)="zone.set($any($event.target).value)"
            aria-describedby="profile-timezone-hint"
          >
            @for (option of options(); track option.id) {
              <option [value]="option.id">
                {{ option.label }}{{ option.utcOffset ? ' (UTC' + option.utcOffset + ')' : '' }}
              </option>
            }
          </select>
        </span>
      </div>
      <p id="profile-timezone-hint" class="hint">
        {{ t.hint }} <strong>{{ t.now(now()) }}</strong>
      </p>
      @if (detected !== zone()) {
        <p class="hint">
          {{ t.detected(detected) }}
          <button type="button" class="link-button" (click)="zone.set(detected)">
            {{ t.useDetected }}
          </button>
        </p>
      }
      @if (error(); as message) {
        <p class="notice" role="alert">{{ message }}</p>
      }
      <button type="submit" class="button" [disabled]="saving() || zone() === profile().timezone">
        {{ t.save }}
      </button>
    </form>
  `,
  styleUrl: '../profile-form.scss',
  styles: ':host .panel { max-width: 640px; }',
})
export class TimezoneForm {
  private readonly api = inject(ProfileApi);
  private readonly alerts = inject(AlertService);

  readonly profile = input.required<UserProfileDto>();
  readonly saved = output<UserProfileDto>();

  protected readonly t = PROFILE_TEXTS.timezone;
  protected readonly detected = detectTimezone();
  protected readonly zone = linkedSignal(() => this.profile().timezone);
  protected readonly options = timezoneOptions(() => this.zone());
  protected readonly now = computed(() => timeIn(new Date().toISOString(), this.zone()));
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);

  protected async save(): Promise<void> {
    this.saving.set(true);
    this.error.set(null);
    try {
      const updated = await firstValueFrom(this.api.updateTimezone({ timezone: this.zone() }));
      this.saved.emit(updated);
      await this.alerts.success(
        this.t.saved,
        this.t.now(timeIn(new Date().toISOString(), updated.timezone)),
      );
    } catch (error) {
      this.error.set(toApiError(error).message);
    } finally {
      this.saving.set(false);
    }
  }
}
