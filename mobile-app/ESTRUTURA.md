# Refatoração em componentes — Blast Back

O projeto foi separado em telas, componentes reutilizáveis, serviços de API, constantes, estado e estilos, sem alterar dependências nem a proposta visual.

## Organização

- `App.js`: composição das telas e navegação interna.
- `src/screens/`: Home, Sistemas, Jogos do sistema, Busca, Salvos, Detalhe, Player.
- `src/components/`: cabeçalho, cartão de jogo, grade de jogos, botões, cartões de sistema, linhas de salvos, cartão de continuar e controles do emulador.
- `src/hooks/useBlastBack.js`: estado e operações de catálogo e sessões.
- `src/services/archiveService.js`: requisições ao Internet Archive.
- `src/constants/catalog.js`: configuração de sistemas, ordenação, URLs e chaves de armazenamento.
- `src/styles/styles.js`: estilos originais compartilhados.

## Executar

```bash
npm install
npx expo start
```

## Observação

Os jogos são carregados do Internet Archive e dependem de internet e da compatibilidade do emulador com o WebView. O botão Salvar registra a sessão e o jogo para reabrir; não salva necessariamente o estado interno do emulador.
