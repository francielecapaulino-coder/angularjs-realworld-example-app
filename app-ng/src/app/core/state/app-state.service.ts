import { Injectable, inject, signal, computed, effect, toObservable } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

/**
 * Enhanced Angular 21+ centralized state management service
 * Uses advanced signals feature suite for reactive state management
 */
@Injectable({
  providedIn: 'root'
})
export class AppStateService {
  private readonly destroy$ = new Subject<void>();

  // Core application signals
  private readonly loadingSig = signal<boolean>(false);
  private readonly errorSig = signal<string | null>(null);
  private readonly titleSig = signal<string>('Conduit');
  private readonly onlineSig = signal<boolean>(navigator.onLine);

  // Application settings signals
  private readonly themeSig = signal<'light' | 'dark' | 'auto'>('auto');
  private readonly languageSig = signal<string>('en');
  private readonly notificationsEnabledSig = signal<boolean>(true);

  // Performance metrics signals
  private readonly pageLoadTimeSig = signal<number>(0);
  private readonly apiResponseTimeSig = signal<number>(0);

  // Computed readonly signals
  readonly isLoading = this.loadingSig.asReadonly();
  readonly error = this.errorSig.asReadonly();
  readonly title = this.titleSig.asReadonly();
  readonly isOnline = this.onlineSig.asReadonly();
  readonly theme = this.themeSig.asReadonly();
  readonly language = this.languageSig.asReadonly();
  readonly notificationsEnabled = this.notificationsEnabledSig.asReadonly();
  readonly pageLoadTime = this.pageLoadTimeSig.asReadonly();
  readonly apiResponseTime = this.apiResponseTimeSig.asReadonly();

  // Advanced computed signals
  readonly isDarkMode = computed(() => {
    const theme = this.themeSig();
    return theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  readonly appStatus = computed(() => ({
    loading: this.loadingSig(),
    error: this.errorSig(),
    online: this.onlineSig(),
    theme: this.themeSig()
  }));

  // Observable streams (Angular 17+ feature)
  readonly loading$ = toObservable(this.loadingSig);
  readonly error$ = toObservable(this.errorSig);
  readonly theme$ = toObservable(this.themeSig);

  constructor() {
    this.initializeConnectionMonitoring();
    this.initializePerformanceTracking();
    this.loadSavedPreferences();
    this.applyTheme();
  }

  /** Set loading state */
  setLoading(loading: boolean): void {
    this.loadingSig.set(loading);
  }

  /** Set error message */
  setError(error: string | null): void {
    this.errorSig.set(error);
  }

  /** Clear error */
  clearError(): void {
    this.errorSig.set(null);
  }

  /** Set page title */
  setTitle(title: string): void {
    this.titleSig.set(title);
    document.title = title;
  }

  /** Set theme */
  setTheme(theme: 'light' | 'dark' | 'auto'): void {
    this.themeSig.set(theme);
    localStorage.setItem('app-theme', theme);
    this.applyTheme();
  }

  /** Toggle theme */
  toggleTheme(): void {
    const current = this.themeSig();
    const newTheme = current === 'light' ? 'dark' : current === 'dark' ? 'auto' : 'light';
    this.setTheme(newTheme);
  }

  /** Set language */
  setLanguage(language: string): void {
    this.languageSig.set(language);
    localStorage.setItem('app-language', language);
  }

  /** Toggle notifications */
  toggleNotifications(): void {
    this.notificationsEnabledSig.update(enabled => !enabled);
  }

  /** Record page load time */
  recordPageLoadTime(time: number): void {
    this.pageLoadTimeSig.set(time);
  }

  /** Record API response time */
  recordApiResponseTime(time: number): void {
    this.apiResponseTimeSig.set(time);
  }

  /** Get current state snapshot */
  getSnapshot() {
    return {
      loading: this.loadingSig(),
      error: this.errorSig(),
      title: this.titleSig(),
      online: this.onlineSig(),
      theme: this.themeSig(),
      language: this.languageSig(),
      notificationsEnabled: this.notificationsEnabledSig(),
      isDarkMode: this.isDarkMode(),
      pageLoadTime: this.pageLoadTimeSig(),
      apiResponseTime: this.apiResponseTimeSig()
    };
  }

  /** Reset app state */
  reset(): void {
    this.loadingSig.set(false);
    this.errorSig.set(null);
    this.titleSig.set('Conduit');
    this.themeSig.set('auto');
    this.languageSig.set('en');
    this.notificationsEnabledSig.set(true);
    this.pageLoadTimeSig.set(0);
    this.apiResponseTimeSig.set(0);
  }

  private initializeConnectionMonitoring(): void {
    window.addEventListener('online', () => this.onlineSig.set(true));
    window.addEventListener('offline', () => this.onlineSig.set(false));
  }

  private initializePerformanceTracking(): void {
    // Track page load performance
    if ('performance' in window) {
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          this.recordPageLoadTime(Math.round(navigation.loadEventEnd - navigation.fetchStart));
        }
      });
    }
  }

  private loadSavedPreferences(): void {
    // Load saved theme
    const savedTheme = localStorage.getItem('app-theme') as 'light' | 'dark' | 'auto' | null;
    if (savedTheme) {
      this.themeSig.set(savedTheme);
    }

    // Load saved language
    const savedLanguage = localStorage.getItem('app-language');
    if (savedLanguage) {
      this.languageSig.set(savedLanguage);
    }
  }

  private applyTheme(): void {
    const isDarkMode = this.isDarkMode();
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', isDarkMode);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}