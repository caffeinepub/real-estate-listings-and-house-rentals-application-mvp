# Specification

## Summary
**Goal:** Deliver an MVP real estate marketplace where users can browse property listings, view details, and (when signed in) manage their own listings and rental inquiries using Internet Identity.

**Planned changes:**
- Backend: Add persistent listing data model in stable storage plus CRUD APIs (create/read-by-id/list-paged/update/delete) with validation, typed results, and owner-only authorization for updates/deletes.
- Backend: Add paginated browse/search API with filters (listing type, city, price range, bedrooms, property type) and text search over title/description.
- Backend: Add rental inquiry data model and APIs tied to listings, enforcing requester-only create/cancel and owner-only accept/reject with status transitions.
- Frontend: Build responsive browse UI (grid/list) with search, filters, pagination, and loading/empty/error states using React Query.
- Frontend: Add listing details page with photo gallery, property facts, amenities, description, availability, and primary actions (rental request for rent listings; contact owner for sale listings).
- Frontend + Backend: Integrate Internet Identity sign-in/out; require authentication for creating/updating/deleting listings and creating rental inquiries; enforce auth by caller Principal.
- Frontend: Add authenticated areas for “Create listing”, “My listings” (edit/delete), “My inquiries”, and “Inquiries for my listings” (accept/reject).
- Frontend: Apply a coherent, distinct real-estate-appropriate visual theme consistently across navigation, cards, forms, and buttons.
- Frontend: Add and use generated static image assets under `frontend/public/assets/generated` (logo and illustrations), referenced via static paths only.

**User-visible outcome:** Users can browse and search real estate listings, open a listing details page, and sign in with Internet Identity to create/manage their own listings and submit/manage rental inquiries (including owner accept/reject for their listings).
