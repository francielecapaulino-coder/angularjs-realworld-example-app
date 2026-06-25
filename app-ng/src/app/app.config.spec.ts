import { Subject, of } from 'rxjs';
import { restoreSessionThenNavigate } from './app.config';
import { AuthService } from './core/auth/auth.service';
import { Router } from '@angular/router';

/**
 * Regression tests for the auth-resolution guarantee:
 * the app initializer MUST resolve verifyAuth (definitive auth state) BEFORE the
 * router performs its initial navigation, so guards never run on a pending state.
 */
describe('restoreSessionThenNavigate (auth-resolution guarantee)', () => {
  it('awaits verifyAuth BEFORE calling router.initialNavigation', async () => {
    const order: string[] = [];

    // verifyAuth resolves only when we choose to — simulating an in-flight GET /user.
    const verify$ = new Subject<boolean>();
    const auth = {
      verifyAuth: () => {
        order.push('verifyAuth:start');
        return verify$.asObservable();
      },
    } as unknown as AuthService;

    const router = {
      initialNavigation: () => {
        order.push('initialNavigation');
        return Promise.resolve();
      },
    } as unknown as Router;

    const done = restoreSessionThenNavigate(auth, router);

    // While verifyAuth is still pending, initial navigation MUST NOT have run yet.
    await Promise.resolve();
    expect(order).toEqual(['verifyAuth:start']);

    // Resolve the auth state → navigation may now proceed.
    verify$.next(true);
    verify$.complete();
    await done;

    expect(order).toEqual(['verifyAuth:start', 'initialNavigation']);
  });

  it('still navigates when the user is NOT authenticated (verifyAuth=false)', async () => {
    const order: string[] = [];
    const auth = {
      verifyAuth: () => {
        order.push('verifyAuth');
        return of(false);
      },
    } as unknown as AuthService;
    const router = {
      initialNavigation: () => {
        order.push('initialNavigation');
        return Promise.resolve();
      },
    } as unknown as Router;

    await restoreSessionThenNavigate(auth, router);

    // Definitive "not authenticated" state still leads to navigation (guard then
    // redirects anonymous users) — never stuck in a pending state.
    expect(order).toEqual(['verifyAuth', 'initialNavigation']);
  });
});
