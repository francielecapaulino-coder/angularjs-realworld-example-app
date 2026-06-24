import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { APP_CONSTANTS } from '../config/app.constants';
import { Article, ArticleListResponse, ArticleQuery } from '../models/article.model';

interface SingleArticleResponse {
  article: Article;
}

/**
 * Articles API (mirrors legacy src/js/services/articles.service.js).
 */
@Injectable({ providedIn: 'root' })
export class ArticlesService {
  private readonly http = inject(HttpClient);

  /**
   * Queries articles. `type: 'feed'` hits `/articles/feed` (requires auth — the
   * token interceptor attaches the header); otherwise `/articles`. Filters map to
   * query params (tag, author, favorited, limit, offset).
   */
  query(config: ArticleQuery): Observable<ArticleListResponse> {
    const path = config.type === 'feed' ? '/articles/feed' : '/articles';
    let params = new HttpParams();
    const filters = config.filters ?? {};
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    }
    return this.http.get<ArticleListResponse>(`${APP_CONSTANTS.apiBase}${path}`, {
      params,
    });
  }

  /** Fetches a single article by slug (GET /articles/:slug). */
  get(slug: string): Observable<Article> {
    return this.http
      .get<SingleArticleResponse>(`${APP_CONSTANTS.apiBase}/articles/${slug}`)
      .pipe(map((res) => res.article));
  }
}
