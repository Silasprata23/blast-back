import React, { useRef } from 'react';
import { ActivityIndicator, Platform, Pressable, SafeAreaView, StatusBar, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { TouchControls } from '../components/TouchControls';
import { embed } from '../constants/catalog';
import { styles } from '../styles/styles';
export function PlayerScreen({selectedGame,saveGame,navigate,width,height}) {
  const webRef = useRef(null);
  const sendKey = (key,down) => {
    const codeMap={ArrowUp:38,ArrowDown:40,ArrowLeft:37,ArrowRight:39,z:90,x:88,Enter:13,Shift:16,'5':53,'1':49};
    const code=codeMap[key]||key.charCodeAt(0);
    const script=`(function(){try{var t=document;var e=new KeyboardEvent('${down?'keydown':'keyup'}',{key:${JSON.stringify(key)},code:${JSON.stringify(key==='Enter'?'Enter':key==='Shift'?'ShiftLeft':key.length===1?'Key'+key.toUpperCase():key)},keyCode:${code},which:${code},bubbles:true,cancelable:true});t.dispatchEvent(e);window.dispatchEvent(e);var f=document.querySelector('iframe');if(f){try{f.contentWindow.dispatchEvent(new KeyboardEvent('${down?'keydown':'keyup'}',{key:${JSON.stringify(key)},keyCode:${code},which:${code},bubbles:true}));}catch(_){}}}catch(e){} })();true;`;
    webRef.current?.injectJavaScript(script);
  };

  return <SafeAreaView style={styles.container}>
    <StatusBar barStyle="light-content"/>
    <View style={styles.playerTop}>
      <Pressable onPress={() => navigate('detail')}><Text style={styles.navActive}>‹ Voltar</Text></Pressable>
      <Text numberOfLines={1} style={styles.playerTitle}>{selectedGame.title||selectedGame.identifier}</Text>
      <Pressable onPress={saveGame} style={styles.saveButton}><Text style={styles.saveText}>Salvar</Text></Pressable>
    </View>
    <View style={styles.webWrap}><WebView ref={webRef} source={{uri:embed(selectedGame.identifier)}} javaScriptEnabled domStorageEnabled allowsFullscreenVideo allowsInlineMediaPlayback mediaPlaybackRequiresUserAction={false} originWhitelist={['*']} style={styles.webview} startInLoadingState renderLoading={()=><ActivityIndicator color="#55f2d0" size="large"/>}/></View>
    <View style={styles.playerHint}><Text style={styles.muted}>Os controles abaixo enviam comandos de teclado ao emulador. O suporte varia conforme o jogo.</Text></View>
    {Platform.OS!=='web' && <TouchControls sendKey={sendKey} width={width} height={height}/>}
  </SafeAreaView>;
}
