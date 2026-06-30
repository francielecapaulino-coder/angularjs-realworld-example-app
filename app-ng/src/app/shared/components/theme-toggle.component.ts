import { Component, inject, computed } from '@angular/core';
import { AppStateService } from '../../core/state/app-state.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  template: `
    <button 
      class="theme-toggle" 
      (click)="toggleTheme()"
      [attr.aria-label]="'Theme: ' + currentTheme()"
      [attr.title]="currentTheme() + ' theme'"
    >
      <span class="theme-icon">{{ themeIcon() }}</span>
    </button>
  `,
  styleUrls: ['./theme-toggle.component.css']
})
export class ThemeToggleComponent {
  private readonly appState = inject(AppStateService);

  readonly theme = this.appState.theme;
  readonly isDarkMode = this.appState.isDarkMode;

  readonly themeIcon = computed(() => {
    const theme = this.theme();
    switch (theme) {
      case 'light': return 'light_mode';
      case 'dark': return 'dark_mode';
      default: return 'brightness_auto';
    }
  });

  currentTheme = computed(() => this.theme());

  toggleTheme(): void {
    this.appState.toggleTheme();
  }
}
