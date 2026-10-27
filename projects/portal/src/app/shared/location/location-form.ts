import { computed, effect, inject, untracked } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormControl, ValidationErrors, Validators } from '@angular/forms';
import { CatalogsApi, LocationInputDto, TimezoneDto } from 'data-access';
import { map } from 'rxjs';

/** Cómo se captura un nivel de la ubicación. */
export type LevelMode = 'list' | 'text' | 'waiting';

/** Controles de ubicación y teléfono (registro HU-02 y perfil HU-14). */
export interface LocationControls {
  readonly phoneCode: FormControl<string>;
  readonly phoneNumber: FormControl<string>;
  readonly country: FormControl<string>;
  readonly divisionId: FormControl<string>;
  readonly divisionName: FormControl<string>;
  readonly municipalityId: FormControl<string>;
  readonly municipalityName: FormControl<string>;
}

const FALLBACK_TIMEZONE = 'America/Mexico_City';

/** Zona horaria del navegador (o la oficial si no se puede detectar). */
export function detectTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || FALLBACK_TIMEZONE;
  } catch {
    return FALLBACK_TIMEZONE;
  }
}

/** Texto limpio: sin espacios de más. */
const clean = (value: string) => value.trim().replace(/\s+/g, ' ');

/**
 * Ubicación en cascada (país → estado → municipio) con los catálogos de la
 * API; cuando un nivel no tiene lista, se escribe a mano. Al cambiar de país
 * (o de estado) se vacían los niveles de abajo, y el indicativo del teléfono
 * sigue al país mientras no se haya elegido otro. Llamar en un contexto de
 * inyección. El orden de los controles en el formulario debe ser país,
 * estado y municipio (al restablecer, cada uno vacía los siguientes).
 */
export function locationForm(c: LocationControls) {
  const catalogs = inject(CatalogsApi);
  const countryCode = toSignal(c.country.valueChanges, { initialValue: c.country.value });
  const divisionId = toSignal(c.divisionId.valueChanges, { initialValue: c.divisionId.value });
  const phoneCode = toSignal(c.phoneCode.valueChanges, { initialValue: c.phoneCode.value });

  const countries = rxResource({
    stream: () => catalogs.countries().pipe(map((r) => r.data)),
    defaultValue: [],
  });
  const country = computed(() => countries.value().find((x) => x.code === countryCode()));
  const divisions = rxResource({
    params: () => (country()?.hasDivisions ? countryCode() : undefined),
    stream: ({ params }) => catalogs.divisions(params).pipe(map((r) => r.data)),
    defaultValue: [],
  });
  /** Estado: de la lista, escrito a mano (país sin catálogo) o esperando la lista. */
  const divisionMode = computed<LevelMode>(() => {
    if (divisions.value().length) return 'list';
    return countries.isLoading() || divisions.isLoading() ? 'waiting' : 'text';
  });
  const division = computed(() => divisions.value().find((d) => d.id === divisionId()));
  const municipalities = rxResource({
    params: () => (division()?.hasMunicipalities ? divisionId() : undefined),
    stream: ({ params }) => catalogs.municipalities(params).pipe(map((r) => r.data)),
    defaultValue: [],
  });
  /** Municipio: igual que el estado; espera a que se elija un estado de la lista. */
  const municipalityMode = computed<LevelMode>(() => {
    if (municipalities.value().length) return 'list';
    if (divisionMode() === 'text') return 'text';
    return !division() || municipalities.isLoading() ? 'waiting' : 'text';
  });

  /** Indicativos únicos, en el orden de los países (México y Centroamérica primero). */
  const phoneCodes = computed(() => {
    const codes = new Set(countries.value().map((x) => x.phoneCode));
    if (phoneCode()) codes.add(phoneCode());
    return [...codes];
  });
  /** Longitud válida del número para el indicativo elegido. */
  const phoneRange = computed(() => {
    const matches = countries.value().filter((x) => x.phoneCode === phoneCode());
    return matches.length
      ? {
          min: Math.min(...matches.map((x) => x.phoneMinLength)),
          max: Math.max(...matches.map((x) => x.phoneMaxLength)),
        }
      : null;
  });
  const catalogFailed = computed(
    () => !!countries.error() || !!divisions.error() || !!municipalities.error(),
  );

  c.country.valueChanges.subscribe(() => {
    c.divisionId.reset();
    c.divisionName.reset();
    c.municipalityId.reset();
    c.municipalityName.reset();
  });
  c.divisionId.valueChanges.subscribe(() => {
    c.municipalityId.reset();
    c.municipalityName.reset();
  });
  c.phoneCode.valueChanges.subscribe(() => c.phoneNumber.updateValueAndValidity());

  effect(() => {
    const selected = country();
    untracked(() => {
      // Solo si la persona cambió de país y no eligió otro indicativo.
      if (selected && c.country.dirty && !c.phoneCode.dirty)
        c.phoneCode.setValue(selected.phoneCode);
      c.phoneNumber.updateValueAndValidity();
    });
  });
  // Estado y municipio son obligatorios: de la lista o escritos a mano.
  effect(() => {
    const divisionLevel = divisionMode();
    const municipalityLevel = municipalityMode();
    untracked(() => {
      setRequired(c.divisionId, divisionLevel !== 'text');
      setRequired(c.divisionName, divisionLevel === 'text');
      setRequired(c.municipalityId, municipalityLevel !== 'text');
      setRequired(c.municipalityName, municipalityLevel === 'text');
    });
  });

  return {
    countries,
    country,
    divisions,
    divisionMode,
    division,
    municipalities,
    municipalityMode,
    phoneCodes,
    catalogFailed,
    /** Validador del número (solo dígitos y largo del indicativo). */
    phoneErrors(control: AbstractControl): ValidationErrors | null {
      const digits = String(control.value).replace(/[\s-]/g, '');
      if (!digits) return null;
      if (!/^\d+$/.test(digits)) return { phoneDigits: true };
      const range = phoneRange();
      return range && (digits.length < range.min || digits.length > range.max)
        ? { phoneLength: range }
        : null;
    },
    /** Ubicación para la API: cada nivel por id (lista) o por nombre (texto). */
    locationBody(): LocationInputDto {
      return {
        countryCode: c.country.value,
        ...(divisionMode() === 'text'
          ? { divisionName: clean(c.divisionName.value) }
          : { divisionId: c.divisionId.value }),
        ...(municipalityMode() === 'text'
          ? { municipalityName: clean(c.municipalityName.value) }
          : { municipalityId: c.municipalityId.value }),
      };
    },
  };
}

/** Zonas sugeridas por la API; `extra` (la detectada o la guardada) se agrega si no está. */
export function timezoneOptions(extra: () => string) {
  const catalogs = inject(CatalogsApi);
  const catalog = rxResource({
    stream: () => catalogs.timezones().pipe(map((r) => r.zones)),
    defaultValue: [],
  });
  return computed<readonly TimezoneDto[]>(() => {
    const zones = catalog.value();
    const id = extra();
    return zones.length && id && !zones.some((z) => z.id === id)
      ? [{ id, label: id, countryCode: null, utcOffset: '', offsetMinutes: 0 }, ...zones]
      : zones;
  });
}

/** Obligatorio o no, según el nivel tenga lista o se escriba. */
function setRequired(control: AbstractControl, required: boolean): void {
  control.setValidators(required ? Validators.required : null);
  control.updateValueAndValidity({ emitEvent: false });
}
