import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { APP_CONSTANTS } from '../config/app.constants';
import { Comment } from '../models/comment.model';

interface CommentsResponse {
  comments: Comment[];
}

interface CommentResponse {
  comment: Comment;
}

/**
 * Comments API (mirrors legacy src/js/services/comments.service.js).
 */
@Injectable({ providedIn: 'root' })
export class CommentsService {
  private readonly http = inject(HttpClient);

  getAll(slug: string): Observable<Comment[]> {
    return this.http
      .get<CommentsResponse>(`${APP_CONSTANTS.apiBase}/articles/${slug}/comments`)
      .pipe(map((res) => res.comments));
  }

  /** Adds a comment (POST /articles/:slug/comments). */
  add(slug: string, body: string): Observable<Comment> {
    return this.http
      .post<CommentResponse>(`${APP_CONSTANTS.apiBase}/articles/${slug}/comments`, {
        comment: { body },
      })
      .pipe(map((res) => res.comment));
  }

  /** Deletes a comment (DELETE /articles/:slug/comments/:id). Author-only (API-enforced). */
  destroy(slug: string, id: number): Observable<void> {
    return this.http
      .delete<void>(`${APP_CONSTANTS.apiBase}/articles/${slug}/comments/${id}`)
      .pipe(map(() => undefined));
  }
}
