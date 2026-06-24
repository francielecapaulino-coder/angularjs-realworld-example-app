import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ArticlePreviewComponent } from './article-preview.component';
import { Article } from '../core/models/article.model';

const ARTICLE: Article = {
  slug: 'a-1',
  title: 'Hello Angular',
  description: 'A description',
  body: 'body',
  tagList: ['ng', 'test'],
  createdAt: '2026-06-24T00:00:00.000Z',
  updatedAt: '2026-06-24T00:00:00.000Z',
  favorited: false,
  favoritesCount: 7,
  author: { username: 'demo', bio: null, image: null, following: false },
};

describe('ArticlePreviewComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArticlePreviewComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('renders title, description, author, tags and favorite count', () => {
    const fixture = TestBed.createComponent(ArticlePreviewComponent);
    fixture.componentInstance.article = ARTICLE;
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Hello Angular');
    expect(text).toContain('A description');
    expect(text).toContain('demo');
    expect(text).toContain('ng');
    expect(text).toContain('7');
  });

  it('links to the article detail route', () => {
    const fixture = TestBed.createComponent(ArticlePreviewComponent);
    fixture.componentInstance.article = ARTICLE;
    fixture.detectChanges();
    const link = (fixture.nativeElement as HTMLElement).querySelector('a.preview-link');
    expect(link?.getAttribute('href')).toContain('/article/a-1');
  });
});
