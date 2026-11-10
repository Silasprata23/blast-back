import React from 'react';
import { View } from 'react-native';
import { Button, Copy, GameList, Heading } from '../components/ui';
import { styles as s } from '../theme';

export default function Saved({ library, navigate }) {
  return <GameList data={library.saved} loading={!library.ready && !library.error} error={library.error || undefined} retry={library.reload} emptyMessage="Você ainda não salvou jogos. Explore o acervo e toque em Salvar na minha lista nos detalhes." onClear={() => navigate('systems', {}, true)} onOpen={game => navigate('detail', { game })} onRemove={library.toggle} header={<View style={{ gap: 24 }}><Heading>{'SEUS CLÁSSICOS.\nSEMPRE À MÃO.'}</Heading><Copy style={s.muted}>Sua lista fica salva neste dispositivo.</Copy><Copy style={s.caption}>Salvar um jogo guarda o atalho. O progresso depende do suporte do emulador.</Copy><Button secondary onPress={() => navigate('systems', {}, true)}>EXPLORAR MAIS JOGOS</Button></View>} />;
}
