import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ArticleListComponent } from './article-list.component';
import { Article } from '../core/models/article.model';
import { APP_CONSTANTS } from '../core/config/app.constants';

function makeArticle(slug: string): Article {
  return {
    slug,
    title: `T-${slug}`,
    description: 'd',
    body: 'b',
    tagList: [],
    createdAt: '2026-06-24T00:00:00.000Z',
    updatedAt: '2026-06-24T00:00:00.000Z',
    favorited: false,
    favoritesCount: 0,
    author: { username: 'demo', bio: null, image: null, following: false },
  };
}

describe('ArticleListComponent', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArticleListComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('fetches with offset = limit*(page-1) and computes totalPages', () => {
    const fixture = TestBed.createComponent(ArticleListComponent);
    fixture.componentInstance.limit = 10;
    fixture.componentInstance.listConfig = { type: 'all' };
    // Direct property assignment does not trigger ngOnChanges in unit tests;
    // invoke it explicitly (in the app it fires via the template binding).
    fixture.componentInstance.ngOnChanges();

    const req = httpMock.expectOne(
      (r) => r.url === `${APP_CONSTANTS.apiBase}/articles`,
    );
    expect(req.request.params.get('offset')).toBe('0');
    req.flush({ articles: [makeArticle('a')], articlesCount: 25 });
    fixture.detectChanges();

    // 25 / 10 → 3 pages
    expect(fixture.componentInstance.totalPages()).toBe(3);
    expect(fixture.componentInstance.articles().length).toBe(1);
  });

  it('renders the empty state when no articles', () => {
    const fixture = TestBed.createComponent(ArticleListComponent);
    fixture.componentInstance.listConfig = { type: 'all' };
    fixture.componentInstance.ngOnChanges();
    const req = httpMock.expectOne((r) => r.url === `${APP_CONSTANTS.apiBase}/articles`);
    req.flush({ articles: [], articlesCount: 0 });
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('No articles are here');
  });

  it('setPage(2) requests offset = limit', () => {
    const fixture = TestBed.createComponent(ArticleListComponent);
    fixture.componentInstance.limit = 10;
    fixture.componentInstance.listConfig = { type: 'all' };
    fixture.componentInstance.ngOnChanges();
    httpMock.expectOne((r) => r.url === `${APP_CONSTANTS.apiBase}/articles`).flush({
      articles: [],
      articlesCount: 30,
    });

    fixture.componentInstance.setPage(2);
    const req = httpMock.expectOne((r) => r.url === `${APP_CONSTANTS.apiBase}/articles`);
    expect(req.request.params.get('offset')).toBe('10');
    req.flush({ articles: [], articlesCount: 30 });
  });
});
