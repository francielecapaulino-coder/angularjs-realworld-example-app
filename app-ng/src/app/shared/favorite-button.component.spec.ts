import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { FavoriteButtonComponent } from './favorite-button.component';
import { AuthService, User } from '../core/auth/auth.service';
import { Article } from '../core/models/article.model';
import { APP_CONSTANTS } from '../core/config/app.constants';

const USER: User = {
  email: 'fav-010@example.test',
  username: 'user-010',
  bio: null,
  image: null,
  token: 'fake-jwt-token-010',
};

function makeArticle(): Article {
  return {
    slug: 'a-1',
    title: 'T',
    description: 'd',
    body: 'b',
    tagList: [],
    createdAt: '2026-06-24T00:00:00.000Z',
    updatedAt: '2026-06-24T00:00:00.000Z',
    favorited: false,
    favoritesCount: 3,
    author: { username: 'demo', bio: null, image: null, following: false },
  };
}

describe('FavoriteButtonComponent', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [FavoriteButtonComponent],
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
    const fixture = TestBed.createComponent(FavoriteButtonComponent);
    fixture.componentInstance.article = makeArticle();
    fixture.detectChanges();

    fixture.componentInstance.toggle();

    expect(navSpy).toHaveBeenCalledWith(['/register']);
    httpMock.expectNone(() => true); // no mutation attempted
  });

  it('authenticated favorite POSTs and updates state optimistically', () => {
    TestBed.inject(AuthService).setAuth(USER);
    const fixture = TestBed.createComponent(FavoriteButtonComponent);
    const article = makeArticle();
    fixture.componentInstance.article = article;
    fixture.detectChanges();

    fixture.componentInstance.toggle();
    const req = httpMock.expectOne(`${APP_CONSTANTS.apiBase}/articles/a-1/favorite`);
    expect(req.request.method).toBe('POST');
    req.flush({ article: { ...article, favorited: true, favoritesCount: 4 } });

    expect(article.favorited).toBe(true);
    expect(article.favoritesCount).toBe(4);
  });

  it('authenticated unfavorite DELETEs when already favorited', () => {
    TestBed.inject(AuthService).setAuth(USER);
    const fixture = TestBed.createComponent(FavoriteButtonComponent);
    const article = { ...makeArticle(), favorited: true, favoritesCount: 4 };
    fixture.componentInstance.article = article;
    fixture.detectChanges();

    fixture.componentInstance.toggle();
    const req = httpMock.expectOne(`${APP_CONSTANTS.apiBase}/articles/a-1/favorite`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ article: { ...article, favorited: false, favoritesCount: 3 } });

    expect(article.favorited).toBe(false);
    expect(article.favoritesCount).toBe(3);
  });
});
