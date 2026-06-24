import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { APP_CONSTANTS } from '../core/config/app.constants';

/**
 * Footer. Mirrors legacy src/js/layout/footer.html.
 */
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.component.html',
})
export class FooterComponent {
  readonly appName = APP_CONSTANTS.appName;
  readonly year = new Date().getFullYear();
}
