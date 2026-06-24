import { Component, EventEmitter, Input, Output, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../core/auth/auth.service';
import { Article } from '../core/models/article.model';
import { FavoriteButtonComponent } from './favorite-button.component';
import { FollowButtonComponent } from './follow-button.component';

/**
 * Article meta + actions (mirrors legacy article-actions, BUG-FREE):
 *  - author → Edit / Delete
 *  - other  → Follow + Favorite
 *
 * `canModify` is derived reactively from AuthService.currentUser and the article
 * input via a computed signal — it never reads the binding in the constructor
 * (which was the legacy crash documented in the Fase 2 E2E baseline).
 */
@Component({
  selector: 'app-article-actions',
  standalone: true,
  imports: [RouterLink, FavoriteButtonComponent, FollowButtonComponent],
  templateUrl: './article-actions.component.html',
})
export class ArticleActionsComponent {
  private readonly articleSig = signal<Article | null>(null);

  @Input({ required: true })
  set article(value: Article) {
    this.articleSig.set(value);
  }
  get article(): Article {
    return this.articleSig()!;
  }

  /** Emitted when the author confirms deletion. */
  @Output() deleteArticle = new EventEmitter<void>();

  private readonly auth = inject(AuthService);

  readonly canModify = computed(() => {
    const current = this.auth.currentUser();
    const art = this.articleSig();
    return !!current && !!art && current.username === art.author.username;
  });

  onDelete(): void {
    this.deleteArticle.emit();
  }
}
