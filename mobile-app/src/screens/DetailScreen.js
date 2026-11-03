import React from 'react';
import { Image, Pressable, Text } from 'react-native';
import { ActionButton } from '../components/ActionButton';
import { thumb } from '../constants/catalog';
import { styles } from '../styles/styles';
export function DetailScreen({selectedGame,detail,error,navigate,play}) {
  if (!selectedGame) return null;
  return <>
    <Pressable onPress={() => navigate('home')}><Text style={styles.navActive}>‹ Voltar</Text></Pressable>
    <Image source={{uri:thumb(selectedGame.identifier)}} style={styles.detailImage} resizeMode="contain"/>
    <Text style={styles.heading}>{detail?.title||selectedGame.title||selectedGame.identifier}</Text>
    <Text style={styles.muted}>{detail?.year||selectedGame.year||''} {detail?.creator?` • ${detail.creator}`:''}</Text>
    <Text style={styles.bodyText}>{detail?.description||error||'Carregando informações do jogo...'}</Text>
    <ActionButton label="▶ JOGAR AGORA" onPress={() => play(selectedGame)}/>
  </>;
}
