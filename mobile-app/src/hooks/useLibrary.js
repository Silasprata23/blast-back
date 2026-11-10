import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LAST_KEY, SAVED_KEY, createFavoritesQueue, parseSession } from '../services/storage.mjs';

export function useLibrary() {
  const [saved, setSaved] = useState([]), [last, setLast] = useState(null), [ready, setReady] = useState(false), [error, setError] = useState(''), [revision, setRevision] = useState(0);
  const [favorites] = useState(() => createFavoritesQueue(
    value => AsyncStorage.setItem(SAVED_KEY, value),
    setSaved,
  ));
  useEffect(() => {
    let live = true;
    setReady(false);
    setError('');
    async function restore() {
      await favorites.restore(async () =>
        (await AsyncStorage.getItem(SAVED_KEY)) ?? await AsyncStorage.getItem('@blastback/saves')
      );
      const session = await AsyncStorage.getItem(LAST_KEY);
      if (live) {
        setLast(parseSession(session));
        setReady(true);
      }
    }
    restore().catch(() => {
      if (live) setError('Não foi possível ler seus salvos neste dispositivo. Tente novamente.');
    });
    return () => { live = false; };
  }, [favorites, revision]);
  function toggle(game, saveOnly = false) {
    if (!ready) return;
    setError('');
    favorites.update(game, saveOnly).catch(() => {
      setError('Não foi possível salvar a lista. Verifique o armazenamento do dispositivo.');
    });
  }
  async function remember(game) {
    const entry = { identifier: game.identifier, title: game.title, savedAt: new Date().toISOString() };
    try { await AsyncStorage.setItem(LAST_KEY, JSON.stringify(entry)); setLast(entry); }
    catch { setError('O jogo pode continuar, mas não foi possível registrar a última sessão.'); }
  }
  return { saved, last, ready, error, toggle, remember, reload: () => setRevision(v => v + 1), isSaved: id => saved.some(g => g.identifier === id) };
}
