# Legacy AngularJS app (archived — DO NOT USE)

This folder contains the **original AngularJS 1.5 Conduit app**, kept for historical
reference only. It was **decommissioned** once the application was fully migrated to
Angular 21 (see `app-ng/`).

- `src/` — the original AngularJS 1.5 source (UI-Router, ES2015 + Browserify).
- `gulpfile.js` — the legacy build (gulp + browserify + templatecache).

## Status
- **Not built, served, or tested** by the project anymore.
- The official application lives in **`app-ng/`** (Angular 21, standalone + Signals).
- Build/serve/test instructions are in the repository root `README.md`.

## Why keep it?
- Historical reference and traceability of the migration.
- Recoverable behavior comparison if ever needed.

This code is intentionally left untouched. Do not add new features here.
