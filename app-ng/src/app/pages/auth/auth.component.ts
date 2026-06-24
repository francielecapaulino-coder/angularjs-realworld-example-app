import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService, AuthType } from '../../core/auth/auth.service';
import { ApiErrors, ListErrorsComponent } from '../../shared/list-errors.component';

/**
 * Login / Register screen (mirrors legacy src/js/auth/*).
 * The mode is provided by the route `data.authType` and bound via
 * withComponentInputBinding (configured in app.config.ts).
 */
@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ListErrorsComponent],
  templateUrl: './auth.component.html',
})
export class AuthComponent implements OnInit {
  /** 'login' | 'register' — bound from route data. */
  @Input() authType: AuthType = 'login';

  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly isSubmitting = signal(false);
  readonly errors = signal<ApiErrors | null>(null);

  readonly form = this.fb.nonNullable.group({
    username: [''],
    email: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  get isRegister(): boolean {
    return this.authType === 'register';
  }

  get title(): string {
    return this.isRegister ? 'Sign up' : 'Sign in';
  }

  ngOnInit(): void {
    if (this.isRegister) {
      this.form.controls.username.addValidators(Validators.required);
      this.form.controls.username.updateValueAndValidity();
    }
  }

  submitForm(): void {
    if (this.isSubmitting()) {
      return;
    }
    this.isSubmitting.set(true);
    this.errors.set(null);

    const { username, email, password } = this.form.getRawValue();
    const credentials = this.isRegister
      ? { username, email, password }
      : { email, password };

    this.auth.attemptAuth(this.authType, credentials).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err: HttpErrorResponse) => {
        this.isSubmitting.set(false);
        this.errors.set((err.error?.errors as ApiErrors) ?? { error: ['request failed'] });
      },
    });
  }
}
