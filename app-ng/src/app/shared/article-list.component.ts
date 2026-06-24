import { Component, Input, OnChanges, inject, signal } from '@angular/core';
import { ArticlesService } from '../core/articles/articles.service';
import { Article, ArticleQuery } from '../core/models/article.model';
import { ArticlePreviewComponent } from './article-preview.component';

/**
 * Renders a paginated list of article previews for a given query config
 * (mirrors legacy article-list.html). Re-fetches whenever the config changes.
 */
@Component({
  selector: 'app-article-list',
  standalone: true,
  imports: [ArticlePreviewComponent],
  templateUrl: './article-list.component.html',
})
export class ArticleListComponent implements OnChanges {
  /** Page size. */
  @Input() limit = 10;
  /** Query config (type + filters). Changing it triggers a re-fetch. */
  @Input({ required: true }) listConfig!: ArticleQuery;

  private readonly articlesService = inject(ArticlesService);

  readonly articles = signal<Article[]>([]);
  readonly loading = signal(false);
  readonly currentPage = signal(1);
  readonly totalPages = signal(0);

  ngOnChanges(): void {
    this.setPage(1);
  }

  setPage(page: number): void {
    this.currentPage.set(page);
    this.runQuery();
  }

  /** Page numbers [1..totalPages] for the pagination control. */
  pages(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  }

  private runQuery(): void {
    this.loading.set(true);
    this.articles.set([]);

    const offset = this.limit * (this.currentPage() - 1);
    const query: ArticleQuery = {
      type: this.listConfig.type,
      filters: { ...this.listConfig.filters, limit: this.limit, offset },
    };

    this.articlesService.query(query).subscribe({
      next: (res) => {
        this.articles.set(res.articles);
        this.totalPages.set(Math.ceil(res.articlesCount / this.limit));
        this.loading.set(false);
      },
      error: () => {
        this.articles.set([]);
        this.totalPages.set(0);
        this.loading.set(false);
      },
    });
  }
}
