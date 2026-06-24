import { Routes } from '@angular/router';
import { PlaceholderComponent } from './pages/placeholder.component';
import { AuthComponent } from './pages/auth/auth.component';
import { HomeComponent } from './pages/home/home.component';

/**
 * Clean-URL routes (history API, per ADR-001). Remaining targets are placeholders;
 * real screens are migrated in later Fase 3 slices. Route paths mirror the legacy
 * UI-Router states (home, login, register, article, editor, profile, settings).
 */
export const routes: Routes = [
  { path: '', pathMatch: 'full', component: HomeComponent },
  { path: 'login', component: AuthComponent, data: { authType: 'login' } },
  { path: 'register', component: AuthComponent, data: { authType: 'register' } },
  { path: 'article/:slug', component: PlaceholderComponent, data: { name: 'Article' } },
  { path: 'editor', component: PlaceholderComponent, data: { name: 'New Article' } },
  { path: 'editor/:slug', component: PlaceholderComponent, data: { name: 'Edit Article' } },
  { path: 'profile/:username', component: PlaceholderComponent, data: { name: 'Profile' } },
  { path: 'settings', component: PlaceholderComponent, data: { name: 'Settings' } },
  { path: '**', redirectTo: '' },
];
