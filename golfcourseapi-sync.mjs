#!/usr/bin/env node
import { toRomaji } from 'wanakana';
const DEFAULT_DELAY_MS = 800;
const DEFAULT_TEE_NAME = 'Regular';
const DEFAULT_BASE_URL = 'https://api.golfcourseapi.com';

const parseArgs = (argv) => {
  const args = new Map();
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;
    const trimmed = arg.slice(2);
    const [key, inlineValue] = trimmed.split('=');
    if (inlineValue !== undefined) {
      args.set(key, inlineValue);
      continue;
    }
    const next = argv[i + 1];
    if (next && !next.startsWith('--')) {
      args.set(key, next);
      i += 1;
    } else {
      args.set(key, 'true');
    }
  }
  return args;
};

const parseInteger = (value, fallback) => {
  if (value === undefined || value === null || value === '') return fallback;
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseAreas = (value) => {
  if (!value) {
    return null;
  }
  const result = new Set();
  const parts = value.split(',').map((part) => part.trim()).filter(Boolean);
  for (const part of parts) {
    if (part.includes('-')) {
      const [startRaw, endRaw] = part.split('-');
      const start = parseInt(startRaw, 10);
      const end = parseInt(endRaw, 10);
      if (!Number.isFinite(start) || !Number.isFinite(end)) continue;
      const min = Math.min(start, end);
      const max = Math.max(start, end);
      for (let code = min; code <= max; code += 1) {
        result.add(String(code));
      }
    } else {
      const code = parseInt(part, 10);
      if (Number.isFinite(code)) {
        result.add(String(code));
      }
    }
  }
  return Array.from(result);
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const maskKey = (key) => {
  if (!key || key.length < 6) return '***';
  return `${key.slice(0, 3)}***${key.slice(-2)}`;
};

const fetchJson = async (url, apiKey, { retries = 2, backoffMs = 1200 } = {}) => {
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const response = await fetch(url, {
      headers: {
        Authorization: `Key ${apiKey}`,
      },
    });
    if (response.ok) {
      return response.json();
    }
    if (attempt < retries && (response.status === 429 || response.status >= 500)) {
      await sleep(backoffMs * (attempt + 1));
      continue;
    }
    const bodyText = await response.text();
    throw new Error(`HTTP ${response.status}: ${bodyText.slice(0, 200)}`);
  }
  throw new Error('Unexpected fetch failure');
};

const stripDecorations = (value) => {
  if (!value) return '';
  return value
    .replace(/\([^)]*\)/g, '')
    .replace(/\uFF08[^\uFF09]*\uFF09/g, '')
    .replace(/【[^】]*】/g, '')
    .replace(/［[^］]*］/g, '')
    .replace(/\[[^\]]*]/g, '')
    .trim();
};

