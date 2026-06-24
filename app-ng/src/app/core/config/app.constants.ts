/**
 * Application-wide constants, mirrored from the legacy AngularJS app
 * (src/js/config/app.constants.js) to preserve the RealWorld contract.
 */
export const APP_CONSTANTS = {
  /** RealWorld API base URL consumed by the app (unchanged from legacy). */
  apiBase: 'https://conduit.productionready.io/api',
  /** localStorage key holding the JWT — preserved from the legacy app. */
  jwtKey: 'jwtToken',
  /** Display name used in the header/footer brand. */
  appName: 'conduit',
} as const;
