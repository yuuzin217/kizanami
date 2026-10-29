import test from 'node:test';
import assert from 'node:assert/strict';
import { validateNewsItems, getLatestArticles, getArchiveDays, getArticlesForDate, getArticleBySlug, formatJstDate } from '../src/data/newsModel.ts';

const sample = (extra = {}) => ({
  id: 'sample-1', slug: 'first-sample', category: 'ai', title: '架空のニュース',
  summary: '説明文', whyItMatters: '重要性の説明', sourceName: '架空サンプル',
  sourceUrl: null, publishedAt: '2026-10-28T07:00:00+09:00',
  curatedAt: '2026-10-28', isSample: true, ...extra,
});

const rejects = (articles, pattern) => assert.throws(() => validateNewsItems(articles), pattern);

test('valid records sort by JST editorial date, then publication time', () => {
  const list = validateNewsItems([
    sample(),
    sample({id:'sample-2',slug:'second-sample',curatedAt:'2026-10-29',publishedAt:'2026-10-29T06:00:00+09:00'}),
    sample({id:'sample-3',slug:'third-sample',curatedAt:'2026-10-29',publishedAt:'2026-10-29T09:00:00+09:00'}),
  ]);
  assert.deepEqual(list.map((x) => x.id), ['sample-3','sample-2','sample-1']);
  assert.deepEqual(getArchiveDays(list), ['2026-10-29','2026-10-28']);
  assert.equal(getLatestArticles(list).length, 2);
  assert.equal(getArticlesForDate(list,'2026-10-28').length, 1);
  assert.equal(getArticleBySlug(list, 'third-sample')?.id, 'sample-3');
  assert.equal(formatJstDate('2026-10-29'), '2026年10月29日');
});

test('no input produces an empty list safely', () => {
  assert.deepEqual(validateNewsItems([]), []);
  assert.deepEqual(getArchiveDays([]), []);
  assert.deepEqual(getLatestArticles([]), []);
});

test('duplicate ids and slugs fail build-time validation', () => {
  rejects([sample(), sample({ slug: 'other' })], /duplicate id/);
  rejects([sample(), sample({ id: 'other' })], /duplicate slug/);
});

test('invalid dates and missing timezone fail', () => {
  rejects([sample({curatedAt:'2026-02-30'})], /invalid curatedAt/);
  rejects([sample({curatedAt:'2026-10-29T00:00:00Z'})], /invalid curatedAt/);
  rejects([sample({publishedAt:'2026-10-29T01:00:00'})], /invalid publishedAt/);
  rejects([sample({publishedAt:'2026-02-30T07:00:00+09:00'})], /invalid publishedAt/);
  rejects([sample({publishedAt:'2026-10-29T25:00:00+09:00'})], /invalid publishedAt/);
});

test('missing fields, unknown categories and malicious slugs fail', () => {
  rejects([sample({title:''})], /missing or empty title/);
  rejects([sample({category:'unknown'})], /unknown category/);
  rejects([sample({slug:'../escape'})], /invalid slug/);
  rejects([sample({isSample:'true'})], /isSample must be boolean/);
  rejects('not an array', /expected an array/);
});

test('real news requires safe HTTPS source and non-sample status', () => {
  rejects([sample({isSample:false,sourceUrl:null})], /HTTPS sourceUrl/);
  rejects([sample({isSample:false,sourceUrl:'javascript:alert(1)'})], /HTTPS sourceUrl/);
  rejects([sample({isSample:false,sourceUrl:'https://user:pass@example.com'})], /HTTPS sourceUrl/);
  rejects([sample({sourceUrl:'https://example.com'})], /sample content must not link/);
  const records = validateNewsItems([sample({isSample:false,sourceName:'公式発表',sourceUrl:'https://example.com/news'})]);
  assert.equal(records[0].sourceUrl, 'https://example.com/news');
});

test('adding an already defined category needs no schema refactor', () => {
  const list = validateNewsItems([sample({category:'politics'})]);
  assert.equal(list[0].category, 'politics');
});
