export const API = 'https://archive.org';
export const SYSTEMS = [
  { id: 'internetarcade', label: 'Arcade' },
  { id: 'consolelivingroom', label: 'Consoles' },
  { id: 'softwarelibrary_msdos_games', label: 'MS-DOS' },
  { id: 'softwarelibrary_c64_games', label: 'Commodore 64' },
  { id: 'softwarelibrary_zx_spectrum', label: 'ZX Spectrum' },
  { id: 'softwarelibrary_apple', label: 'Apple II' },
];
export const SORTS = [
  { id: 'downloads', label: 'Mais jogados', query: 'downloads desc' },
  { id: 'title', label: 'Nome (A–Z)', query: 'titleSorter asc' },
  { id: 'year', label: 'Mais recentes', query: 'year desc' },
];
export const thumb = id => `${API}/services/img/${encodeURIComponent(id)}`;
export const embed = id => `${API}/embed/${encodeURIComponent(id)}`;
const first = value => Array.isArray(value) ? value[0] : value;
const list = value => value == null ? [] : Array.isArray(value) ? value : [value];
export function clean(value) {
  return String(first(value) ?? '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
}
export function buildSearchUrl({ collection, query = '', sort = 'downloads', page = 1, rows = 24 } = {}) {
  const validCollection = SYSTEMS.find(s => s.id === collection);
  const collections = validCollection ? `collection:${validCollection.id}` : `(${SYSTEMS.map(s => `collection:${s.id}`).join(' OR ')})`;
  // Quoted tokens prevent user text from becoming Archive query operators.
  const tokens = String(query).match(/[\p{L}\p{N}]+/gu) || [];
  const q = [collections, 'mediatype:software'];
  if (tokens.length) q.push(`title:(${tokens.map(t => `"${t}"`).join(' AND ')})`);
  const p = new URLSearchParams({ q: q.join(' AND '), rows: String(rows), page: String(page), output: 'json' });
  ['identifier', 'title', 'year', 'downloads', 'creator'].forEach(f => p.append('fl[]', f));
  p.append('sort[]', (SORTS.find(s => s.id === sort) || SORTS[0]).query);
  return `${API}/advancedsearch.php?${p}`;
}
export async function requestJson(url, { signal, fetcher = fetch, timeout = 20000 } = {}) {
  const controller = new AbortController();
  let timedOut = false;
  const abort = () => controller.abort();
  signal?.addEventListener('abort', abort, { once: true });
  if (signal?.aborted) controller.abort();
  const timer = setTimeout(() => { timedOut = true; controller.abort(); }, timeout);
  try {
    const response = await fetcher(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`O acervo respondeu com erro ${response.status}. Tente novamente.`);
    return await response.json();
  } catch (error) {
    if (timedOut) throw new Error('O acervo demorou para responder. Tente novamente.');
    if (signal?.aborted) throw error;
    if (error instanceof SyntaxError) throw new Error('O acervo enviou uma resposta inválida. Tente novamente.');
    if (error instanceof TypeError) throw new Error('Não foi possível conectar ao acervo. Confira sua conexão.');
    throw error;
  } finally { clearTimeout(timer); signal?.removeEventListener('abort', abort); }
}
export async function searchGames(options = {}, requestOptions) {
  const data = await requestJson(buildSearchUrl(options), requestOptions);
  if (!Array.isArray(data?.response?.docs)) throw new Error('O acervo enviou uma lista inválida. Tente novamente.');
  const games = data.response.docs.filter(g => typeof g.identifier === 'string').map(g => ({
    identifier: g.identifier, title: clean(g.title) || g.identifier,
    year: clean(g.year), creator: clean(g.creator), downloads: Number(g.downloads) || 0,
  }));
  return { games, total: Number(data.response.numFound) || 0, page: options.page || 1 };
}
export async function getItem(id, requestOptions) {
  const data = await requestJson(`${API}/metadata/${encodeURIComponent(id)}`, requestOptions);
  if (!data?.metadata || !Object.keys(data.metadata).length) throw new Error('Este jogo não está disponível no acervo.');
  const m = data.metadata;
  return { identifier: id, title: clean(m.title) || id, description: clean(m.description), year: clean(m.year || m.date), creator: clean(m.creator), subjects: list(m.subject).flatMap(s => String(s).split(';')).map(clean).filter(Boolean).slice(0, 8) };
}
