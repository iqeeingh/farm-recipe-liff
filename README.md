# Farmaroundyou LIFF Recipe Assistant

This repository includes a Vite + React + TypeScript frontend scaffold under [frontend](./frontend) for the Farmaroundyou LIFF recipe assistant.

## Frontend

The frontend uses a safe LIFF bootstrap flow that still renders normally outside the LINE in-app browser. Recipe data is loaded from the GAS Web App API when `VITE_GAS_API_BASE` is configured, with a small local fallback dataset for development.

When LIFF initializes successfully inside LINE and the user is logged in, the frontend reads only `userId` from `liff.getProfile()` and includes that `lineUserId` in recipe event logs. Outside LINE, or if LIFF cannot provide identity, the app stays in guest mode and uses the local `visitorId` fallback. The production consumer UI does not expose LIFF/debug status cards or internal environment messaging.

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

Analytics endpoints also use the same base URL with:

```text
${VITE_GAS_API_BASE}?action=getAnalyticsSummary&days=30
${VITE_GAS_API_BASE}?action=getDailyMethodStats&days=30
${VITE_GAS_API_BASE}?action=getDailyRecipeStats&days=30
${VITE_GAS_API_BASE}?action=getDailyProductStats&days=30
${VITE_GAS_API_BASE}?action=getDailySceneStats&days=30
${VITE_GAS_API_BASE}?action=getDailyEventStats&days=30
```

No real secrets should be committed.

### Recipe taxonomy

- `method` is the single-select cooking-method taxonomy used by the home-page filter chips.
- Current method chip taxonomy: `全部`, `煎`, `炒`, `炸`, `滷`, `烤`, `氣炸`, `煮湯`, `燉煮`, `涼拌`, `蒸`, `快速料理`
- `sceneTags` are separate multi-value usage-scene labels such as meal context or audience.
- `sceneTags` must not be added to the method chips.

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
- Visual analytics dashboard at `/?page=analytics`
- GAS recipe API integration in `frontend/src/api.ts`
- Frontend recipe event logging to GAS `recipe_events`
- Fallback local recipe data when `VITE_GAS_API_BASE` is missing
- LIFF initialization helper in `frontend/src/liff.ts` with guest fallback outside LINE
- Search and method chip filtering
- Empty-state recovery UI for unmatched filters and search keywords
- Detail-page purchase button

## Analytics retention

The Apps Script backend keeps raw `recipe_events` for 5 years and writes permanent daily summary tables so long-term reporting does not depend on infinite raw-event growth in Google Sheets.

Daily summary sheets:

- `daily_method_stats`
- `daily_recipe_stats`
- `daily_product_stats`
- `daily_scene_stats`
- `daily_event_stats`

Scheduled maintenance:

- Function: `dailyRecipeMaintenance`
- Trigger: time-driven, daily
- Time: `1am–2am` in `Asia/Taipei`

The maintenance job runs:

1. `summarizeYesterdayRecipeEvents()`
2. `rebuildUserTagsRecent(180)`
3. `cleanupOldRecipeEvents()`

See [docs/SHEET_SCHEMA.md](./docs/SHEET_SCHEMA.md) and [docs/DEPLOY.md](./docs/DEPLOY.md) for schema and deployment details.

## Analytics dashboard

Open the analytics dashboard with:

```text
/?page=analytics
```

It reads only from:

- `daily_method_stats`
- `daily_recipe_stats`
- `daily_product_stats`
- `daily_scene_stats`
- `daily_event_stats`
