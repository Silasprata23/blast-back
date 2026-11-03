import React from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { ActionButton } from '../components/ActionButton';
import { GameGrid } from '../components/GameGrid';
import { SectionHeader } from '../components/SectionHeader';
import { SORTS } from '../constants/catalog';
import { styles } from '../styles/styles';
export function SearchScreen({query,setQuery,sort,setSort,loadGames,games,wide,loading,error,openGame}) {
  return <>
    <SectionHeader title="Buscar jogos" subtitle="Pesquise no catálogo do Internet Archive"/>
    <TextInput value={query} onChangeText={setQuery} placeholder="Nome do jogo..." placeholderTextColor="#82909b"
      style={styles.input} returnKeyType="search" onSubmitEditing={() => loadGames({query,rows:48})}/>
    <View style={styles.sortRow}>{SORTS.map(s =>
      <Pressable key={s.value} onPress={() => setSort(s.value)} style={[styles.sortChip,sort===s.value&&styles.sortSelected]}>
        <Text style={styles.sortText}>{s.label}</Text>
      </Pressable>
    )}</View>
    <ActionButton label="PESQUISAR" onPress={() => loadGames({query,sort,rows:48})}/>
    <GameGrid {...{games,wide,loading,error}} onOpen={openGame}/>
  </>;
}
