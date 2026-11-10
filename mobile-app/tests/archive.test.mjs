import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSearchUrl, searchGames, getItem, requestJson } from '../src/services/archive.mjs';
import { parseGames, parseSession } from '../src/services/storage.mjs';

test('search keeps user text inside title tokens and applies collection, sort and page', () => {
  const url = new URL(buildSearchUrl({ collection: 'internetarcade', query: 'Pac-Man OR collection:secrets', sort: 'title', page: 3 }));
  assert.match(url.searchParams.get('q'), /title:\("Pac" AND "Man" AND "OR" AND "collection" AND "secrets"\)/);
  assert.equal(url.searchParams.get('sort[]'), 'titleSorter asc'); assert.equal(url.searchParams.get('page'), '3');
  assert.ok(!url.searchParams.get('q').includes('collection:secrets'));
});
test('search normalizes array metadata, retains real ids and omits invalid records', async () => {
  const result = await searchGames({}, { fetcher: async () => ({ ok: true, json: async () => ({ response: { numFound: 1, docs: [{ identifier: 'game', title: ['<b>Game</b>'], creator: ['Maker'], year: 1980 }, { title: 'No ID' }] } }) }) });
  assert.equal(result.total, 1); assert.deepEqual(result.games, [{ identifier: 'game', title: 'Game', creator: 'Maker', year: '1980', downloads: 0 }]);
});
test('invalid payloads and missing metadata do not silently become successful empty screens', async () => {
  const fetcher = async () => ({ ok: true, json: async () => ({}) });
  await assert.rejects(searchGames({}, { fetcher }), /lista inválida/);
  await assert.rejects(getItem('gone', { fetcher }), /não está disponível/);
});
test('HTTP errors and timeouts provide retryable user messages', async () => {
  await assert.rejects(requestJson('url', { fetcher: async () => ({ ok: false, status: 503 }) }), /503/);
  await assert.rejects(requestJson('url', { timeout: 5, fetcher: (_, { signal }) => new Promise((resolve, reject) => signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))) }), /demorou/);
});
test('external cancellation stays distinguishable from network failure', async () => {
  const controller = new AbortController(); controller.abort();
  await assert.rejects(requestJson('url', { signal: controller.signal, fetcher: async (_, { signal }) => { assert.equal(signal.aborted, true); throw new DOMException('Aborted', 'AbortError'); } }), { name: 'AbortError' });
});
test('saved data tolerates corruption, removes duplicates and rejects unusable entries', () => {
  assert.deepEqual(parseGames('{broken'), []);
  assert.deepEqual(parseGames('{"not":"an array"}'), []);
  assert.equal(parseGames(JSON.stringify([{ identifier: 'a', title: 'A' }, { identifier: 'a', title: 'A' }, { title: 'Missing ID' }])).length, 1);
  assert.equal(parseSession('null'), null);
  assert.equal(parseSession('{"identifier":"a","title":"A"}').identifier, 'a');
});
