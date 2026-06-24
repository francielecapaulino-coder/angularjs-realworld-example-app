import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { APP_CONSTANTS } from '../config/app.constants';

interface TagsResponse {
  tags: string[];
}

/**
 * Tags API (mirrors legacy src/js/services/tags.service.js).
 */
@Injectable({ providedIn: 'root' })
export class TagsService {
  private readonly http = inject(HttpClient);

  getAll(): Observable<string[]> {
    return this.http
      .get<TagsResponse>(`${APP_CONSTANTS.apiBase}/tags`)
      .pipe(map((res) => res.tags));
  }
}
