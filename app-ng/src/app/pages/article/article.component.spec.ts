import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ArticleComponent } from './article.component';
import { AuthService, User } from '../../core/auth/auth.service';
import { APP_CONSTANTS } from '../../core/config/app.constants';

const ARTICLE = {
  slug: 'a-1',
  title: 'Hello Article',
  description: 'desc',
  body: '# Heading\n\nBody **bold**.',
  tagList: ['ng', 'test'],
  createdAt: '2026-06-24T00:00:00.000Z',
  updatedAt: '2026-06-24T00:00:00.000Z',
  favorited: false,
  favoritesCount: 2,
  author: { username: 'demo', bio: null, image: null, following: false },
};

const MOCK_USER: User = {
  email: 'a-009@example.test',
  username: 'user-009',
  bio: null,
  image: null,
  token: 'fake-jwt-token-009',
};

function setup() {
  TestBed.configureTestingModule({
    imports: [ArticleComponent],
    providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
  });
  const fixture = TestBed.createComponent(ArticleComponent);
  fixture.componentInstance.slug = 'a-1';
  const httpMock = TestBed.inject(HttpTestingController);
  return { fixture, httpMock };
}

function flush(httpMock: HttpTestingController, comments: unknown[] = []) {
  httpMock.expectOne(`${APP_CONSTANTS.apiBase}/articles/a-1`).flush({ article: ARTICLE });
  httpMock
    .expectOne(`${APP_CONSTANTS.apiBase}/articles/a-1/comments`)
    .flush({ comments });
}

describe('ArticleComponent', () => {
  beforeEach(() => localStorage.clear());

  it('renders the article title, sanitized body and tags', () => {
    const { fixture, httpMock } = setup();
    fixture.detectChanges();
    flush(httpMock);
    fixture.detectChanges();

    const html = fixture.nativeElement as HTMLElement;
    expect(html.textContent).toContain('Hello Article');
    expect(html.querySelector('.article-content h1')).toBeTruthy(); // markdown rendered
    expect(html.textContent).toContain('ng');
    httpMock.verify();
  });

  it('shows the sign-in prompt for anonymous users', () => {
    const { fixture, httpMock } = setup();
    fixture.detectChanges();
    flush(httpMock);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Sign in');
    expect(text).toContain('to add comments');
    httpMock.verify();
  });

  it('shows the (disabled) comment form for authenticated users', () => {
    const { fixture, httpMock } = setup();
    TestBed.inject(AuthService).setAuth(MOCK_USER);
    fixture.detectChanges();
    flush(httpMock);
    fixture.detectChanges();

    const html = fixture.nativeElement as HTMLElement;
    expect(html.querySelector('form.comment-form')).toBeTruthy();
    httpMock.verify();
  });

  it('renders comments', () => {
    const { fixture, httpMock } = setup();
    fixture.detectChanges();
    flush(httpMock, [
      {
        id: 1,
        body: 'Nice post',
        createdAt: '2026-06-24T00:00:00.000Z',
        updatedAt: '2026-06-24T00:00:00.000Z',
        author: { username: 'reader', bio: null, image: null, following: false },
      },
    ]);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Nice post');
    expect(text).toContain('reader');
    httpMock.verify();
  });
});
