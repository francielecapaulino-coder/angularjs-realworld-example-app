import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ArticlesService } from './articles.service';
import { APP_CONSTANTS } from '../config/app.constants';

describe('ArticlesService', () => {
  let service: ArticlesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ArticlesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('queries the global feed at GET /articles with paging params', () => {
    service.query({ type: 'all', filters: { limit: 10, offset: 20 } }).subscribe();
    const req = httpMock.expectOne(
      (r) => r.url === `${APP_CONSTANTS.apiBase}/articles`,
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('limit')).toBe('10');
    expect(req.request.params.get('offset')).toBe('20');
    req.flush({ articles: [], articlesCount: 0 });
  });

  it('queries the personal feed at GET /articles/feed', () => {
    service.query({ type: 'feed', filters: { limit: 10, offset: 0 } }).subscribe();
    const req = httpMock.expectOne(
      (r) => r.url === `${APP_CONSTANTS.apiBase}/articles/feed`,
    );
    expect(req.request.method).toBe('GET');
    req.flush({ articles: [], articlesCount: 0 });
  });

  it('passes the tag filter as a query param', () => {
    service.query({ type: 'all', filters: { tag: 'angular' } }).subscribe();
    const req = httpMock.expectOne(
      (r) => r.url === `${APP_CONSTANTS.apiBase}/articles`,
    );
    expect(req.request.params.get('tag')).toBe('angular');
    req.flush({ articles: [], articlesCount: 0 });
  });

  it('omits empty/undefined filters', () => {
    service.query({ type: 'all', filters: { tag: '', limit: 10 } }).subscribe();
    const req = httpMock.expectOne(
      (r) => r.url === `${APP_CONSTANTS.apiBase}/articles`,
    );
    expect(req.request.params.has('tag')).toBe(false);
    expect(req.request.params.get('limit')).toBe('10');
    req.flush({ articles: [], articlesCount: 0 });
  });
});
