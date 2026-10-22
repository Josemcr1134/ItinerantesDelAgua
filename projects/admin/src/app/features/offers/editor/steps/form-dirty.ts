import { Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl } from '@angular/forms';
import { map } from 'rxjs';

/** `dirty` del formulario como signal (se actualiza con cada cambio o reset). */
export function formDirty(control: AbstractControl): Signal<boolean> {
  return toSignal(control.events.pipe(map(() => control.dirty)), { initialValue: control.dirty });
}
