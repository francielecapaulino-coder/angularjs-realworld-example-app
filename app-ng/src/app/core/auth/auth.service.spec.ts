import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { AuthService, User } from './auth.service';
import { JwtService } from './jwt.service';
import { APP_CONSTANTS } from '../config/app.constants';

const FAKE_TOKEN = 'fake-jwt-token-006';
const MOCK_USER: User = {
  email: 'test-006@example.test',
  username: 'user-006',
  bio: null,
  image: null,
  token: FAKE_TOKEN,
};

describe('AuthService', () => {
  let auth: AuthService;
  let httpMock: HttpTestingController;
  let jwt: JwtService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    auth = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    jwt = TestBed.inject(JwtService);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('starts unauthenticated', () => {
    expect(auth.isAuthenticated()).toBe(false);
    expect(auth.currentUser()).toBeNull();
  });

  it('setAuth stores token and exposes the current user signal', () => {
    auth.setAuth(MOCK_USER);
    expect(jwt.get()).toBe(FAKE_TOKEN);
    expect(auth.isAuthenticated()).toBe(true);
    expect(auth.currentUser()?.username).toBe('user-006');
  });

  it('purgeAuth clears token and user', () => {
    auth.setAuth(MOCK_USER);
    auth.purgeAuth();
    expect(jwt.get()).toBeNull();
    expect(auth.isAuthenticated()).toBe(false);
    expect(auth.currentUser()).toBeNull();
  });

  it('verifyAuth resolves false without a token and makes no request', async () => {
    const ok = await new Promise<boolean>((resolve) => {
      auth.verifyAuth().subscribe((value) => resolve(value));
    });
    expect(ok).toBe(false);
    httpMock.expectNone(`${APP_CONSTANTS.apiBase}/user`);
  });

  it('verifyAuth fetches GET /user and sets the user when a token exists', async () => {
    jwt.save(FAKE_TOKEN);
    const result = new Promise<boolean>((resolve) => {
      auth.verifyAuth().subscribe((value) => resolve(value));
    });
    const req = httpMock.expectOne(`${APP_CONSTANTS.apiBase}/user`);
    expect(req.request.method).toBe('GET');
    req.flush({ user: MOCK_USER });
    expect(await result).toBe(true);
    expect(auth.currentUser()?.username).toBe('user-006');
  });

  it('verifyAuth purges auth when GET /user fails', async () => {
    jwt.save(FAKE_TOKEN);
    const result = new Promise<boolean>((resolve) => {
      auth.verifyAuth().subscribe((value) => resolve(value));
    });
    const req = httpMock.expectOne(`${APP_CONSTANTS.apiBase}/user`);
    req.flush({ errors: {} }, { status: 401, statusText: 'Unauthorized' });
    expect(await result).toBe(false);
    expect(auth.isAuthenticated()).toBe(false);
    expect(jwt.get()).toBeNull();
  });
});
