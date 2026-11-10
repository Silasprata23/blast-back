import { useCallback, useEffect, useRef, useState } from 'react';
import { searchGames } from '../services/archive.mjs';

export function useGames({ collection, query = '', sort = 'downloads', enabled = true }) {
  const [state, setState] = useState({ games: [], total: 0, page: 0, loading: true, loadingMore: false, error: '', moreError: '' });
  const controller = useRef(null);
  const generation = useRef(0);
  const busy = useRef(false);
  const load = useCallback(async (page = 1) => {
    if (page > 1 && busy.current) return;
    controller.current?.abort();
    const current = ++generation.current;
    const abort = new AbortController(); controller.current = abort; busy.current = true;
    setState(s => ({ ...s, ...(page === 1 ? { games: [], total: 0, page: 0 } : {}), loading: page === 1, loadingMore: page > 1, error: '', moreError: '' }));
    try {
      const result = await searchGames({ collection, query, sort, page }, { signal: abort.signal });
      if (current !== generation.current || abort.signal.aborted) return;
      setState(s => ({ ...s, games: page === 1 ? result.games : [...new Map([...s.games, ...result.games].map(g => [g.identifier, g])).values()], total: result.total, page, loading: false, loadingMore: false }));
    } catch (e) {
      if (current !== generation.current || abort.signal.aborted) return;
      setState(s => ({ ...s, loading: false, loadingMore: false, [page === 1 ? 'error' : 'moreError']: e.message }));
    } finally { if (current === generation.current) busy.current = false; }
  }, [collection, query, sort]);
  useEffect(() => {
    if (enabled) load();
    return () => { controller.current?.abort(); generation.current++; busy.current = false; };
  }, [load, enabled]);
  return { ...state, retry: () => load(1), loadMore: () => load(state.page + 1), hasMore: state.games.length < state.total };
}
