import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, BackHandler, StatusBar, View, useWindowDimensions } from 'react-native';
import { useFonts } from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Shell from './src/components/Shell';
import Catalog from './src/screens/Catalog';
import Systems from './src/screens/Systems';
import Filters from './src/screens/Filters';
import Detail from './src/screens/Detail';
import Saved from './src/screens/Saved';
import { PlayerScreen } from './src/screens/PlayerScreen';
import { useLibrary } from './src/hooks/useLibrary';
import { colors } from './src/theme';

export default function App() {
  const [loaded, fontError] = useFonts({ BarlowCondensed: require('./assets/fonts/BarlowCondensed-Bold.ttf'), ChakraPetch: require('./assets/fonts/ChakraPetch-Regular.ttf') });
  const [stack, setStack] = useState([{ name: 'home', params: {} }]);
  const [filters, setFilters] = useState({ sort: 'downloads', collection: '' });
  const [query, setQuery] = useState('');
  const route = stack[stack.length - 1];
  const library = useLibrary();
  const { width, height } = useWindowDimensions();
  useEffect(() => { if (route.name === 'player') library.remember(route.params.game); }, [route]);

  const navigate = useCallback((name, params = {}, reset = false) => setStack(previous => reset ? [{ name, params }] : [...previous, { name, params }]), []);
  const back = useCallback(() => setStack(previous => previous.length > 1 ? previous.slice(0, -1) : previous), []);
  useEffect(() => {
    const listener = BackHandler.addEventListener('hardwareBackPress', () => { if (stack.length < 2) return false; back(); return true; });
    return () => listener.remove();
  }, [stack.length, back]);
  if (!loaded && !fontError) return <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={colors.olive} /></View>;
  let screen;
  if (['home', 'search', 'catalog'].includes(route.name)) screen = <Catalog key={route.name + (route.params.system?.id || '')} mode={route.name} filters={filters} query={query} setQuery={setQuery} navigate={navigate} library={library} system={route.params.system} />;
  else if (route.name === 'systems') screen = <Systems navigate={navigate} />;
  else if (route.name === 'filters') screen = <Filters value={filters} apply={setFilters} back={back} origin={route.params.origin} />;
  else if (route.name === 'detail') screen = <Detail key={route.params.game.identifier} game={route.params.game} navigate={navigate} library={library} />;
  else if (route.name === 'saved') screen = <Saved library={library} navigate={navigate} />;
  else if (route.name === 'player') return <SafeAreaProvider><PlayerScreen selectedGame={route.params.game} detail={route.params.game} saveGame={() => library.toggle(route.params.game, true)} navigate={() => stack.length > 1 ? back() : navigate('home', {}, true)} width={width} height={height} /></SafeAreaProvider>;
  return <SafeAreaProvider><StatusBar barStyle="light-content" backgroundColor={colors.bg} /><Shell route={route} navigate={navigate} back={back} canGoBack={stack.length > 1}>{screen}</Shell></SafeAreaProvider>;
}
