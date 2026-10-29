import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import articles from '../src/data/articles.json' with { type: 'json' };

const dist = resolve('dist');
const base = '/kizanami/';
const dates = [...new Set(articles.map((article) => article.curatedAt))];
const requiredPages = [
  'index.html', 'archive/index.html',
  ...dates.map((day) => 'archive/' + day + '/index.html'),
  ...articles.map((article) => 'news/' + article.slug + '/index.html'),
];

function readPage(relativePath) {
  const filePath = join(dist, relativePath);
  assert.ok(existsSync(filePath), 'Missing generated page: ' + relativePath);
  return readFileSync(filePath, 'utf8');
}

function localTarget(href) {
  const path = href.split(/[?#]/, 1)[0].slice(base.length);
  return path.endsWith('/') || path === ''
    ? join(dist, path, 'index.html')
    : join(dist, path);
}

for (const relativePath of requiredPages) {
  const html = readPage(relativePath);
  assert.match(html, /<main\b/, relativePath + ': main missing');
  assert.match(html, /<h1\b/, relativePath + ': h1 missing');
  for (const match of html.matchAll(/\bhref="([^"]+)"/g)) {
    const href = match[1];
    if (href.startsWith(base)) {
      assert.ok(existsSync(localTarget(href)), relativePath + ': broken internal link ' + href);
    } else if (href.startsWith('#')) {
      assert.ok(html.includes('id="' + href.slice(1) + '"'), relativePath + ': broken anchor ' + href);
    } else {
      assert.ok(/^https:\/\//.test(href), relativePath + ': unapproved link ' + href);
    }
  }
}
const home = readPage('index.html');
const latestDate = dates.sort().at(-1);
const latestCount = Math.min(3, articles.filter((article) => article.curatedAt === latestDate).length);
assert.equal((home.match(/class="story"/g) || []).length, latestCount, 'Wrong number of featured articles');
for (const article of articles) {
  const html = readPage('news/' + article.slug + '/index.html');
  assert.ok(html.includes(article.title), article.slug + ': wrong title');
  if (article.isSample) {
    assert.ok(html.includes('架空サンプル'), article.slug + ': missing sample disclaimer');
  }
}
console.log('Verified ' + requiredPages.length + ' static pages, links, anchors and sample notices.');
