# Specification

## Summary
**Goal:** Eliminate the post-reset “circular lockout” by fully clearing admin configuration on upgrade and providing a supported way to re-establish the first admin, with the frontend using the new setup API.

**Planned changes:**
- Add a backend canister upgrade migration that resets admin credentials to null and clears all AccessControl role assignments so no principal remains admin after reset.
- Add a backend “initial admin setup” API that, only when credentials are not configured, lets an authenticated Internet Identity caller set initial admin username/password and become admin in the same operation; reject when credentials already exist.
- Update the frontend Initial Admin Setup flow to call the new initial-setup API, show actionable errors when setup is disallowed, and invalidate/refetch relevant React Query admin-state caches after successful setup.

**User-visible outcome:** After an admin reset or on a fresh install, the first Internet Identity user can successfully configure initial admin credentials and immediately access the admin dashboard without seeing the lockout error; if admin is already configured, the UI guides the user to use the normal admin login path.
