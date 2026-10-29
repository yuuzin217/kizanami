/** Canonical editorial date is a calendar date in Asia/Tokyo (JST). */
export const categoryLabels = {
  ai: 'AI',
  politics: '政治',
  technology: 'テクノロジー',
  economy: '経済',
  international: '国際',
} as const;

export type NewsCategory = keyof typeof categoryLabels;

export interface NewsArticle {
  id: string;
  slug: string;
  category: NewsCategory;
  title: string;
  summary: string;
  whyItMatters: string;
  sourceName: string;
  sourceUrl: string | null;
  publishedAt: string;
  curatedAt: string;
  isSample: boolean;
}

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const publishedPattern = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?(Z|[+-]\d{2}:\d{2})$/;
const has = (obj: Record<string, unknown>, key: string): boolean => Object.prototype.hasOwnProperty.call(obj, key);

function validJstCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

function validPublicationInstant(value: string): boolean {
  const match = publishedPattern.exec(value);
  if (!match || !validJstCalendarDate(match[1])) return false;
  const [, , hour, minute, second, offset] = match;
  if (+hour > 23 || +minute > 59 || +second > 59) return false;
  if (offset !== 'Z') {
    const offsetHour = Number(offset.slice(1, 3));
    const offsetMinute = Number(offset.slice(4, 6));
    if (offsetHour > 14 || offsetMinute > 59 || (offsetHour === 14 && offsetMinute !== 0)) return false;
  }
  return !Number.isNaN(Date.parse(value));
}

function safeSourceUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && Boolean(url.hostname) && !url.username && !url.password;
  } catch {
    return false;
  }
}

/** Reject malformed records at build time, before any route is emitted. */
export function validateNewsItems(input: unknown): NewsArticle[] {
  if (!Array.isArray(input)) throw new Error('news data: expected an array');
  const ids = new Set<string>();
  const slugs = new Set<string>();
  const result: NewsArticle[] = [];
  for (const [index, raw] of input.entries()) {
    const prefix = `news[${index}]`;
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error(`${prefix}: expected an object`);
    const item = raw as Record<string, unknown>;
    for (const key of ['id', 'slug', 'category', 'title', 'summary', 'whyItMatters', 'sourceName', 'publishedAt', 'curatedAt']) {
      if (typeof item[key] !== 'string' || !(item[key] as string).trim()) throw new Error(`${prefix}: missing or empty ${key}`);
    }
    for (const key of ['id', 'slug']) {
      const value = item[key] as string;
      if (value.length > 100 || !slugPattern.test(value)) throw new Error(`${prefix}: invalid ${key}`);
    }
    if (ids.has(item.id as string)) throw new Error(`${prefix}: duplicate id`);
    if (slugs.has(item.slug as string)) throw new Error(`${prefix}: duplicate slug`);
    if (!has(categoryLabels, item.category as string)) throw new Error(`${prefix}: unknown category`);
    if (!validJstCalendarDate(item.curatedAt as string)) throw new Error(`${prefix}: invalid curatedAt (JST date required)`);
    if (!validPublicationInstant(item.publishedAt as string)) throw new Error(`${prefix}: invalid publishedAt (ISO 8601 with offset required)`);
    if (typeof item.isSample !== 'boolean') throw new Error(`${prefix}: isSample must be boolean`);
    const source = item.sourceUrl;
    if (item.isSample) {
      if (source !== null) throw new Error(`${prefix}: sample content must not link to a purported source`);
    } else if (typeof source !== 'string' || !safeSourceUrl(source)) {
      throw new Error(`${prefix}: real news requires an HTTPS sourceUrl without credentials`);
    }
    ids.add(item.id as string);
    slugs.add(item.slug as string);
    result.push(item as unknown as NewsArticle);
  }
  // Sort a copy: newest editorial day, then most recently published, then id for stable ties.
  return result.sort((a, b) => b.curatedAt.localeCompare(a.curatedAt) ||
    Date.parse(b.publishedAt) - Date.parse(a.publishedAt) || a.id.localeCompare(b.id));
}

export function getArchiveDays(articles: readonly NewsArticle[]): string[] {
  return [...new Set(articles.map((article) => article.curatedAt))].sort((a, b) => b.localeCompare(a));
}

export function getArticlesForDate(articles: readonly NewsArticle[], date: string): NewsArticle[] {
  return articles.filter((article) => article.curatedAt === date);
}

export function getLatestArticles(articles: readonly NewsArticle[], limit = 3): NewsArticle[] {
  const date = getArchiveDays(articles)[0];
  return date ? getArticlesForDate(articles, date).slice(0, limit) : [];
}

export function getArticleBySlug(articles: readonly NewsArticle[], slug: string): NewsArticle | undefined {
  return articles.find((article) => article.slug === slug);
}

export function formatJstDate(date: string): string {
  // Validated ISO calendar date: use components directly to avoid local timezone shifts.
  const [year, month, day] = date.split('-');
  return `${year}年${Number(month)}月${Number(day)}日`;
}

export function formatPublicationDate(iso: string): string {
  return new Intl.DateTimeFormat('ja-JP', {
    timeZone: 'Asia/Tokyo', year: 'numeric', month: 'long', day: 'numeric',
  }).format(new Date(iso));
}
