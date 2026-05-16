const SHEET_RECIPES = 'recipes';
const SHEET_PRODUCTS = 'products';
const SHEET_EVENTS = 'recipe_events';
const TZ = 'Asia/Taipei';
const CACHE_SECONDS = 300;

function doGet(e) {
  const action = e.parameter.action || '';

  try {
    if (action === 'listRecipes') {
      return jsonResponse_({
        ok: true,
        data: listRecipes_()
      });
    }

    if (action === 'getRecipe') {
      const recipeId = e.parameter.recipeId || '';
      if (!recipeId) {
        return jsonResponse_({
          ok: false,
          error: 'missing recipeId'
        });
      }

      const recipe = getRecipe_(recipeId);
      if (!recipe) {
        return jsonResponse_({
          ok: false,
          error: 'recipe not found'
        });
      }

      return jsonResponse_({
        ok: true,
        data: recipe
      });
    }

    if (action === 'listProducts') {
      return jsonResponse_({
        ok: true,
        data: listProducts_()
      });
    }

    if (action === 'logEvent') {
      const result = logEvent_(e.parameter);
      return jsonResponse_({
        ok: true,
        data: result
      });
    }

    return jsonResponse_({
      ok: false,
      error: 'unknown action'
    });

  } catch (err) {
    return jsonResponse_({
      ok: false,
      error: String(err && err.message ? err.message : err)
    });
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || '{}');
    const action = body.action || '';

    if (action === 'logEvent') {
      const result = logEvent_(body);
      return jsonResponse_({
        ok: true,
        data: result
      });
    }

    return jsonResponse_({
      ok: false,
      error: 'unknown action'
    });

  } catch (err) {
    return jsonResponse_({
      ok: false,
      error: String(err && err.message ? err.message : err)
    });
  }
}

function listRecipes_() {
  const cache = CacheService.getScriptCache();
  const cacheKey = 'recipes_active_v1';
  const cached = cache.get(cacheKey);

  if (cached) {
    return JSON.parse(cached);
  }

  const rows = readSheetObjects_(SHEET_RECIPES);

  const data = rows
    .filter(row => String(row.status || '').trim() === 'active')
    .sort((a, b) => {
      const sa = Number(a.sortOrder || 999999);
      const sb = Number(b.sortOrder || 999999);
      if (sa !== sb) return sa - sb;
      return String(a.recipeId || '').localeCompare(String(b.recipeId || ''));
    });

  cache.put(cacheKey, JSON.stringify(data), CACHE_SECONDS);

  return data;
}

function getRecipe_(recipeId) {
  const rows = listRecipes_();
  return rows.find(row => String(row.recipeId) === String(recipeId)) || null;
}

function listProducts_() {
  const cache = CacheService.getScriptCache();
  const cacheKey = 'products_active_v1';
  const cached = cache.get(cacheKey);

  if (cached) {
    return JSON.parse(cached);
  }

  const rows = readSheetObjects_(SHEET_PRODUCTS);

  const data = rows
    .filter(row => String(row.status || '').trim() === 'active')
    .sort((a, b) => {
      const sa = Number(a.sortOrder || 999999);
      const sb = Number(b.sortOrder || 999999);
      if (sa !== sb) return sa - sb;
      return String(a.productId || '').localeCompare(String(b.productId || ''));
    });

  cache.put(cacheKey, JSON.stringify(data), CACHE_SECONDS);

  return data;
}

function logEvent_(payload) {
  const sh = getSheet_(SHEET_EVENTS);
  const now = Utilities.formatDate(new Date(), TZ, 'yyyy/MM/dd HH:mm:ss');
  const eventId = 'E' + Utilities.formatDate(new Date(), TZ, 'yyyyMMddHHmmss') + Math.floor(Math.random() * 1000);

  sh.appendRow([
    eventId,
    payload.lineUserId || '',
    payload.visitorId || '',
    payload.eventType || '',
    payload.method || '',
    payload.keyword || '',
    payload.category || '',
    payload.productId || '',
    payload.productName || '',
    payload.recipeId || '',
    payload.recipeName || '',
    now
  ]);

  return {
    eventId: eventId,
    createdAt: now
  };
}

function readSheetObjects_(sheetName) {
  const sh = getSheet_(sheetName);
  const values = sh.getDataRange().getValues();

  if (values.length <= 1) return [];

  const headers = values[0].map(h => String(h || '').trim());

  return values.slice(1)
    .filter(row => row.some(cell => cell !== '' && cell !== null))
    .map(row => {
      const obj = {};
      headers.forEach((key, index) => {
        obj[key] = row[index];
      });
      return obj;
    });
}

function getSheet_(sheetName) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sh) {
    throw new Error('找不到工作表：' + sheetName);
  }
  return sh;
}

function jsonResponse_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function clearRecipeCache() {
  CacheService.getScriptCache().remove('recipes_active_v1');
  CacheService.getScriptCache().remove('products_active_v1');
}

function testLogEvent() {
  const result = logEvent_({
    lineUserId: 'test_line_user',
    visitorId: 'test_visitor',
    eventType: 'test_event',
    method: '氣炸',
    keyword: '棒棒腿',
    category: '雞肉',
    productId: 'P001',
    productName: '棒棒腿',
    recipeId: 'R001',
    recipeName: '氣炸椒鹽棒棒腿'
  });

  Logger.log(result);
}