# Farmaroundyou LIFF Recipe Assistant

This repository includes a Vite + React + TypeScript frontend scaffold under [frontend](./frontend) for the Farmaroundyou LIFF recipe assistant.

## Frontend

The frontend uses a safe LIFF bootstrap flow that still renders normally outside the LINE in-app browser. Recipe data is loaded from the GAS Web App API when `VITE_GAS_API_BASE` is configured, with a small local fallback dataset for development.

When LIFF initializes successfully inside LINE and the user is logged in, the frontend reads only `userId` from `liff.getProfile()` and includes that `lineUserId` in recipe event logs. Outside LINE, or if LIFF cannot provide identity, the app stays in guest mode and uses the local `visitorId` fallback.

### Environment variables

Copy `frontend/.env.example` to `frontend/.env` and set:

- `VITE_LIFF_ID`
- `VITE_GAS_API_BASE`

The recipe list request is:

```text
${VITE_GAS_API_BASE}?action=listRecipes
```

Recipe event logging also uses the same base URL with:

```text
${VITE_GAS_API_BASE}?action=logEvent&...
```

No real secrets should be committed.

### Static assets

Place `recipe-placeholder.png` inside `frontend/public/` so recipe cards and detail pages can fall back to `/recipe-placeholder.png` when an image URL is missing or fails to load.

### Local development

```bash
cd frontend
npm install
npm run dev
```

### Production build

```bash
cd frontend
npm run build
```

## Current scope

- Mobile-first recipe list and detail UI
- GAS recipe API integration in `frontend/src/api.ts`
- Frontend recipe event logging to GAS `recipe_events`
- Fallback local recipe data when `VITE_GAS_API_BASE` is missing
- LIFF initialization helper in `frontend/src/liff.ts` with guest fallback outside LINE
- Search and method chip filtering
- Detail-page purchase button

This task does not modify `gas/Code.gs`, does not use LINE webhook, and does not implement push messaging.
