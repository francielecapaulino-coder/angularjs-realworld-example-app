import { Component, Input, OnInit, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { ArticlesService, ArticleInput } from '../../core/articles/articles.service';
import { ApiErrors, ListErrorsComponent } from '../../shared/list-errors.component';

/** localStorage key holding the in-progress new-article draft. */
export const EDITOR_DRAFT_KEY = 'conduit-editor-draft';

interface EditorDraft {
  title: string;
  description: string;
  body: string;
  tagList: string[];
}

/**
 * Article editor (mirrors legacy src/js/editor/editor.{controller.js,html}).
 * New article → POST /articles; edit (route has :slug) → load via GET, then PUT.
 * The route is protected by authGuard, so only authenticated users reach it.
 *
 * Draft autosave (new-article mode only): the form + tag list are persisted to
 * localStorage ('conduit-editor-draft') while typing and restored on reopen/refresh,
 * then cleared on a successful submit. Edit mode (:slug) never uses the draft, to
 * avoid clobbering the content loaded from the backend.
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

  /** True once the component has initialised, so autosave does not fire during restore. */
  private ready = false;

  constructor() {
    // Autosave the form (debounced) while editing a NEW article.
    this.form.valueChanges.pipe(debounceTime(400), takeUntilDestroyed()).subscribe(() => {
      this.saveDraft();
    });
    // Autosave when tags change (tags live outside the reactive form).
    effect(() => {
      this.tagList(); // track
      this.saveDraft();
    });
  }

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
    } else {
      this.restoreDraft();
    }
    this.ready = true;
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
      next: (article) => {
        this.clearDraft();
        this.router.navigate(['/article', article.slug]);
      },
      error: (err) => {
        this.submitting.set(false);
        this.errors.set((err.error?.errors as ApiErrors) ?? { error: ['request failed'] });
      },
    });
  }

  /** Persist the current form + tags as a draft (new-article mode only). */
  private saveDraft(): void {
    if (this.slug || !this.ready) {
      return; // never in edit mode; skip while restoring
    }
    const draft: EditorDraft = {
      ...this.form.getRawValue(),
      tagList: this.tagList(),
    };
    if (!draft.title && !draft.description && !draft.body && draft.tagList.length === 0) {
      this.clearDraft(); // nothing to keep
      return;
    }
    try {
      localStorage.setItem(EDITOR_DRAFT_KEY, JSON.stringify(draft));
    } catch {
      /* localStorage unavailable - ignore */
    }
  }

  /** Restore a previously saved draft into the form and tag list, if any. */
  private restoreDraft(): void {
    const draft = this.readDraft();
    if (!draft) {
      return;
    }
    this.form.patchValue({
      title: draft.title,
      description: draft.description,
      body: draft.body,
    });
    this.tagList.set([...draft.tagList]);
  }

  private readDraft(): EditorDraft | null {
    try {
      const raw = localStorage.getItem(EDITOR_DRAFT_KEY);
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw) as Partial<EditorDraft>;
      return {
        title: typeof parsed.title === 'string' ? parsed.title : '',
        description: typeof parsed.description === 'string' ? parsed.description : '',
        body: typeof parsed.body === 'string' ? parsed.body : '',
        tagList: Array.isArray(parsed.tagList) ? parsed.tagList.filter((t) => typeof t === 'string') : [],
      };
    } catch {
      return null;
    }
  }

  private clearDraft(): void {
    try {
      localStorage.removeItem(EDITOR_DRAFT_KEY);
    } catch {
      /* localStorage unavailable - ignore */
    }
  }
}
