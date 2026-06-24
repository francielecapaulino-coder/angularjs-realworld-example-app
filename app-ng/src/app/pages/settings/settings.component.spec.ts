import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { SettingsComponent } from './settings.component';
import { AuthService, User } from '../../core/auth/auth.service';
import { JwtService } from '../../core/auth/jwt.service';
import { APP_CONSTANTS } from '../../core/config/app.constants';

const USER: User = {
  email: 'set-012@example.test',
  username: 'user-012',
  bio: 'Old bio',
  image: null,
  token: 'fake-jwt-token-012',
};

function setup() {
  TestBed.configureTestingModule({
    imports: [SettingsComponent],
    providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
  });
  const auth = TestBed.inject(AuthService);
  auth.setAuth(USER);
  const fixture = TestBed.createComponent(SettingsComponent);
  const httpMock = TestBed.inject(HttpTestingController);
  return { fixture, httpMock, auth };
}

describe('SettingsComponent', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('prefills the form from the current user', () => {
    const { fixture, httpMock } = setup();
    fixture.detectChanges();
    expect(fixture.componentInstance.form.getRawValue().username).toBe('user-012');
    expect(fixture.componentInstance.form.getRawValue().email).toBe('set-012@example.test');
    expect(fixture.componentInstance.form.getRawValue().bio).toBe('Old bio');
    httpMock.verify();
  });

  it('submit PUTs /user (omitting empty password) and navigates to the profile', () => {
    const { fixture, httpMock } = setup();
    const navSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    fixture.detectChanges();

    fixture.componentInstance.form.patchValue({ bio: 'New bio' });
    fixture.componentInstance.submit();

    const req = httpMock.expectOne(`${APP_CONSTANTS.apiBase}/user`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body.user.password).toBeUndefined();
    expect(req.request.body.user.bio).toBe('New bio');
    req.flush({ user: { ...USER, bio: 'New bio' } });

    expect(navSpy).toHaveBeenCalledWith(['/profile', 'user-012']);
    httpMock.verify();
  });

  it('includes password only when provided', () => {
    const { fixture, httpMock } = setup();
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    fixture.detectChanges();

    fixture.componentInstance.form.patchValue({ password: 'newsecret' });
    fixture.componentInstance.submit();

    const req = httpMock.expectOne(`${APP_CONSTANTS.apiBase}/user`);
    expect(req.request.body.user.password).toBe('newsecret');
    req.flush({ user: USER });
    httpMock.verify();
  });

  it('logout purges the session and navigates home', () => {
    const { fixture, httpMock, auth } = setup();
    const jwt = TestBed.inject(JwtService);
    const navSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    fixture.detectChanges();

    fixture.componentInstance.logout();

    expect(auth.isAuthenticated()).toBe(false);
    expect(jwt.get()).toBeNull();
    expect(navSpy).toHaveBeenCalledWith(['/']);
    httpMock.verify();
  });

  it('renders API errors on failure', () => {
    const { fixture, httpMock } = setup();
    fixture.detectChanges();

    fixture.componentInstance.submit();
    const req = httpMock.expectOne(`${APP_CONSTANTS.apiBase}/user`);
    req.flush(
      { errors: { email: ['is invalid'] } },
      { status: 422, statusText: 'Unprocessable' },
    );
    fixture.detectChanges();

    expect(fixture.componentInstance.errors()).toEqual({ email: ['is invalid'] });
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('is invalid');
    httpMock.verify();
  });
});
