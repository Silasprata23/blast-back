export const SAVED_KEY = '@arcadia/favorites';
export const LAST_KEY = '@blastback/last-session';
export function parseGames(raw) {
  try { const data = JSON.parse(raw || '[]'); return Array.isArray(data) ? [...new Map(data.filter(g => typeof g?.identifier === 'string' && typeof g?.title === 'string').map(g => [g.identifier, g])).values()] : []; } catch { return []; }
}
export function parseSession(raw) { return parseGames(`[${raw || 'null'}]`)[0] || null; }

// Only publish a new favorites list after the device confirms the write.
export function createFavoritesQueue(write, publish) {
  let confirmed = [];
  let pending = Promise.resolve();
  return {
    restore(read) {
      const operation = pending.then(async () => {
        confirmed = parseGames(await read());
        publish(confirmed);
      });
      pending = operation.catch(() => {});
      return operation;
    },
    update(game, saveOnly = false) {
      const operation = pending.then(async () => {
        const exists = confirmed.some(item => item.identifier === game.identifier);
        if (exists && saveOnly) return;
        const next = exists
          ? confirmed.filter(item => item.identifier !== game.identifier)
          : [{ ...game, savedAt: new Date().toISOString() }, ...confirmed];
        await write(JSON.stringify(next));
        confirmed = next;
        publish(next);
      });
      pending = operation.catch(() => {});
      return operation;
    },
  };
}
