import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Download } from 'lucide-react';
import { isMediaSupabaseConfigured, mediaSupabase } from '../lib/mediaSupabase';
import { readWatermarkCache, writeWatermarkCache } from '../lib/scorePhotoWatermarkCache';

const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1350;
const WATERMARK_STORAGE_KEY = 'scorePhotoWatermarkSettings';
const SCORE_DRAFT_STORAGE_KEY = 'scorePhotoDraft';
const DEFAULT_WATERMARK_LOGO_URL = '/title-logo.png';
const STAMP_OPTIONS = [
  { id: 'none', label: 'スタンプなし', src: '' },
  { id: 'stamp-1', label: 'スタンプ1', src: 'stamps/stamp-1.png' },
  { id: 'stamp-2', label: 'スタンプ2', src: 'stamps/stamp-2.png' },
  { id: 'stamp-3', label: 'スタンプ3', src: 'stamps/stamp-3.png' },
  { id: 'stamp-4', label: 'スタンプ4', src: 'stamps/stamp-4.png' },
  { id: 'stamp-5', label: 'スタンプ5', src: 'stamps/stamp-5.png' },
  { id: 'stamp-6', label: 'スタンプ6', src: 'stamps/stamp-6.png' },
] as const;
const DEFAULT_STAMP = STAMP_OPTIONS[0];
const DEFAULT_STAMP_ID = DEFAULT_STAMP.id;
const STAMP_MIN_SIZE = 160;
const STAMP_MAX_SIZE = 640;
const DEFAULT_STAMP_SIZE = 360;
const DEFAULT_STAMP_ROTATION = 0;
const DEFAULT_STAMP_POSITION = { x: CANVAS_WIDTH * 0.55, y: CANVAS_HEIGHT * 0.3 };
const SETTINGS_TABLE = 'score_photo_settings';
const SETTINGS_KEY = 'global';

const createEmptyScores = (length: number) => Array.from({ length }, () => '');
const DEFAULT_EVENT_NAME = '希楽夢杯';

const sanitizeNumberInput = (value: string) => value.replace(/[^\d]/g, '');

const sumScores = (values: string[]) =>
  values.reduce((sum, value) => sum + (parseInt(value, 10) || 0), 0);

type CourseResult = {
  id: string;
  name: string;
  nameKana?: string;
  prefecture?: string;
  pars?: number[];
  parSegments?: CourseSegment[];
  parTotal?: number;
  holeCount?: number;
  normalizedName?: string;
  normalizedNameKana?: string;
  normalizedPrefecture?: string;
  normalizedId?: string;
};

type CourseSegment = {
  name: string;
  pars: number[];
};

type ParCourseData = {
  name?: string;
  prefecture?: string;
  segments: CourseSegment[];
  fullPars?: number[];
};

const normalizeKeyword = (value: string) => value.trim().toLowerCase();
type StampOption = (typeof STAMP_OPTIONS)[number];
type StampInstance = {
  id: string;
  optionId: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
};
type ScorePhotoTransientCache = {
  photoFile: File | null;
  stamps: StampInstance[];
  activeStampId: string | null;
};
const getStampById = (id: string): StampOption =>
  STAMP_OPTIONS.find((stamp) => stamp.id === id) ?? STAMP_OPTIONS[0];
const buildPublicAssetUrl = (path: string) => {
  if (!path) return '';
  const normalized = path.startsWith('/') ? path.slice(1) : path;
  return `${import.meta.env.BASE_URL}${normalized}`;
};

const scorePhotoTransientCache: ScorePhotoTransientCache = {
  photoFile: null,
  stamps: [],
  activeStampId: null,
};

const PAR_CSV_FILES = [
  '/par_hyogo_osaka_nara.csv',
  '/par_kyoto.csv',
  '/par_shiga.csv',
  '/par_all.csv',
];

const parseCsvRows = (text: string) => {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  const pushRow = () => {
    row.push(field);
    if (row.some((value) => value.trim() !== '')) {
      rows.push(row);
    }
    row = [];
    field = '';
  };

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        const next = text[i + 1];
        if (next === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }
    if (char === ',') {
      row.push(field);
      field = '';
      continue;
    }
    if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') {
        i += 1;
      }
      pushRow();
      continue;
    }
    field += char;
  }

  if (field.length > 0 || row.length > 0) {
    pushRow();
  }
  return rows;
};

const parseParCsv = (text: string) => {
  const rows = parseCsvRows(text);
  if (rows.length === 0) return {} as Record<string, ParCourseData>;
  const header = rows[0].map((value) => value.replace(/^\uFEFF/, '').trim());
  const indexOf = (name: string) => header.indexOf(name);
  let areaIndex = indexOf('region');
  let courseNameIndex = indexOf('course_title');
  let segmentNameIndex = indexOf('layout_title');
  let layoutKindIndex = indexOf('layout_kind');
  let courseIdIndex = indexOf('course_code');
  let holeIndexes = Array.from({ length: 18 }, (_, idx) => indexOf(`p${String(idx + 1).padStart(2, '0')}`));

  if (areaIndex < 0) areaIndex = indexOf('area');
  if (areaIndex < 0) areaIndex = indexOf('prefecture');
  if (courseNameIndex < 0) courseNameIndex = indexOf('golf_course');
  if (courseNameIndex < 0) courseNameIndex = indexOf('display_name');
  if (segmentNameIndex < 0) segmentNameIndex = indexOf('course_name');
  if (layoutKindIndex < 0) layoutKindIndex = indexOf('course_type');
  if (courseIdIndex < 0) courseIdIndex = indexOf('course_id');
  if (holeIndexes.every((value) => value < 0)) {
    holeIndexes = Array.from({ length: 18 }, (_, idx) => indexOf(`hole${idx + 1}_par`));
  }
  const map: Record<string, ParCourseData> = {};

  for (let i = 1; i < rows.length; i += 1) {
    const row = rows[i];
    const courseId = courseIdIndex >= 0 ? String(row[courseIdIndex] ?? '').trim() : '';
    if (!courseId) continue;
    const segmentName = segmentNameIndex >= 0 ? String(row[segmentNameIndex] ?? '').trim() : '';
    const layoutKind = layoutKindIndex >= 0 ? String(row[layoutKindIndex] ?? '').trim().toLowerCase() : '';
    const parsedPars = holeIndexes.map((index) =>
      index >= 0 ? parseInt(String(row[index] ?? '').trim(), 10) : NaN
    );
    const fullPars = parsedPars.every(Number.isFinite) ? (parsedPars as number[]) : null;
    const pars = parsedPars.filter(Number.isFinite).slice(0, 9) as number[];
    if (!segmentName && !fullPars) continue;
    const entry = map[courseId] ?? { segments: [] };
    const prefecture = areaIndex >= 0 ? String(row[areaIndex] ?? '').trim() : '';
    const courseName = courseNameIndex >= 0 ? String(row[courseNameIndex] ?? '').trim() : '';
    if (prefecture && !entry.prefecture) entry.prefecture = prefecture;
    if (courseName && !entry.name) entry.name = courseName;
    if (fullPars && fullPars.length === 18 && !entry.fullPars) {
      entry.fullPars = fullPars;
    }
    const isFullLayout = layoutKind.includes('out+in') || layoutKind.includes('all');
    if (!isFullLayout && segmentName && pars.length === 9) {
      if (!entry.segments.some((segment) => segment.name === segmentName)) {
        entry.segments.push({ name: segmentName, pars });
      }
    }
    map[courseId] = entry;
  }
  return map;
};

const mergeParMaps = (maps: Record<string, ParCourseData>[]) => {
  const merged: Record<string, ParCourseData> = {};
  maps.forEach((map) => {
    Object.entries(map).forEach(([courseId, data]) => {
      if (!merged[courseId]) {
        merged[courseId] = { ...data, segments: [...data.segments] };
        return;
      }
      const existing = merged[courseId];
      if (!existing.prefecture && data.prefecture) existing.prefecture = data.prefecture;
      if (!existing.name && data.name) existing.name = data.name;
      data.segments.forEach((segment) => {
        if (!existing.segments.some((entry) => entry.name === segment.name)) {
          existing.segments.push(segment);
        }
      });
    });
  });
  return merged;
};

const loadParCourseMap = async () => {
  const cacheBuster = typeof window !== 'undefined' ? `?ts=${Date.now()}` : '';
  const texts = await Promise.all(
    PAR_CSV_FILES.map(async (path) => {
      try {
        const response = await fetch(`${path}${cacheBuster}`, { cache: 'no-store' });
        if (!response.ok) return '';
        return await response.text();
      } catch (error) {
        return '';
      }
    })
  );
  const maps = texts.filter(Boolean).map((text) => parseParCsv(text));
  return mergeParMaps(maps);
};

