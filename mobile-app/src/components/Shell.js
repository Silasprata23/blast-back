import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Copy, Heading } from './ui';
import { colors } from '../theme';

export default function Shell({ route, navigate, back, canGoBack, children }) {
  const insets = useSafeAreaInsets();
  const active = route.name === 'catalog' ? 'systems' : route.name === 'filters' ? route.params?.origin || 'search' : ['detail', 'player'].includes(route.name) ? 'home' : route.name;
  const showBack = canGoBack && ['catalog', 'detail', 'player', 'filters'].includes(route.name);
  return <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}><View style={t.shell}>
    <View style={t.header}><Pressable accessibilityRole="button" accessibilityLabel={showBack ? 'Voltar' : 'Ir ao início'} onPress={showBack ? back : () => navigate('home', {}, true)} style={{ minHeight: 48, flex: 1, justifyContent: 'center' }}><Heading size={25}>{showBack ? '‹  VOLTAR' : 'BLAST BACK'}</Heading></Pressable><Heading size={22} style={{ color: colors.accent }}>B</Heading></View>
    <View style={{ flex: 1 }}>{children}</View>
    <View accessibilityRole="tablist" style={[t.nav, { paddingBottom: Math.max(insets.bottom, 16) }]}>{[['home', 'Início', '⌂'], ['systems', 'Sistemas', '▦'], ['search', 'Buscar', '⌕'], ['saved', 'Salvos', '♡']].map(([name, label, symbol]) => <Pressable key={name} accessibilityRole="tab" accessibilityState={{ selected: active === name }} accessibilityLabel={label} onPress={() => navigate(name, {}, true)} style={({ pressed }) => [t.tab, { opacity: pressed ? 0.65 : 1 }]}><Copy style={{ fontSize: 22, lineHeight: 32, color: active === name ? colors.accent : colors.muted }}>{symbol}</Copy><Copy style={{ fontSize: 12, lineHeight: 18, color: active === name ? colors.ink : colors.muted }}>{label}</Copy></Pressable>)}</View>
  </View></View>;
}
const t = StyleSheet.create({ shell: { flex: 1, width: '100%', maxWidth: 780, alignSelf: 'center' }, header: { minHeight: 64, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, nav: { backgroundColor: colors.surface, flexDirection: 'row', paddingTop: 12, paddingHorizontal: 24 }, tab: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 52 } });
