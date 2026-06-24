import { Pipe, PipeTransform, SecurityContext, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { marked } from 'marked';

/**
 * Renders untrusted markdown to SANITIZED HTML (ADR-001: marked + DomSanitizer).
 *
 * Security: the article body is untrusted user content. We parse it with `marked`
 * and then run the result through Angular's `DomSanitizer.sanitize(HTML, ...)`,
 * which strips scripts, event handlers and dangerous URLs. We DO NOT use
 * `bypassSecurityTrustHtml`. The pipe returns a plain string bound via
 * `[innerHTML]`, which Angular sanitizes again — defense in depth.
 */
@Pipe({ name: 'markdown', standalone: true })
export class MarkdownPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);

  transform(value: string | null | undefined): string {
    if (!value) {
      return '';
    }
    // marked.parse is synchronous for string input with default options.
    const rawHtml = marked.parse(value, { async: false }) as string;
    return this.sanitizer.sanitize(SecurityContext.HTML, rawHtml) ?? '';
  }
}