const normalizeName = (value) => {
  if (!value) return '';
  const withoutParens = stripDecorations(value);
  return withoutParens
    .toLowerCase()
    .replace(/[\s\-_,.'"]/g, '')
    .replace(/golf|country|club|course|gc|cc/g, '');
};

const normalizeRomaji = (value) => {
  if (!value) return '';
  const romaji = toRomaji(value);
  return romaji
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const mapRomajiGolfTerms = (value) => {
  if (!value) return '';
  let result = value;
  result = result.replace(/gorufu/g, 'golf');
  result = result.replace(/koosu|kosu|ko-su/g, 'course');
  result = result.replace(/kantorii|kantori|kantory/g, 'country');
  result = result.replace(/kurabu/g, 'club');
  result = result.replace(/countryclub/g, 'country club');
  result = result.replace(/golfcourse/g, 'golf course');
  result = result.replace(/\s+/g, ' ').trim();
  return result;
};

const toBigrams = (value) => {
  const grams = new Set();
  if (!value) return grams;
  for (let i = 0; i < value.length - 1; i += 1) {
    grams.add(value.slice(i, i + 2));
  }
  return grams;
};

const similarityScore = (a, b) => {
  if (!a || !b) return 0;
  if (a === b) return 1;
  if (a.includes(b) || b.includes(a)) return 0.9;
  const gramsA = toBigrams(a);
  const gramsB = toBigrams(b);
  if (gramsA.size === 0 || gramsB.size === 0) return 0;
  let intersection = 0;
  for (const gram of gramsA) {
    if (gramsB.has(gram)) intersection += 1;
  }
  const union = gramsA.size + gramsB.size - intersection;
  return union > 0 ? intersection / union : 0;
};

const isJapanCourse = (course) => {
  const country = String(course?.location?.country || '').toLowerCase();
  return country.includes('japan') || country === 'jp' || country === 'jpn';
};

const pickBestMatch = (results, targetNames) => {
  const targets = Array.isArray(targetNames) ? targetNames : [targetNames];
  const normalizedTargets = targets
    .map((target) => normalizeName(target))
    .filter(Boolean);
  if (normalizedTargets.length === 0) return null;
  const scored = results.map((course) => {
    const combinedName = [course.course_name, course.club_name].filter(Boolean).join(' ');
    const normalizedCandidate = normalizeName(combinedName);
    let score = 0;
    for (const target of normalizedTargets) {
      score = Math.max(score, similarityScore(target, normalizedCandidate));
    }
    if (isJapanCourse(course)) {
      score += 0.05;
    }
    return { course, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored[0] || null;
};

const buildSearchQueries = (course) => {
  const queries = new Set();
  const rawName = stripDecorations(course?.name || '');
  const kanaName = stripDecorations(course?.nameKana || '');

  if (rawName) {
    queries.add(rawName);
    const cleaned = rawName.replace(/[・/]/g, ' ').replace(/\s+/g, ' ').trim();
    if (cleaned) queries.add(cleaned);
    const withoutCourse = rawName.replace(/(東|西|南|北|中|OUT|IN)コース.*$/i, '').trim();
    if (withoutCourse) queries.add(withoutCourse);
    const withoutSuffix = rawName
      .replace(/ゴルフ倶楽部|ゴルフクラブ|ゴルフ場|カントリークラブ|カントリー倶楽部/g, '')
      .trim();
    if (withoutSuffix) queries.add(withoutSuffix);
  }

  if (kanaName) {
    queries.add(kanaName);
    const romaji = normalizeRomaji(kanaName);
    const mapped = mapRomajiGolfTerms(romaji);
    if (mapped) queries.add(mapped);
  }

  return Array.from(queries)
    .map((value) => value.trim())
    .filter((value) => value.length >= 2);
};

const selectTeeBox = (course, teeName, allowFallback) => {
  const tees = [
    ...(Array.isArray(course?.tees?.male) ? course.tees.male : []),
    ...(Array.isArray(course?.tees?.female) ? course.tees.female : []),
  ];
  if (tees.length === 0) return null;
  const normalizedTarget = (teeName || '').toLowerCase();
  const withHoles = tees.filter((tee) => {
    const holes = Array.isArray(tee?.holes) ? tee.holes : [];
    const holeCount = parseInteger(tee?.number_of_holes, holes.length);
    return holeCount === 18 && holes.length >= 18;
  });
  const candidates = withHoles.length > 0 ? withHoles : tees;
  let best = null;
  let bestScore = -1;
  for (const tee of candidates) {
    const name = String(tee?.tee_name || '').toLowerCase();
    const score = normalizedTarget && name.includes(normalizedTarget) ? 1 : 0;
    if (score > bestScore) {
      best = tee;
      bestScore = score;
    }
  }
  if (best && bestScore > 0) return best;
  if (allowFallback && candidates.length > 0) return candidates[0];
  return null;
};

const extractPars = (tee) => {
  const holes = Array.isArray(tee?.holes) ? tee.holes : [];
  if (holes.length < 18) return null;
  const pars = holes.slice(0, 18).map((hole) => parseInteger(hole?.par, null));
  if (pars.some((par) => par === null)) return null;
  return pars;
};

const sumPars = (pars) => pars.reduce((sum, value) => sum + value, 0);

const isLikelyEstimatedPars = (pars) => {
  if (!Array.isArray(pars) || pars.length !== 18) return false;
  return pars.every((value) => value === 4);
};

const formatCsv = (courses) => {
  const headers = [
    'id',
    'name',
    'prefecture',
    'areaCodes',
    'holeCount',
    'parOut',
    'parIn',
    'parTotal',
    'parSource',
    'parTeeName',
    ...Array.from({ length: 18 }, (_, index) => `par${index + 1}`),
  ];
  const lines = [headers.join(',')];
  for (const course of courses) {
    const pars = course.pars || [];
    const row = [
      course.id,
      course.name,
      course.prefecture,
      course.areaCodes?.join('|') || '',
      course.holeCount ?? '',
      course.parOut ?? '',
      course.parIn ?? '',
      course.parTotal ?? '',
      course.parSource ?? '',
      course.parTeeName ?? '',
      ...Array.from({ length: 18 }, (_, index) => pars[index] ?? ''),
    ];
    const escaped = row.map((value) => {
      const stringValue = value === null || value === undefined ? '' : String(value);
      if (/[",\n]/.test(stringValue)) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    });
    lines.push(escaped.join(','));
  }
  return lines.join('\n');
};

const buildSearchUrl = (baseUrl, query) => {
  const url = new URL('/v1/search', baseUrl);
  url.searchParams.set('search_query', query);
  return url.toString();
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  if (args.has('help')) {
    console.log(`Usage:
  GOLFCOURSEAPI_KEY=xxx node golfcourseapi-sync.mjs [options]

Options:
  --in-json file.json      Input JSON (default: public/course-index.json)
  --out-json file.json     Output JSON (default: same as input)
  --out-csv file.csv       Output CSV (default: public/course-index.csv)
  --areas 25-30            Limit to area codes
  --limit 0                Max courses to query (0 = no limit)
  --delay 800              Delay between requests (ms)
  --tee Regular            Tee name preference (default: Regular)
  --allow-fallback true    Use a non-regular tee if regular not found (default: true)
  --force true             Overwrite even if pars already exist
  --base-url https://api.golfcourseapi.com
`);
    process.exit(0);
  }

  const apiKey =
    args.get('api-key') || process.env.GOLFCOURSEAPI_KEY || process.env.GOLFCOURSE_API_KEY;
  if (!apiKey) {
    console.error('Missing GOLFCOURSEAPI_KEY. Set env var or pass --api-key.');
    process.exit(1);
  }

  const inputJson = args.get('in-json') || 'public/course-index.json';
  const outputJson = args.get('out-json') || inputJson;
  const outputCsv = args.get('out-csv') || 'public/course-index.csv';
  const delayMs = parseInteger(args.get('delay'), DEFAULT_DELAY_MS);
  const maxCourses = parseInteger(args.get('limit'), 0);
  const teeName = args.get('tee') || DEFAULT_TEE_NAME;
  const allowFallback = args.get('allow-fallback') !== 'false';
  const force = args.get('force') === 'true';
  const baseUrl = args.get('base-url') || DEFAULT_BASE_URL;
  const areaFilter = parseAreas(args.get('areas'));

  console.log(`GolfCourseAPI sync (key=${maskKey(apiKey)})`);
  console.log(`Input: ${inputJson}`);
  console.log(`Output: ${outputJson}`);
  console.log(`Areas: ${areaFilter ? areaFilter.join(',') : 'all'}`);
  console.log(`Tee: ${teeName} | Allow fallback: ${allowFallback}`);

  const fs = await import('node:fs/promises');
  const raw = await fs.readFile(inputJson, 'utf-8');
  const data = JSON.parse(raw);
  const rawCourses = Array.isArray(data?.entries)
    ? data.entries
    : Array.isArray(data?.courses)
      ? data.courses
      : [];
  const courses = rawCourses.map((course) => ({
    id: String(course?.courseCode ?? course?.id ?? '').trim(),
    name: course?.courseTitle ?? course?.name ?? '',
    nameKana: course?.courseKana ?? course?.nameKana ?? '',
    prefecture: course?.region ?? course?.prefecture ?? '',
    areaCodes: course?.areaTags ?? course?.areaCodes ?? [],
    holeCount: course?.holes ?? course?.holeCount ?? null,
    parTotal: course?.parTotal ?? null,
    pars: course?.parList ?? course?.pars ?? [],
  }));

  let attempted = 0;
  let updated = 0;
  let skipped = 0;
  let failed = 0;
  const errors = [];

  for (const course of courses) {
    if (!course || !course.id) continue;
    if (maxCourses > 0 && attempted >= maxCourses) break;
    if (areaFilter && Array.isArray(course.areaCodes)) {
      const matchesArea = course.areaCodes.some((code) => areaFilter.includes(String(code)));
      if (!matchesArea) continue;
    }

    const pars = Array.isArray(course.pars) ? course.pars : [];
    const hasRealPars = pars.length === 18 && !isLikelyEstimatedPars(pars);
    if (!force && course.parSource === 'golfcourseapi' && hasRealPars) {
      skipped += 1;
      continue;
    }
    if (!force && hasRealPars) {
      skipped += 1;
      continue;
    }

    const searchQueries = buildSearchQueries(course);
    if (searchQueries.length === 0) {
      failed += 1;
      errors.push({ id: course.id, reason: 'empty_search_query' });
      continue;
    }

    try {
      let results = [];
      let usedQuery = '';
      for (const query of searchQueries) {
        const url = buildSearchUrl(baseUrl, query);
        const response = await fetchJson(url, apiKey);
        results = Array.isArray(response?.courses) ? response.courses : [];
        if (results.length > 0) {
          usedQuery = query;
          break;
        }
        await sleep(Math.min(200, delayMs));
      }

      if (results.length === 0) {
        failed += 1;
        errors.push({ id: course.id, reason: 'no_search_results', queries: searchQueries });
        attempted += 1;
        await sleep(delayMs);
        continue;
      }

      const best = pickBestMatch(results, [course.name, course.nameKana, usedQuery].filter(Boolean));
      if (!best || best.score < 0.35) {
        failed += 1;
        errors.push({ id: course.id, reason: 'low_match_score', query: usedQuery });
        attempted += 1;
        await sleep(delayMs);
        continue;
      }

      const tee = selectTeeBox(best.course, teeName, allowFallback);
      if (!tee) {
        failed += 1;
        errors.push({ id: course.id, reason: 'tee_not_found', query: usedQuery });
        attempted += 1;
        await sleep(delayMs);
        continue;
      }

      const nextPars = extractPars(tee);
      if (!nextPars) {
        failed += 1;
        errors.push({ id: course.id, reason: 'holes_missing', query: usedQuery });
        attempted += 1;
        await sleep(delayMs);
        continue;
      }

      course.pars = nextPars;
      course.parOut = sumPars(nextPars.slice(0, 9));
      course.parIn = sumPars(nextPars.slice(9, 18));
      course.parTotal = sumPars(nextPars);
      course.parSource = 'golfcourseapi';
      course.parTeeName = tee?.tee_name || teeName;
      course.golfcourseapiId = best.course?.id ?? null;
      course.holeCount = 18;

      updated += 1;
    } catch (error) {
      failed += 1;
      errors.push({ id: course.id, reason: 'request_failed', message: error.message });
    }

    attempted += 1;
    if (attempted % 25 === 0) {
      console.log(`[sync] attempted ${attempted} | updated ${updated} | failed ${failed}`);
    }
    await sleep(delayMs);
  }

  data.meta = data.meta || {};
  data.meta.golfcourseapi = {
    updatedAt: new Date().toISOString(),
    key: maskKey(apiKey),
    teeName,
    allowFallback,
    maxCourses,
    areaFilter,
    counts: { attempted, updated, skipped, failed },
    errors,
  };

  await Promise.all([
    fs.writeFile(outputJson, JSON.stringify(data, null, 2)),
    fs.writeFile(outputCsv, formatCsv(courses)),
  ]);

  console.log(`Done. Updated ${updated}, skipped ${skipped}, failed ${failed}.`);
  console.log(`Wrote ${outputJson} and ${outputCsv}.`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
