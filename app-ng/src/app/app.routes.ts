import { Routes } from '@angular/router';
import { AuthComponent } from './pages/auth/auth.component';
import { HomeComponent } from './pages/home/home.component';
import { ArticleComponent } from './pages/article/article.component';
import { EditorComponent } from './pages/editor/editor.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { authGuard } from './core/auth/auth.guard';

/**
 * Clean-URL routes (history API, per ADR-001). All main RealWorld screens are now
 * migrated. Route paths mirror the legacy UI-Router states (home, login, register,
 * article, editor, profile, settings). Editor and settings require authentication.
 */
export const routes: Routes = [
  { path: '', pathMatch: 'full', component: HomeComponent },
  { path: 'login', component: AuthComponent, data: { authType: 'login' } },
  { path: 'register', component: AuthComponent, data: { authType: 'register' } },
  { path: 'article/:slug', component: ArticleComponent },
  { path: 'editor', component: EditorComponent, canActivate: [authGuard] },
  { path: 'editor/:slug', component: EditorComponent, canActivate: [authGuard] },
  { path: 'profile/:username', component: ProfileComponent },
  { path: 'settings', component: SettingsComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' },
];
