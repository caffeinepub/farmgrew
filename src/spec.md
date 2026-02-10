# Specification

## Summary
**Goal:** Make the Admin product management area visible in the app navigation while restricting access to a controller-managed allowlist of Internet Identity principals (intended for the Internet Identity linked to Google account grandzbee@gmail.com).

**Planned changes:**
- Add a clearly visible “Admin” navigation entry that routes to `/admin` for all users, while keeping the `/admin` route protected by the existing admin guard.
- Implement/extend backend admin authorization using an allowlist of Internet Identity principals, including a controller-only method to add an admin principal.
- Enforce admin-only authorization on product management APIs (create/update/delete/listAll/uploadProductImage) so non-allowlisted principals receive an authorization error.
- Update `/admin` access denied messaging to state that users must sign in with Internet Identity and that admin access is restricted to the Internet Identity linked to Google account grandzbee@gmail.com (no claims of Google OAuth login support).

**User-visible outcome:** Everyone can see and click an “Admin” link; non-admins see an access denied screen with correct Internet Identity messaging, while the allowlisted admin can access and use the admin product management UI.
