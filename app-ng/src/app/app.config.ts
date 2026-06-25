import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideAppInitializer,
  inject,
} from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withDisabledInitialNavigation,
  Router,
} from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { routes } from './app.routes';
import { tokenInterceptor } from './core/auth/token.interceptor';
import { AuthService } from './core/auth/auth.service';

/**
 * Restores the session from a stored token and ONLY THEN triggers the initial
 * navigation. This guarantees route guards (e.g. authGuard) are evaluated against
 * a DEFINITIVELY RESOLVED auth state (authenticated or not) — never a pending one.
 *
 * `verifyAuth()` resolves to true/false (and never rejects — it handles errors
 * internally), so the initial navigation always runs with a settled state.
 */
export async function restoreSessionThenNavigate(
  auth: AuthService,
  router: Router,
): Promise<void> {
  await firstValueFrom(auth.verifyAuth());
  await router.initialNavigation();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // History API routing (PathLocationStrategy is the default - no withHashLocation).
    // withComponentInputBinding lets route `data`/params bind to component @Input()s.
    // withDisabledInitialNavigation defers the first navigation until the app
    // initializer below restores the session - so route guards (authGuard) see the
    // authenticated state instead of racing verifyAuth and bouncing to /login.
    provideRouter(routes, withComponentInputBinding(), withDisabledInitialNavigation()),
    provideHttpClient(withInterceptors([tokenInterceptor])),
    // Restore the session BEFORE the first navigation (see restoreSessionThenNavigate).
    provideAppInitializer(() => restoreSessionThenNavigate(inject(AuthService), inject(Router))),
  ],
};
