import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TagsService } from './tags.service';
import { APP_CONSTANTS } from '../config/app.constants';

describe('TagsService', () => {
  let service: TagsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TagsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('GET /tags and unwraps the tags array', async () => {
    const result = new Promise<string[]>((resolve) => {
      service.getAll().subscribe((tags) => resolve(tags));
    });
    const req = httpMock.expectOne(`${APP_CONSTANTS.apiBase}/tags`);
    expect(req.request.method).toBe('GET');
    req.flush({ tags: ['angular', 'rxjs'] });
    expect(await result).toEqual(['angular', 'rxjs']);
  });
});
