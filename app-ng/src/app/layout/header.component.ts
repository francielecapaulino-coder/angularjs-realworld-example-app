import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/auth/auth.service';
import { APP_CONSTANTS } from '../core/config/app.constants';

/**
 * Top navbar. Mirrors legacy src/js/layout/header.html, with reactive auth
 * state via AuthService signals (no broken $scope.$watch).
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  private readonly auth = inject(AuthService);

  readonly appName = APP_CONSTANTS.appName;
  readonly isAuthenticated = this.auth.isAuthenticated;
  readonly currentUser = this.auth.currentUser;
}
