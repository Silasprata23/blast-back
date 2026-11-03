import React from 'react';
import { Image, Pressable, Text } from 'react-native';
import { thumb } from '../constants/catalog';
import { styles } from '../styles/styles';
export function GameCard({ game, onPress }) {
  return <Pressable onPress={() => onPress(game)} style={[styles.gameCard, {width:'100%'}]}>
    <Image source={{uri:thumb(game.identifier)}} style={styles.gameImage} resizeMode="cover"/>
    <Text numberOfLines={2} style={styles.gameTitle}>{game.title || game.identifier}</Text>
    <Text style={styles.muted}>{game.year || 'Clássico arcade'}</Text>
  </Pressable>;
}
