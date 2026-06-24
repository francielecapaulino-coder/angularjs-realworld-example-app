import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { APP_CONSTANTS } from '../config/app.constants';
import { Comment } from '../models/comment.model';

interface CommentsResponse {
  comments: Comment[];
}

/**
 * Comments API (mirrors legacy src/js/services/comments.service.js).
 * This slice covers reads only; add/delete arrive in the write-actions slice.
 */
@Injectable({ providedIn: 'root' })
export class CommentsService {
  private readonly http = inject(HttpClient);

  getAll(slug: string): Observable<Comment[]> {
    return this.http
      .get<CommentsResponse>(`${APP_CONSTANTS.apiBase}/articles/${slug}/comments`)
      .pipe(map((res) => res.comments));
  }
}
