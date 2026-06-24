import { Component, Input, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ArticlesService } from '../core/articles/articles.service';
import { AuthService } from '../core/auth/auth.service';
import { Article } from '../core/models/article.model';

/**
 * Favorite/unfavorite toggle (mirrors legacy favorite-btn).
 * Anonymous users are redirected to /register (no mutation is attempted).
 * Updates favorited/favoritesCount optimistically from the API response.
 */
@Component({
  selector: 'app-favorite-button',
  standalone: true,
  template: `
    <button
      class="btn btn-sm"
      [class.btn-primary]="article.favorited"
      [class.btn-outline-primary]="!article.favorited"
      [disabled]="submitting()"
      type="button"
      (click)="toggle()"
    >
      <i class="ion-heart"></i> <ng-content></ng-content>
    </button>
  `,
})
export class FavoriteButtonComponent {
  @Input({ required: true }) article!: Article;

  private readonly articles = inject(ArticlesService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly submitting = signal(false);

  toggle(): void {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/register']);
      return;
    }
    this.submitting.set(true);
    const request = this.article.favorited
      ? this.articles.unfavorite(this.article.slug)
      : this.articles.favorite(this.article.slug);

    request.subscribe({
      next: (updated) => {
        this.article.favorited = updated.favorited;
        this.article.favoritesCount = updated.favoritesCount;
        this.submitting.set(false);
      },
      error: () => this.submitting.set(false),
    });
  }
}
