import {
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  signal,
  untracked,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
  AdminTeacherDto,
  AdminTeacherRefDto,
  AdminTeachersApi,
  Paginated,
  requestState,
} from 'data-access';
import { debounceTime, distinctUntilChanged } from 'rxjs';

/** Docentes de la oferta en el orden de la ficha: buscar, agregar, mover y quitar. */
@Component({
  selector: 'adm-teacher-picker',
  template: `
    <fieldset class="picker">
      <legend class="adm-field__label">Docentes</legend>
      @if (teachers().length) {
        <ol class="selected">
          @for (t of teachers(); track t.id; let i = $index, first = $first, last = $last) {
            <li class="teacher">
              @if (t.photoUrl) {
                <img class="teacher__photo" [src]="t.photoUrl" alt="" />
              } @else {
                <span class="teacher__photo teacher__photo--empty" aria-hidden="true">{{
                  t.fullName.charAt(0)
                }}</span>
              }
              <span class="teacher__name">{{ t.fullName }}</span>
              @if (!disabled()) {
                <button
                  type="button"
                  class="adm-action"
                  [disabled]="first"
                  (click)="move(i, -1)"
                  [attr.aria-label]="'Subir a ' + t.fullName"
                >
                  ↑
                </button>
                <button
                  type="button"
                  class="adm-action"
                  [disabled]="last"
                  (click)="move(i, 1)"
                  [attr.aria-label]="'Bajar a ' + t.fullName"
                >
                  ↓
                </button>
                <button
                  type="button"
                  class="adm-action adm-action--danger"
                  (click)="remove(t.id)"
                  [attr.aria-label]="'Quitar a ' + t.fullName"
                >
                  Quitar
                </button>
              }
            </li>
          }
        </ol>
      } @else {
        <p class="adm-field__hint">Sin docentes asignados.</p>
      }

      @if (!disabled()) {
        <label class="visually-hidden" for="teacher-search">Buscar docente</label>
        <input
          id="teacher-search"
          class="adm-field__input"
          type="search"
          autocomplete="off"
          placeholder="Buscar docente por nombre"
          [value]="searchText()"
          (input)="searchText.set($any($event.target).value)"
        />
        <div aria-live="polite">
          @if (search().trim().length >= 2) {
            @if (results.loading() && !results.data()) {
              <p class="adm-field__hint">Buscando…</p>
            } @else if (!available().length) {
              <p class="adm-field__hint">No hay más docentes con «{{ search() }}».</p>
            } @else {
              <ul class="results">
                @for (t of available(); track t.id) {
                  <li>
                    <button type="button" class="adm-menuitem" (click)="add(t)">
                      + {{ t.fullName }}
                    </button>
                  </li>
                }
              </ul>
            }
          }
        </div>
      }
      @if (issue()) {
        <p class="adm-field__error">{{ issue() }}</p>
      }
    </fieldset>
  `,
  styles: `
    .picker {
      margin: 0;
      padding: 0;
      border: 0;
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }
    .selected,
    .results {
      display: grid;
      gap: var(--space-2);
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .results {
      gap: 0;
      padding: var(--space-1);
      border-radius: 12px;
      background: #fff;
    }
    .teacher {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-2);
      border-radius: 14px;
      background: #fff;
    }
    .teacher__photo {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      object-fit: cover;
      flex: none;
    }
    .teacher__photo--empty {
      display: grid;
      place-items: center;
      background: var(--color-columbia-blue);
      color: var(--color-deep-blue);
      font-weight: 700;
    }
    .teacher__name {
      flex: 1;
      font-weight: 600;
    }
  `,
})
export class TeacherPicker {
  readonly teachers = model<readonly AdminTeacherRefDto[]>([]);
  readonly disabled = input(false);
  readonly issue = input<string | null>(null);

  private readonly api = inject(AdminTeachersApi);
  protected readonly searchText = signal('');
  protected readonly search = toSignal(
    toObservable(this.searchText).pipe(debounceTime(300), distinctUntilChanged()),
    { initialValue: '' },
  );
  protected readonly results = requestState<Paginated<AdminTeacherDto>>();
  /** Resultados que aún no están en la oferta. */
  protected readonly available = computed(() => {
    const chosen = new Set(this.teachers().map((t) => t.id));
    return (this.results.data()?.data ?? []).filter((t) => !chosen.has(t.id));
  });

  constructor() {
    effect(() => {
      const q = this.search().trim();
      untracked(() => {
        if (q.length >= 2) void this.results.run(this.api.list({ q, pageSize: 8 }));
        else this.results.reset();
      });
    });
  }

  protected add(teacher: AdminTeacherDto): void {
    this.teachers.update((list) => [
      ...list,
      { id: teacher.id, fullName: teacher.fullName, photoUrl: teacher.photoUrl },
    ]);
    this.searchText.set('');
  }

  protected remove(id: string): void {
    this.teachers.update((list) => list.filter((t) => t.id !== id));
  }

  protected move(index: number, delta: number): void {
    this.teachers.update((list) => {
      const next = [...list];
      [next[index], next[index + delta]] = [next[index + delta], next[index]];
      return next;
    });
  }
}
