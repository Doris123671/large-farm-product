# Deployment

## Hosting plan

- Backend: Render Web Service, using `render.yaml` in this repository.
- Database: MongoDB Atlas.
- Frontend: Vercel, with the project root set to `client/` and the output directory set to `dist`.

The production frontend calls the backend using `VITE_API_BASE_URL`; the local Vite proxy is development-only. Configure the Vercel production environment variable with the Render service origin, for example `https://your-library-catalog-service.onrender.com`, and redeploy after changing it.

## Environment variables

Backend variables on Render:

- `MONGODB_URI`: Atlas connection string for the production database.
- `AUTH_TOKEN_SECRET`: a private random secret of at least 32 characters. Render generates this in the blueprint.
- `CORS_ORIGINS`: the exact Vercel production origin, such as `https://library-catalog-frontend.vercel.app`, with no trailing slash. Add preview origins only when they are needed.
- `COOKIE_SAME_SITE`: `none` for the cross-site Vercel-to-Render deployment. Production cookies are also marked `Secure` and `HttpOnly`.
- `NODE_ENV`: `production`.

Frontend variables on Vercel:

- `VITE_API_BASE_URL`: the public Render backend origin, without a trailing slash.

For local development, the frontend can leave `VITE_API_BASE_URL` empty and use the Vite proxy; set `CORS_ORIGINS=http://localhost:5173` in the backend environment.

## Production setup and verification

1. Create a dedicated Atlas database and restrict its network access to the backend host where possible.
2. Deploy the backend service from this repository. Set the Atlas URI and exact Vercel origin in Render's environment settings.
3. Run `npm run seed` and `npm run seed:user` once against the production database only if this is a fresh demo database. The catalog seed replaces existing book and genre records.
4. Deploy `client/` to Vercel and set `VITE_API_BASE_URL` to the live backend origin.
5. Verify the backend's `/health` returns `{"status":"ok"}` and `/genres` returns catalog data. Open the Vercel site, search the catalog, and confirm the Network panel shows successful requests to the configured backend. Then test login, direct navigation to `/booking`, and a conflicting booking.

## Issue found during deployment preparation

The existing local setup uses Vite's `/books`, `/genres`, and `/api` development proxy. That proxy does not run in a production static build, so leaving `VITE_API_BASE_URL` empty would make the deployed frontend call its own domain and fail to load the catalog. The production fix is to set `VITE_API_BASE_URL` in Vercel and configure the backend's `CORS_ORIGINS` to the exact Vercel origin. Because authentication uses cookies, production also requires `COOKIE_SAME_SITE=none`; the API allows credentialed CORS only for configured origins.

## Deployment status and live URLs

Deployment has not been run from this workspace: it has no Render/Vercel project credentials or production Atlas URI. No live URLs are claimed yet.

- Frontend: pending Vercel deployment.
- Backend: pending Render deployment.
- Repositories: [library-catalog-service](https://github.com/Doris123671/library-catalog-service) and [assignment workspace](https://github.com/Doris123671/python-totals--hardened-).