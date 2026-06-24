import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ArticlesService } from '../../core/articles/articles.service';
import { CommentsService } from '../../core/comments/comments.service';
import { AuthService } from '../../core/auth/auth.service';
import { Article } from '../../core/models/article.model';
import { Comment } from '../../core/models/comment.model';
import { MarkdownPipe } from '../../shared/markdown.pipe';
import { CommentCardComponent } from '../../shared/comment-card.component';
import { ArticleActionsComponent } from '../../shared/article-actions.component';

/**
 * Article detail page (mirrors legacy src/js/article/article.html).
 * Loads the article + comments, renders the SANITIZED markdown body, and provides
 * the authenticated write actions: favorite/follow (via ArticleActions), delete
 * (author), and add/delete comments.
 */
@Component({
  selector: 'app-article',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    MarkdownPipe,
    CommentCardComponent,
    ArticleActionsComponent,
  ],
  templateUrl: './article.component.html',
})
export class ArticleComponent implements OnInit {
  /** Route param bound via withComponentInputBinding. */
  @Input({ required: true }) slug!: string;

  private readonly articlesService = inject(ArticlesService);
  private readonly commentsService = inject(CommentsService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly article = signal<Article | null>(null);
  readonly comments = signal<Comment[]>([]);
  readonly loading = signal(true);
  readonly isAuthenticated = this.auth.isAuthenticated;
  readonly currentUser = this.auth.currentUser;

  // Comment form state
  readonly commentBody = signal('');
  readonly commentSubmitting = signal(false);

  ngOnInit(): void {
    this.articlesService.get(this.slug).subscribe({
      next: (article) => {
        this.article.set(article);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    this.commentsService.getAll(this.slug).subscribe({
      next: (comments) => this.comments.set(comments),
      error: () => this.comments.set([]),
    });
  }

  /** True when the given comment belongs to the current user. */
  canDeleteComment(comment: Comment): boolean {
    const user = this.currentUser();
    return !!user && user.username === comment.author.username;
  }

  addComment(): void {
    const body = this.commentBody().trim();
    if (!body || this.commentSubmitting()) {
      return;
    }
    this.commentSubmitting.set(true);
    this.commentsService.add(this.slug, body).subscribe({
      next: (comment) => {
        this.comments.update((list) => [comment, ...list]);
        this.commentBody.set('');
        this.commentSubmitting.set(false);
      },
      error: () => this.commentSubmitting.set(false),
    });
  }

  deleteComment(id: number): void {
    this.commentsService.destroy(this.slug, id).subscribe({
      next: () => this.comments.update((list) => list.filter((c) => c.id !== id)),
    });
  }

  deleteArticle(): void {
    const art = this.article();
    if (!art) {
      return;
    }
    this.articlesService.delete(art.slug).subscribe({
      next: () => this.router.navigate(['/']),
    });
  }
}
