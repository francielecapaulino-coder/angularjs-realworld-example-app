import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { JwtService } from './jwt.service';
import { APP_CONSTANTS } from '../config/app.constants';

/** RealWorld user envelope (subset consumed by the app). */
export interface User {
  email: string;
  username: string;
  bio: string | null;
  image: string | null;
  token: string;
}

interface UserResponse {
  user: User;
}

/** Credentials submitted by the login/register forms. */
export interface AuthCredentials {
  username?: string;
  email: string;
  password: string;
}

/** Auth mode driven by the route. */
export type AuthType = 'login' | 'register';

/**
 * Signal-based session/auth state (mirrors legacy src/js/services/user.service.js).
 * Exposes the current user as a signal so layout/components react reactively —
 * fixing the legacy header's broken `$scope.$watch('User.current')`.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly jwt = inject(JwtService);

  private readonly currentUserSig = signal<User | null>(null);

  /** Read-only current user signal. */
  readonly currentUser = this.currentUserSig.asReadonly();
  /** True when a user session is active. */
  readonly isAuthenticated = computed(() => this.currentUserSig() !== null);

  /** Stores the user + token after a successful login/register. */
  setAuth(user: User): void {
    this.jwt.save(user.token);
    this.currentUserSig.set(user);
  }

  /**
   * Authenticates against the RealWorld API.
   *  - login    → POST /users/login  { user: { email, password } }
   *  - register → POST /users        { user: { username, email, password } }
   * On success, stores the session via setAuth and emits the user.
   * Mirrors legacy src/js/services/user.service.js#attemptAuth.
   */
  attemptAuth(type: AuthType, credentials: AuthCredentials): Observable<User> {
    const route = type === 'login' ? '/users/login' : '/users';
    return this.http
      .post<UserResponse>(`${APP_CONSTANTS.apiBase}${route}`, { user: credentials })
      .pipe(
        tap((res) => this.setAuth(res.user)),
        map((res) => res.user),
      );
  }

  /** Clears the session (logout or invalid token). */
  purgeAuth(): void {
    this.jwt.destroy();
    this.currentUserSig.set(null);
  }

  /**
   * Verifies the stored token against `GET /user`.
   * Resolves to `true` when authenticated, `false` otherwise.
   * No token → immediately false (no HTTP call), matching legacy behavior.
   */
  verifyAuth(): Observable<boolean> {
    if (!this.jwt.get()) {
      this.currentUserSig.set(null);
      return of(false);
    }
    return this.http.get<UserResponse>(`${APP_CONSTANTS.apiBase}/user`).pipe(
      tap((res) => this.currentUserSig.set(res.user)),
      map(() => true),
      catchError(() => {
        this.purgeAuth();
        return of(false);
      }),
    );
  }
}
