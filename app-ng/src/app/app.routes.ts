import { Routes } from '@angular/router';
import { PlaceholderComponent } from './pages/placeholder.component';

/**
 * Clean-URL routes (history API, per ADR-001). Targets are placeholders for now;
 * real screens are migrated in later Fase 3 slices. Route paths mirror the legacy
 * UI-Router states (home, login, register, article, editor, profile, settings).
 */
export const routes: Routes = [
  { path: '', pathMatch: 'full', component: PlaceholderComponent, data: { name: 'Home' } },
  { path: 'login', component: PlaceholderComponent, data: { name: 'Sign in' } },
  { path: 'register', component: PlaceholderComponent, data: { name: 'Sign up' } },
  { path: 'article/:slug', component: PlaceholderComponent, data: { name: 'Article' } },
  { path: 'editor', component: PlaceholderComponent, data: { name: 'New Article' } },
  { path: 'editor/:slug', component: PlaceholderComponent, data: { name: 'Edit Article' } },
  { path: 'profile/:username', component: PlaceholderComponent, data: { name: 'Profile' } },
  { path: 'settings', component: PlaceholderComponent, data: { name: 'Settings' } },
  { path: '**', redirectTo: '' },
];
