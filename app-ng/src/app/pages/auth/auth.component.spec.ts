import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { AuthComponent } from './auth.component';
import { AuthService, User } from '../../core/auth/auth.service';
import { APP_CONSTANTS } from '../../core/config/app.constants';

const MOCK_USER: User = {
  email: 'auth-007@example.test',
  username: 'user-007',
  bio: null,
  image: null,
  token: 'fake-jwt-token-007',
};

function setup(authType: 'login' | 'register') {
  TestBed.configureTestingModule({
    imports: [AuthComponent],
    providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
  });
  const fixture = TestBed.createComponent(AuthComponent);
  fixture.componentInstance.authType = authType;
  fixture.detectChanges();
  return fixture;
}

describe('AuthComponent', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    httpMock?.verify();
    localStorage.clear();
  });

  it('login mode hides the username field', () => {
    const fixture = setup('login');
    httpMock = TestBed.inject(HttpTestingController);
    const html = fixture.nativeElement as HTMLElement;
    expect(html.querySelector('input[placeholder="Username"]')).toBeNull();
    expect(html.querySelector('input[placeholder="Email"]')).toBeTruthy();
    expect(html.querySelector('input[placeholder="Password"]')).toBeTruthy();
    expect(html.querySelector('h1')?.textContent).toContain('Sign in');
  });

  it('register mode shows the username field', () => {
    const fixture = setup('register');
    httpMock = TestBed.inject(HttpTestingController);
    const html = fixture.nativeElement as HTMLElement;
    expect(html.querySelector('input[placeholder="Username"]')).toBeTruthy();
    expect(html.querySelector('h1')?.textContent).toContain('Sign up');
  });

  it('successful login navigates to home and stores the session', async () => {
    const fixture = setup('login');
    httpMock = TestBed.inject(HttpTestingController);
    const router = TestBed.inject(Router);
    const navSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const auth = TestBed.inject(AuthService);

    fixture.componentInstance.form.setValue({
      username: '',
      email: 'auth-007@example.test',
      password: 'pw-not-real-007',
    });
    fixture.componentInstance.submitForm();

    const req = httpMock.expectOne(`${APP_CONSTANTS.apiBase}/users/login`);
    req.flush({ user: MOCK_USER });
    await fixture.whenStable();

    expect(navSpy).toHaveBeenCalledWith(['/']);
    expect(auth.isAuthenticated()).toBe(true);
  });

  it('shows server errors and does not authenticate on 422', async () => {
    const fixture = setup('login');
    httpMock = TestBed.inject(HttpTestingController);
    const auth = TestBed.inject(AuthService);

    fixture.componentInstance.form.setValue({
      username: '',
      email: 'auth-007@example.test',
      password: 'wrong',
    });
    fixture.componentInstance.submitForm();

    const req = httpMock.expectOne(`${APP_CONSTANTS.apiBase}/users/login`);
    req.flush(
      { errors: { 'email or password': ['is invalid'] } },
      { status: 422, statusText: 'Unprocessable Entity' },
    );
    await fixture.whenStable();
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('email or password is invalid');
    expect(auth.isAuthenticated()).toBe(false);
    expect(fixture.componentInstance.isSubmitting()).toBe(false);
  });
});
