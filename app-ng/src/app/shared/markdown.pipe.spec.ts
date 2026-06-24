import { TestBed } from '@angular/core/testing';
import { MarkdownPipe } from './markdown.pipe';

describe('MarkdownPipe', () => {
  let pipe: MarkdownPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    pipe = TestBed.runInInjectionContext(() => new MarkdownPipe());
  });

  it('returns empty string for null/empty input', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform('')).toBe('');
  });

  it('renders basic markdown to HTML', () => {
    const html = pipe.transform('# Title\n\nSome **bold** text.');
    expect(html).toContain('<h1');
    expect(html).toContain('Title');
    expect(html).toContain('<strong>bold</strong>');
  });

  // --- XSS / sanitization (security-critical) ---

  it('strips <script> tags from the output', () => {
    const html = pipe.transform('Hello\n\n<script>alert("xss")</script>');
    expect(html.toLowerCase()).not.toContain('<script');
    expect(html.toLowerCase()).not.toContain('alert("xss")');
  });

  it('removes inline event handlers (onerror/onclick)', () => {
    const html = pipe.transform('<img src="x" onerror="alert(1)">');
    expect(html.toLowerCase()).not.toContain('onerror');
  });

  it('neutralizes javascript: URLs in links (prefixes with unsafe:)', () => {
    const html = pipe.transform('[click](javascript:alert(1))');
    // Angular's sanitizer rewrites dangerous URLs to an inert "unsafe:" form,
    // so the browser will not execute them. There must be no executable
    // href="javascript:..." in the output.
    expect(html.toLowerCase()).not.toContain('href="javascript:');
    expect(html.toLowerCase()).toContain('unsafe:');
  });

  it('keeps safe links intact', () => {
    const html = pipe.transform('[ng](https://angular.dev)');
    expect(html).toContain('href="https://angular.dev"');
  });
});
