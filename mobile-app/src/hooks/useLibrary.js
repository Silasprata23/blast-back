import { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LAST_KEY, SAVED_KEY, parseGames, parseSession } from '../services/storage.mjs';

export function useLibrary() {
  const [saved, setSaved] = useState([]), [last, setLast] = useState(null), [ready, setReady] = useState(false), [error, setError] = useState(''), [revision, setRevision] = useState(0);
  const current = useRef([]), queue = useRef(Promise.resolve());
  useEffect(() => {
    let live = true; setReady(false); setError('');
    Promise.all([AsyncStorage.getItem(SAVED_KEY), AsyncStorage.getItem(LAST_KEY), AsyncStorage.getItem('@blastback/saves')]).then(([raw, session, legacy]) => {
      if (!live) return;
      current.current = parseGames(raw ?? legacy); setSaved(current.current); setLast(parseSession(session)); setReady(true);
    }).catch(() => { if (live) setError('Não foi possível ler seus salvos neste dispositivo. Tente novamente.'); });
    return () => { live = false; };
  }, [revision]);
  function toggle(game) {
    if (!ready) return;
    const next = current.current.some(g => g.identifier === game.identifier) ? current.current.filter(g => g.identifier !== game.identifier) : [{ ...game, savedAt: new Date().toISOString() }, ...current.current];
    const previous = current.current; current.current = next; setSaved(next); setError('');
    queue.current = queue.current.then(() => AsyncStorage.setItem(SAVED_KEY, JSON.stringify(next))).catch(() => {
      if (current.current === next) { current.current = previous; setSaved(previous); }
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
