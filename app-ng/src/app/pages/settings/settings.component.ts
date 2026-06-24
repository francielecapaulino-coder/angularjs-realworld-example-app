import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { AuthService, UserUpdate } from '../../core/auth/auth.service';
import { ApiErrors, ListErrorsComponent } from '../../shared/list-errors.component';

/**
 * Settings page (mirrors legacy src/js/settings/*). Updates the current account
 * (PUT /user, which returns a fresh token re-stored via setAuth) and provides a
 * logout button. The route is protected by authGuard.
 */
@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [ReactiveFormsModule, ListErrorsComponent],
  templateUrl: './settings.component.html',
})
export class SettingsComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    image: [''],
    username: [''],
    bio: [''],
    email: [''],
    password: [''],
  });

  readonly submitting = signal(false);
  readonly errors = signal<ApiErrors | null>(null);

  ngOnInit(): void {
    const user = this.auth.currentUser();
    if (user) {
      this.form.patchValue({
        image: user.image ?? '',
        username: user.username,
        bio: user.bio ?? '',
        email: user.email,
      });
    }
  }

  submit(): void {
    if (this.submitting()) {
      return;
    }
    this.submitting.set(true);
    this.errors.set(null);

    const raw = this.form.getRawValue();
    const payload: UserUpdate = {
      email: raw.email,
      username: raw.username,
      bio: raw.bio || null,
      image: raw.image || null,
    };
    // Only send a password when the user typed a new one.
    if (raw.password) {
      payload.password = raw.password;
    }

    this.auth.update(payload).subscribe({
      next: (user) => this.router.navigate(['/profile', user.username]),
      error: (err) => {
        this.submitting.set(false);
        this.errors.set((err.error?.errors as ApiErrors) ?? { error: ['request failed'] });
      },
    });
  }

  logout(): void {
    this.auth.purgeAuth();
    this.router.navigate(['/']);
  }
}
