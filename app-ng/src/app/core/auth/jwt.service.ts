import { Injectable } from '@angular/core';
import { APP_CONSTANTS } from '../config/app.constants';

/**
 * Reads/writes the JWT token in localStorage.
 * Preserves the legacy key `jwtToken` (src/js/services/jwt.service.js).
 */
@Injectable({ providedIn: 'root' })
export class JwtService {
  get(): string | null {
    return localStorage.getItem(APP_CONSTANTS.jwtKey);
  }

  save(token: string): void {
    localStorage.setItem(APP_CONSTANTS.jwtKey, token);
  }

  destroy(): void {
    localStorage.removeItem(APP_CONSTANTS.jwtKey);
  }
}
