import { Component, Input, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileService } from '../core/profile/profile.service';
import { AuthService } from '../core/auth/auth.service';
import { Profile } from '../core/models/article.model';

/**
 * Follow/unfollow toggle (mirrors legacy follow-btn).
 * Anonymous users are redirected to /register (no mutation is attempted).
 */
@Component({
  selector: 'app-follow-button',
  standalone: true,
  template: `
    <button
      class="btn btn-sm action-btn"
      [class.btn-secondary]="user.following"
      [class.btn-outline-secondary]="!user.following"
      [disabled]="submitting()"
      type="button"
      (click)="toggle()"
    >
      <i class="ion-plus-round"></i>
      {{ user.following ? 'Unfollow' : 'Follow' }} {{ user.username }}
    </button>
  `,
})
export class FollowButtonComponent {
  @Input({ required: true }) user!: Profile;

  private readonly profiles = inject(ProfileService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly submitting = signal(false);

  toggle(): void {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/register']);
      return;
    }
    this.submitting.set(true);
    const request = this.user.following
      ? this.profiles.unfollow(this.user.username)
      : this.profiles.follow(this.user.username);

    request.subscribe({
      next: (updated) => {
        this.user.following = updated.following;
        this.submitting.set(false);
      },
      error: () => this.submitting.set(false),
    });
  }
}
