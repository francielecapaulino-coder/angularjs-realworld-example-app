import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ArticlesService } from '../../core/articles/articles.service';
import { CommentsService } from '../../core/comments/comments.service';
import { AuthService } from '../../core/auth/auth.service';
import { Article } from '../../core/models/article.model';
import { Comment } from '../../core/models/comment.model';
import { MarkdownPipe } from '../../shared/markdown.pipe';
import { CommentCardComponent } from '../../shared/comment-card.component';

/**
 * Article detail page (mirrors legacy src/js/article/article.html).
 * Read-only in this slice: loads the article + comments and renders the body as
 * SANITIZED markdown. Write actions (comment/favorite/follow/edit) arrive next.
 */
@Component({
  selector: 'app-article',
  standalone: true,
  imports: [RouterLink, DatePipe, MarkdownPipe, CommentCardComponent],
  templateUrl: './article.component.html',
})
export class ArticleComponent implements OnInit {
  /** Route param bound via withComponentInputBinding. */
  @Input({ required: true }) slug!: string;

  private readonly articlesService = inject(ArticlesService);
  private readonly commentsService = inject(CommentsService);
  private readonly auth = inject(AuthService);

  readonly article = signal<Article | null>(null);
  readonly comments = signal<Comment[]>([]);
  readonly loading = signal(true);
  readonly isAuthenticated = this.auth.isAuthenticated;

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
}
