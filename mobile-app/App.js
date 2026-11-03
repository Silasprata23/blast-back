import React from 'react';
import { SafeAreaView, ScrollView, StatusBar, Text, useWindowDimensions } from 'react-native';
import { Header } from './src/components/Header';
import { useBlastBack } from './src/hooks/useBlastBack';
import { HomeScreen } from './src/screens/HomeScreen';
import { SystemsScreen } from './src/screens/SystemsScreen';
import { SystemGamesScreen } from './src/screens/SystemGamesScreen';
import { SearchScreen } from './src/screens/SearchScreen';
import { SavesScreen } from './src/screens/SavesScreen';
import { DetailScreen } from './src/screens/DetailScreen';
import { PlayerScreen } from './src/screens/PlayerScreen';
import { styles } from './src/styles/styles';

export default function App() {
  const {width,height} = useWindowDimensions();
  const wide = width >= 700;
  const state = useBlastBack();
  const {screen,setScreen,loadGames,selectedGame} = state;
  const navigate = id => {
    setScreen(id);
    if (id === 'systems') state.setGames([]);
  };
  const selectSystem = system => {
    state.setSelectedSystem(system);
    setScreen('system-games');
    loadGames({collection:system.id,rows:48});
  };
  if (screen === 'player' && selectedGame) {
    return <PlayerScreen selectedGame={selectedGame} saveGame={state.saveGame} navigate={navigate} width={width} height={height}/>;
  }
  return <SafeAreaView style={styles.container}>
    <StatusBar barStyle="light-content"/>
    <Header screen={screen} navigate={navigate}/>
    <ScrollView contentContainerStyle={[styles.content,{maxWidth:1100,width:'100%',alignSelf:'center',paddingHorizontal:wide?28:16}]}>
      {screen==='home' && <HomeScreen {...state} wide={wide} navigate={navigate}/>}
      {screen==='systems' && <SystemsScreen onSelect={selectSystem}/>}
      {screen==='system-games' && <SystemGamesScreen {...state} wide={wide} navigate={navigate}/>}
      {screen==='search' && <SearchScreen {...state} wide={wide}/>}
      {screen==='saves' && <SavesScreen {...state}/>}
      {screen==='detail' && <DetailScreen {...state} navigate={navigate}/>}
      <Text style={styles.footer}>BLAST BACK • Jogos fornecidos pelo Internet Archive</Text>
    </ScrollView>
  </SafeAreaView>;
}
