import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Button, Copy, GameImage, Heading, StateView } from '../components/ui';
import { getItem } from '../services/archive.mjs';
import { styles as s } from '../theme';

export default function Detail({ game, navigate, library }) {
  const [state, setState] = useState({ loading: true, data: null, error: '' }), [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController(); setState({ loading: true, data: null, error: '' });
    getItem(game.identifier, { signal: controller.signal }).then(data => { if (!controller.signal.aborted) setState({ loading: false, data, error: '' }); }).catch(e => { if (!controller.signal.aborted) setState({ loading: false, data: null, error: e.message }); });
    return () => controller.abort();
  }, [game.identifier, retry]);
  if (state.loading || state.error) return <ScrollView contentContainerStyle={s.content}><StateView kind={state.error ? 'error' : 'loading'} message={state.error} onRetry={state.error ? () => setRetry(v => v + 1) : undefined} /></ScrollView>;
  const data = state.data;
  return <ScrollView contentContainerStyle={s.content}><Copy style={s.kicker}>{data.year ? `ACERVO / ${data.year}` : 'ACERVO / INTERNET ARCHIVE'}</Copy><GameImage game={data} style={{ width: '100%', aspectRatio: 342 / 220 }} resizeMode="contain" /><Heading size={44}>{data.title.toLocaleUpperCase('pt-BR')}</Heading><Copy style={s.muted}>{[data.creator, data.year].filter(Boolean).join(' · ') || 'Informações não fornecidas pelo acervo.'}</Copy>
    <Button onPress={() => navigate('player', { game: data })}>JOGAR AGORA</Button><Button secondary disabled={!library.ready} onPress={() => library.toggle(data)}>{library.isSaved(data.identifier) ? 'REMOVER DA MINHA LISTA' : 'SALVAR NA MINHA LISTA'}</Button>
    {library.error ? <Copy accessibilityRole="alert">{library.error}</Copy> : null}<Heading size={23}>SOBRE O JOGO</Heading><Copy style={s.muted}>{data.description || 'Este item não possui descrição no Internet Archive.'}</Copy>
    {!!data.subjects.length && <View style={{ gap: 8 }}><Heading size={23}>CATEGORIAS</Heading><Copy style={s.caption}>{data.subjects.join(' · ')}</Copy></View>}<Copy style={s.caption}>Fonte: Internet Archive</Copy>
  </ScrollView>;
}
