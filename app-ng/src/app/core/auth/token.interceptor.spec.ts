import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { tokenInterceptor } from './token.interceptor';
import { JwtService } from './jwt.service';
import { APP_CONSTANTS } from '../config/app.constants';

const FAKE_TOKEN = 'fake-jwt-token-006';

describe('tokenInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let jwt: JwtService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([tokenInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    jwt = TestBed.inject(JwtService);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('adds "Authorization: Token <jwt>" for API requests when a token exists', () => {
    jwt.save(FAKE_TOKEN);
    http.get(`${APP_CONSTANTS.apiBase}/user`).subscribe();
    const req = httpMock.expectOne(`${APP_CONSTANTS.apiBase}/user`);
    expect(req.request.headers.get('Authorization')).toBe(`Token ${FAKE_TOKEN}`);
    req.flush({ user: {} });
  });

  it('uses the "Token" scheme, NOT "Bearer"', () => {
    jwt.save(FAKE_TOKEN);
    http.get(`${APP_CONSTANTS.apiBase}/articles`).subscribe();
    const req = httpMock.expectOne(`${APP_CONSTANTS.apiBase}/articles`);
    const authHeader = req.request.headers.get('Authorization') ?? '';
    expect(authHeader.startsWith('Token ')).toBe(true);
    expect(authHeader.includes('Bearer')).toBe(false);
    req.flush({});
  });

  it('does NOT add the header when there is no token', () => {
    http.get(`${APP_CONSTANTS.apiBase}/articles`).subscribe();
    const req = httpMock.expectOne(`${APP_CONSTANTS.apiBase}/articles`);
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('does NOT send the token to non-API origins (no credential leak)', () => {
    jwt.save(FAKE_TOKEN);
    const externalUrl = 'https://demo.productionready.io/main.css';
    http.get(externalUrl).subscribe();
    const req = httpMock.expectOne(externalUrl);
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush('');
  });

  it('purges the stored token on a 401 response', () => {
    jwt.save(FAKE_TOKEN);
    http.get(`${APP_CONSTANTS.apiBase}/user`).subscribe({
      next: () => {},
      error: () => {},
    });
    const req = httpMock.expectOne(`${APP_CONSTANTS.apiBase}/user`);
    req.flush({ errors: { message: 'Unauthorized' } }, { status: 401, statusText: 'Unauthorized' });
    expect(jwt.get()).toBeNull();
  });
});
