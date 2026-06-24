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
    // Restore the session from a stored token BEFORE the first navigation, then
    // kick off the initial navigation. Mirrors the legacy `verifyAuth` resolve on
    // the abstract `app` state.
    provideAppInitializer(async () => {
      const auth = inject(AuthService);
      const router = inject(Router);
      await firstValueFrom(auth.verifyAuth());
      await router.initialNavigation();
    }),
  ],
};
