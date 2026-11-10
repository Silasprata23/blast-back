import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Button, Copy, Heading } from '../components/ui';
import { SORTS, SYSTEMS } from '../services/archive.mjs';
import { styles as s } from '../theme';

export default function Filters({ value, apply, back, origin }) {
  const [draft, setDraft] = useState(value);
  return <ScrollView contentContainerStyle={s.content}><Heading>DO SEU JEITO.</Heading><Copy style={s.caption}>ORDENAR JOGOS</Copy><View style={{ gap: 12 }}>{SORTS.map(v => <Button key={v.id} secondary accessibilityRole="radio" accessibilityState={{ checked: draft.sort === v.id }} onPress={() => setDraft(d => ({ ...d, sort: v.id }))}>{draft.sort === v.id ? '●' : '○'}  {v.label}</Button>)}</View>
    {origin === 'search' && <><Copy style={s.caption}>SISTEMA</Copy>{[{ id: '', label: 'Todos os sistemas' }, ...SYSTEMS].map(v => <Button key={v.id} secondary accessibilityRole="radio" accessibilityState={{ checked: draft.collection === v.id }} onPress={() => setDraft(d => ({ ...d, collection: v.id }))}>{draft.collection === v.id ? '●' : '○'}  {v.label}</Button>)}</>}
    <Button onPress={() => { apply(draft); back(); }}>APLICAR</Button><Button secondary onPress={() => { apply({ sort: 'downloads', collection: origin === 'search' ? '' : value.collection }); back(); }}>LIMPAR FILTROS</Button>
  </ScrollView>;
}
