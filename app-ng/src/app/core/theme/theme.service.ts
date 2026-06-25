import { Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

/** localStorage key holding the user's explicit theme choice. */
export const THEME_STORAGE_KEY = 'conduit-theme';

/**
 * Manages the light/dark theme.
 *
 * Resolution order on init:
 *   1. explicit choice persisted in localStorage ('conduit-theme'), if present;
 *   2. otherwise the OS preference via `prefers-color-scheme: dark`.
 *
 * The theme is applied to the document root as `data-theme="<theme>"`, which the
 * global stylesheet uses to override the Conduit design system for dark mode.
 *
 * An inline script in index.html applies the same attribute before CSS loads to
 * avoid a flash of the wrong theme (FOUC); this service stays in sync with it.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly themeSignal = signal<Theme>(this.resolveInitialTheme());

  /** Current theme as a readonly signal for templates. */
  readonly theme = this.themeSignal.asReadonly();

  constructor() {
    // Ensure the DOM reflects the resolved theme (covers the no-inline-script case).
    this.apply(this.themeSignal());
  }

  /** Flip between light and dark, persisting the explicit choice. */
  toggle(): void {
    this.setTheme(this.themeSignal() === 'dark' ? 'light' : 'dark');
  }

  /** Set a specific theme, persist it and apply it to the DOM. */
  setTheme(theme: Theme): void {
    this.themeSignal.set(theme);
    this.persist(theme);
    this.apply(theme);
  }

  private resolveInitialTheme(): Theme {
    const stored = this.readStored();
    if (stored) {
      return stored;
    }
    return this.prefersDark() ? 'dark' : 'light';
  }

  private readStored(): Theme | null {
    try {
      const value = localStorage.getItem(THEME_STORAGE_KEY);
      return value === 'light' || value === 'dark' ? value : null;
    } catch {
      return null;
    }
  }

  private persist(theme: Theme): void {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      /* localStorage unavailable - ignore (theme still applies for this session) */
    }
  }

  private prefersDark(): boolean {
    return typeof window !== 'undefined'
      && typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private apply(theme: Theme): void {
    document.documentElement.setAttribute('data-theme', theme);
  }
}
