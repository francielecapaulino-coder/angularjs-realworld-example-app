import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ArticlesService, ArticleInput } from '../../core/articles/articles.service';
import { ApiErrors, ListErrorsComponent } from '../../shared/list-errors.component';

/**
 * Article editor (mirrors legacy src/js/editor/editor.{controller.js,html}).
 * New article → POST /articles; edit (route has :slug) → load via GET, then PUT.
 * The route is protected by authGuard, so only authenticated users reach it.
 */
@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [ReactiveFormsModule, ListErrorsComponent],
  templateUrl: './editor.component.html',
})
export class EditorComponent implements OnInit {
  /** Present only on the edit route (/editor/:slug). */
  @Input() slug?: string;

  private readonly articles = inject(ArticlesService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    body: ['', Validators.required],
  });

  readonly tagField = signal('');
  readonly tagList = signal<string[]>([]);
  readonly submitting = signal(false);
  readonly errors = signal<ApiErrors | null>(null);

  ngOnInit(): void {
    if (this.slug) {
      this.articles.get(this.slug).subscribe({
        next: (article) => {
          this.form.patchValue({
            title: article.title,
            description: article.description,
            body: article.body,
          });
          this.tagList.set([...article.tagList]);
        },
      });
    }
  }

  addTag(): void {
    const tag = this.tagField().trim();
    if (tag && !this.tagList().includes(tag)) {
      this.tagList.update((tags) => [...tags, tag]);
    }
    this.tagField.set('');
  }

  removeTag(tagName: string): void {
    this.tagList.update((tags) => tags.filter((tag) => tag !== tagName));
  }

  submit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.errors.set(null);

    const payload: ArticleInput = {
      ...this.form.getRawValue(),
      tagList: this.tagList(),
    };

    const request = this.slug
      ? this.articles.update(this.slug, payload)
      : this.articles.create(payload);

    request.subscribe({
      next: (article) => this.router.navigate(['/article', article.slug]),
      error: (err) => {
        this.submitting.set(false);
        this.errors.set((err.error?.errors as ApiErrors) ?? { error: ['request failed'] });
      },
    });
  }
}
