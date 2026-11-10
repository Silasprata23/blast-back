import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { colors, fontFamily, fonts, styles as s } from '../theme';
import { thumb } from '../services/archive.mjs';

export function Copy({ children, style, ...props }) { return <Text {...props} style={[s.body, { fontFamily: fontFamily(fonts.body) }, style]}>{children}</Text>; }
export function Heading({ children, size = 36, style }) { return <Text accessibilityRole="header" style={[s.heading, { fontFamily: fontFamily(fonts.heading), fontSize: size, lineHeight: Math.round(size * 1.1) }, style]}>{children}</Text>; }
export function Button({ children, onPress, secondary = false, disabled = false, loading = false, style, accessibilityRole = 'button', accessibilityState, ...props }) {
  return <Pressable {...props} accessibilityRole={accessibilityRole} accessibilityState={{ ...accessibilityState, disabled: disabled || loading }} disabled={disabled || loading} onPress={onPress} style={({ pressed }) => [u.button, secondary && u.secondary, (pressed || disabled || loading) && { opacity: 0.65 }, style]}>
    {loading ? <ActivityIndicator color={secondary ? colors.ink : colors.bg} /> : <Copy style={[u.buttonLabel, { color: secondary ? colors.ink : colors.bg }]}>{children}</Copy>}
  </Pressable>;
}
export function GameImage({ game, style, resizeMode = 'cover' }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [game.identifier]);
  return failed ? <View accessibilityLabel="Imagem indisponível" style={[u.fallback, style]}><Heading size={42} style={{ color: colors.olive }}>A /</Heading><Copy style={s.caption}>SEM IMAGEM</Copy></View> : <Image accessibilityLabel={`Imagem de ${game.title}`} source={{ uri: thumb(game.identifier) }} onError={() => setFailed(true)} resizeMode={resizeMode} style={[{ backgroundColor: colors.surface }, style]} />;
}
export function GameCard({ game, width, onPress, onRemove }) {
  return <View style={{ width, gap: 8 }}>
    <Pressable accessibilityRole="button" accessibilityLabel={`Ver detalhes de ${game.title}`} onPress={() => onPress(game)} style={({ pressed }) => ({ gap: 8, opacity: pressed ? 0.7 : 1 })}>
      <GameImage game={game} style={{ width: '100%', aspectRatio: 163 / 114 }} />
      <Text numberOfLines={2} style={[u.gameTitle, { fontFamily: fontFamily(fonts.heading) }]}>{game.title}</Text>
      <Copy numberOfLines={2} style={s.caption}>{[game.year || 'Ano não informado', game.creator].filter(Boolean).join(' · ')}</Copy>
    </Pressable>
    {onRemove && <Pressable accessibilityRole="button" accessibilityLabel={`Remover ${game.title} dos salvos`} onPress={() => onRemove(game)} style={u.remove}><Copy style={{ color: colors.accent, fontSize: 12 }}>REMOVER DOS SALVOS</Copy></Pressable>}
  </View>;
}
export function StateView({ kind = 'loading', message, onRetry, onClear, clearLabel = 'LIMPAR PESQUISA' }) {
  if (kind === 'loading') return <View accessibilityLiveRegion="polite" style={{ gap: 24 }}><Heading size={96} style={{ color: colors.olive }}>…</Heading><Heading>BUSCANDO CLÁSSICOS</Heading><Copy style={s.muted}>Estamos consultando o acervo. Aguarde um instante.</Copy><ActivityIndicator color={colors.olive} />{[0, 1, 2].map(i => <View key={i} style={{ height: 64, backgroundColor: colors.surface }} />)}</View>;
  return <View accessibilityLiveRegion="polite" style={{ gap: 24 }}><Heading size={96} style={{ color: colors.olive }}>{kind === 'error' ? '!' : '0'}</Heading><Heading>{kind === 'error' ? 'A FICHA NÃO CAIU.' : 'NENHUM JOGO POR AQUI.'}</Heading><Copy style={s.muted}>{message || 'Não encontramos jogos para esta pesquisa. Tente outro nome ou remova os filtros.'}</Copy>{(onRetry || onClear) && <Button onPress={onRetry || onClear}>{onRetry ? 'TENTAR NOVAMENTE' : clearLabel}</Button>}</View>;
}
export function GameList({ data, header, onOpen, onRemove, loading = false, error, emptyMessage, retry, onClear, clearLabel, loadMore, hasMore, loadingMore, moreError, onRefresh }) {
  const { width } = useWindowDimensions();
  const available = Math.min(width, 780) - 48;
  const columns = available > 560 ? 3 : 2;
  const cardWidth = (available - (columns - 1) * 16) / columns;
  const footer = <View style={{ gap: 16 }}>{moreError && <Copy accessibilityRole="alert" style={{ color: colors.accent }}>{moreError}</Copy>}{hasMore && !loading && !error && <Button secondary onPress={loadMore} loading={loadingMore}>{moreError ? 'TENTAR CARREGAR MAIS' : 'CARREGAR MAIS'}</Button>}</View>;
  return <FlatList key={columns} testID="game-list" data={loading || error ? [] : data} numColumns={columns} keyExtractor={g => g.identifier} columnWrapperStyle={{ gap: 16 }} contentContainerStyle={[s.content, { gap: 24 }]} style={s.flex} keyboardShouldPersistTaps="handled" initialNumToRender={12} windowSize={7} removeClippedSubviews={false}
    ListHeaderComponent={header} renderItem={({ item }) => <GameCard game={item} width={cardWidth} onPress={onOpen} onRemove={onRemove} />}
    ListEmptyComponent={<StateView clearLabel={clearLabel} kind={loading ? 'loading' : error ? 'error' : 'empty'} message={error || emptyMessage} onRetry={error ? retry : undefined} onClear={!loading && !error ? onClear : undefined} />}
    ListFooterComponent={footer} refreshing={false} onRefresh={onRefresh} />;
}
export function Panel({ title, children }) { return <View style={s.panel}><Heading size={23} style={{ color: colors.olive }}>{title}</Heading><Copy style={s.muted}>{children}</Copy></View>; }
const u = StyleSheet.create({
  button: { backgroundColor: colors.accent, minHeight: 48, paddingVertical: 14, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  secondary: { backgroundColor: colors.surface }, buttonLabel: { textAlign: 'center', fontSize: 14, lineHeight: 20 },
  gameTitle: { fontSize: 23, lineHeight: 26, color: colors.ink },
  fallback: { backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', gap: 4 }, remove: { minHeight: 44, justifyContent: 'center' },
});
