import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { styles } from '../styles/styles';
const NAV = [['home','Início'],['systems','Sistemas'],['search','Buscar'],['saves','Salvos']];
export function Header({ screen, navigate }) {
  return <View style={styles.header}>
    <Pressable onPress={() => navigate('home')}><Text style={styles.brand}>▣ BLAST BACK</Text></Pressable>
    <View style={styles.nav}>{NAV.map(([id,label]) =>
      <Pressable key={id} onPress={() => navigate(id)} style={styles.navItem}>
        <Text style={screen === id ? styles.navActive : styles.navText}>{label}</Text>
      </Pressable>
    )}</View>
  </View>;
}
