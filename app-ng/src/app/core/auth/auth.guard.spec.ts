import { TestBed } from '@angular/core/testing';
import { Router, UrlTree, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { authGuard } from './auth.guard';
import { AuthService, User } from './auth.service';

const USER: User = {
  email: 'guard-011@example.test',
  username: 'user-011',
  bio: null,
  image: null,
  token: 'fake-jwt-token-011',
};

function runGuard(): boolean | UrlTree {
  return TestBed.runInInjectionContext(() => authGuard({} as never, {} as never)) as
    | boolean
    | UrlTree;
}

describe('authGuard', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
  });

  afterEach(() => localStorage.clear());

  it('redirects anonymous users to /login (returns a UrlTree)', () => {
    const result = runGuard();
    const expected = TestBed.inject(Router).createUrlTree(['/login']);
    expect(result instanceof UrlTree).toBe(true);
    expect(result.toString()).toBe(expected.toString());
  });

  it('allows authenticated users', () => {
    TestBed.inject(AuthService).setAuth(USER);
    expect(runGuard()).toBe(true);
  });
});
