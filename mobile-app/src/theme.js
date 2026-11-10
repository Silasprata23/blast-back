import { StyleSheet } from 'react-native';

export const colors = { bg: '#151715', surface: '#232620', ink: '#F2EEDF', muted: '#B1B5A6', accent: '#E95B43', olive: '#C1CB8D', line: '#414638' };
export const fonts = { heading: 'BarlowCondensed', body: 'ChakraPetch' };
export const styles = StyleSheet.create({
  flex: { flex: 1 },
  page: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 32, gap: 24 },
  body: { fontFamily: fonts.body, color: colors.ink, fontSize: 14, lineHeight: 21 },
  muted: { color: colors.muted },
  heading: { fontFamily: fonts.heading, color: colors.ink, fontSize: 36, lineHeight: 40 },
  caption: { fontFamily: fonts.body, color: colors.muted, fontSize: 12, lineHeight: 18 },
  kicker: { fontFamily: fonts.body, color: colors.accent, fontSize: 12, lineHeight: 18 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  panel: { padding: 16, backgroundColor: colors.surface, gap: 8 },
});
