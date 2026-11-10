import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSearchUrl, searchGames, getItem, requestJson } from '../src/services/archive.mjs';
import { createFavoritesQueue, parseGames, parseSession } from '../src/services/storage.mjs';

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

test('pagination uses raw rows even when ids repeat or records are unusable', async () => {
  async function page(number, docs, numFound) {
    return searchGames({ rows: 2, page: number }, {
      fetcher: async () => ({ ok: true, json: async () => ({ response: { docs, numFound } }) }),
    });
  }
  const game = { identifier: 'a' };
  assert.equal((await page(1, [game, null], 4)).hasMore, true);
  assert.equal((await page(2, [game, game], 4)).hasMore, false);
  assert.equal((await page(2, [], 10)).hasMore, false);
});

test('details carry normalized control metadata even when no emulator is declared', async () => {
  async function item(metadata) {
    return getItem('a', { fetcher: async () => ({ ok: true, json: async () => ({ metadata }) }) });
  }
  const game = await item({ emulator: ['mame'], collection: 'internetarcade' });
  assert.deepEqual(game.emulator, { name: 'mame' });
  assert.deepEqual(game.collection, ['internetarcade']);
  const unknown = await item({ title: 'Unknown' });
  assert.equal(unknown.emulator, null);
  assert.deepEqual(unknown.collection, []);
});

test('queued favorites keep the last confirmed list across failed writes and retries', async () => {
  let failing = true;
  let disk = JSON.stringify([{ identifier: 'original', title: 'Original' }]);
  let visible;
  const queue = createFavoritesQueue(async value => {
    if (failing) throw Error('storage full');
    disk = value;
  }, value => { visible = value; });
  await queue.restore(async () => disk);
  const a = { identifier: 'a', title: 'A' };
  const b = { identifier: 'b', title: 'B' };
  await Promise.all([assert.rejects(queue.update(a)), assert.rejects(queue.update(b))]);
  assert.deepEqual(visible, JSON.parse(disk));
  assert.deepEqual(visible.map(item => item.identifier), ['original']);
  failing = false;
  await Promise.all([queue.update(b, true), queue.update(b, true)]);
  assert.deepEqual(visible.map(item => item.identifier), ['b', 'original']);
  assert.deepEqual(visible, JSON.parse(disk));
});
