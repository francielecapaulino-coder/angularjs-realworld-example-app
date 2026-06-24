import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { FollowButtonComponent } from './follow-button.component';
import { AuthService, User } from '../core/auth/auth.service';
import { Profile } from '../core/models/article.model';
import { APP_CONSTANTS } from '../core/config/app.constants';

const USER: User = {
  email: 'fol-010@example.test',
  username: 'user-010',
  bio: null,
  image: null,
  token: 'fake-jwt-token-010',
};

function makeProfile(): Profile {
  return { username: 'demo', bio: null, image: null, following: false };
}

describe('FollowButtonComponent', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [FollowButtonComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('anonymous click redirects to /register and makes NO request', () => {
    const router = TestBed.inject(Router);
    const navSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(FollowButtonComponent);
    fixture.componentInstance.user = makeProfile();
    fixture.detectChanges();

    fixture.componentInstance.toggle();

    expect(navSpy).toHaveBeenCalledWith(['/register']);
    httpMock.expectNone(() => true);
  });

  it('authenticated follow POSTs and sets following=true', () => {
    TestBed.inject(AuthService).setAuth(USER);
    const fixture = TestBed.createComponent(FollowButtonComponent);
    const profile = makeProfile();
    fixture.componentInstance.user = profile;
    fixture.detectChanges();

    fixture.componentInstance.toggle();
    const req = httpMock.expectOne(`${APP_CONSTANTS.apiBase}/profiles/demo/follow`);
    expect(req.request.method).toBe('POST');
    req.flush({ profile: { ...profile, following: true } });

    expect(profile.following).toBe(true);
  });

  it('authenticated unfollow DELETEs when already following', () => {
    TestBed.inject(AuthService).setAuth(USER);
    const fixture = TestBed.createComponent(FollowButtonComponent);
    const profile = { ...makeProfile(), following: true };
    fixture.componentInstance.user = profile;
    fixture.detectChanges();

    fixture.componentInstance.toggle();
    const req = httpMock.expectOne(`${APP_CONSTANTS.apiBase}/profiles/demo/follow`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ profile: { ...profile, following: false } });

    expect(profile.following).toBe(false);
  });
});
