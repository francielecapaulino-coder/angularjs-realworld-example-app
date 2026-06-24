import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { CommentsService } from './comments.service';
import { APP_CONSTANTS } from '../config/app.constants';

describe('CommentsService', () => {
  let service: CommentsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CommentsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('GET /articles/:slug/comments and unwraps the comments array', async () => {
    const result = new Promise<unknown[]>((resolve) => {
      service.getAll('a-1').subscribe((comments) => resolve(comments));
    });
    const req = httpMock.expectOne(`${APP_CONSTANTS.apiBase}/articles/a-1/comments`);
    expect(req.request.method).toBe('GET');
    req.flush({ comments: [{ id: 1, body: 'hi' }] });
    expect((await result).length).toBe(1);
  });
});
