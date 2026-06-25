# Slice 013 — Follow-ups (bootstrap/auth hardening)

These work units are delivered **as part of slice 013** (E2E migration +
session-restore race fix). They harden the same bootstrap/auth area uncovered by
the E2E migration and are consolidated into a single follow-up PR (continuation of
slice 013), rather than separate slices.

| Folder | What it adds |
|---|---|
| `015-auth-resolution-guarantee` | Exported `restoreSessionThenNavigate` + regression test locking the order: verifyAuth resolves BEFORE initial navigation (guard never sees a pending auth state). |
| `016-bootstrap-loading` | Loading spinner inside `<app-root>` (index.html) so there is no white screen while verifyAuth's GET /user is in flight. |
| `017-verifyauth-timeout` | `timeout(VERIFY_AUTH_TIMEOUT_MS=8000)` on verifyAuth + clean failure handling (401/network/hang → purge → /login, no indefinite hang). Plus expanded E2E coverage (login 422, authed feed tabs, settings update, author edit/delete, refresh/direct-access regression, no-UI-login policy).

## Scope notes
- The core session-restore race fix shipped in the merged slice-013 PR (#14).
- No additional guard/resolver beyond the single `authGuard` was needed — the fix
  lives in the bootstrap (`app.config.ts`), so the guard always evaluates a
  resolved auth state.
