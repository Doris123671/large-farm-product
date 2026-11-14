# Fieldnotes — Library Catalog

A responsive React catalog experience for the Library Catalog Service API. Browse the collection, combine a genre filter with title/author search, and open a book for its full details.

## Run locally

1. Start MongoDB and configure the API from the repository root as described in [`../README.md`](../README.md).
2. Seed the catalog with `npm run seed` from the repository root, then start the API with `npm start`.
3. In this `client/` directory, install the frontend dependencies and start Vite:

   ```sh
   npm install
   npm run dev
   ```

4. Open the local URL printed by Vite (normally `http://localhost:5173`).

Vite proxies `/books`, `/genres`, and `/api` to the API at `http://localhost:3000`, so the browser can use the API without a local CORS setup. For a different API origin, set `VITE_API_BASE_URL` before starting or building the client, for example `VITE_API_BASE_URL=https://api.example.com`. The API host must allow browser requests from the deployed frontend origin.

## Screen recording / GIF

The demo recording is not attached yet because the API database is not configured in this workspace. After starting the API and seeding the catalog, record this flow at `http://localhost:5173`: save a book → refresh and confirm it remains in the reading list → request it → sign in as the seeded librarian → open `/admin/borrow-requests` and mark it returned → show the server-computed fine → create a booking and try an overlapping time → show the API conflict → review `/admin/bookings` and `/admin/books`.

## Implementation notes

- Genre filtering and search use the API's `GET /books?genre=...&search=...` endpoint. The API performs the filtering and pagination, keeping the browser's data transfer small; the URL preserves the current filter and search for sharing and browser navigation.
- The grid reflows from two columns on narrow screens to three and four columns as more space is available.
- Catalog, genre, and detail requests have visible loading and error feedback. Empty catalog matches and missing/invalid book IDs have separate recovery states.
- The reading list is stored in browser `localStorage`, so it survives reloads without needing an account or another API request. It is device- and browser-specific and is not shared across devices; backend synchronization would enable that later, at the cost of requiring network access and a signed-in account.
- Login, registration, and the initial profile check use the backend `/api/auth/*` and `/api/users/profile` endpoints. The API stores its JWT in an HttpOnly cookie; requests include credentials. Keep the frontend and API same-site (the Vite development proxy does this locally), or configure a same-site production reverse proxy and appropriate server CORS/CSRF policy.
- `/booking` is protected by the app-wide profile status, including direct URL visits. The booking form keeps space, date, start time, and end time in component state only and does not submit a booking to the API yet.
- The reading-list page can submit a borrow request for a saved book. The librarian-only admin pages provide live Book CRUD, borrow status updates, and booking visibility. The booking form now submits to the server, which rejects overlapping reservations with visible feedback.
- `npm run build` creates the production site in `dist/`.
