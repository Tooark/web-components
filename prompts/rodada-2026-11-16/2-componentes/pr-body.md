## ark-data-view, ark-pagination e ark-nav

Os dois recursos que estavam nas branches locais `feat/data-view-pagination` e `feat/nav` (ambas feitas a partir da 1.5.0), refeitos sobre a `main` atual (1.6.1 + o PR de dependencias). Os commits sao os originais, na mesma ordem e com as mesmas mensagens; muda so o que a base nova pediu. Tudo entra em `[Unreleased]`: sem bump de versao, nada e publicado.

### Componentes

- **`ark-pagination`**: o host e o `role="navigation"`; resumo do intervalo, seletor opcional de itens por pagina e a faixa de paginas. `page`, `page-size` e `total` sao a fonte da verdade, `ark-page-change` a cada troca.
- **`ark-data-view`**: registros como `<table>` de verdade ou cards, a partir de `rows` + `columns` (propriedades JS). Simples por padrao (tabela com seletor de visao); busca, paginacao, selecao com acoes em massa, reordenar e linhas clicaveis sao opt-in. `mode="client|server"` com um `ark-query-change` consolidado. Conteudo de celula nos termos de cada framework: JSX por portal no React, slots `#cell-<key>` no Vue, `ng-template[arkDataViewCell]` no Angular.
- **`ark-nav`, `ark-nav-item`, `ark-nav-group`**: navegacao em `sidebar` (recolhe para trilho de icones ou, com `collapsible="hidden"`, so o logo), `navbar` e `tabbar`. Item com `<a href>` real e `ark-navigate` cancelavel para roteamento de SPA.
- Wrappers React, Vue e Angular dos cinco elementos; a suite passa a rodar os wrappers Angular (`Integration/Angular Wrappers`, JIT a partir do src).

### O que mudou em relacao as branches

- `apps/storybook/package.json`: as devDependencies Angular da suite vao para 21.2.26, as mesmas do `packages/angular` depois do bump (eram 21.2.24), e convivem com as do CodeMirror que a 1.6.0 trouxe; lockfile regenerado so com essas entradas.
- Revisao de acentos: estendida as stories que entraram depois dela (Extensions do `ark-code-editor` na 1.6.0, Enter em formularios do `ark-button` e do `ark-datepicker` na 1.6.1) e ajustada aos comentarios novos das stories da Motion.
- READMEs: linhas das tabelas inseridas sobre a formatacao do Biome 2.6; contagem de elementos e de wrappers para 46 (41 + 2 + 3). CHANGELOG: a entrada do nav entra no mesmo Added do Unreleased, antes da 1.6.1.
- O `chore: diretorio prompts/ no .gitignore` da branch do data-view vem junto.

### Verificacao local

`biome ci .` limpo; build dos 10 pacotes e do Storybook estatico, `pnpm check:publish` e `pnpm check:ssr` OK; suite completa 510/510 (50 arquivos) com coverage.
