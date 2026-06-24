import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { EditorComponent } from './editor.component';
import { APP_CONSTANTS } from '../../core/config/app.constants';

function setup(slug?: string) {
  TestBed.configureTestingModule({
    imports: [EditorComponent],
    providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
  });
  const fixture = TestBed.createComponent(EditorComponent);
  if (slug) {
    fixture.componentInstance.slug = slug;
  }
  const httpMock = TestBed.inject(HttpTestingController);
  return { fixture, httpMock };
}

const ARTICLE = {
  slug: 'a-1',
  title: 'Existing',
  description: 'Existing desc',
  body: 'Existing body',
  tagList: ['x', 'y'],
  createdAt: '2026-06-24T00:00:00.000Z',
  updatedAt: '2026-06-24T00:00:00.000Z',
  favorited: false,
  favoritesCount: 0,
  author: { username: 'demo', bio: null, image: null, following: false },
};

describe('EditorComponent', () => {
  afterEach(() => localStorage.clear());

  it('addTag adds unique tags and ignores duplicates/empties', () => {
    const { fixture, httpMock } = setup();
    fixture.detectChanges();
    const ed = fixture.componentInstance;

    ed.tagField.set('ng');
    ed.addTag();
    ed.tagField.set('ng'); // duplicate
    ed.addTag();
    ed.tagField.set('   '); // empty
    ed.addTag();

    expect(ed.tagList()).toEqual(['ng']);
    expect(ed.tagField()).toBe('');
    httpMock.verify();
  });

  it('removeTag removes the tag', () => {
    const { fixture, httpMock } = setup();
    fixture.detectChanges();
    const ed = fixture.componentInstance;
    ed.tagList.set(['a', 'b']);
    ed.removeTag('a');
    expect(ed.tagList()).toEqual(['b']);
    httpMock.verify();
  });

  it('new article POSTs and navigates to the created article', () => {
    const { fixture, httpMock } = setup();
    const navSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    fixture.detectChanges();
    const ed = fixture.componentInstance;

    ed.form.setValue({ title: 'New', description: 'D', body: 'B' });
    ed.tagList.set(['t']);
    ed.submit();

    const req = httpMock.expectOne(`${APP_CONSTANTS.apiBase}/articles`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      article: { title: 'New', description: 'D', body: 'B', tagList: ['t'] },
    });
    req.flush({ article: { ...ARTICLE, slug: 'new-slug' } });

    expect(navSpy).toHaveBeenCalledWith(['/article', 'new-slug']);
    httpMock.verify();
  });

  it('edit mode prefetches the article (GET) and submits a PUT', () => {
    const { fixture, httpMock } = setup('a-1');
    const navSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    fixture.detectChanges();

    // ngOnInit fetched the article to populate the form
    httpMock.expectOne(`${APP_CONSTANTS.apiBase}/articles/a-1`).flush({ article: ARTICLE });
    const ed = fixture.componentInstance;
    expect(ed.form.getRawValue().title).toBe('Existing');
    expect(ed.tagList()).toEqual(['x', 'y']);

    ed.submit();
    const req = httpMock.expectOne(`${APP_CONSTANTS.apiBase}/articles/a-1`);
    expect(req.request.method).toBe('PUT');
    req.flush({ article: { ...ARTICLE, slug: 'a-1' } });

    expect(navSpy).toHaveBeenCalledWith(['/article', 'a-1']);
    httpMock.verify();
  });

  it('does not submit when the form is invalid (no request)', () => {
    const { fixture, httpMock } = setup();
    fixture.detectChanges();
    fixture.componentInstance.submit(); // empty required fields
    httpMock.expectNone(() => true);
    httpMock.verify();
  });

  it('renders API validation errors on failure', () => {
    const { fixture, httpMock } = setup();
    fixture.detectChanges();
    const ed = fixture.componentInstance;
    ed.form.setValue({ title: 'New', description: 'D', body: 'B' });
    ed.submit();

    const req = httpMock.expectOne(`${APP_CONSTANTS.apiBase}/articles`);
    req.flush({ errors: { title: ["can't be blank"] } }, { status: 422, statusText: 'Unprocessable' });
    fixture.detectChanges();

    expect(ed.errors()).toEqual({ title: ["can't be blank"] });
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain("can't be blank");
    httpMock.verify();
  });
});
