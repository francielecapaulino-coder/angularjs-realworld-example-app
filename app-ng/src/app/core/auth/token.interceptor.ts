import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { JwtService } from './jwt.service';
import { APP_CONSTANTS } from '../config/app.constants';

/**
 * Attaches `Authorization: Token <jwt>` to outgoing requests.
 *
 * Security invariants (mirrors legacy src/js/config/auth.interceptor.js):
 *  - The header is added ONLY for requests targeting the RealWorld API base
 *    (APP_CONSTANTS.apiBase). The token is NEVER sent to other origins/CDNs.
 *  - The scheme is `Token ` (RealWorld), NOT `Bearer`.
 *  - The header is added only when a token exists.
 *
 * 401 handling: purge the stored token. Unlike the legacy interceptor, this
 * does NOT force `window.location.reload()` — route guards / app state react
 * to the cleared token instead, avoiding reload loops.
 */
export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const jwt = inject(JwtService);
  const token = jwt.get();

  const targetsApi = req.url.startsWith(APP_CONSTANTS.apiBase);
  const authedReq =
    targetsApi && token
      ? req.clone({ setHeaders: { Authorization: `Token ${token}` } })
      : req;

  return next(authedReq).pipe(
    catchError((error: unknown) => {
      if (
        error &&
        typeof error === 'object' &&
        'status' in error &&
        (error as { status: number }).status === 401
      ) {
        jwt.destroy();
      }
      return throwError(() => error);
    }),
  );
};
