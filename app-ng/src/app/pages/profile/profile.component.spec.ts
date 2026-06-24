import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ProfileComponent } from './profile.component';
import { AuthService, User } from '../../core/auth/auth.service';
import { APP_CONSTANTS } from '../../core/config/app.constants';

const PROFILE = { username: 'demo', bio: 'A bio', image: null, following: false };

function userNamed(username: string): User {
  return { email: `${username}@example.test`, username, bio: null, image: null, token: 't' };
}

function setup(username = 'demo') {
  TestBed.configureTestingModule({
    imports: [ProfileComponent],
    providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
  });
  const fixture = TestBed.createComponent(ProfileComponent);
  fixture.componentInstance.username = username;
  const httpMock = TestBed.inject(HttpTestingController);
  return { fixture, httpMock };
}

function flushProfile(httpMock: HttpTestingController, profile = PROFILE) {
  httpMock.expectOne(`${APP_CONSTANTS.apiBase}/profiles/${profile.username}`).flush({ profile });
}

describe('ProfileComponent', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('loads the profile and defaults to the My Articles tab (author filter)', () => {
    const { fixture, httpMock } = setup('demo');
    fixture.detectChanges();
    flushProfile(httpMock);
    fixture.detectChanges();

    expect(fixture.componentInstance.profile()?.username).toBe('demo');
    expect(fixture.componentInstance.listConfig()).toEqual({
      type: 'all',
      filters: { author: 'demo' },
    });
    // ArticleList fired its initial query for the author tab.
    httpMock
      .expectOne((r) => r.url === `${APP_CONSTANTS.apiBase}/articles`)
      .flush({ articles: [], articlesCount: 0 });
    httpMock.verify();
  });

  it('switching to Favorited uses the favorited filter', () => {
    const { fixture, httpMock } = setup('demo');
    fixture.detectChanges();
    flushProfile(httpMock);
    fixture.detectChanges();
    httpMock
      .expectOne((r) => r.url === `${APP_CONSTANTS.apiBase}/articles`)
      .flush({ articles: [], articlesCount: 0 });

    fixture.componentInstance.selectTab('favorited');
    expect(fixture.componentInstance.listConfig()).toEqual({
      type: 'all',
      filters: { favorited: 'demo' },
    });
    fixture.detectChanges();
    httpMock
      .expectOne((r) => r.url === `${APP_CONSTANTS.apiBase}/articles`)
      .flush({ articles: [], articlesCount: 0 });
    httpMock.verify();
  });

  it('shows Edit Profile Settings on the own profile (no follow button)', () => {
    TestBed.configureTestingModule({});
    const { fixture, httpMock } = setup('demo');
    TestBed.inject(AuthService).setAuth(userNamed('demo'));
    fixture.detectChanges();
    flushProfile(httpMock);
    fixture.detectChanges();
    httpMock
      .expectOne((r) => r.url === `${APP_CONSTANTS.apiBase}/articles`)
      .flush({ articles: [], articlesCount: 0 });

    const html = fixture.nativeElement as HTMLElement;
    expect(html.textContent).toContain('Edit Profile Settings');
    expect(html.querySelector('app-follow-button')).toBeNull();
    httpMock.verify();
  });

  it('shows the follow button on another user profile', () => {
    const { fixture, httpMock } = setup('demo');
    TestBed.inject(AuthService).setAuth(userNamed('reader'));
    fixture.detectChanges();
    flushProfile(httpMock);
    fixture.detectChanges();
    httpMock
      .expectOne((r) => r.url === `${APP_CONSTANTS.apiBase}/articles`)
      .flush({ articles: [], articlesCount: 0 });

    const html = fixture.nativeElement as HTMLElement;
    expect(html.querySelector('app-follow-button')).toBeTruthy();
    expect(html.textContent).not.toContain('Edit Profile Settings');
    httpMock.verify();
  });
});
