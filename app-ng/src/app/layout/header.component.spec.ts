import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { HeaderComponent } from './header.component';
import { AuthService, User } from '../core/auth/auth.service';

const MOCK_USER: User = {
  email: 'test-006@example.test',
  username: 'user-006',
  bio: null,
  image: null,
  token: 'fake-jwt-token-006',
};

describe('HeaderComponent', () => {
  let auth: AuthService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    auth = TestBed.inject(AuthService);
  });

  it('shows Sign in / Sign up links when logged out', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Sign in');
    expect(text).toContain('Sign up');
    expect(text).not.toContain('New Article');
  });

  it('shows New Article / Settings / username when logged in', () => {
    auth.setAuth(MOCK_USER);
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('New Article');
    expect(text).toContain('Settings');
    expect(text).toContain('user-006');
    expect(text).not.toContain('Sign in');
  });

  it('renders a theme toggle button that flips data-theme on click', () => {
    document.documentElement.removeAttribute('data-theme');
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();

    const button = (fixture.nativeElement as HTMLElement).querySelector(
      'button.theme-toggle',
    ) as HTMLButtonElement | null;
    expect(button).toBeTruthy();
    expect(button!.getAttribute('aria-label')).toContain('dark');

    button!.click();
    fixture.detectChanges();

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    // aria-label now offers switching back to light.
    expect(button!.getAttribute('aria-label')).toContain('light');
  });
});