const mergeCourseParData = (courses: CourseResult[], parMap: Record<string, ParCourseData>) =>
  courses.map((course) => {
    const parData = parMap[course.id];
    if (!parData) return course;
    const next: CourseResult = { ...course };
    if (!next.prefecture && parData.prefecture) {
      next.prefecture = parData.prefecture;
    }
    if (parData.fullPars && parData.fullPars.length === 18) {
      next.pars = parData.fullPars;
    }
    if (parData.segments.length >= 2) {
      next.parSegments = parData.segments;
    }
    return next;
  });

const buildEstimatedPars = (totalPar: number, holeCount: number) => {
  if (!Number.isFinite(totalPar) || holeCount !== 18) return null;
  const base = 4;
  const baseTotal = base * holeCount;
  let delta = totalPar - baseTotal;
  if (Math.abs(delta) > 6) return null;
  const pars = Array.from({ length: holeCount }, () => base);
  if (delta > 0) {
    for (let i = 0; i < delta; i += 1) {
      pars[i] = 5;
    }
  } else if (delta < 0) {
    for (let i = 0; i < Math.abs(delta); i += 1) {
      pars[i] = 3;
    }
  }
  return pars;
};

const extractLocalCourses = (data: any): CourseResult[] => {
  const items = Array.isArray(data?.entries)
    ? data.entries
    : Array.isArray(data?.courses)
      ? data.courses
      : [];
  return items
    .map((course: any) => {
      const id = String(course?.courseCode ?? course?.id ?? course?.courseId ?? course?.golfCourseId ?? '').trim();
      const name = String(course?.courseTitle ?? course?.name ?? course?.golfCourseName ?? '').trim();
      if (!id || !name) return null;
      const pars = Array.isArray(course?.parList)
        ? course.parList.map((value: any) => parseInt(value, 10)).filter(Number.isFinite)
        : Array.isArray(course?.pars)
          ? course.pars.map((value: any) => parseInt(value, 10)).filter(Number.isFinite)
        : [];
      const normalizedPars = pars.length === 18 ? pars : undefined;
      const segments = Array.isArray(course?.parSegments)
        ? course.parSegments
            .map((segment: any) => {
              const segmentName = String(segment?.name ?? '').trim();
              const segmentPars = Array.isArray(segment?.pars)
                ? segment.pars.map((value: any) => parseInt(value, 10)).filter(Number.isFinite)
                : [];
              if (!segmentName || segmentPars.length !== 9) return null;
              return { name: segmentName, pars: segmentPars } satisfies CourseSegment;
            })
            .filter(Boolean)
        : [];
      const normalizedSegments = segments.length >= 2 ? (segments as CourseSegment[]) : undefined;
      const parTotal = Number.isFinite(course?.parTotal) ? Number(course.parTotal) : undefined;
      const holeCount = Number.isFinite(course?.holes)
        ? Number(course.holes)
        : Number.isFinite(course?.holeCount)
          ? Number(course.holeCount)
          : undefined;
      return {
        id,
        name,
        nameKana: course?.courseKana || course?.nameKana || course?.golfCourseNameKana || '',
        prefecture: course?.region || course?.prefecture || course?.prefectureName || '',
        pars: normalizedPars,
        parSegments: normalizedSegments,
        parTotal,
        holeCount,
        normalizedName: normalizeKeyword(name),
        normalizedNameKana: normalizeKeyword(
          course?.courseKana || course?.nameKana || course?.golfCourseNameKana || ''
        ),
        normalizedPrefecture: normalizeKeyword(course?.region || course?.prefecture || course?.prefectureName || ''),
        normalizedId: normalizeKeyword(id),
      } satisfies CourseResult;
    })
    .filter(Boolean) as CourseResult[];
};

const matchCourse = (course: CourseResult, tokens: string[]) => {
  if (tokens.length === 0) return false;
  const name = course.normalizedName ?? normalizeKeyword(course.name);
  const nameKana = course.normalizedNameKana ?? normalizeKeyword(course.nameKana || '');
  const prefecture = course.normalizedPrefecture ?? normalizeKeyword(course.prefecture || '');
  const id = course.normalizedId ?? normalizeKeyword(course.id);
  return tokens.every((token) =>
    name.includes(token) || nameKana.includes(token) || prefecture.includes(token) || id.includes(token)
  );
};

const parseScoreValue = (value: string) => {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
};

const getScoreIcon = (scoreValue: string, parValue: string) => {
  const score = parseScoreValue(scoreValue);
  const par = parseScoreValue(parValue);
  if (score === null || par === null) return '';
  const diff = score - par;
  if (diff <= -2) return '◎';
  if (diff === -1) return '○';
  if (diff === 0) return '−';
  if (diff === 1) return '△';
  if (diff === 2) return '■';
  return `+${diff}`;
};

const formatDateDisplay = (value: string) => {
  if (!value) return '';
  const [year, month, day] = value.split('-');
  if (!year || !month || !day) return value;
  return `${year}.${month}.${day}`;
};

const drawCover = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number
) => {
  const imageRatio = img.width / img.height;
  const targetRatio = width / height;
  let drawWidth = width;
  let drawHeight = height;
  let offsetX = 0;
  let offsetY = 0;

  if (imageRatio > targetRatio) {
    drawHeight = height;
    drawWidth = height * imageRatio;
    offsetX = (width - drawWidth) / 2;
  } else {
    drawWidth = width;
    drawHeight = width / imageRatio;
    offsetY = (height - drawHeight) / 2;
  }

  ctx.drawImage(img, x + offsetX, y + offsetY, drawWidth, drawHeight);
};

