import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { HomeComponent } from './home.component';
import { AuthService, User } from '../../core/auth/auth.service';
import { APP_CONSTANTS } from '../../core/config/app.constants';

const MOCK_USER: User = {
  email: 'home-008@example.test',
  username: 'user-008',
  bio: null,
  image: null,
  token: 'fake-jwt-token-008',
};

function setup() {
  TestBed.configureTestingModule({
    imports: [HomeComponent],
    providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
  });
  const fixture = TestBed.createComponent(HomeComponent);
  const httpMock = TestBed.inject(HttpTestingController);
  return { fixture, httpMock };
}

/** Flushes the tags + initial article-list requests triggered on init. */
function flushInitial(httpMock: HttpTestingController) {
  httpMock.expectOne(`${APP_CONSTANTS.apiBase}/tags`).flush({ tags: ['ng'] });
  const articleReq = httpMock.match((r) => r.url.includes('/articles'));
  articleReq.forEach((r) => r.flush({ articles: [], articlesCount: 0 }));
}

describe('HomeComponent', () => {
  beforeEach(() => localStorage.clear());

  it('shows the banner and Global Feed for anonymous users (no Your Feed tab)', () => {
    const { fixture, httpMock } = setup();
    fixture.detectChanges();
    flushInitial(httpMock);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('A place to share your knowledge.');
    expect(text).toContain('Global Feed');
    expect(text).not.toContain('Your Feed');
    httpMock.verify();
  });

  it('hides the banner and defaults to Your Feed when authenticated', () => {
    const { fixture, httpMock } = setup();
    TestBed.inject(AuthService).setAuth(MOCK_USER);
    fixture.detectChanges();

    httpMock.expectOne(`${APP_CONSTANTS.apiBase}/tags`).flush({ tags: ['ng'] });
    // authenticated default tab → personal feed
    const feedReq = httpMock.expectOne((r) => r.url === `${APP_CONSTANTS.apiBase}/articles/feed`);
    feedReq.flush({ articles: [], articlesCount: 0 });
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Your Feed');
    expect(text).not.toContain('A place to share your knowledge.');
    httpMock.verify();
  });

  it('renders popular tags in the sidebar', () => {
    const { fixture, httpMock } = setup();
    fixture.detectChanges();
    httpMock.expectOne(`${APP_CONSTANTS.apiBase}/tags`).flush({ tags: ['angular', 'rxjs'] });
    httpMock.match((r) => r.url.includes('/articles')).forEach((r) =>
      r.flush({ articles: [], articlesCount: 0 }),
    );
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Popular Tags');
    expect(text).toContain('angular');
    expect(text).toContain('rxjs');
    httpMock.verify();
  });
});
