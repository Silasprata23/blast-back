import React from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { Copy, Heading } from '../components/ui';
import { SYSTEMS } from '../services/archive.mjs';
import { colors, styles as s } from '../theme';

export default function Systems({ navigate }) {
  return <FlatList data={SYSTEMS} keyExtractor={v => v.id} contentContainerStyle={s.content} ListHeaderComponent={<View style={{ gap: 24 }}><Heading>{'ESCOLHA SUA\nMÁQUINA.'}</Heading><Copy style={s.muted}>Do fliperama ao computador de casa.</Copy></View>} renderItem={({ item }) => <Pressable accessibilityRole="button" accessibilityLabel={`Explorar ${item.label}`} onPress={() => navigate('catalog', { system: item })} style={({ pressed }) => ({ minHeight: 64, backgroundColor: colors.surface, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 16, opacity: pressed ? 0.7 : 1 })}><Heading size={23} style={{ flex: 1 }}>{item.label}</Heading><Heading size={23} style={{ color: colors.accent }}>›</Heading></Pressable>} />;
}
