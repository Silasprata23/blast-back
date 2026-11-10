export const SAVED_KEY = '@arcadia/favorites';
export const LAST_KEY = '@blastback/last-session';
export function parseGames(raw) {
  try { const data = JSON.parse(raw || '[]'); return Array.isArray(data) ? [...new Map(data.filter(g => typeof g?.identifier === 'string' && typeof g?.title === 'string').map(g => [g.identifier, g])).values()] : []; } catch { return []; }
}
export function parseSession(raw) { return parseGames(`[${raw || 'null'}]`)[0] || null; }
