# Specification

## Summary
**Goal:** Add a secure, admin-only product management module with full backend persistence, including product image upload/retrieval, and a protected Admin UI for CRUD operations.

**Planned changes:**
- Add admin-only backend API endpoints for product create, update, delete, and admin listing with explicit authorization errors for non-admin callers.
- Extend the persisted Product model to include name, description, price, category, and an image reference while keeping existing shop/cart reads compatible.
- Implement backend image upload/replace (admin-only) plus image retrieval (public read) with validation (type/size) and clear not-found errors.
- Create a protected frontend `/admin` route gated by authentication and admin authorization, with UI to list/add/edit/delete products and upload/preview images.
- Ensure all Admin and shop catalog data is fetched from backend canister state and mutations persist; refresh UI via React Query invalidation/refetch after successful actions.
- Add backend + frontend validation and clear English error handling for product fields and image uploads.
- If needed, implement conditional state migration on canister upgrade so existing products remain accessible and new fields get sensible defaults.

**User-visible outcome:** Administrators can sign in, visit `/admin`, and manage products (including uploading/replacing images) with changes persisted to the backend; shoppers see updated product data and stored images after successful admin updates.