export function ScorePhotoPage() {
  const [eventName, setEventName] = useState(DEFAULT_EVENT_NAME);
  const [courseName, setCourseName] = useState('');
  const [dateValue, setDateValue] = useState(() => new Date().toISOString().slice(0, 10));
  const [scores, setScores] = useState<string[]>(() => createEmptyScores(18));
  const [putts, setPutts] = useState<string[]>(() => createEmptyScores(18));
  const [pars, setPars] = useState<string[]>(() => createEmptyScores(18));
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoImage, setPhotoImage] = useState<HTMLImageElement | null>(null);
  const [watermarkText, setWatermarkText] = useState('kiramucup2026');
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.35);
  const [watermarkSize, setWatermarkSize] = useState(28);
  const [watermarkLogoSize, setWatermarkLogoSize] = useState(140);
  const [watermarkImage, setWatermarkImage] = useState<HTMLImageElement | null>(null);
  const [watermarkDataUrl, setWatermarkDataUrl] = useState('');
  const [watermarkVersion, setWatermarkVersion] = useState(0);
  const watermarkUpdatedAtRef = useRef(0);
  const [stamps, setStamps] = useState<StampInstance[]>([]);
  const [activeStampId, setActiveStampId] = useState<string | null>(null);
  const [stampLoadError, setStampLoadError] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [stampAssetsVersion, setStampAssetsVersion] = useState(0);
  const [courseKeyword, setCourseKeyword] = useState('');
  const [courseResults, setCourseResults] = useState<CourseResult[]>([]);
  const [courseStatus, setCourseStatus] = useState('');
  const [searchError, setSearchError] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [courseData, setCourseData] = useState<CourseResult[]>([]);
  const [courseDataLoaded, setCourseDataLoaded] = useState(false);
  const [parDataLoaded, setParDataLoaded] = useState(false);
  const [courseSegments, setCourseSegments] = useState<CourseSegment[]>([]);
  const [selectedOutSegment, setSelectedOutSegment] = useState('');
  const [selectedInSegment, setSelectedInSegment] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const [downloadMessage, setDownloadMessage] = useState('');
  const isLineBrowser = typeof navigator !== 'undefined' && /LINE/i.test(navigator.userAgent);
  const openExternalParam =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('openExternalBrowser') === '1';
  const shouldShowExternalPrompt = isLineBrowser || openExternalParam;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const photoFileRef = useRef<File | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const stampDragRef = useRef({ active: false, offsetX: 0, offsetY: 0 });
  const stampPointersRef = useRef(new Map<number, { x: number; y: number }>());
  const stampGestureRef = useRef<{
    stampId: string;
    optionId: string;
    center: { x: number; y: number };
    distance: number;
    angle: number;
    size: number;
    rotation: number;
  } | null>(null);
  const stampsRef = useRef<StampInstance[]>([]);
  const activeStampIdRef = useRef<string | null>(null);
  const stampIdCounterRef = useRef(0);
  const stampImageCacheRef = useRef(new Map<string, HTMLImageElement>());
  const stampImagePromiseRef = useRef(new Map<string, Promise<HTMLImageElement>>());
  const failedStampSrcRef = useRef(new Set<string>());
  const [previewSize, setPreviewSize] = useState({ width: CANVAS_WIDTH, height: CANVAS_HEIGHT });

  const outTotal = useMemo(() => sumScores(scores.slice(0, 9)), [scores]);
  const inTotal = useMemo(() => sumScores(scores.slice(9, 18)), [scores]);
  const totalScore = outTotal + inTotal;
  const puttTotal = useMemo(() => sumScores(putts), [putts]);
  const outParTotal = useMemo(() => sumScores(pars.slice(0, 9)), [pars]);
  const inParTotal = useMemo(() => sumScores(pars.slice(9, 18)), [pars]);
  const activeStamp = useMemo(
    () => stamps.find((stamp) => stamp.id === activeStampId) ?? null,
    [activeStampId, stamps]
  );
  const activeStampOption = useMemo(
    () => (activeStamp ? getStampById(activeStamp.optionId) : null),
    [activeStamp]
  );
  const activeStampSize = activeStamp?.size ?? DEFAULT_STAMP_SIZE;
  const activeStampRotation = activeStamp?.rotation ?? DEFAULT_STAMP_ROTATION;

  const getStampDimensions = useCallback((size: number, optionId?: string) => {
    const option = optionId ? getStampById(optionId) : null;
    const src = option?.src ? buildPublicAssetUrl(option.src) : '';
    const image = src ? stampImageCacheRef.current.get(src) : null;
    const ratio = image && image.naturalWidth > 0 ? image.naturalWidth / image.naturalHeight : 1;
    const width = Math.min(STAMP_MAX_SIZE, Math.max(STAMP_MIN_SIZE, size));
    return { width, height: width / ratio };
  }, []);

  const previewScale = useMemo(() => {
    return {
      x: previewSize.width / CANVAS_WIDTH,
      y: previewSize.height / CANVAS_HEIGHT,
    };
  }, [previewSize]);

  const stampDisplays = useMemo(() => {
    return stamps.map((stamp) => {
      const option = getStampById(stamp.optionId);
      const src = option.src ? buildPublicAssetUrl(option.src) : '';
      const dimensions = getStampDimensions(stamp.size, stamp.optionId);
      return {
        id: stamp.id,
        src,
        label: option.label,
        width: dimensions.width * previewScale.x,
        height: dimensions.height * previewScale.y,
        x: stamp.x * previewScale.x,
        y: stamp.y * previewScale.y,
        rotation: stamp.rotation,
      };
    });
  }, [getStampDimensions, previewScale, stampAssetsVersion, stamps]);

  useEffect(() => {
    stampsRef.current = stamps;
  }, [stamps]);

  useEffect(() => {
    activeStampIdRef.current = activeStampId;
  }, [activeStampId]);

  useEffect(() => {
    scorePhotoTransientCache.stamps = stamps;
    scorePhotoTransientCache.activeStampId = activeStampId;
  }, [activeStampId, stamps]);

  useEffect(() => {
    if (stamps.length === 0) {
      if (activeStampId !== null) setActiveStampId(null);
      return;
    }
    if (!activeStampId || !stamps.some((stamp) => stamp.id === activeStampId)) {
      setActiveStampId(stamps[stamps.length - 1]?.id ?? null);
    }
  }, [activeStampId, stamps]);

  useEffect(() => {
    if (scorePhotoTransientCache.photoFile && !photoUrl) {
      photoFileRef.current = scorePhotoTransientCache.photoFile;
      const url = URL.createObjectURL(scorePhotoTransientCache.photoFile);
      setPhotoUrl(url);
    }
    if (scorePhotoTransientCache.stamps.length > 0 && stamps.length === 0) {
      setStamps(scorePhotoTransientCache.stamps);
      setActiveStampId(scorePhotoTransientCache.activeStampId);
    }
  }, [photoUrl, stamps.length]);

  const handleScoreChange = (index: number, value: string) => {
    const next = [...scores];
    next[index] = sanitizeNumberInput(value);
    setScores(next);
  };

  const handleParChange = (index: number, value: string) => {
    const next = [...pars];
    next[index] = sanitizeNumberInput(value);
    setPars(next);
  };

  const handleCourseSearch = async () => {
    setSearchError('');
    setCourseStatus('');
    if (!courseKeyword.trim()) {
      setSearchError('検索ワードを入力してください。');
      return;
    }

    setIsSearching(true);
    try {
      let courses = courseData;
      if (!courseDataLoaded) {
        setCourseStatus('コースデータを読み込み中...');
        const cacheBuster = typeof window !== 'undefined' ? `?ts=${Date.now()}` : '';
        const response = await fetch(`/course-index.json${cacheBuster}`, { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('course_data_not_found');
        }
        const data = await response.json();
        courses = extractLocalCourses(data);
        setCourseData(courses);
        setCourseDataLoaded(true);
        setCourseStatus('');
      }
      if (!parDataLoaded) {
        setCourseStatus('パーデータを読み込み中...');
        const parMap = await loadParCourseMap();
        if (Object.keys(parMap).length > 0) {
          courses = mergeCourseParData(courses, parMap);
          setCourseData(courses);
          setParDataLoaded(true);
          setCourseStatus('');
        } else {
          setCourseStatus('パーデータCSVを読み込めませんでした。public/par_*.csv を確認してください。');
        }
      }
      const tokens = normalizeKeyword(courseKeyword).split(/\s+/).filter(Boolean);
      const results = courses.filter((course) => matchCourse(course, tokens)).slice(0, 50);
      setCourseResults(results);
      if (results.length === 0) {
        setSearchError('該当するゴルフ場が見つかりませんでした。');
      }
    } catch (error) {
      setSearchError('コースデータを読み込めませんでした。public/course-index.json を確認してください。');
    } finally {
      setIsSearching(false);
    }
  };

  const applySegmentPars = useCallback(
    (segments: CourseSegment[], outName: string, inName: string) => {
      const outSegment = segments.find((segment) => segment.name === outName);
      const inSegment = segments.find((segment) => segment.name === inName);
      if (!outSegment || !inSegment) {
        return false;
      }
      const combined = [...outSegment.pars, ...inSegment.pars];
      if (combined.length !== 18) {
        return false;
      }
      setPars(combined.map((value) => String(value)));
      setCourseStatus(`パー情報を反映しました（${outSegment.name} / ${inSegment.name}）。`);
      return true;
    },
    []
  );

  const handleSegmentSelection = (type: 'out' | 'in', value: string) => {
    const nextOut = type === 'out' ? value : selectedOutSegment;
    const nextIn = type === 'in' ? value : selectedInSegment;
    setSelectedOutSegment(nextOut);
    setSelectedInSegment(nextIn);
    if (!applySegmentPars(courseSegments, nextOut, nextIn)) {
      setCourseStatus('コースを選択するとパーを反映します。');
    }
  };

  const handleCourseSelect = (course: CourseResult) => {
    const prevCourseName = courseName;
    const prevOutSegment = selectedOutSegment;
    const prevInSegment = selectedInSegment;
    setCourseName(course.name);
    setSearchError('');
    setCourseResults([]);
    const segments = course.parSegments ?? [];
    setCourseSegments(segments);
    if (segments.length >= 2) {
      const hasSaved =
        prevCourseName === course.name &&
        prevOutSegment &&
        prevInSegment &&
        segments.some((segment) => segment.name === prevOutSegment) &&
        segments.some((segment) => segment.name === prevInSegment);
      const outName = hasSaved ? prevOutSegment : segments[0].name;
      const inName = hasSaved ? prevInSegment : segments[1]?.name ?? segments[0].name;
      setSelectedOutSegment(outName);
      setSelectedInSegment(inName);
      if (!applySegmentPars(segments, outName, inName)) {
        setCourseStatus('コースを選択するとパーを反映します。');
      }
      return;
    }
    setSelectedOutSegment('');
    setSelectedInSegment('');
    if (course.pars && course.pars.length === 18) {
      setPars(course.pars.map((value) => String(value)));
      setCourseStatus('パー情報を反映しました。');
      return;
    }
    if (course.parTotal && course.holeCount) {
      const estimated = buildEstimatedPars(course.parTotal, course.holeCount);
      if (estimated) {
        setPars(estimated.map((value) => String(value)));
        setCourseStatus('総パーから自動反映しました（推定）。');
        return;
      }
    }
    setCourseStatus('パー情報が見つかりませんでした。手入力してください。');
  };

  const handlePuttChange = (index: number, value: string) => {
    const next = [...putts];
    next[index] = sanitizeNumberInput(value);
    setPutts(next);
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    photoFileRef.current = file;
    scorePhotoTransientCache.photoFile = file;
    const url = URL.createObjectURL(file);
    setPhotoUrl(url);
  };

  const ensureStampImage = useCallback((src: string) => {
    if (!src) return Promise.resolve(null);
    if (failedStampSrcRef.current.has(src)) {
      return Promise.reject(new Error('stamp_load_failed'));
    }
    const cached = stampImageCacheRef.current.get(src);
    if (cached && cached.complete && cached.naturalWidth > 0) {
      return Promise.resolve(cached);
    }
    const existingPromise = stampImagePromiseRef.current.get(src);
    if (existingPromise) return existingPromise;
    const img = cached ?? new Image();
    stampImageCacheRef.current.set(src, img);
    const promise = new Promise<HTMLImageElement>((resolve, reject) => {
      img.onload = () => {
        stampImagePromiseRef.current.delete(src);
        failedStampSrcRef.current.delete(src);
        setStampAssetsVersion((value) => value + 1);
        resolve(img);
      };
      img.onerror = () => {
        stampImagePromiseRef.current.delete(src);
        failedStampSrcRef.current.add(src);
        setStampAssetsVersion((value) => value + 1);
        reject(new Error('stamp_load_failed'));
      };
    });
    stampImagePromiseRef.current.set(src, promise);
    img.src = src;
    return promise;
  }, []);

  useEffect(() => {
    if (stamps.length === 0) return;
    const sources = Array.from(
      new Set(
        stamps
          .map((stamp) => {
            const option = getStampById(stamp.optionId);
            return option.src ? buildPublicAssetUrl(option.src) : '';
          })
          .filter(Boolean)
      )
    );
    sources.forEach((src) => {
      ensureStampImage(src).catch(() => {
        return;
      });
    });
  }, [ensureStampImage, stamps]);

  const updateStamp = useCallback((stampId: string, updater: (stamp: StampInstance) => StampInstance) => {
    setStamps((prev) => prev.map((stamp) => (stamp.id === stampId ? updater(stamp) : stamp)));
  }, []);

  const addStamp = useCallback(
    (optionId: string) => {
      if (optionId === DEFAULT_STAMP_ID) return;
      const option = getStampById(optionId);
      if (!option.src) return;
      const src = buildPublicAssetUrl(option.src);
      const stampId = `stamp-${stampIdCounterRef.current++}`;
      const newStamp: StampInstance = {
        id: stampId,
        optionId,
        x: DEFAULT_STAMP_POSITION.x,
        y: DEFAULT_STAMP_POSITION.y,
        size: DEFAULT_STAMP_SIZE,
        rotation: DEFAULT_STAMP_ROTATION,
      };
      setStamps((prev) => [...prev, newStamp]);
      setActiveStampId(stampId);
      setStampLoadError('');
      ensureStampImage(src).catch(() => {
        setStampLoadError('スタンプ画像が読み込めませんでした。画像を確認してください。');
        setStamps((prev) => prev.filter((stamp) => stamp.id !== stampId));
      });
    },
    [ensureStampImage]
  );

  const removeStamp = useCallback((stampId: string) => {
    if (activeStampIdRef.current === stampId) {
      stampPointersRef.current.clear();
      stampDragRef.current.active = false;
      stampGestureRef.current = null;
      activeStampIdRef.current = null;
    }
    setStamps((prev) => prev.filter((stamp) => stamp.id !== stampId));
  }, []);

  const handleRemoveActiveStamp = () => {
    if (!activeStampId) return;
    removeStamp(activeStampId);
  };

  const handleResetStamps = () => {
    stampPointersRef.current.clear();
    stampDragRef.current.active = false;
    stampGestureRef.current = null;
    activeStampIdRef.current = null;
    setStamps([]);
    setActiveStampId(null);
    setStampLoadError('');
  };

  const handleStampResetPosition = () => {
    if (!activeStampId) return;
    updateStamp(activeStampId, (stamp) => ({
      ...stamp,
      x: DEFAULT_STAMP_POSITION.x,
      y: DEFAULT_STAMP_POSITION.y,
    }));
  };

  const handleStampResetRotation = () => {
    if (!activeStampId) return;
    updateStamp(activeStampId, (stamp) => ({
      ...stamp,
      rotation: DEFAULT_STAMP_ROTATION,
    }));
  };

  const clampStampPosition = useCallback(
    (x: number, y: number, size: number, optionId: string) => {
      const dimensions = getStampDimensions(size, optionId);
      if (!dimensions.width || !dimensions.height) return { x, y };
      const halfW = dimensions.width / 2;
      const halfH = dimensions.height / 2;
      const clampedX = Math.min(CANVAS_WIDTH - halfW, Math.max(halfW, x));
      const clampedY = Math.min(CANVAS_HEIGHT - halfH, Math.max(halfH, y));
      return { x: clampedX, y: clampedY };
    },
    [getStampDimensions]
  );

  const getPointerPosition = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const rect = previewRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const x = (event.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
    const y = (event.clientY - rect.top) * (CANVAS_HEIGHT / rect.height);
    return { x, y };
  }, []);

  const handleStampPointerDown = useCallback(
    (stampId: string, event: React.PointerEvent<HTMLDivElement>) => {
      const stamp = stampsRef.current.find((item) => item.id === stampId);
      if (!stamp) return;
      const point = getPointerPosition(event);
      if (!point) return;
      event.preventDefault();
      if (activeStampIdRef.current !== stampId) {
        stampPointersRef.current.clear();
        stampGestureRef.current = null;
        stampDragRef.current.active = false;
      }
      setActiveStampId(stampId);
      activeStampIdRef.current = stampId;
      event.currentTarget.setPointerCapture?.(event.pointerId);
      stampPointersRef.current.set(event.pointerId, point);
      if (stampPointersRef.current.size === 1) {
        stampGestureRef.current = null;
        stampDragRef.current.active = true;
        stampDragRef.current.offsetX = point.x - stamp.x;
        stampDragRef.current.offsetY = point.y - stamp.y;
      } else if (stampPointersRef.current.size === 2) {
        const points = Array.from(stampPointersRef.current.values());
        const center = {
          x: (points[0].x + points[1].x) / 2,
          y: (points[0].y + points[1].y) / 2,
        };
        const distance = Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y);
        const angle = Math.atan2(points[1].y - points[0].y, points[1].x - points[0].x);
        stampGestureRef.current = {
          stampId,
          optionId: stamp.optionId,
          center,
          distance,
          angle,
          size: stamp.size,
          rotation: stamp.rotation,
        };
        stampDragRef.current.active = false;
      }
    },
    [getPointerPosition]
  );

  const handleStampPointerMove = useCallback(
    (stampId: string, event: React.PointerEvent<HTMLDivElement>) => {
      if (activeStampIdRef.current !== stampId) return;
      if (!stampPointersRef.current.has(event.pointerId)) return;
      const point = getPointerPosition(event);
      if (!point) return;
      event.preventDefault();
      stampPointersRef.current.set(event.pointerId, point);
      if (stampPointersRef.current.size === 1 && stampDragRef.current.active) {
        const stamp = stampsRef.current.find((item) => item.id === stampId);
        if (!stamp) return;
        const nextX = point.x - stampDragRef.current.offsetX;
        const nextY = point.y - stampDragRef.current.offsetY;
        const clamped = clampStampPosition(nextX, nextY, stamp.size, stamp.optionId);
        updateStamp(stampId, (current) => ({ ...current, x: clamped.x, y: clamped.y }));
        return;
      }
      if (stampPointersRef.current.size >= 2) {
        const points = Array.from(stampPointersRef.current.values()).slice(0, 2);
        const center = {
          x: (points[0].x + points[1].x) / 2,
          y: (points[0].y + points[1].y) / 2,
        };
        const distance = Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y);
        const angle = Math.atan2(points[1].y - points[0].y, points[1].x - points[0].x);
        const gesture = stampGestureRef.current;
        if (!gesture || !gesture.distance || gesture.stampId !== stampId) return;
        const scale = distance / gesture.distance;
        const nextSize = Math.min(STAMP_MAX_SIZE, Math.max(STAMP_MIN_SIZE, gesture.size * scale));
        const rotationDelta = ((angle - gesture.angle) * 180) / Math.PI;
        const nextRotation = gesture.rotation + rotationDelta;
        const clamped = clampStampPosition(center.x, center.y, nextSize, gesture.optionId);
        updateStamp(stampId, (current) => ({
          ...current,
          size: nextSize,
          rotation: nextRotation,
          x: clamped.x,
          y: clamped.y,
        }));
      }
    },
    [clampStampPosition, getPointerPosition, updateStamp]
  );

  const handleStampPointerUp = useCallback((stampId: string, event: React.PointerEvent<HTMLDivElement>) => {
    if (activeStampIdRef.current !== stampId) return;
    stampPointersRef.current.delete(event.pointerId);
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    if (stampPointersRef.current.size < 2) {
      stampGestureRef.current = null;
    }
    if (stampPointersRef.current.size === 1) {
      const stamp = stampsRef.current.find((item) => item.id === stampId);
      const remaining = Array.from(stampPointersRef.current.values())[0];
      if (stamp && remaining) {
        stampDragRef.current.active = true;
        stampDragRef.current.offsetX = remaining.x - stamp.x;
        stampDragRef.current.offsetY = remaining.y - stamp.y;
      }
    } else {
      stampDragRef.current.active = false;
    }
  }, []);

  const goBack = () => {
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const setTemporaryDownloadMessage = (message: string) => {
    setDownloadMessage(message);
    window.setTimeout(() => setDownloadMessage(''), 3000);
  };

  const handleDownload = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const safeName = eventName || 'score-photo';
    if (isLineBrowser) {
      setTemporaryDownloadMessage('右上のメニューから外部ブラウザで開いて保存してください。');
      return;
    }
    if (stamps.length > 0) {
      const sources = stamps
        .map((stamp) => {
          const option = getStampById(stamp.optionId);
          return option.src ? buildPublicAssetUrl(option.src) : '';
        })
        .filter(Boolean);
      await Promise.all(sources.map((src) => ensureStampImage(src).catch(() => null)));
    }
    setIsExporting(true);
    await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
    await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
    canvas.toBlob((blob) => {
      if (!blob) {
        setIsExporting(false);
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${safeName}-${formatDateDisplay(dateValue) || 'score'}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 10000);
      setIsExporting(false);
    }, 'image/png');
  };

  const handleSaveDraft = () => {
    const payload = {
      eventName,
      courseName,
      dateValue,
      scores,
      putts,
      pars,
      courseKeyword,
      selectedOutSegment,
      selectedInSegment,
    };
    try {
      window.localStorage.setItem(SCORE_DRAFT_STORAGE_KEY, JSON.stringify(payload));
      setSaveMessage('保存しました');
    } catch (error) {
      setSaveMessage('保存に失敗しました');
    }
    window.setTimeout(() => setSaveMessage(''), 2000);
  };

  const handleResetDraft = () => {
    setEventName(DEFAULT_EVENT_NAME);
    setCourseName('');
    setDateValue(new Date().toISOString().slice(0, 10));
    setScores(createEmptyScores(18));
    setPutts(createEmptyScores(18));
    setPars(createEmptyScores(18));
    setCourseKeyword('');
    setCourseResults([]);
    setCourseSegments([]);
    setSelectedOutSegment('');
    setSelectedInSegment('');
    setCourseStatus('');
    setSearchError('');
    setPhotoUrl('');
    photoFileRef.current = null;
    scorePhotoTransientCache.photoFile = null;
    handleResetStamps();
    setSaveMessage('リセットしました');
    try {
      window.localStorage.removeItem(SCORE_DRAFT_STORAGE_KEY);
    } catch (error) {
      return;
    }
    window.setTimeout(() => setSaveMessage(''), 2000);
  };

  const applyWatermarkSettings = useCallback((partial: {
    text?: string;
    opacity?: number;
    size?: number;
    logoDataUrl?: string;
    logoSize?: number;
  }) => {
    if (partial.text !== undefined) setWatermarkText(partial.text);
    if (partial.opacity !== undefined) setWatermarkOpacity(partial.opacity);
    if (partial.size !== undefined) setWatermarkSize(partial.size);
    if (partial.logoDataUrl !== undefined) setWatermarkDataUrl(partial.logoDataUrl || '');
    if (partial.logoSize !== undefined) setWatermarkLogoSize(partial.logoSize);
  }, []);

  const applyWatermarkSettingsFromStorage = useCallback(() => {
    if (typeof window === 'undefined') return;
    const cached = readWatermarkCache();
    if (cached) {
      const cachedUpdatedAt =
        typeof cached.updatedAt === 'number' && !Number.isNaN(cached.updatedAt) ? cached.updatedAt : undefined;
      const shouldApplyCached =
        cachedUpdatedAt === undefined
          ? watermarkUpdatedAtRef.current === 0
          : cachedUpdatedAt >= watermarkUpdatedAtRef.current;
      if (shouldApplyCached) {
        applyWatermarkSettings({
          text: cached.text,
          opacity: cached.opacity,
          size: cached.size,
          logoDataUrl: cached.logoDataUrl,
          logoSize: cached.logoSize,
        });
        if (cachedUpdatedAt !== undefined) {
          watermarkUpdatedAtRef.current = cachedUpdatedAt;
        }
      }
    }
    try {
      const stored = window.localStorage.getItem(WATERMARK_STORAGE_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored) as Partial<{
        text: string;
        opacity: number;
        size: number;
        logoDataUrl: string;
        logoSize: number;
        updatedAt?: number;
      }>;
      const parsedUpdatedAt =
        typeof parsed.updatedAt === 'number' && !Number.isNaN(parsed.updatedAt) ? parsed.updatedAt : undefined;
      const shouldApplyStored =
        parsedUpdatedAt === undefined
          ? watermarkUpdatedAtRef.current === 0
          : parsedUpdatedAt >= watermarkUpdatedAtRef.current;
      if (!shouldApplyStored) return;
      const nextSettings = {
        text: parsed.text,
        opacity: parsed.opacity,
        size: parsed.size,
        logoDataUrl: parsed.logoDataUrl,
        logoSize: parsed.logoSize,
      };
      applyWatermarkSettings(nextSettings);
      if (parsedUpdatedAt !== undefined) {
        watermarkUpdatedAtRef.current = parsedUpdatedAt;
      }
      writeWatermarkCache({ ...nextSettings, updatedAt: parsedUpdatedAt });
    } catch (error) {
      return;
    }
  }, [applyWatermarkSettings, readWatermarkCache, writeWatermarkCache]);

  const fetchWatermarkSettingsFromSupabase = useCallback(async () => {
    applyWatermarkSettingsFromStorage();
    if (!isMediaSupabaseConfigured) return;
    const { data, error } = await mediaSupabase
      .from(SETTINGS_TABLE)
      .select('text, opacity, size, logo_data_url, logo_size, updated_at')
      .eq('settings_key', SETTINGS_KEY)
      .maybeSingle();
    if (error || !data) return;
    const parsedUpdatedAt = data.updated_at ? Date.parse(data.updated_at) : undefined;
    const remoteUpdatedAt = Number.isNaN(parsedUpdatedAt ?? NaN) ? undefined : parsedUpdatedAt;
    const shouldApplyRemote =
      remoteUpdatedAt === undefined
        ? watermarkUpdatedAtRef.current === 0
        : remoteUpdatedAt >= watermarkUpdatedAtRef.current;
    if (!shouldApplyRemote) return;
    const nextSettings = {
      text: data.text ?? undefined,
      opacity: typeof data.opacity === 'number' ? data.opacity : undefined,
      size: typeof data.size === 'number' ? data.size : undefined,
      logoDataUrl: data.logo_data_url ?? '',
      logoSize: typeof data.logo_size === 'number' ? data.logo_size : undefined,
    };
    applyWatermarkSettings(nextSettings);
    if (remoteUpdatedAt !== undefined) {
      watermarkUpdatedAtRef.current = remoteUpdatedAt;
    }
    const localPayload = { ...nextSettings, updatedAt: remoteUpdatedAt };
    writeWatermarkCache(localPayload);
    try {
      window.localStorage.setItem(WATERMARK_STORAGE_KEY, JSON.stringify(localPayload));
    } catch (storageError) {
      return;
    }
  }, [applyWatermarkSettings, applyWatermarkSettingsFromStorage, writeWatermarkCache]);

  useEffect(() => {
    fetchWatermarkSettingsFromSupabase();
    const handleFocus = () => fetchWatermarkSettingsFromSupabase();
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchWatermarkSettingsFromSupabase();
      }
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key === WATERMARK_STORAGE_KEY) {
        applyWatermarkSettingsFromStorage();
      }
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('storage', handleStorage);
    };
  }, [applyWatermarkSettingsFromStorage, fetchWatermarkSettingsFromSupabase]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = window.localStorage.getItem(SCORE_DRAFT_STORAGE_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored) as Partial<{
        eventName: string;
        courseName: string;
        dateValue: string;
        scores: string[];
        putts: string[];
        pars: string[];
        courseKeyword: string;
        selectedOutSegment: string;
        selectedInSegment: string;
      }>;
      if (parsed.eventName !== undefined) setEventName(parsed.eventName);
      if (parsed.courseName !== undefined) setCourseName(parsed.courseName);
      if (parsed.dateValue !== undefined) setDateValue(parsed.dateValue);
      if (Array.isArray(parsed.scores)) setScores(parsed.scores);
      if (Array.isArray(parsed.putts)) setPutts(parsed.putts);
      if (Array.isArray(parsed.pars)) setPars(parsed.pars);
      if (parsed.courseKeyword !== undefined) setCourseKeyword(parsed.courseKeyword);
      if (parsed.selectedOutSegment !== undefined) setSelectedOutSegment(parsed.selectedOutSegment);
      if (parsed.selectedInSegment !== undefined) setSelectedInSegment(parsed.selectedInSegment);
      setSaveMessage('前回の入力を復元しました');
      window.setTimeout(() => setSaveMessage(''), 2000);
    } catch (error) {
      return;
    }
  }, []);

  useEffect(() => {
    if (!photoUrl) {
      setPhotoImage(null);
      return;
    }
    const img = new Image();
    img.onload = () => setPhotoImage(img);
    img.src = photoUrl;
    return () => {
      URL.revokeObjectURL(photoUrl);
    };
  }, [photoUrl]);

  useEffect(() => {
    setWatermarkVersion(Date.now());
  }, [watermarkDataUrl]);

  useEffect(() => {
    const logoSrc = watermarkDataUrl || DEFAULT_WATERMARK_LOGO_URL;
    if (!logoSrc) {
      setWatermarkImage(null);
      return;
    }
    const isDataUrl = logoSrc.startsWith('data:');
    const resolvedSrc = isDataUrl
      ? logoSrc
      : `${logoSrc}${logoSrc.includes('?') ? '&' : '?'}v=${watermarkVersion}`;
    setWatermarkImage(null);
    const img = new Image();
    img.onload = () => setWatermarkImage(img);
    img.onerror = () => setWatermarkImage(null);
    img.src = resolvedSrc;
  }, [watermarkDataUrl, watermarkVersion]);

  useEffect(() => {
    if (stamps.length === 0) return;
    setStamps((prev) => {
      let changed = false;
      const next = prev.map((stamp) => {
        const clamped = clampStampPosition(stamp.x, stamp.y, stamp.size, stamp.optionId);
        if (clamped.x === stamp.x && clamped.y === stamp.y) {
          return stamp;
        }
        changed = true;
        return { ...stamp, x: clamped.x, y: clamped.y };
      });
      return changed ? next : prev;
    });
  }, [clampStampPosition, stampAssetsVersion, stamps.length]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const target = previewRef.current;
    if (!target) return;
    const update = () => {
      const rect = target.getBoundingClientRect();
      if (rect.width && rect.height) {
        setPreviewSize({ width: rect.width, height: rect.height });
      }
    };
    update();
    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(update);
      observer.observe(target);
    }
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('resize', update);
      if (observer) observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    ctx.fillStyle = '#121212';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (photoImage) {
      drawCover(ctx, photoImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    } else {
      ctx.fillStyle = '#1f1f1f';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 36px Jost, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('写真をアップロード', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    }

    const overlayHeight = 360;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.fillRect(0, CANVAS_HEIGHT - overlayHeight, CANVAS_WIDTH, overlayHeight);

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.font = '700 42px Jost, sans-serif';
    if (eventName) {
      ctx.fillText(eventName, 60, CANVAS_HEIGHT - overlayHeight + 70);
    }

    ctx.font = '600 28px Jost, sans-serif';
    const dateDisplay = formatDateDisplay(dateValue);
    const courseLine = [dateDisplay, courseName].filter(Boolean).join('  ');
    ctx.fillText(courseLine || '日付 / コース名', 60, CANVAS_HEIGHT - overlayHeight + 110);

    const overlayTop = CANVAS_HEIGHT - overlayHeight;

    ctx.textAlign = 'right';
    ctx.font = '700 48px Jost, sans-serif';
    ctx.fillText(`${totalScore || 0}`, CANVAS_WIDTH - 60, overlayTop + 90);
    ctx.font = '600 22px Jost, sans-serif';
    ctx.fillText('TOTAL', CANVAS_WIDTH - 60, overlayTop + 125);

    const totalsParts = [`OUT ${outTotal}`, `IN ${inTotal}`];
    if (puttTotal > 0) {
      totalsParts.push(`PUTT ${puttTotal}`);
    }
    ctx.textAlign = 'center';
    ctx.font = '800 34px Jost, sans-serif';
    ctx.fillText(totalsParts.join('   '), CANVAS_WIDTH / 2, overlayTop + 175);

    const lineY = overlayTop + 225;
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(60, lineY - 24);
    ctx.lineTo(CANVAS_WIDTH - 60, lineY - 24);
    ctx.stroke();

    const midGap = 24;
    const cellWidth = (CANVAS_WIDTH - 120 - midGap) / 18;
    ctx.textAlign = 'center';
    for (let i = 0; i < 18; i += 1) {
      const offset = i >= 9 ? midGap : 0;
      const centerX = 60 + cellWidth * i + offset + cellWidth / 2;
      ctx.font = '600 20px Jost, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`${i + 1}`, centerX, lineY);
      ctx.font = '600 16px Jost, sans-serif';
      const parText = pars[i] ? `Par${pars[i]}` : '';
      ctx.fillText(parText, centerX, lineY + 22);
      ctx.font = '700 24px Jost, sans-serif';
      const scoreText = scores[i] ? scores[i] : '-';
      ctx.fillText(scoreText, centerX, lineY + 54);
      ctx.font = '700 20px Jost, sans-serif';
      const icon = getScoreIcon(scores[i], pars[i]);
      if (icon) {
        ctx.fillText(icon, centerX, lineY + 86);
      }
    }

    const watermarkTop = 40;
    const watermarkLeft = 40;
    const watermarkRight = 40;

    if (watermarkText) {
      ctx.save();
      ctx.globalAlpha = watermarkOpacity;
      ctx.fillStyle = '#ffffff';
      ctx.font = `600 ${watermarkSize}px Jost, sans-serif`;
      ctx.textAlign = 'right';
      ctx.fillText(watermarkText, CANVAS_WIDTH - watermarkRight, watermarkTop + watermarkSize);
      ctx.restore();
    }

    if (watermarkImage) {
      const maxWidth = Math.min(220, Math.max(60, watermarkLogoSize));
      const ratio = watermarkImage.width / watermarkImage.height;
      const drawWidth = maxWidth;
      const drawHeight = maxWidth / ratio;
      ctx.save();
      ctx.globalAlpha = Math.min(0.8, watermarkOpacity + 0.2);
      ctx.drawImage(watermarkImage, watermarkLeft, watermarkTop, drawWidth, drawHeight);
      ctx.restore();
    }

    if (isExporting && stamps.length > 0) {
      stamps.forEach((stamp) => {
        const option = getStampById(stamp.optionId);
        if (!option.src) return;
        const src = buildPublicAssetUrl(option.src);
        const image = stampImageCacheRef.current.get(src);
        if (!image || image.naturalWidth === 0) return;
        const dimensions = getStampDimensions(stamp.size, stamp.optionId);
        ctx.save();
        ctx.globalAlpha = 1;
        ctx.translate(stamp.x, stamp.y);
        ctx.rotate((stamp.rotation * Math.PI) / 180);
        ctx.drawImage(image, -dimensions.width / 2, -dimensions.height / 2, dimensions.width, dimensions.height);
        ctx.restore();
      });
    }
  }, [
    photoImage,
    eventName,
    courseName,
    dateValue,
    scores,
    outTotal,
    inTotal,
    totalScore,
    puttTotal,
    pars,
    outParTotal,
    inParTotal,
    watermarkText,
    watermarkOpacity,
    watermarkSize,
    watermarkLogoSize,
    watermarkImage,
    isExporting,
    stampAssetsVersion,
    stamps,
  ]);

  return (
    <div className="min-h-screen bg-yellow-300">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <button
          onClick={goBack}
          className="mb-6 flex items-center gap-2 bg-yellow-400 px-6 py-3 border-4 border-black font-black uppercase hover:translate-x-1 hover:translate-y-1 transition-transform"
          style={{ boxShadow: '4px 4px 0 0 var(--shadow-color)' }}
        >
          <ArrowLeft className="w-5 h-5" />
          戻る
        </button>

        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-5xl font-black mb-4 uppercase" style={{ color: 'var(--accent)' }}>
            スコアフォト作成
          </h1>
          <p className="text-black text-lg font-bold">
            写真にスコアを重ねて保存できます（無料）
          </p>
        </div>

        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-8">
          <div className="bg-white border-4 border-black p-6 md:p-8" style={{ boxShadow: '8px 8px 0 0 var(--shadow-color)' }}>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-black text-black mb-2 uppercase">大会名</label>
                <input
                  type="text"
                  value={eventName}
                  onChange={(event) => setEventName(event.target.value)}
                  className="w-full px-4 py-3 border-4 border-black focus:outline-none font-bold"
                  placeholder="希楽夢杯"
                />
              </div>
              <div>
                <label className="block text-sm font-black text-black mb-2 uppercase">日付</label>
                <div className="w-full border-4 border-black px-4 py-3 box-border overflow-hidden">
                  <input
                    type="date"
                    value={dateValue}
                    onChange={(event) => setDateValue(event.target.value)}
                    className="w-full min-w-0 bg-transparent focus:outline-none font-bold"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-black text-black mb-2 uppercase">ゴルフ場名（下記で検索）</label>
                <input
                  type="text"
                  value={courseName}
                  onChange={(event) => setCourseName(event.target.value)}
                  className="w-full px-4 py-3 border-4 border-black focus:outline-none font-bold"
                  placeholder="ゴルフ場名を入力"
                />
                <p className="mt-1 text-xs font-bold text-black">
                  検索で選択するとパーを自動反映します
                </p>
              </div>
            </div>

            <div className="mt-6 bg-yellow-100 border-4 border-black p-4" style={{ boxShadow: '4px 4px 0 0 var(--shadow-color)' }}>
              <label className="block text-sm font-black text-black mb-2 uppercase">
                ゴルフ場検索（全国データ）
              </label>
              <div className="flex flex-wrap gap-2">
                <input
                  type="text"
                  value={courseKeyword}
                  onChange={(event) => setCourseKeyword(event.target.value)}
                  className="flex-1 min-w-[200px] px-4 py-3 border-4 border-black focus:outline-none font-bold"
                  placeholder="例：宇治田原"
                />
                <button
                  type="button"
                  onClick={handleCourseSearch}
                  disabled={isSearching}
                  className="px-4 py-3 border-4 border-black bg-white text-black font-black uppercase hover:translate-x-0.5 hover:translate-y-0.5 transition-transform disabled:opacity-50"
                  style={{ boxShadow: '4px 4px 0 0 var(--shadow-color)' }}
                >
                  {isSearching ? '検索中...' : '検索'}
                </button>
              </div>
              {searchError && (
                <div className="mt-3 bg-red-400 border-4 border-black text-black px-4 py-2 font-bold">
                  {searchError}
                </div>
              )}
              {courseStatus && (
                <div className="mt-3 bg-white border-4 border-black text-black px-4 py-2 font-bold">
                  {courseStatus}
                </div>
              )}
              {courseResults.length > 0 && (
                <div className="mt-4 max-h-56 overflow-auto space-y-2">
                  {courseResults.map((course) => (
                    <button
                      key={course.id}
                      type="button"
                      onClick={() => handleCourseSelect(course)}
                      className="w-full text-left border-4 border-black bg-white px-4 py-3 font-bold hover:bg-yellow-200 transition-colors"
                      style={{ boxShadow: '4px 4px 0 0 var(--shadow-color)' }}
                    >
                      <div className="text-base">{course.name}</div>
                      {course.prefecture && (
                        <div className="text-xs text-black/70">{course.prefecture}</div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {courseSegments.length > 0 && (
              <div
                className="mt-6 bg-white border-4 border-black p-4"
                style={{ boxShadow: '4px 4px 0 0 var(--shadow-color)' }}
              >
                <div className="text-sm font-black text-black uppercase">コース選択（9H × 2）</div>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="block text-xs font-black text-black mb-1 uppercase">OUTコース</label>
                    <select
                      value={selectedOutSegment}
                      onChange={(event) => handleSegmentSelection('out', event.target.value)}
                      className="w-full px-3 py-2 border-4 border-black font-bold"
                    >
                      {courseSegments.map((segment) => (
                        <option key={`out-${segment.name}`} value={segment.name}>
                          {segment.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-black mb-1 uppercase">INコース</label>
                    <select
                      value={selectedInSegment}
                      onChange={(event) => handleSegmentSelection('in', event.target.value)}
                      className="w-full px-3 py-2 border-4 border-black font-bold"
                    >
                      {courseSegments.map((segment) => (
                        <option key={`in-${segment.name}`} value={segment.name}>
                          {segment.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <p className="mt-2 text-xs font-bold text-black">
                  コースを選択するとパーが切り替わります。
                </p>
              </div>
            )}

            <div className="mt-6">
              <label className="block text-sm font-black text-black mb-2 uppercase">写真アップロード</label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="w-full border-4 border-black bg-yellow-100 px-4 py-3 font-bold"
              />
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-black uppercase">パー入力</h3>
                <div className="text-sm font-black text-black">合計 {outParTotal + inParTotal}</div>
              </div>
              <div className="mt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-black">OUT</span>
                  <span className="text-sm font-black text-black">合計 {outParTotal}</span>
                </div>
                <div className="mt-2 grid grid-cols-9 gap-2">
                  {pars.slice(0, 9).map((value, index) => (
                    <input
                      key={`par-out-${index}`}
                      inputMode="numeric"
                      value={value}
                      onChange={(event) => handleParChange(index, event.target.value)}
                      className="h-11 md:h-9 w-full border-2 border-black text-center font-bold"
                      placeholder={`${index + 1}`}
                    />
                  ))}
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-black">IN</span>
                  <span className="text-sm font-black text-black">合計 {inParTotal}</span>
                </div>
                <div className="mt-2 grid grid-cols-9 gap-2">
                  {pars.slice(9).map((value, index) => (
                    <input
                      key={`par-in-${index}`}
                      inputMode="numeric"
                      value={value}
                      onChange={(event) => handleParChange(index + 9, event.target.value)}
                      className="h-11 md:h-9 w-full border-2 border-black text-center font-bold"
                      placeholder={`${index + 10}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-black uppercase">OUT スコア</h3>
                <div className="text-sm font-black text-black">合計 {outTotal}</div>
              </div>
              <div className="mt-3 grid grid-cols-9 gap-2">
                {scores.slice(0, 9).map((value, index) => (
                  <input
                    key={`out-${index}`}
                    inputMode="numeric"
                    value={value}
                    onChange={(event) => handleScoreChange(index, event.target.value)}
                    className="h-12 md:h-10 w-full border-2 border-black text-center font-bold"
                    placeholder={`${index + 1}`}
                  />
                ))}
              </div>
              <div className="mt-2 grid grid-cols-9 gap-2">
                {scores.slice(0, 9).map((_, index) => (
                  <div
                    key={`icon-out-${index}`}
                    className="h-8 w-full border-2 border-black bg-yellow-100 text-center font-black"
                  >
                    {getScoreIcon(scores[index], pars[index]) || '—'}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-black uppercase">IN スコア</h3>
                <div className="text-sm font-black text-black">合計 {inTotal}</div>
              </div>
              <div className="mt-3 grid grid-cols-9 gap-2">
                {scores.slice(9).map((value, index) => (
                  <input
                    key={`in-${index}`}
                    inputMode="numeric"
                    value={value}
                    onChange={(event) => handleScoreChange(index + 9, event.target.value)}
                    className="h-12 md:h-10 w-full border-2 border-black text-center font-bold"
                    placeholder={`${index + 10}`}
                  />
                ))}
              </div>
              <div className="mt-2 grid grid-cols-9 gap-2">
                {scores.slice(9).map((_, index) => (
                  <div
                    key={`icon-in-${index}`}
                    className="h-8 w-full border-2 border-black bg-yellow-100 text-center font-black"
                  >
                    {getScoreIcon(scores[index + 9], pars[index + 9]) || '—'}
                  </div>
                ))}
              </div>
              <div className="mt-3 text-right text-base font-black text-black">
                TOTAL {totalScore}
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-black uppercase">パット数（任意）</h3>
                <div className="text-sm font-black text-black">合計 {puttTotal}</div>
              </div>
              <div className="mt-3 grid grid-cols-9 gap-2">
                {putts.slice(0, 9).map((value, index) => (
                  <input
                    key={`putt-out-${index}`}
                    inputMode="numeric"
                    value={value}
                    onChange={(event) => handlePuttChange(index, event.target.value)}
                    className="h-11 md:h-9 w-full border-2 border-black text-center font-bold"
                    placeholder={`${index + 1}`}
                  />
                ))}
              </div>
              <div className="mt-2 grid grid-cols-9 gap-2">
                {putts.slice(9).map((value, index) => (
                  <input
                    key={`putt-in-${index}`}
                    inputMode="numeric"
                    value={value}
                    onChange={(event) => handlePuttChange(index + 9, event.target.value)}
                    className="h-11 md:h-9 w-full border-2 border-black text-center font-bold"
                    placeholder={`${index + 10}`}
                  />
                ))}
              </div>
            </div>

            <div className="mt-8">
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="flex-1 min-w-[200px] flex items-center justify-center gap-2 bg-white text-black px-6 py-3 border-4 border-black text-lg font-black uppercase hover:translate-x-1 hover:translate-y-1 transition-transform"
                  style={{ boxShadow: '6px 6px 0 0 var(--shadow-color)' }}
                >
                  入力内容を保存
                </button>
                <button
                  type="button"
                  onClick={handleResetDraft}
                  className="flex-1 min-w-[200px] flex items-center justify-center gap-2 bg-red-400 text-black px-6 py-3 border-4 border-black text-lg font-black uppercase hover:translate-x-1 hover:translate-y-1 transition-transform"
                  style={{ boxShadow: '6px 6px 0 0 var(--shadow-color)' }}
                >
                  入力内容をリセット
                </button>
              </div>
              {saveMessage && (
                <div className="mt-3 bg-yellow-200 border-4 border-black text-black px-4 py-2 font-bold text-center">
                  {saveMessage}
                </div>
              )}
            </div>

          </div>

          <div className="space-y-4">
            <div
              ref={previewRef}
              className="relative border-4 border-black bg-black"
              style={{ boxShadow: '8px 8px 0 0 var(--shadow-color)' }}
            >
              <canvas ref={canvasRef} className="w-full h-auto block" />
              {!isExporting &&
                stampDisplays.map((stamp) => {
                  if (!stamp.src) return null;
                  const isActive = stamp.id === activeStampId;
                  return (
                    <div
                      key={stamp.id}
                      className={`absolute z-10 select-none touch-none ${isActive ? 'cursor-grab' : 'cursor-pointer'}`}
                      style={{
                        width: `${stamp.width}px`,
                        height: `${stamp.height}px`,
                        left: `${stamp.x}px`,
                        top: `${stamp.y}px`,
                        transform: `translate(-50%, -50%) rotate(${stamp.rotation}deg)`,
                        outline: isActive ? '4px solid #FACC15' : 'none',
                        outlineOffset: isActive ? '2px' : undefined,
                        boxShadow: isActive ? '0 0 0 2px var(--shadow-color)' : undefined,
                      }}
                      onPointerDown={(event) => handleStampPointerDown(stamp.id, event)}
                      onPointerMove={(event) => handleStampPointerMove(stamp.id, event)}
                      onPointerUp={(event) => handleStampPointerUp(stamp.id, event)}
                      onPointerCancel={(event) => handleStampPointerUp(stamp.id, event)}
                      onPointerLeave={(event) => handleStampPointerUp(stamp.id, event)}
                    >
                      <img
                        src={stamp.src}
                        alt={stamp.label}
                        draggable={false}
                        className="w-full h-full object-contain pointer-events-none"
                      />
                    </div>
                  );
                })}
            </div>
            <div className="bg-white border-4 border-black p-4" style={{ boxShadow: '4px 4px 0 0 var(--shadow-color)' }}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-lg font-black text-black uppercase">スタンプ</h3>
                <button
                  type="button"
                  onClick={handleRemoveActiveStamp}
                  disabled={!activeStampId}
                  className="px-4 py-2 border-4 border-black font-black text-sm uppercase bg-yellow-200 hover:translate-x-0.5 hover:translate-y-0.5 transition-transform disabled:opacity-50"
                  style={{ boxShadow: '3px 3px 0 0 var(--shadow-color)' }}
                >
                  選択中を削除
                </button>
              </div>
              <p className="mt-2 text-xs font-bold text-black">
                スタンプはタップで追加。プレビュー上でドラッグ、スマホはピンチで拡大縮小・回転できます。
              </p>
              <div className="mt-4 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
                <div>
                  <label className="block text-xs font-black text-black mb-2 uppercase">スタンプ選択</label>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-2 sm:gap-3">
                    {STAMP_OPTIONS.filter((stamp) => stamp.id !== DEFAULT_STAMP_ID).map((stamp) => {
                      const isActive = activeStampOption?.id === stamp.id;
                      return (
                        <button
                          key={stamp.id}
                          type="button"
                          onClick={() => addStamp(stamp.id)}
                          className={`relative w-full border-4 border-black p-2 text-left ${isActive ? 'bg-yellow-200 ring-4 ring-black' : 'bg-white'}`}
                          style={{ boxShadow: '3px 3px 0 0 var(--shadow-color)' }}
                        >
                          {isActive && (
                            <span
                              className="absolute -top-3 -right-3 bg-black text-white text-[10px] font-black px-2 py-1 border-2 border-black"
                              style={{ boxShadow: '2px 2px 0 0 var(--shadow-color)' }}
                            >
                              選択中
                            </span>
                          )}
                          <div className="bg-white border-2 border-black p-1 flex items-center justify-center h-16 sm:h-24">
                            {stamp.src ? (
                              <img
                                src={buildPublicAssetUrl(stamp.src)}
                                alt={stamp.label}
                                draggable={false}
                                className="max-h-12 sm:max-h-20 w-auto object-contain"
                              />
                            ) : (
                              <span className="text-xs font-black text-black">なし</span>
                            )}
                          </div>
                          <div className="mt-2 text-[10px] font-black text-black sm:text-xs">{stamp.label}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-black mb-2 uppercase">サイズ</label>
                    <input
                      type="range"
                      min={STAMP_MIN_SIZE}
                      max={STAMP_MAX_SIZE}
                      step={10}
                      value={activeStampSize}
                      onChange={(event) => {
                        if (!activeStampId) return;
                        const nextSize = Number(event.target.value);
                        updateStamp(activeStampId, (stamp) => {
                          const clamped = clampStampPosition(stamp.x, stamp.y, nextSize, stamp.optionId);
                          return { ...stamp, size: nextSize, x: clamped.x, y: clamped.y };
                        });
                      }}
                      disabled={!activeStampId}
                      className="w-full disabled:opacity-50"
                    />
                    <div className="mt-1 text-xs font-bold text-black">{Math.round(activeStampSize)}px</div>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-black mb-2 uppercase">回転</label>
                    <input
                      type="range"
                      min={-180}
                      max={180}
                      step={1}
                      value={activeStampRotation}
                      onChange={(event) => {
                        if (!activeStampId) return;
                        const nextRotation = Number(event.target.value);
                        updateStamp(activeStampId, (stamp) => ({ ...stamp, rotation: nextRotation }));
                      }}
                      disabled={!activeStampId}
                      className="w-full disabled:opacity-50"
                    />
                    <div className="mt-1 text-xs font-bold text-black">{Math.round(activeStampRotation)}°</div>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleResetStamps}
                  className="px-4 py-2 border-4 border-black font-black text-xs uppercase bg-white hover:translate-x-0.5 hover:translate-y-0.5 transition-transform"
                  style={{ boxShadow: '3px 3px 0 0 var(--shadow-color)' }}
                >
                  デフォルトに戻す
                </button>
                <button
                  type="button"
                  onClick={handleStampResetPosition}
                  disabled={!activeStampId}
                  className="px-4 py-2 border-4 border-black font-black text-xs uppercase bg-white hover:translate-x-0.5 hover:translate-y-0.5 transition-transform disabled:opacity-50"
                  style={{ boxShadow: '3px 3px 0 0 var(--shadow-color)' }}
                >
                  位置を中央に戻す
                </button>
                <button
                  type="button"
                  onClick={handleStampResetRotation}
                  disabled={!activeStampId}
                  className="px-4 py-2 border-4 border-black font-black text-xs uppercase bg-white hover:translate-x-0.5 hover:translate-y-0.5 transition-transform disabled:opacity-50"
                  style={{ boxShadow: '3px 3px 0 0 var(--shadow-color)' }}
                >
                  回転を0°に戻す
                </button>
              </div>
              {stampLoadError && (
                <div className="mt-3 bg-red-400 border-4 border-black text-black px-3 py-2 text-xs font-bold">
                  {stampLoadError}
                </div>
              )}
              {!stampLoadError && (
                <div className="mt-3 text-xs font-bold text-black">
                  ※デフォルトは {DEFAULT_STAMP.label} です。
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 bg-yellow-400 text-black px-6 py-3 border-4 border-black text-lg font-black uppercase hover:translate-x-1 hover:translate-y-1 transition-transform"
              style={{ boxShadow: '6px 6px 0 0 var(--shadow-color)' }}
            >
              <Download className="w-5 h-5" />
              画像を保存する
            </button>
            <p className="text-sm font-bold text-black text-center">
              表示するを選択し、画像を長押しで保存を押してください。
            </p>
            {downloadMessage && (
              <div className="bg-yellow-200 border-4 border-black text-black px-4 py-2 font-bold text-center">
                {downloadMessage}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
