import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { APP_CONSTANTS } from '../config/app.constants';
import { Profile } from '../models/article.model';

interface ProfileResponse {
  profile: Profile;
}

/**
 * Profiles API (mirrors legacy src/js/services/profile.service.js).
 */
@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly http = inject(HttpClient);

  get(username: string): Observable<Profile> {
    return this.http
      .get<ProfileResponse>(`${APP_CONSTANTS.apiBase}/profiles/${username}`)
      .pipe(map((res) => res.profile));
  }

  /** Follows a user (POST /profiles/:username/follow). */
  follow(username: string): Observable<Profile> {
    return this.http
      .post<ProfileResponse>(`${APP_CONSTANTS.apiBase}/profiles/${username}/follow`, {})
      .pipe(map((res) => res.profile));
  }

  /** Unfollows a user (DELETE /profiles/:username/follow). */
  unfollow(username: string): Observable<Profile> {
    return this.http
      .delete<ProfileResponse>(`${APP_CONSTANTS.apiBase}/profiles/${username}/follow`)
      .pipe(map((res) => res.profile));
  }
}
