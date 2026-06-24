import { Routes } from '@angular/router';
import { PlaceholderComponent } from './pages/placeholder.component';
import { AuthComponent } from './pages/auth/auth.component';
import { HomeComponent } from './pages/home/home.component';
import { ArticleComponent } from './pages/article/article.component';
import { EditorComponent } from './pages/editor/editor.component';
import { authGuard } from './core/auth/auth.guard';

/**
 * Clean-URL routes (history API, per ADR-001). Remaining targets are placeholders;
 * real screens are migrated in later Fase 3 slices. Route paths mirror the legacy
 * UI-Router states (home, login, register, article, editor, profile, settings).
 */
export const routes: Routes = [
  { path: '', pathMatch: 'full', component: HomeComponent },
  { path: 'login', component: AuthComponent, data: { authType: 'login' } },
  { path: 'register', component: AuthComponent, data: { authType: 'register' } },
  { path: 'article/:slug', component: ArticleComponent },
  { path: 'editor', component: EditorComponent, canActivate: [authGuard] },
  { path: 'editor/:slug', component: EditorComponent, canActivate: [authGuard] },
  { path: 'profile/:username', component: PlaceholderComponent, data: { name: 'Profile' } },
  { path: 'settings', component: PlaceholderComponent, data: { name: 'Settings' } },
  { path: '**', redirectTo: '' },
];
