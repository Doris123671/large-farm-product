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

Vite proxies `/books` and `/genres` to the API at `http://localhost:3000`, so the browser can use the API without a local CORS setup. For a different API origin, set `VITE_API_BASE_URL` before starting or building the client, for example `VITE_API_BASE_URL=https://api.example.com`. The API host must allow browser requests from the deployed frontend origin.

## Screen recording / GIF

The demo recording is not attached yet because the API database is not configured in this workspace. After starting the API and seeding the catalog, record this short flow at `http://localhost:5173` and add the resulting Loom/GIF URL here: browse the collection → choose a genre → type a title or author (search waits 400 ms after typing) → open a book card.

## Implementation notes

- Genre filtering and search use the API's `GET /books?genre=...&search=...` endpoint. The API performs the filtering and pagination, keeping the browser's data transfer small; the URL preserves the current filter and search for sharing and browser navigation.
- The grid reflows from two columns on narrow screens to three and four columns as more space is available.
- Catalog, genre, and detail requests have visible loading and error feedback. Empty catalog matches and missing/invalid book IDs have separate recovery states.
- `npm run build` creates the production site in `dist/`.
