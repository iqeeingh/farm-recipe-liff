const SHEET_RECIPES = 'recipes';
const SHEET_PRODUCTS = 'products';
const SHEET_EVENTS = 'recipe_events';
const SHEET_USER_TAGS = 'user_tags';
const SHEET_DAILY_METHOD_STATS = 'daily_method_stats';
const SHEET_DAILY_RECIPE_STATS = 'daily_recipe_stats';
const SHEET_DAILY_PRODUCT_STATS = 'daily_product_stats';
const SHEET_DAILY_SCENE_STATS = 'daily_scene_stats';
const SHEET_DAILY_EVENT_STATS = 'daily_event_stats';

const TZ = 'Asia/Taipei';
const CACHE_SECONDS = 300;
const RAW_EVENT_RETENTION_YEARS = 5;

const EVENT_HEADERS = [
  'eventId',
  'lineUserId',
  'visitorId',
  'eventType',
  'method',
  'keyword',
  'category',
  'productId',
  'productName',
  'recipeId',
  'recipeName',
  'createdAt'
];

const USER_TAG_HEADERS = [
  'userKey',
  'lineUserId',
  'visitorId',
  'tag',
  'score',
  'updatedAt'
];

const DAILY_METHOD_HEADERS = ['date', 'method', 'count', 'updatedAt'];
const DAILY_RECIPE_HEADERS = ['date', 'recipeId', 'recipeName', 'viewCount', 'productClickCount', 'updatedAt'];
const DAILY_PRODUCT_HEADERS = ['date', 'productId', 'productName', 'viewCount', 'productClickCount', 'updatedAt'];
const DAILY_SCENE_HEADERS = ['date', 'sceneTag', 'count', 'updatedAt'];
const DAILY_EVENT_HEADERS = ['date', 'eventType', 'count', 'updatedAt'];

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

    if (action === 'getAnalyticsSummary') {
      return jsonResponse_({
        ok: true,
        data: getAnalyticsSummary_(e.parameter.days)
      });
    }

    if (action === 'getDailyMethodStats') {
      return jsonResponse_({
        ok: true,
        data: getDailyMethodStats_(e.parameter.days)
      });
    }

    if (action === 'getDailyRecipeStats') {
      return jsonResponse_({
        ok: true,
        data: getDailyRecipeStats_(e.parameter.days)
      });
    }

    if (action === 'getDailyProductStats') {
      return jsonResponse_({
        ok: true,
        data: getDailyProductStats_(e.parameter.days)
      });
    }

    if (action === 'getDailySceneStats') {
      return jsonResponse_({
        ok: true,
        data: getDailySceneStats_(e.parameter.days)
      });
    }

    if (action === 'getDailyEventStats') {
      return jsonResponse_({
        ok: true,
        data: getDailyEventStats_(e.parameter.days)
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
    .filter(function(row) {
      return String(row.status || '').trim() === 'active';
    })
    .sort(function(a, b) {
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
  return rows.find(function(row) {
    return String(row.recipeId) === String(recipeId);
  }) || null;
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
    .filter(function(row) {
      return String(row.status || '').trim() === 'active';
    })
    .sort(function(a, b) {
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
  ensureHeaderRow_(sh, EVENT_HEADERS);

  const now = formatTimestamp_(new Date());
  const eventId = 'E' + Utilities.formatDate(new Date(), TZ, 'yyyyMMddHHmmss') + Math.floor(Math.random() * 1000);

  sh.appendRow([
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
  ].reduce(function(acc, value, index) {
    if (index === 0) {
      acc.push(eventId);
    }
    acc.push(value);
    return acc;
  }, []));

  return {
    eventId: eventId,
    createdAt: now
  };
}

function getAnalyticsSummary_(days) {
  const normalizedDays = normalizeAnalyticsDays_(days);
  const methodStats = getDailyMethodStats_(normalizedDays);
  const recipeStats = getDailyRecipeStats_(normalizedDays);
  const productStats = getDailyProductStats_(normalizedDays);
  const eventStats = getDailyEventStats_(normalizedDays);

  const totalEvents = eventStats.reduce(function(total, row) {
    return total + Number(row.count || 0);
  }, 0);

  const recipeViews = recipeStats.reduce(function(total, row) {
    return total + Number(row.viewCount || 0);
  }, 0);

  const productClicks = productStats.reduce(function(total, row) {
    return total + Number(row.productClickCount || 0);
  }, 0);

  return {
    days: normalizedDays,
    totalEvents: totalEvents,
    recipeViews: recipeViews,
    productClicks: productClicks,
    topMethod: findTopSummaryItem_(methodStats, function(row) {
      return String(row.method || '').trim();
    }, function(row) {
      return Number(row.count || 0);
    }),
    topRecipe: findTopSummaryItem_(recipeStats, function(row) {
      return String(row.recipeName || row.recipeId || '').trim();
    }, function(row) {
      return Number(row.viewCount || 0);
    }),
    topProduct: findTopSummaryItem_(productStats, function(row) {
      return String(row.productName || row.productId || '').trim();
    }, function(row) {
      return Number(row.productClickCount || 0);
    })
  };
}

function getDailyMethodStats_(days) {
  return readDailyStatRows_(SHEET_DAILY_METHOD_STATS, DAILY_METHOD_HEADERS, normalizeAnalyticsDays_(days)).map(function(row) {
    return {
      date: String(row.date || ''),
      method: String(row.method || ''),
      count: Number(row.count || 0),
      updatedAt: String(row.updatedAt || '')
    };
  });
}

function getDailyRecipeStats_(days) {
  return readDailyStatRows_(SHEET_DAILY_RECIPE_STATS, DAILY_RECIPE_HEADERS, normalizeAnalyticsDays_(days)).map(function(row) {
    return {
      date: String(row.date || ''),
      recipeId: String(row.recipeId || ''),
      recipeName: String(row.recipeName || ''),
      viewCount: Number(row.viewCount || 0),
      productClickCount: Number(row.productClickCount || 0),
      updatedAt: String(row.updatedAt || '')
    };
  });
}

function getDailyProductStats_(days) {
  return readDailyStatRows_(SHEET_DAILY_PRODUCT_STATS, DAILY_PRODUCT_HEADERS, normalizeAnalyticsDays_(days)).map(function(row) {
    return {
      date: String(row.date || ''),
      productId: String(row.productId || ''),
      productName: String(row.productName || ''),
      viewCount: Number(row.viewCount || 0),
      productClickCount: Number(row.productClickCount || 0),
      updatedAt: String(row.updatedAt || '')
    };
  });
}

function getDailySceneStats_(days) {
  return readDailyStatRows_(SHEET_DAILY_SCENE_STATS, DAILY_SCENE_HEADERS, normalizeAnalyticsDays_(days)).map(function(row) {
    return {
      date: String(row.date || ''),
      sceneTag: String(row.sceneTag || ''),
      count: Number(row.count || 0),
      updatedAt: String(row.updatedAt || '')
    };
  });
}

function getDailyEventStats_(days) {
  return readDailyStatRows_(SHEET_DAILY_EVENT_STATS, DAILY_EVENT_HEADERS, normalizeAnalyticsDays_(days)).map(function(row) {
    return {
      date: String(row.date || ''),
      eventType: String(row.eventType || ''),
      count: Number(row.count || 0),
      updatedAt: String(row.updatedAt || '')
    };
  });
}

function summarizeRecipeEventsForDate(targetDate) {
  setupDailyStatsSheets();

  const dateKey = normalizeDateKey_(targetDate);
  const events = getRecipeEventsForDate_(dateKey);
  const recipesById = buildRecipeLookup_();
  const updatedAt = formatTimestamp_(new Date());

  const methodCounts = {};
  const recipeCounts = {};
  const productCounts = {};
  const sceneCounts = {};
  const eventCounts = {};

  events.forEach(function(event) {
    const eventType = String(event.eventType || '').trim();
    if (!eventType) {
      return;
    }

    incrementCounter_(eventCounts, eventType, 1);

    if (eventType === 'click_method') {
      const method = String(event.method || '').trim();
      if (method) {
        incrementCounter_(methodCounts, method, 1);
      }
    }

    if (eventType !== 'view_recipe' && eventType !== 'click_product') {
      return;
    }

    const recipeId = String(event.recipeId || '').trim();
    const recipe = recipeId ? recipesById[recipeId] : null;
    const recipeName = String(event.recipeName || (recipe && recipe.recipeName) || '').trim();
    const productId = String(event.productId || (recipe && recipe.productId) || '').trim();
    const productName = String(event.productName || (recipe && recipe.productName) || '').trim();
    const sceneTags = recipe ? recipe.sceneTags : [];

    if (recipeId) {
      const recipeKey = recipeId;
      if (!recipeCounts[recipeKey]) {
        recipeCounts[recipeKey] = {
          date: dateKey,
          recipeId: recipeId,
          recipeName: recipeName,
          viewCount: 0,
          productClickCount: 0,
          updatedAt: updatedAt
        };
      }

      if (eventType === 'view_recipe') {
        recipeCounts[recipeKey].viewCount += 1;
      }
      if (eventType === 'click_product') {
        recipeCounts[recipeKey].productClickCount += 1;
      }
      if (!recipeCounts[recipeKey].recipeName && recipeName) {
        recipeCounts[recipeKey].recipeName = recipeName;
      }
    }

    if (productId || productName) {
      const productKey = productId || ('name:' + productName);
      if (!productCounts[productKey]) {
        productCounts[productKey] = {
          date: dateKey,
          productId: productId,
          productName: productName,
          viewCount: 0,
          productClickCount: 0,
          updatedAt: updatedAt
        };
      }

      if (eventType === 'view_recipe') {
        productCounts[productKey].viewCount += 1;
      }
      if (eventType === 'click_product') {
        productCounts[productKey].productClickCount += 1;
      }
      if (!productCounts[productKey].productName && productName) {
        productCounts[productKey].productName = productName;
      }
    }

    sceneTags.forEach(function(sceneTag) {
      incrementCounter_(sceneCounts, sceneTag, 1);
    });
  });

  replaceSummaryRowsForDate_(SHEET_DAILY_METHOD_STATS, DAILY_METHOD_HEADERS, dateKey, objectKeys_(methodCounts).sort().map(function(method) {
    return {
      date: dateKey,
      method: method,
      count: methodCounts[method],
      updatedAt: updatedAt
    };
  }));

  replaceSummaryRowsForDate_(SHEET_DAILY_RECIPE_STATS, DAILY_RECIPE_HEADERS, dateKey, objectValues_(recipeCounts).sort(function(a, b) {
    return String(a.recipeId).localeCompare(String(b.recipeId));
  }));

  replaceSummaryRowsForDate_(SHEET_DAILY_PRODUCT_STATS, DAILY_PRODUCT_HEADERS, dateKey, objectValues_(productCounts).sort(function(a, b) {
    return String(a.productId || a.productName).localeCompare(String(b.productId || b.productName));
  }));

  replaceSummaryRowsForDate_(SHEET_DAILY_SCENE_STATS, DAILY_SCENE_HEADERS, dateKey, objectKeys_(sceneCounts).sort().map(function(sceneTag) {
    return {
      date: dateKey,
      sceneTag: sceneTag,
      count: sceneCounts[sceneTag],
      updatedAt: updatedAt
    };
  }));

  replaceSummaryRowsForDate_(SHEET_DAILY_EVENT_STATS, DAILY_EVENT_HEADERS, dateKey, objectKeys_(eventCounts).sort().map(function(eventType) {
    return {
      date: dateKey,
      eventType: eventType,
      count: eventCounts[eventType],
      updatedAt: updatedAt
    };
  }));

  return {
    targetDate: dateKey,
    sourceEventCount: events.length,
    methodRowCount: objectKeys_(methodCounts).length,
    recipeRowCount: objectKeys_(recipeCounts).length,
    productRowCount: objectKeys_(productCounts).length,
    sceneRowCount: objectKeys_(sceneCounts).length,
    eventRowCount: objectKeys_(eventCounts).length
  };
}

function summarizeYesterdayRecipeEvents() {
  const targetDate = getRelativeDateKey_(-1);
  return summarizeRecipeEventsForDate(targetDate);
}

function cleanupOldRecipeEvents() {
  const sh = getSheet_(SHEET_EVENTS);
  ensureHeaderRow_(sh, EVENT_HEADERS);

  const values = sh.getDataRange().getValues();
  if (values.length <= 1) {
    return {
      deletedCount: 0,
      cutoff: formatTimestamp_(getRetentionCutoffDate_())
    };
  }

  const headers = values[0].map(function(value) { return String(value || '').trim(); });
  const createdAtIndex = headers.indexOf('createdAt');
  if (createdAtIndex === -1) {
    throw new Error('recipe_events 缺少 createdAt 欄位');
  }

  const cutoff = getRetentionCutoffDate_();
  let deletedCount = 0;

  for (let rowIndex = values.length - 1; rowIndex >= 1; rowIndex -= 1) {
    const createdAt = parseTimestamp_(values[rowIndex][createdAtIndex]);
    if (createdAt && createdAt.getTime() < cutoff.getTime()) {
      sh.deleteRow(rowIndex + 1);
      deletedCount += 1;
    }
  }

  return {
    deletedCount: deletedCount,
    cutoff: formatTimestamp_(cutoff)
  };
}

function rebuildUserTagsRecent(days) {
  const recentDays = Math.max(1, Number(days || 180));
  const cutoffDate = getRecentWindowStartDate_(recentDays);
  const cutoffMs = cutoffDate.getTime();
  const events = readSheetObjects_(SHEET_EVENTS).filter(function(event) {
    const createdAt = parseTimestamp_(event.createdAt);
    return createdAt && createdAt.getTime() >= cutoffMs;
  });

  const recipesById = buildRecipeLookup_();
  const updatedAt = formatTimestamp_(new Date());
  const tagMap = {};

  events.forEach(function(event) {
    const lineUserId = String(event.lineUserId || '').trim();
    const visitorId = String(event.visitorId || '').trim();
    const userKey = lineUserId || visitorId;
    if (!userKey) {
      return;
    }

    const eventType = String(event.eventType || '').trim();
    const recipeId = String(event.recipeId || '').trim();
    const recipe = recipeId ? recipesById[recipeId] : null;
    const category = String(event.category || (recipe && recipe.category) || '').trim();
    const productId = String(event.productId || (recipe && recipe.productId) || '').trim();
    const methodValues = recipe ? recipe.methods : parseDelimitedList_(event.method);
    const sceneTags = recipe ? recipe.sceneTags : [];

    function addTag(tag, score) {
      if (!tag || !score) {
        return;
      }

      const compositeKey = userKey + '||' + tag;
      if (!tagMap[compositeKey]) {
        tagMap[compositeKey] = {
          userKey: userKey,
          lineUserId: lineUserId,
          visitorId: visitorId,
          tag: tag,
          score: 0,
          updatedAt: updatedAt
        };
      }

      tagMap[compositeKey].score += score;
      if (!tagMap[compositeKey].lineUserId && lineUserId) {
        tagMap[compositeKey].lineUserId = lineUserId;
      }
      if (!tagMap[compositeKey].visitorId && visitorId) {
        tagMap[compositeKey].visitorId = visitorId;
      }
    }

    if (eventType === 'click_method') {
      const clickedMethod = String(event.method || '').trim();
      if (clickedMethod) {
        addTag('prefer_method_' + clickedMethod, 3);
      }
    }

    if (category) {
      if (eventType === 'view_recipe') {
        addTag('interest_category_' + category, 2);
      } else if (eventType === 'click_product') {
        addTag('interest_category_' + category, 3);
      }
    }

    if (productId) {
      if (eventType === 'view_recipe') {
        addTag('interest_product_' + productId, 2);
      } else if (eventType === 'click_product') {
        addTag('interest_product_' + productId, 5);
      }
    }

    if (eventType === 'view_recipe' || eventType === 'click_product') {
      methodValues.forEach(function(method) {
        addTag('prefer_method_' + method, eventType === 'click_product' ? 2 : 1);
      });

      sceneTags.forEach(function(sceneTag) {
        addTag('scene_' + sceneTag, eventType === 'click_product' ? 3 : 2);
      });
    }

    if (eventType === 'click_product') {
      addTag('intent_click_product', 5);
    }
  });

  const rows = objectValues_(tagMap)
    .filter(function(row) {
      return row.score > 0;
    })
    .sort(function(a, b) {
      if (String(a.userKey) !== String(b.userKey)) {
        return String(a.userKey).localeCompare(String(b.userKey));
      }
      return String(a.tag).localeCompare(String(b.tag));
    });

  writeSheetObjects_(SHEET_USER_TAGS, USER_TAG_HEADERS, rows);

  return {
    days: recentDays,
    cutoffDate: formatDateKey_(cutoffDate),
    sourceEventCount: events.length,
    tagRowCount: rows.length
  };
}

function rebuildUserTags() {
  return rebuildUserTagsRecent(180);
}

function dailyRecipeMaintenance() {
  const summarizeResult = summarizeYesterdayRecipeEvents();
  const rebuildResult = rebuildUserTagsRecent(180);
  const cleanupResult = cleanupOldRecipeEvents();

  return {
    summarizeResult: summarizeResult,
    rebuildResult: rebuildResult,
    cleanupResult: cleanupResult
  };
}

function setupDailyStatsSheets() {
  ensureSheetWithHeaders_(SHEET_DAILY_METHOD_STATS, DAILY_METHOD_HEADERS);
  ensureSheetWithHeaders_(SHEET_DAILY_RECIPE_STATS, DAILY_RECIPE_HEADERS);
  ensureSheetWithHeaders_(SHEET_DAILY_PRODUCT_STATS, DAILY_PRODUCT_HEADERS);
  ensureSheetWithHeaders_(SHEET_DAILY_SCENE_STATS, DAILY_SCENE_HEADERS);
  ensureSheetWithHeaders_(SHEET_DAILY_EVENT_STATS, DAILY_EVENT_HEADERS);
  ensureSheetWithHeaders_(SHEET_USER_TAGS, USER_TAG_HEADERS);

  return {
    ok: true,
    createdOrVerified: [
      SHEET_DAILY_METHOD_STATS,
      SHEET_DAILY_RECIPE_STATS,
      SHEET_DAILY_PRODUCT_STATS,
      SHEET_DAILY_SCENE_STATS,
      SHEET_DAILY_EVENT_STATS,
      SHEET_USER_TAGS
    ]
  };
}

function testSummarizeYesterdayRecipeEvents() {
  const result = summarizeYesterdayRecipeEvents();
  Logger.log(JSON.stringify(result));
  return result;
}

function testDailyRecipeMaintenance() {
  const result = dailyRecipeMaintenance();
  Logger.log(JSON.stringify(result));
  return result;
}

function readSheetObjects_(sheetName) {
  const sh = getSheet_(sheetName);
  const values = sh.getDataRange().getValues();

  if (values.length <= 1) {
    return [];
  }

  const headers = values[0].map(function(header) {
    return String(header || '').trim();
  });

  return values.slice(1)
    .filter(function(row) {
      return row.some(function(cell) {
        return cell !== '' && cell !== null;
      });
    })
    .map(function(row) {
      const obj = {};
      headers.forEach(function(key, index) {
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

function ensureSheetWithHeaders_(sheetName, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(sheetName);
  if (!sh) {
    sh = ss.insertSheet(sheetName);
  }
  ensureHeaderRow_(sh, headers);
  return sh;
}

function ensureHeaderRow_(sheet, headers) {
  const lastColumn = Math.max(sheet.getLastColumn(), headers.length);
  const firstRow = lastColumn > 0 ? sheet.getRange(1, 1, 1, lastColumn).getValues()[0] : [];
  const currentHeaders = firstRow.slice(0, headers.length).map(function(value) {
    return String(value || '').trim();
  });
  const needsHeaders = headers.some(function(header, index) {
    return currentHeaders[index] !== header;
  });

  if (needsHeaders) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
}

function writeSheetObjects_(sheetName, headers, rows) {
  const sh = ensureSheetWithHeaders_(sheetName, headers);
  sh.clearContents();
  const values = [headers].concat(rows.map(function(row) {
    return headers.map(function(header) {
      return row[header] !== undefined ? row[header] : '';
    });
  }));
  sh.getRange(1, 1, values.length, headers.length).setValues(values);
}

function replaceSummaryRowsForDate_(sheetName, headers, dateKey, records) {
  const sh = ensureSheetWithHeaders_(sheetName, headers);
  const values = sh.getDataRange().getValues();
  const dateIndex = headers.indexOf('date');
  const keepRows = values.length <= 1 ? [] : values.slice(1).filter(function(row) {
    return String(row[dateIndex] || '').trim() !== dateKey;
  });

  const newRows = records.map(function(record) {
    return headers.map(function(header) {
      return record[header] !== undefined ? record[header] : '';
    });
  });

  const finalValues = [headers].concat(keepRows, newRows);
  sh.clearContents();
  sh.getRange(1, 1, finalValues.length, headers.length).setValues(finalValues);
}

function readDailyStatRows_(sheetName, headers, days) {
  const normalizedDays = normalizeAnalyticsDays_(days);
  const sh = ensureSheetWithHeaders_(sheetName, headers);
  const values = sh.getDataRange().getValues();

  if (values.length <= 1) {
    return [];
  }

  const rangeStart = getAnalyticsRangeStartDate_(normalizedDays);
  const headersRow = values[0].map(function(header) {
    return String(header || '').trim();
  });
  const dateIndex = headersRow.indexOf('date');

  return values.slice(1)
    .filter(function(row) {
      if (!row[dateIndex]) {
        return false;
      }
      const dateValue = normalizeDateKey_(row[dateIndex]);
      const parsed = parseTimestamp_(dateValue + ' 00:00:00');
      return parsed && parsed.getTime() >= rangeStart.getTime();
    })
    .map(function(row) {
      const item = {};
      headersRow.forEach(function(header, index) {
        item[header] = row[index];
      });
      return item;
    });
}

function getRecipeEventsForDate_(dateKey) {
  return readSheetObjects_(SHEET_EVENTS).filter(function(event) {
    return extractDateKeyFromTimestamp_(event.createdAt) === dateKey;
  });
}

function buildRecipeLookup_() {
  const lookup = {};
  readSheetObjects_(SHEET_RECIPES).forEach(function(recipe) {
    const recipeId = String(recipe.recipeId || '').trim();
    if (!recipeId) {
      return;
    }

    lookup[recipeId] = {
      recipeId: recipeId,
      recipeName: String(recipe.recipeName || '').trim(),
      category: String(recipe.category || '').trim(),
      productId: String(recipe.productId || '').trim(),
      productName: String(recipe.productName || '').trim(),
      methods: parseDelimitedList_(recipe.method),
      sceneTags: parseDelimitedList_(recipe.sceneTags)
    };
  });
  return lookup;
}

function parseDelimitedList_(value) {
  if (Array.isArray(value)) {
    return value
      .map(function(item) { return String(item || '').trim(); })
      .filter(function(item) { return item; });
  }

  return String(value || '')
    .split(/[\n,，、|]/)
    .map(function(item) { return item.trim(); })
    .filter(function(item) { return item; });
}

function incrementCounter_(map, key, amount) {
  if (!key) {
    return;
  }
  map[key] = (map[key] || 0) + Number(amount || 0);
}

function formatTimestamp_(date) {
  return Utilities.formatDate(date, TZ, 'yyyy/MM/dd HH:mm:ss');
}

function formatDateKey_(date) {
  return Utilities.formatDate(date, TZ, 'yyyy-MM-dd');
}

function normalizeDateKey_(targetDate) {
  if (targetDate instanceof Date) {
    return formatDateKey_(targetDate);
  }

  const text = String(targetDate || '').trim().replace(/\//g, '-');
  const match = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (match) {
    return [
      match[1],
      ('0' + match[2]).slice(-2),
      ('0' + match[3]).slice(-2)
    ].join('-');
  }

  const parsed = new Date(text);
  if (isNaN(parsed.getTime())) {
    throw new Error('無法解析日期：' + targetDate);
  }
  return formatDateKey_(parsed);
}

function extractDateKeyFromTimestamp_(value) {
  const parsed = parseTimestamp_(value);
  return parsed ? formatDateKey_(parsed) : '';
}

function parseTimestamp_(value) {
  if (!value) {
    return null;
  }

  if (Object.prototype.toString.call(value) === '[object Date]') {
    return isNaN(value.getTime()) ? null : value;
  }

  const text = String(value).trim();
  const match = text.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})(?:\s+(\d{1,2}):(\d{1,2}):(\d{1,2}))?$/);
  if (match) {
    return new Date(
      Number(match[1]),
      Number(match[2]) - 1,
      Number(match[3]),
      Number(match[4] || 0),
      Number(match[5] || 0),
      Number(match[6] || 0)
    );
  }

  const parsed = new Date(text);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function getRelativeDateKey_(dayOffset) {
  const now = new Date();
  const localNowText = Utilities.formatDate(now, TZ, 'yyyy/MM/dd HH:mm:ss');
  const localNow = parseTimestamp_(localNowText);
  localNow.setDate(localNow.getDate() + Number(dayOffset || 0));
  return formatDateKey_(localNow);
}

function getAnalyticsRangeStartDate_(days) {
  return getRecentWindowStartDate_(days);
}

function getRecentWindowStartDate_(days) {
  const today = parseTimestamp_(Utilities.formatDate(new Date(), TZ, 'yyyy/MM/dd 00:00:00'));
  today.setDate(today.getDate() - (Number(days || 180) - 1));
  return today;
}

function getRetentionCutoffDate_() {
  const now = parseTimestamp_(Utilities.formatDate(new Date(), TZ, 'yyyy/MM/dd HH:mm:ss'));
  now.setFullYear(now.getFullYear() - RAW_EVENT_RETENTION_YEARS);
  return now;
}

function normalizeAnalyticsDays_(days) {
  const allowed = {
    7: true,
    30: true,
    90: true,
    180: true,
    365: true
  };
  const parsed = Number(days || 30);
  return allowed[parsed] ? parsed : 30;
}

function findTopSummaryItem_(rows, getLabel, getValue) {
  const totals = {};

  rows.forEach(function(row) {
    const label = String(getLabel(row) || '').trim();
    if (!label) {
      return;
    }
    totals[label] = (totals[label] || 0) + Number(getValue(row) || 0);
  });

  let topLabel = '';
  let topCount = 0;

  objectKeys_(totals).forEach(function(label) {
    const count = totals[label];
    if (count > topCount || (!topLabel && count === topCount)) {
      topLabel = label;
      topCount = count;
    }
  });

  if (!topLabel) {
    return null;
  }

  return {
    label: topLabel,
    count: topCount
  };
}

function objectKeys_(obj) {
  return Object.keys(obj || {});
}

function objectValues_(obj) {
  return objectKeys_(obj).map(function(key) {
    return obj[key];
  });
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
  return result;
}
