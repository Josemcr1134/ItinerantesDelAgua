import { computed, effect, inject, Injectable, signal, untracked } from '@angular/core';
import { SessionStore } from 'auth';
import {
  AdminMeDto,
  AdminUsersApi,
  isApiError,
  Permission,
  Role,
  RoleDefinitionDto,
  toApiError,
} from 'data-access';
import { firstValueFrom } from 'rxjs';

/** Resultado de cargar el acceso al panel. */
export type AccessResult = 'granted' | 'forbidden' | 'error';

/**
 * Acceso al panel de la persona con sesión (`GET /admin/me`): roles y permisos
 * efectivos. Las pantallas y el menú consultan `can(...)` para mostrar u
 * ocultar secciones y botones; la API valida igual cada petición.
 */
@Injectable({ providedIn: 'root' })
export class AdminAccess {
  private readonly api = inject(AdminUsersApi);
  private readonly session = inject(SessionStore);
  private readonly meState = signal<AdminMeDto | null>(null);
  private readonly catalogState = signal<readonly RoleDefinitionDto[]>([]);
  private pending: Promise<AccessResult> | null = null;

  readonly me = this.meState.asReadonly();
  readonly permissions = computed(() => new Set<Permission>(this.meState()?.permissions ?? []));
  /** Roles del equipo (sin `PARTICIPANT`). */
  readonly roles = computed<readonly Role[]>(() =>
    (this.meState()?.roles ?? []).filter((role) => role !== 'PARTICIPANT'),
  );
  /** Catálogo de roles con su nombre visible y permisos. */
  readonly catalog = this.catalogState.asReadonly();

  constructor() {
    // Al cerrar la sesión (o cambiar de persona) se olvida el acceso.
    effect(() => {
      const userId = this.session.user()?.id ?? null;
      untracked(() => {
        if (this.meState() && this.meState()?.user.id !== userId) {
          this.reset();
        }
      });
    });
  }

  can(permission: Permission): boolean {
    return this.permissions().has(permission);
  }

  /** Nombre visible de un rol (del catálogo de la API). */
  roleLabel(role: Role): string {
    return this.catalogState().find((def) => def.role === role)?.label ?? role;
  }

  /** Carga el acceso una vez por sesión (las llamadas simultáneas comparten la petición). */
  load(): Promise<AccessResult> {
    if (this.meState()) {
      return Promise.resolve('granted');
    }
    this.pending ??= this.fetch().finally(() => (this.pending = null));
    return this.pending;
  }

  /** Vuelve a pedir el acceso (p. ej. tras cambiar mis propios roles). */
  async refresh(): Promise<AccessResult> {
    this.meState.set(null);
    return this.load();
  }

  reset(): void {
    this.meState.set(null);
    this.catalogState.set([]);
  }

  private async fetch(): Promise<AccessResult> {
    try {
      const me = await firstValueFrom(this.api.me());
      this.meState.set(me);
      // El catálogo solo da nombres: si falla, se muestran las claves.
      firstValueFrom(this.api.roles())
        .then((res) => this.catalogState.set(res.data))
        .catch(() => undefined);
      return 'granted';
    } catch (error) {
      const apiError = isApiError(error) ? error : toApiError(error);
      return apiError.statusCode === 403 ? 'forbidden' : 'error';
    }
  }
}
