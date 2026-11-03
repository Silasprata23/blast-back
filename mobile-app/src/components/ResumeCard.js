import React from 'react';
import { Text, View } from 'react-native';
import { ActionButton } from './ActionButton';
import { styles } from '../styles/styles';
export function ResumeCard({session,onResume}) {
  return <View style={styles.resumeCard}>
    <View style={{flex:1}}><Text style={styles.resumeTitle}>CONTINUAR JOGANDO?</Text>
      <Text style={styles.muted}>{session.title}</Text></View>
    <ActionButton label="CONTINUAR" onPress={onResume}/>
  </View>;
}
