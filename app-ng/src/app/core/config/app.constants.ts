/**
 * Application-wide constants, mirrored from the legacy AngularJS app
 * (src/js/config/app.constants.js) to preserve the RealWorld contract.
 */
export const APP_CONSTANTS = {
  /**
   * RealWorld API base URL consumed by the app.
   *
   * Relative path so the app talks to the API served from the same origin:
   *  - dev: `ng serve` proxies `/api` -> http://localhost:8080 (see proxy.conf.json);
   *  - prod/docker: nginx serves the SPA and proxies `/api` -> the backend (slice 025).
   * To target a different API, change this value or adjust the proxy.
   */
  apiBase: '/api',
  /** localStorage key holding the JWT - preserved from the legacy app. */
  jwtKey: 'jwtToken',
  /** Display name used in the header/footer brand. */
  appName: 'conduit',
} as const;
