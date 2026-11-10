import React, { useState } from 'react';
import { Image, Keyboard, TextInput, View } from 'react-native';
import { Button, Copy, GameList, Heading } from '../components/ui';
import { colors, fontFamily, fonts, styles as s } from '../theme';
import { SORTS } from '../services/archive.mjs';
import { useGames } from '../hooks/useGames';

export default function Catalog({ mode, filters, query, setQuery, navigate, library, system }) {
  const [draft, setDraft] = useState(query);
  const isHome = mode === 'home', isSearch = mode === 'search';
  const collection = isHome ? 'internetarcade' : isSearch ? filters.collection : system?.id;
  const result = useGames({ collection, query: isSearch ? query : '', sort: isHome ? 'downloads' : filters.sort });
  const open = game => navigate('detail', { game });
  const sortLabel = (SORTS.find(v => v.id === filters.sort) || SORTS[0]).label;
  function submit() { Keyboard.dismiss(); if (draft.trim() === query) result.retry(); else setQuery(draft.trim()); }
  const header = <View style={{ gap: isHome ? 16 : 24 }}>
    {isHome ? <>
      <Copy style={s.kicker}>SEU PRÓXIMO CLÁSSICO</Copy><Heading size={48}>{'MAIS UMA\nPARTIDA?'}</Heading>
      <View style={{ height: 160, backgroundColor: colors.olive, alignItems: 'center', justifyContent: 'center' }}><Image accessibilityLabel="Ilustração de um gabinete arcade" source={require('../../assets/figma/arcade-cabinet.png')} resizeMode="contain" style={{ width: 182, height: 160 }} /></View>
      <Button onPress={() => navigate('systems', {}, true)}>EXPLORAR SISTEMAS</Button>
      {library.last && <Button secondary onPress={() => navigate('player', { game: library.last })}>REABRIR: {library.last.title}</Button>}
      <Heading size={28}>POPULARES NO ARCADE</Heading>
    </> : isSearch ? <>
      <Heading>{'QUAL É O\nSEU CLÁSSICO?'}</Heading>
      <TextInput accessibilityLabel="Nome do jogo" value={draft} onChangeText={setDraft} placeholder="Buscar pelo nome do jogo" placeholderTextColor={colors.muted} returnKeyType="search" autoCapitalize="none" autoCorrect={false} onSubmitEditing={submit} style={{ minHeight: 52, padding: 14, backgroundColor: colors.surface, color: colors.ink, fontFamily: fontFamily(fonts.body), fontSize: 14 }} />
      <Button onPress={submit}>BUSCAR JOGOS</Button>
      <Button secondary onPress={() => navigate('filters', { origin: 'search' })}>ORDEM: {sortLabel.toLocaleUpperCase('pt-BR')}{filters.collection ? ' · FILTRADO' : ''}</Button>
      <Copy style={s.caption}>{query ? `RESULTADOS PARA “${query.toLocaleUpperCase('pt-BR')}”` : 'EXPLORE O ACERVO OU PESQUISE UM NOME'}</Copy>
    </> : <>
      <Copy style={s.kicker}>COLEÇÃO / {system?.label.toLocaleUpperCase('pt-BR')}</Copy><Heading size={42}>{system?.label.toLocaleUpperCase('pt-BR')}</Heading><Copy style={s.muted}>Encontre sua próxima ficha.</Copy>
      <Button secondary onPress={() => navigate('filters', { origin: 'catalog' })}>ORDEM: {sortLabel.toLocaleUpperCase('pt-BR')}</Button>
    </>}
  </View>;
  return <GameList {...result} data={result.games} header={header} onOpen={open} onRefresh={result.retry} emptyMessage={isHome ? 'O acervo não retornou jogos agora. Tente atualizar a lista.' : undefined} onClear={isSearch ? () => { setDraft(''); setQuery(''); if (!query) result.retry(); } : undefined} />;
}
