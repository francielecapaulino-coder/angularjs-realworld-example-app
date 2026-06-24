import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ArticleActionsComponent } from './article-actions.component';
import { AuthService, User } from '../core/auth/auth.service';
import { Article } from '../core/models/article.model';

function makeArticle(authorName = 'demo'): Article {
  return {
    slug: 'a-1',
    title: 'T',
    description: 'd',
    body: 'b',
    tagList: [],
    createdAt: '2026-06-24T00:00:00.000Z',
    updatedAt: '2026-06-24T00:00:00.000Z',
    favorited: false,
    favoritesCount: 0,
    author: { username: authorName, bio: null, image: null, following: false },
  };
}

function userNamed(username: string): User {
  return { email: `${username}@example.test`, username, bio: null, image: null, token: 't' };
}

describe('ArticleActionsComponent', () => {
  let auth: AuthService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [ArticleActionsComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    auth = TestBed.inject(AuthService);
  });

  // Regression for the legacy bug: when authenticated and viewing someone else's
  // article, the Follow + Favorite buttons MUST render (legacy crashed here).
  it('renders Follow + Favorite for an authenticated non-author', () => {
    auth.setAuth(userNamed('reader'));
    const fixture = TestBed.createComponent(ArticleActionsComponent);
    fixture.componentInstance.article = makeArticle('demo');
    fixture.detectChanges();

    const html = fixture.nativeElement as HTMLElement;
    expect(html.querySelector('app-follow-button')).toBeTruthy();
    expect(html.querySelector('app-favorite-button')).toBeTruthy();
    expect(html.textContent).not.toContain('Edit Article');
  });

  it('renders Edit + Delete for the article author', () => {
    auth.setAuth(userNamed('demo'));
    const fixture = TestBed.createComponent(ArticleActionsComponent);
    fixture.componentInstance.article = makeArticle('demo');
    fixture.detectChanges();

    const html = fixture.nativeElement as HTMLElement;
    expect(html.textContent).toContain('Edit Article');
    expect(html.textContent).toContain('Delete Article');
    expect(html.querySelector('app-follow-button')).toBeNull();
  });

  it('anonymous visitor sees Follow + Favorite (not Edit)', () => {
    const fixture = TestBed.createComponent(ArticleActionsComponent);
    fixture.componentInstance.article = makeArticle('demo');
    fixture.detectChanges();

    const html = fixture.nativeElement as HTMLElement;
    expect(html.querySelector('app-favorite-button')).toBeTruthy();
    expect(html.textContent).not.toContain('Edit Article');
  });

  it('emits deleteArticle when the author clicks Delete', () => {
    auth.setAuth(userNamed('demo'));
    const fixture = TestBed.createComponent(ArticleActionsComponent);
    fixture.componentInstance.article = makeArticle('demo');
    let emitted = false;
    fixture.componentInstance.deleteArticle.subscribe(() => (emitted = true));
    fixture.detectChanges();

    const deleteBtn = (fixture.nativeElement as HTMLElement).querySelector(
      'button.btn-outline-danger',
    ) as HTMLButtonElement;
    deleteBtn.click();
    expect(emitted).toBe(true);
  });
});
