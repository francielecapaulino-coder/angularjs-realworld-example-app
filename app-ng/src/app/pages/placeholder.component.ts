import { Component, Input } from '@angular/core';

/**
 * Temporary placeholder for routes whose real screens are migrated in later
 * Fase 3 slices. Renders the page name so routing can be validated now.
 */
@Component({
  selector: 'app-placeholder',
  standalone: true,
  template: `
    <div class="container page">
      <h1>{{ name }}</h1>
      <p>This screen will be migrated in a later slice.</p>
    </div>
  `,
})
export class PlaceholderComponent {
  @Input() name = 'Page';
}
