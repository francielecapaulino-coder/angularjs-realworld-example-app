import { Component, Input } from '@angular/core';

/** RealWorld error envelope: { field: [messages] }. */
export type ApiErrors = Record<string, string[]>;

/**
 * Renders RealWorld validation errors as a list (mirrors legacy
 * src/js/components/list-errors.html): one "<field> <message>" line per error.
 */
@Component({
  selector: 'app-list-errors',
  standalone: true,
  template: `
    @if (errors) {
      <ul class="error-messages">
        @for (entry of entries(); track entry.field) {
          @for (message of entry.messages; track message) {
            <li>{{ entry.field }} {{ message }}</li>
          }
        }
      </ul>
    }
  `,
})
export class ListErrorsComponent {
  @Input() errors: ApiErrors | null = null;

  entries(): { field: string; messages: string[] }[] {
    if (!this.errors) {
      return [];
    }
    return Object.keys(this.errors).map((field) => ({
      field,
      messages: this.errors![field],
    }));
  }
}
