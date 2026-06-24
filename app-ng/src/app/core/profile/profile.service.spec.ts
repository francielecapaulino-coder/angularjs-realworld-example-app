import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ProfileService } from './profile.service';
import { APP_CONSTANTS } from '../config/app.constants';

describe('ProfileService', () => {
  let service: ProfileService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProfileService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('follow POSTs to /profiles/:username/follow', () => {
    service.follow('demo').subscribe();
    const req = httpMock.expectOne(`${APP_CONSTANTS.apiBase}/profiles/demo/follow`);
    expect(req.request.method).toBe('POST');
    req.flush({ profile: { username: 'demo', following: true } });
  });

  it('unfollow DELETEs /profiles/:username/follow', () => {
    service.unfollow('demo').subscribe();
    const req = httpMock.expectOne(`${APP_CONSTANTS.apiBase}/profiles/demo/follow`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ profile: { username: 'demo', following: false } });
  });

  it('get GETs /profiles/:username', () => {
    service.get('demo').subscribe();
    const req = httpMock.expectOne(`${APP_CONSTANTS.apiBase}/profiles/demo`);
    expect(req.request.method).toBe('GET');
    req.flush({ profile: { username: 'demo', following: false } });
  });
});
