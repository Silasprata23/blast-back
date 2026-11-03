import React from 'react';
import { View } from 'react-native';
import { TouchButton } from './TouchButton';
import { styles } from '../styles/styles';
export function TouchControls({sendKey,width,height}) {
 const size=Math.min(58,width*0.14);
 return <View style={[styles.touchPanel,{paddingHorizontal:Math.max(14,width*0.055),paddingBottom:Math.max(12,height*0.018)}]}>
   <View style={styles.dpad}>
     <View style={styles.dpadRow}><TouchButton label="▲" keyName="ArrowUp" sendKey={sendKey} size={size}/></View>
     <View style={styles.dpadRow}>
       <TouchButton label="◀" keyName="ArrowLeft" sendKey={sendKey} size={size}/>
       <View style={{width:size,height:size}}/>
       <TouchButton label="▶" keyName="ArrowRight" sendKey={sendKey} size={size}/>
     </View>
     <View style={styles.dpadRow}><TouchButton label="▼" keyName="ArrowDown" sendKey={sendKey} size={size}/></View>
   </View>
   <View style={styles.actionPad}>
     <View style={styles.actionRow}>
       <TouchButton label="B" keyName="x" sendKey={sendKey} accent size={size}/>
       <TouchButton label="A" keyName="z" sendKey={sendKey} accent size={size}/>
     </View>
     <View style={styles.actionRow}>
       <TouchButton label="SELECT" keyName="5" sendKey={sendKey} small/>
       <TouchButton label="START" keyName="1" sendKey={sendKey} small/>
     </View>
   </View>
 </View>;
}
