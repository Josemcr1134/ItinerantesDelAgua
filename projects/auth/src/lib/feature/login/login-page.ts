import { Component, computed, ElementRef, inject, input, signal, viewChild } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { requestState, UserProfileDto } from 'data-access';
import { Button } from 'ui-kit';
import { AUTH_CONFIG } from '../../auth.config';
import { AuthService } from '../../auth.service';
import { SessionStore } from '../../session/session.store';
import { AuthLayout } from '../auth-layout/auth-layout';
import { AUTH_TEXTS, formatTime } from '../auth-texts';
import { PasswordToggle } from '../password-toggle/password-toggle';

/** Login compartido por todas las plataformas (HU-04). */
@Component({
  selector: 'auth-login-page',
  imports: [ReactiveFormsModule, RouterLink, Button, AuthLayout, PasswordToggle],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
})
export default class LoginPage {
  /** Página a la que volver tras iniciar sesión (query param). */
  readonly returnUrl = input<string>();

  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly config = inject(AUTH_CONFIG);
  protected readonly texts = AUTH_TEXTS;
  protected readonly expired = inject(SessionStore).ended() === 'expired';
  protected readonly request = requestState<UserProfileDto>();
  protected readonly showPassword = signal(false);
  private readonly emailInput = viewChild.required<ElementRef<HTMLInputElement>>('email');
  private readonly passwordInput = viewChild.required<ElementRef<HTMLInputElement>>('password');

  protected readonly form = inject(NonNullableFormBuilder).group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    rememberMe: [false],
  });

  protected readonly errorMessage = computed(() => {
    const error = this.request.error();
    if (!error) {
      return null;
    }
    const lockedUntil = error.metaString('lockedUntil');
    return lockedUntil
      ? `${error.message} ${this.texts.login.lockedUntil(formatTime(lockedUntil))}`
      : error.message;
  });

  protected showError(name: 'email' | 'password'): boolean {
    const control = this.form.controls[name];
    return control.invalid && control.touched;
  }

  protected async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      const first = this.form.controls.email.invalid ? this.emailInput() : this.passwordInput();
      first.nativeElement.focus();
      return;
    }
    const { email, password, rememberMe } = this.form.getRawValue();
    const user = await this.request.run(
      this.auth.login({ email: email.trim().toLowerCase(), password, rememberMe }),
    );
    if (user) {
      await this.router.navigateByUrl(this.safeReturnUrl());
    } else {
      this.form.controls.password.reset();
    }
  }

  /** Solo rutas internas, para evitar redirecciones abiertas. */
  private safeReturnUrl(): string {
    const url = this.returnUrl();
    return url && url.startsWith('/') && !url.startsWith('//') ? url : this.config.homeUrl;
  }
}
