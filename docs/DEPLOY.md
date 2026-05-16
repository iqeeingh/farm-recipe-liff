# GAS Deploy

## Required one-time setup

1. Save `gas/Code.gs` in Apps Script.
2. Run `setupDailyStatsSheets()` manually once.
3. Confirm the following sheets exist:
   - `daily_method_stats`
   - `daily_recipe_stats`
   - `daily_product_stats`
   - `daily_scene_stats`
   - `daily_event_stats`
   - `user_tags`

## Manual verification

1. Run `testSummarizeYesterdayRecipeEvents()`.
2. Run `testDailyRecipeMaintenance()`.
3. If yesterday has data in `recipe_events`, confirm the `daily_*_stats` sheets were updated.
4. Confirm `user_tags` is rebuilt successfully.
5. Confirm `listRecipes`, `getRecipe`, `listProducts`, and `logEvent` still work.

## Trigger

Add or update a time-driven trigger with:

- Function: `dailyRecipeMaintenance`
- Event source: `Time-driven`
- Frequency: `Daily`
- Time: `1am–2am`
- Timezone: `Asia/Taipei`

## Deploy web app

Deploy a new Apps Script version if the Web App source changed.

Recommended sequence:

1. Save Apps Script changes.
2. Run the manual verification functions above.
3. Deploy a new version.
4. Confirm the web app endpoint still serves:
   - `action=listRecipes`
   - `action=getRecipe`
   - `action=listProducts`
   - `action=logEvent`
   - `action=getAnalyticsSummary`
   - `action=getDailyMethodStats`
   - `action=getDailyRecipeStats`
   - `action=getDailyProductStats`
   - `action=getDailySceneStats`
   - `action=getDailyEventStats`

## Frontend analytics page

After deploying the frontend, open:

- `https://farm-recipe-liff.vercel.app/?page=analytics`

Verify:

- summary cards render
- charts render or show empty states cleanly
- data changes when switching 7 / 30 / 90 / 180 / 365 day ranges
