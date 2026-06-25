import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, tap, timeout } from 'rxjs';
import { JwtService } from './jwt.service';
import { APP_CONSTANTS } from '../config/app.constants';

/**
 * Max time to wait for the session-restore request (GET /user) during bootstrap.
 * If the network hangs, the request is aborted after this window so the app never
 * stalls indefinitely — the user is treated as logged out and routed to /login.
 */
export const VERIFY_AUTH_TIMEOUT_MS = 8000;

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

/** Editable account fields submitted by the settings form. */
export interface UserUpdate {
  email: string;
  username: string;
  bio: string | null;
  image: string | null;
  password?: string;
}

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
   * Updates the current account (PUT /user). The response carries a fresh token,
   * so we re-store the session via setAuth. Mirrors legacy User.update.
   */
  update(user: UserUpdate): Observable<User> {
    return this.http
      .put<UserResponse>(`${APP_CONSTANTS.apiBase}/user`, { user })
      .pipe(
        tap((res) => this.setAuth(res.user)),
        map((res) => res.user),
      );
  }

  /**
   * Verifies the stored token against `GET /user`.
   * Resolves to `true` when authenticated, `false` otherwise — and NEVER rejects,
   * so callers (e.g. the bootstrap initializer) can always settle.
   *
   * Failure handling:
   *  - no token            → immediately false (no HTTP call);
   *  - 401 (expired token) → caught, session purged, false;
   *  - network error       → caught, session purged, false;
   *  - hung request        → aborted after VERIFY_AUTH_TIMEOUT_MS, then treated like
   *                          a network error (purge + false) so the app never stalls.
   * In every failure case the user ends up logged out → guards redirect to /login.
   */
  verifyAuth(): Observable<boolean> {
    if (!this.jwt.get()) {
      this.currentUserSig.set(null);
      return of(false);
    }
    return this.http.get<UserResponse>(`${APP_CONSTANTS.apiBase}/user`).pipe(
      timeout(VERIFY_AUTH_TIMEOUT_MS),
      tap((res) => this.currentUserSig.set(res.user)),
      map(() => true),
      catchError(() => {
        // Covers 401 (expired), network errors and TimeoutError alike.
        this.purgeAuth();
        return of(false);
      }),
    );
  }
}
