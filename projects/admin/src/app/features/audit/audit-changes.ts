import { Component, computed, input } from '@angular/core';

/** Un campo que cambió, con su valor anterior y el nuevo ya en texto. */
interface FieldChange {
  readonly field: string;
  readonly before: string;
  readonly after: string;
}

/** Valor de un cambio en texto ("—" si no había; objetos como JSON compacto). */
function show(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Sí' : 'No';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

/**
 * Antes y después de una entrada de auditoría (solo los campos que
 * cambiaron), desplegable para no alargar la lista.
 */
@Component({
  selector: 'adm-audit-changes',
  template: `
    @if (fields().length) {
      <details class="changes">
        <summary>
          Ver cambios ({{ fields().length }} {{ fields().length === 1 ? 'campo' : 'campos' }})
        </summary>
        <dl class="list">
          @for (f of fields(); track f.field) {
            <div class="item">
              <dt class="field">{{ f.field }}</dt>
              <dd class="values">
                <span class="before"
                  ><span class="visually-hidden">Antes: </span>{{ f.before }}</span
                >
                <span class="arrow" aria-hidden="true">→</span>
                <span class="after"
                  ><span class="visually-hidden">Después: </span>{{ f.after }}</span
                >
              </dd>
            </div>
          }
        </dl>
      </details>
    }
  `,
  styles: `
    :host {
      display: block;
    }
    summary {
      color: var(--color-primary);
      font-size: 0.8125rem;
      font-weight: 700;
      cursor: pointer;
    }
    .list {
      display: grid;
      gap: var(--space-2);
      margin: var(--space-2) 0 0;
    }
    .field {
      font-family: var(--font-family-numeric), ui-monospace, monospace;
      font-size: 0.75rem;
      font-weight: 700;
    }
    .values {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 2px var(--space-2);
      margin: 2px 0 0;
      font-size: 0.8125rem;
      overflow-wrap: anywhere;
    }
    .before {
      color: color-mix(in srgb, var(--color-raisin-black) 60%, transparent);
      text-decoration: line-through;
    }
    .arrow {
      color: var(--color-primary);
    }
    .after {
      font-weight: 600;
    }
  `,
})
export class AuditChanges {
  readonly changes = input<Readonly<Record<string, unknown>> | null>(null);

  protected readonly fields = computed<FieldChange[]>(() => {
    const changes = this.changes();
    if (!changes) return [];
    const before = isRecord(changes['before']) ? changes['before'] : {};
    const after = isRecord(changes['after']) ? changes['after'] : {};
    const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])];
    return keys.map((field) => ({ field, before: show(before[field]), after: show(after[field]) }));
  });
}
