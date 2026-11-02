# Avaliação das lacunas apontadas pelo Arkcode

Documento de trabalho, não faz parte do pacote. Reúne a avaliação da tabela de lacunas que a varredura do Arkcode
gerou (recebida em 2026-11-04), dos dois defeitos de layout reportados em 2026-11-08 (cabeçalho do `ark-card` e
campos de formulário esticados), do rótulo do `ark-switch` (2026-11-09) e da repetição dos pontos do `@tooark/chart`
(2026-11-10), para decidir o que entra na lib, o que fica no app e em que ordem.

**Base avaliada:** `origin/main` em 1.6.1 (`6ad1b39`) e as branches locais `feat/data-view-pagination` e `feat/nav`,
ambas criadas a partir da 1.5.0, nunca mescladas nem enviadas ao origin. Nada foi implementado nesta avaliação. As
medições dos itens 12 e 13 foram feitas em Chromium headless (Playwright); a do 13 com os componentes reais do `dist`
1.6.1, e a do 15 (como os tokens de cor chegam a um canvas) com o CSS compilado do core e o ECharts 6.1.0.

**Regras aplicadas:** recurso vindo de um app consumidor entra na lib de forma genérica e desligado por padrão, com
wrapper e teste nos três frameworks (paridade HTML, React, Vue e Angular); decisões anteriores valem até surgir motivo
novo (editor do Arkcode via `extensions` em 2026-10-13, `helper` do switch recusado em 2026-09-29).

**Vocabulário do veredito:**

- **Já existe**: implementado, falta mesclar ou já coberto pela API atual.
- **Já avaliado**: repete um item anterior; o veredito está lá.
- **Lacuna, fazer na lib**: recurso genérico que recomendo implementar.
- **Lacuna, resolver no app**: existe ponto de extensão; a lib não muda.
- **Recusado**: avaliado e descartado, com o motivo.
- **Decisão sua**: viável, mas muda uma regra ou um desenho já fixado.

## Resumo

| #   | Item da lista                                         | Veredito                                   | Esforço (lista → reavaliado) |
| --- | ----------------------------------------------------- | ------------------------------------------ | ---------------------------- |
| 1a  | `lang="pt-BR"` cai em inglês                          | Lacuna, fazer na lib                       | P → P                        |
| 1b  | Herdar `lang` do `<html>`                             | Decisão sua                                | P → P                        |
| 1c  | `setArkLocale()` global                               | Decisão sua (alternativa opt-in ao 1b)     | P → P                        |
| 2   | Tema: controller, script CSP, `ArkThemeSwitch`        | Lacuna, resolver no app                    | M → nada na lib              |
| 3a  | `ark-chart`/`ark-code-editor` em React: tipagem       | Lacuna, fazer na lib                       | P → P                        |
| 3b  | `ArkChart`/`ArkCodeEditor` como wrappers              | Decisão sua                                | P → M                        |
| 4a  | `filename`, `highlightLines`, clique na linha, blame  | Lacuna, resolver no app (já decidido)      | M → nada na lib              |
| 4b  | `maxHeight` no editor                                 | Lacuna, fazer na lib                       | parte de M → P               |
| 5a  | Tokens `--ark-syntax-*`                               | Lacuna, fazer na lib                       | M → M                        |
| 5b  | `ark-code-snippet`                                    | Recusado                                   | M → nada                     |
| 6   | `palette="tokens"` no `ark-chart`                     | Lacuna, fazer na lib                       | M → M                        |
| 7a  | `ArkInput` monospace                                  | Já existe                                  | P → nada                     |
| 7b  | `ArkInput` labelHidden                                | Já existe                                  | P → nada                     |
| 7c  | `ArkSwitch` helper                                    | Recusado (2026-09-29)                      | P → nada                     |
| 7d  | `onValueChange`                                       | Recusado                                   | P → nada                     |
| 7e  | `ArkButton asChild` para o router                     | Lacuna, fazer na lib (como `ark-navigate`) | P → P                        |
| 8   | `ArkTable` com ordenação e aria-sort, `ArkPagination` | Já existe (`feat/data-view-pagination`)    | G → mesclar                  |
| 9   | `ArkTree` com seleção em três estados                 | Lacuna, fazer na lib                       | G → G                        |
| 10a | `ark-diff-viewer`                                     | Lacuna, resolver no app                    | G → nada na lib              |
| 10b | `ArkDownloadButton`                                   | Lacuna, fazer na lib (`download` no `<a>`) | P → P                        |
| 11a | `ArkChip`                                             | Adiar                                      | P → P quando um app precisar |
| 11b | `ArkStat`                                             | Adiar                                      | P → P quando um app precisar |
| 11c | `ArkRelativeTime`                                     | Lacuna, fazer na lib                       | P → P                        |
| 11d | `ArkMenuGroup`                                        | Lacuna, fazer na lib                       | P → P                        |
| 11e | `headingLevel`                                        | Lacuna, fazer na lib                       | P → P                        |
| 11f | `ArkSidebar`                                          | Já existe (`feat/nav`)                     | M → mesclar                  |
| 12  | Cabeçalho do `ark-card` esmaga o título               | Lacuna, fazer na lib (correção)            | novo → P                     |
| 13  | Campos de formulário esticados numa linha alta        | Lacuna, fazer na lib (correção)            | novo → P                     |
| 14  | `ark-switch` sem rótulo visível nem clique no host    | Lacuna, fazer na lib                       | novo → P/M                   |
| 15  | `@tooark/chart`: wrapper React e cores dos tokens     | Já avaliado: 3a/3b (wrapper) e 6 (tokens)  | — (itens 3a, 3b e 6)         |

## Já existe

### 8 e 11f. `ArkTable` + `ArkPagination` e `ArkSidebar`

**Solicitado:** tabela com ordenação e `aria-sort`, paginação, e uma sidebar com semântica própria.

**Situação:** já existe. `ark-data-view` (coluna `sortable`, `aria-sort` no `th`, modo tabela/cards, seleção, `ark-query-change`)
e `ark-pagination` estão em `feat/data-view-pagination`; `ark-nav variant="sidebar"` (com `collapsible="rail|hidden"`,
`ark-nav-item`, `ark-nav-group`, `ark-navigate` cancelável) está em `feat/nav`. As duas têm wrappers React, Vue e
Angular, stories de integração, READMEs e CHANGELOG. Nenhuma foi mesclada nem enviada ao origin.

**O que precisa fazer:** mesclar uma de cada vez. `git merge-tree` não acusa conflito de nenhuma das duas contra
`origin/main` (1.6.1). Entre si, elas tocam 25 arquivos em comum (`register.ts`, `tag-map.ts`, `base.css`,
`components.css`, `i18n/*`, `style.ts`, os `index` dos pacotes, `jsx-intrinsics.d.ts`, as stories de integração,
READMEs, CHANGELOG, CLAUDE.md): a segunda a entrar precisa de rebase com resolução por inserção alfabética. Rodar
build, `check:publish`, `check:ssr` e a suíte após cada uma. Sugestão: data-view primeiro (maior), nav depois.

**Recomendação:** mesclar. É o maior retorno da lista com custo zero de implementação.

**Impacto:** dois componentes novos na 1.7.0; sem mudança para quem não os usa.

### 7a. `ArkInput` monospace

**Solicitado:** fonte monoespaçada no campo.

**Situação:** já existe. O `base.css` aplica `font: inherit` ao `<input>` interno dentro do host `ark-input`, então
uma classe de fonte no host (`class="font-mono"` no Tailwind do app, ou `style="font-family: ..."`) chega ao campo.

**O que precisa fazer:** nada na lib. Opcional: uma frase no README do `ark-input` dizendo que a fonte herda do host.

**Recomendação:** não criar atributo.

**Impacto:** nenhum.

### 7b. `ArkInput` labelHidden

**Solicitado:** campo sem rótulo visível, mas com nome acessível.

**Situação:** já existe. `aria-label` está na lista de atributos repassados ao `<input>` e o README documenta
(seção de consultas de teste). Sem `label` e com `aria-label`, o campo tem nome e nenhum rótulo visível.

**O que precisa fazer:** nada.

**Recomendação:** usar `aria-label`.

**Impacto:** nenhum.

## Lacuna, fazer na lib

Ordem sugerida por valor e custo. Todos entram desligados por padrão, salvo onde dito que é correção.

### 1a. `lang="pt-BR"` cai em inglês

**Solicitado:** parar de repetir `lang={arkLang}` 190 vezes; o app mapeia `pt-BR` para `pt` à mão.

**Situação:** lacuna. `resolveLocale` em `packages/core/src/i18n/index.ts` só conhece `en`, `pt`, `es` e `custom`;
qualquer outro valor, inclusive `pt-BR` ou `es-MX`, cai em `en` silenciosamente.

**O que precisa fazer:** normalizar o idioma antes da busca (minúsculas, cortar região e script: `pt-BR` → `pt`,
`es-419` → `es`); testar no story de i18n; uma linha nos READMEs e no CHANGELOG.

**Recomendação:** fazer, como correção.

**Impacto:** quem passa `lang="pt-BR"` hoje recebe inglês e passará a receber português. É o comportamento esperado,
mas é mudança visível; registrar no CHANGELOG. Não resolve sozinho a repetição de `lang`, só torna o valor do app
aceitável sem mapeamento.

### 3a. `ark-chart` e `ark-code-editor` em React: tipagem dos tags brutos

**Solicitado:** `ArkChart` e `ArkCodeEditor` em React, porque hoje o app cria os elementos com `createElement`.

**Situação:** lacuna de tipagem. Os pacotes laterais não têm wrapper por decisão de arquitetura (usados pela tag;
um wrapper em `@tooark/react` arrastaria ECharts e CodeMirror como peers de todo consumidor). O
`jsx-intrinsics.d.ts` tipa as tags, mas falta o que vai como propriedade JS: `option` do `ark-chart`; `value`,
`extensions`, `variables`, `variableKeys`, `completions`, `completionSource`, `formatter` do `ark-code-editor`. Em
TypeScript isso rejeita o JSX e empurra o app para o `createElement`. O React 19 atribui essas props como
propriedade quando o elemento as define, então em tempo de execução o JSX já funciona.

**O que precisa fazer:** completar os dois blocos do `jsx-intrinsics.d.ts` com as propriedades, tipadas pelos tipos
que `@tooark/chart` e `@tooark/code` exportam (tipo só, sem dependência de runtime); acrescentar ao
`typecheck/dom-props.tsx`; documentar no README do React.

**Recomendação:** fazer. Resolve o sintoma sem reverter a decisão dos wrappers.

**Impacto:** só tipos. Eventos (`change`, `ark-format-error`, `ark-submit`, os do chart) continuam exigindo `ref` +
`addEventListener` no React 19, que não liga eventos customizados por prop.

### 4b. `max-height` no `ark-code-editor`

**Solicitado:** altura máxima com rolagem interna na visão de arquivo.

**Situação:** lacuna. Existe `min-height` (padrão `8rem`, o editor cresce com o conteúdo) e não existe teto.

**O que precisa fazer:** atributo `max-height` (comprimento CSS) aplicado ao `.cm-editor` com `overflow: auto` no
scroller, opção `maxHeight` no engine, story, tipagem JSX, README.

**Recomendação:** fazer. É layout, como o `min-height`, não recurso do CodeMirror.

**Impacto:** nenhum sem o atributo.

### 5a. Tokens `--ark-syntax-*`

**Solicitado:** parar de copiar a paleta de sintaxe do editor para outras partes do app.

**Situação:** lacuna. O engine do `@tooark/code` lê os tokens `--ark-color-*` com fallback para o chrome (fundo,
texto, bordas, seleção) e mantém a paleta de sintaxe fixa em código (`SYNTAX`, dois lados, oito papéis: keyword,
string, number, property, comment, atom, punctuation, invalid). O README diz "duas paletas fixas".

**O que precisa fazer:** declarar `--ark-syntax-<papel>` em `tokens.css` com `light-dark()` e os valores atuais; o
engine lê cada um por `getComputedStyle` com os valores atuais como fallback (mesmo padrão do chrome), e reaplica
na troca de tema; smoke test do `check-css` para os tokens novos; story mostrando o override; READMEs do tokens e do
code.

**Recomendação:** fazer. Deixa a sintaxe temável e reutilizável sem dependência nova.

**Impacto:** sem o CSS de tokens na página, nada muda (fallback). Com ele, as cores continuam as mesmas até alguém
sobrescrever um token. Os tokens entram no bundle de tokens de todo consumidor (oito variáveis).

### 5b. `ark-code-snippet` (recusado)

**Solicitado:** bloco de código destacado, só leitura, sem editor.

**Situação:** coberto por `ark-code-editor readonly` (sem cursor nem linha ativa; busca e dobra continuam).

**Recomendação:** não fazer. Um segundo elemento duplicaria gramáticas, tema e peers do CodeMirror para ganhar
pouco; com os tokens do item 5a o app colore um `<pre>` próprio se quiser algo mais leve.

**Impacto:** nenhum.

### 6. `palette="tokens"` no `ark-chart`

**Solicitado:** gráfico que acompanhe as cores do tema em vez de cores fixas.

**Situação:** lacuna. O engine só escolhe o tema `dark` do ECharts ou nenhum; a paleta de séries, textos e eixos é
a padrão da lib.

**O que precisa fazer:** atributo `palette` (`default`, atual, ou `tokens`); com `tokens`, montar um tema ECharts a
partir dos tokens do host, registrar por `echarts.registerTheme` e reaplicar pelo `setTheme`, que já descarta e
recria a instância na troca de tema; opção `palette` no engine; story com os dois valores; tipagem JSX; README. O
tema de tokens leva `backgroundColor: "transparent"` (sem tema o ECharts já é transparente), `color` com os intents
na ordem primary, info, success, warning, danger, neutral (`secondary` coincide com `fg` e fica de fora; são seis
cores, o ECharts repete a partir da sétima e `option.color` do app sobrescreve), `textStyle`, eixos e legenda com
`fg`/`fg-muted`, linhas de grade com `border`, tooltip com `surface`/`fg`/`border`. Com `palette="tokens"` o tema
`dark` embutido não entra: ele pinta um fundo opaco próprio, derivado da paleta clara por `modifyHSL`, que não
coincide com `--ark-color-surface`. Medi em Chromium 156 como os tokens chegam a um canvas, com o CSS compilado do
core (os `--ark-color-*` só existem no CSS compilado, `@tooark/core/styles.css` ou
`@tooark/web-components/styles.css`; o `tokens.css` cru é fonte do Tailwind e não define nada sozinho):

| Token (lado claro)              | `getPropertyValue("--ark-color-…")`  | `color` computado numa sonda | `echarts.color.parse` |
| ------------------------------- | ------------------------------------ | ---------------------------- | --------------------- |
| `primary` (escrito em hex)      | `light-dark(#b45309,#f59e0b)`        | `rgb(180, 83, 9)`            | `180,83,9,1`          |
| `fg` (escrito em oklch)         | `light-dark(oklch(…),oklch(…))`      | `oklch(0.208 0.042 265.755)` | `undefined`           |
| `border`, `success` (oklch)     | `light-dark(oklch(…),oklch(…))`      | `oklch(…)`                   | `undefined`           |

Três consequências para o engine: (1) `getPropertyValue` devolve o `light-dark(...)` literal, então a leitura é por
um nó-sonda com `color: var(--ark-color-<token>)` e o `color` computado, que resolve o lado pelo `color-scheme` do
host; (2) só 14 dos 59 tokens de cor estão em hex, e `surface`/`surface-raised` só no lado claro (a família
`primary`, os `*-fg` dos intents, `surface` e `surface-raised`); os outros 45, incluindo `fg`, `border` e os demais
intents, estão em `oklch` e computam para uma string `oklch(...)`, que o parser do zrender não lê (`parse` devolve
`undefined`), e sem isso as cores derivadas (ênfase ao passar o mouse, áreas com opacidade, gradientes) não são
calculadas; o canvas também não converte (`fillStyle` devolve a string `oklch`
intacta); normalizar cada cor pintando um pixel num canvas 1×1 e lendo `getImageData` (sRGB de 8 bits), ou
convertendo oklch → sRGB em JS, antes de entregar ao ECharts; (3) sem o CSS de tokens na página a sonda devolve a
cor herdada (preto): quando `getPropertyValue` vier vazio, cair no tema padrão do ECharts.

**Recomendação:** fazer, opt-in.

**Impacto:** nenhum sem o atributo. Com ele, o gráfico passa a depender do CSS de tokens na página (sem ele, cai no
padrão do ECharts) e o fundo fica transparente, mostrando a superfície do card ou da página.

### 7e. `ArkButton asChild` para o router

**Solicitado:** botão que renderize o `Link` do router, no padrão `asChild` do Radix.

**Situação:** lacuna parcial. `ark-button href` já desenha um `<a>` esticado (foco, `target`, `rel`). `asChild`
não cabe no light DOM: o componente nunca envolve nem substitui filhos, e o `<a>` é chrome próprio. Hoje o app
intercepta o clique no wrapper (`onClick` + `preventDefault` + `navigate`), e já funciona. O `ark-nav-item` emite
`ark-navigate` cancelável com `detail: { href }`, sem emitir em clique com modificador ou `target="_blank"`.

**O que precisa fazer:** o mesmo `ark-navigate` no `ark-button` com `href`, com o mesmo contrato do nav; `onNavigate`
nos três wrappers; story; README.

**Recomendação:** fazer, por paridade com o nav. Rejeitar `asChild`.

**Impacto:** evento novo, nada muda para quem não o escuta.

### 10b. `ArkDownloadButton`

**Solicitado:** botão de download.

**Situação:** lacuna pequena. `ark-button href` existe, mas o `<a>` esticado copia só `target` e `rel`; não há como
passar `download`.

**O que precisa fazer:** observar `download` e encaminhar ao `<a>` (com e sem nome de arquivo); documentar o padrão
"URL de blob + `download`" no README; os wrappers repassam o atributo.

**Recomendação:** fazer. Um atributo resolve o componente inteiro.

**Impacto:** nenhum sem o atributo.

### 11e. `heading-level`

**Solicitado:** controlar o nível do título dos componentes para a hierarquia da página.

**Situação:** lacuna. `ark-card`, `ark-dialog` e `ark-drawer` criam `h2`; `ark-empty` cria `h3`; não há como mudar.

**O que precisa fazer:** atributo `heading-level` (1 a 6) nos quatro, recriando o elemento quando muda e preservando
`aria-labelledby`; story; wrappers; README.

**Recomendação:** fazer. É acessibilidade real e o padrão não muda.

**Impacto:** nenhum sem o atributo.

### 11d. `ArkMenuGroup`

**Solicitado:** agrupar itens do menu com rótulo.

**Situação:** lacuna. O `ark-menu-item` tem `divider` (`role="separator"`); não existe grupo nomeado, isto é,
`role="group"` com `aria-labelledby`.

**O que precisa fazer:** `ark-menu-group label="..."` envolvendo itens (ou um item `heading`), com a navegação por
teclado do menu atravessando o grupo; registro, tag-map, host list, wrappers, story, README.

**Recomendação:** fazer, pequeno.

**Impacto:** elemento novo, sem mudança nos menus atuais.

### 11c. `ArkRelativeTime`

**Solicitado:** "há 3 minutos" com atualização automática.

**Situação:** lacuna. Não há nada na lib. `Intl.RelativeTimeFormat` resolve sem dependência, e o `lang` dos
componentes já fornece o idioma.

**O que precisa fazer:** `ark-time` (ou `ark-relative-time`) com `datetime`, formato relativo ou absoluto, `title`
com a data completa, atualização por intervalo adaptativo pausada fora do documento; depende do item 1a para
`pt-BR`; wrappers, story, README.

**Recomendação:** fazer, depois do 1a.

**Impacto:** elemento novo.

### 9. `ArkTree`

**Solicitado:** árvore com semântica (`role="tree"`) e seleção em três estados.

**Situação:** lacuna. Nada na lib. Genérico (arquivos no Arkcode, coleções no Arkuest).

**O que precisa fazer:** rodada própria com desenho de API antes de codar, como foi o data-view: `ark-tree` +
`ark-tree-item`, `aria-expanded`/`aria-level`/`aria-selected`, um tab stop com setas, `selectable` (`single`,
`multiple` com `aria-checked="mixed"` e propagação opt-in), nós carregados sob demanda, eventos consolidados no
`ark-tree`, conteúdo do nó por slot. Wrappers com paridade nos três frameworks, stories, READMEs.

**Recomendação:** fazer, depois dos itens P.

**Impacto:** elemento novo; é o maior item da lista (G).

### 12. Cabeçalho do `ark-card` esmaga o título

**Solicitado:** com ações largas numa tela estreita, o título encolhe até uma letra por linha ("Relatório V2" a
400 px); o app contornou movendo o seletor para o corpo.

**Situação:** lacuna, defeito de layout. O host é `grid-template-columns: minmax(0, 1fr) auto`. O algoritmo do grid
dá à coluna `auto` das ações o seu `max-content` antes de distribuir sobra à coluna `1fr`, que com mínimo `0` fica
sem nada. Medi em Chromium headless um card de 400 px com quatro ações (três botões e um `select`):

| Variante                                                  | Largura do título | Linhas do título       | Linhas de ações |
| --------------------------------------------------------- | ----------------- | ---------------------- | --------------- |
| A, atual: `minmax(0, 1fr) auto`                           | 0 px              | 2, sob as ações        | 1               |
| E, atual + `overflow-wrap: anywhere` no título            | 0 px              | 11, letra a letra      | 1               |
| B: `minmax(min-content, 1fr) auto` + ações com `wrap`     | 65 px             | 2 ("Relatório" / "V2") | 2               |
| C: `minmax(min(50%, 12rem), 1fr) auto` + ações com `wrap` | 183 px            | 1                      | 3               |

A variante E reproduz o sintoma do Arkcode (o app tem `break-words`/`overflow-wrap` no título). A variante A mostra
que sem isso o título some debaixo das ações: o defeito atinge qualquer consumidor com ações largas, não só esse app.

**O que precisa fazer:** em `components.css`, variante B: piso `min-content` na coluna do título e, no
`[slot="actions"]`, `flex-wrap: wrap`, `justify-content: flex-end`, `row-gap` e `min-width: 0`. Story de card
estreito afirmando que o título não fica abaixo da largura da sua maior palavra e que nada ultrapassa o card; a story
`Layout` atual (ações encostadas à direita e centradas) deve continuar passando. CHANGELOG como correção.

**Recomendação:** fazer como correção, sem atributo. Foge da regra de opt-in de propósito: o estado atual nunca é
desejado. B em vez de C porque não reserva espaço ao lado de um título curto ("Hoje" ficou com 34 px e as ações com o
resto).

**Impacto:** só muda o caso degenerado. Limites que ficam: (1) um `slot="header"` do usuário com um trecho longo sem
quebra (URL, hash) passa a fixar o piso da coluna e pode empurrar as ações para fora do card, onde antes ele
encolhia; o app resolve com `overflow-wrap` no próprio conteúdo. (2) O `min-content` do card cresce pela maior
palavra do título; um card com largura automática dentro de um flex ou de um grid `auto-fit` pode medir diferente.
Testei só largura fixa de 400 px, conferir numa story. (3) Uma única ação mais larga que a sobra continua
transbordando; empilhar as ações abaixo do título fica como opt-in futuro se algum app precisar.

### 13. Campos de formulário esticados numa linha alta

**Solicitado:** `ark-input`, `ark-textarea`, `ark-select` e `ark-file-input` ao lado de um campo alto: o rótulo fica
no topo e a caixa desce. O problema já existia; a importação de textos longos o deixou visível, e o app estendeu o
contorno do `app.css` a esses componentes.

**Situação:** lacuna, defeito de layout, da mesma família do item 12. Os quatro hosts são `inline-grid` com três áreas
(`label`, `field`, `message`) e sem `align-content`. Num flex com `align-items: stretch` (o padrão) ou numa grid, o
host é esticado até a altura do irmão mais alto, e `align-content: normal` numa grid vale `stretch`: a sobra é
repartida entre as três linhas, o rótulo flutua e o campo desce. `ark-checkbox` e `ark-radio` com `helper` (grid de
duas colunas em classes próprias) têm o mesmo defeito. Medi com os componentes reais do `dist` 1.6.1 numa linha flex
ao lado de uma caixa de 240 px; a coluna "corrigido" coincide com o campo solto na linha em todos os casos:

| Host esticado a 240 px      | Hoje: rótulo → mensagem (topo em px) | Corrigido: rótulo → mensagem | Observação                                 |
| --------------------------- | ------------------------------------ | ---------------------------- | ------------------------------------------ |
| `ark-input`                 | 27 → 197                             | 0 → 60                       | campo desce de 20 para 102                 |
| `ark-textarea`              | 0 → 182                              | 0 → 98                       | rótulo com 58 px; textarea de 74 a 116 px  |
| `ark-select`                | 27 → 197                             | 0 → 60                       | campo desce de 20 para 102                 |
| `ark-file-input`            | 0 → 199                              | 0 → 150                      | rótulo com 41 px de altura                 |
| `ark-checkbox` com `helper` | 51 → 174                             | 0 → 22                       | a caixa também desce para 51               |
| `ark-radio` com `helper`    | 51 → 174                             | 0 → 22                       | a caixa também desce para 51               |

No `ark-input` e no `ark-select` o rótulo fica em 27 porque o host tem `align-items: center` (rótulo centrado na
linha que cresceu); no textarea e no file-input ele fica no topo de uma linha mais alta, que é o que o Arkcode viu.

**O que precisa fazer:** `align-content: start` nos quatro hosts em `components.css`; `ark:content-start` na classe
de layout em grid do `ark-checkbox` e do `ark-radio` (a que entra com `helper`); story de linha alta (flex com
`align-items: stretch`) afirmando que rótulo, campo e mensagem ficam nas mesmas posições de um campo solto; a story
`alignment` (alturas 24/28/36/44/52 dos controles) não é afetada, ela mede o controle interno. CHANGELOG como
correção.

**Recomendação:** fazer como correção, sem atributo, pelo mesmo motivo do item 12: repartir a sobra entre rótulo,
campo e mensagem nunca é desejado. Entre `align-content: start` e `grid-template-rows: auto 1fr auto` (o campo
absorve a sobra, o que faria o textarea preencher a altura), `start` é o comportamento de um `<label>` + `<input>`
nativos num bloco; um textarea que preenche a altura pode virar opt-in depois.

**Impacto:** só muda o host esticado: a sobra passa a ficar embaixo da mensagem. Hosts soltos, em linhas com
`align-items: start` ou `inline-block` não mudam de medida (os valores corrigidos coincidem com a referência).
`ark-checkbox`/`ark-radio` sem `helper` são `inline-flex` com itens centrados: esticados, a caixa fica no meio da
altura, comportamento normal de um item flex que o app alinha com `align-items: start` na linha; não mexer. O
contorno do `app.css` do Arkcode fica redundante após a correção e pode sair.

### 14. `ark-switch` sem rótulo visível nem clique fora do trilho

**Solicitado:** o `label` do switch vira só nome acessível (o texto não aparece) e só o trilho responde ao clique.
Dentro do cartão o elemento ocupa a largura toda, então clicar fora do trilho não faz nada. O app pôs o texto ao
lado, clicável, e registrou em `docs/06` e no problema 57 de `docs/07`.

**Situação:** lacuna, consequência de um desenho deliberado. O switch é o mais simples dos controles desenhados:
`aria-label`, senão `label`, vira o `aria-label` do botão `role="switch"`; não há `<label for>`, `aria-labelledby`
nem clique no host (é o que o CLAUDE.md descreve e o motivo da recusa do `helper` em 2026-09-29). O host não tem
classes nem CSS próprios: filhos do usuário ficam onde estão, sem layout, sem nome e sem clique. `ark-checkbox` e
`ark-radio` já têm o padrão completo: `label` desenha um `<label for>` próprio; filhos do usuário nomeiam a caixa por
`aria-labelledby` no host e um clique no host fora do controle alterna como um `<label>`, ignorando links e controles
dentro do rótulo. Os wrappers do checkbox repassam filhos (React `children`, Vue `slots.default`, Angular
`ng-content`); os do switch não. Dentro do `ark-card` o host é item da grid do corpo, por isso ocupa a largura toda.

Alternativas:

- Tornar `label` visível: muda quem usa `label` hoje como nome oculto (as próprias stories fazem isso); não é opt-in.
- Filhos do usuário como rótulo visível (`<ark-switch>Notificações</ark-switch>`), o mesmo padrão do checkbox:
  opt-in por construção, `label`/`aria-label` continuam com precedência, e o host inteiro passa a alternar ao clique.
- Atributo novo (`text`): mais superfície de API para o mesmo resultado; os filhos são o jeito do light DOM.

**O que precisa fazer:** no `ark-switch`: listener de clique no host como o `handleHostClick` do checkbox (ignora o
trilho, links e controles internos e o estado desabilitado; foca o trilho e alterna); nome em ordem `aria-label` →
`label` → filhos via `aria-labelledby` apontando ao host com `id` gerado, re-sincronizado por `MutationObserver` em
`childList`; com filhos, classes no host (`ark:inline-flex ark:items-center ark:gap-2 ark:cursor-pointer`) via
`ownClasses`/`applyOwnClasses`, e o trilho vai para o início do host (`prepend`) para o texto ficar depois; os
wrappers passam filhos nos três frameworks; story com texto livre (clique no texto alterna, o nome acessível vem do
texto, `label` prevalece); README (`label` continua "nome acessível"; filhos documentados).

**Recomendação:** fazer, pela rota dos filhos. Com um rótulo visível, o `helper` do switch (item 7c) deixa de ser
impossível e pode ser reavaliado como opt-in ancorado ao rótulo.

**Impacto:** switch sem filhos não muda em nada, nem layout nem nome. Com filhos, o que hoje é texto solto sem
comportamento passa a ser rótulo com clique e nome; um app que já põe texto dentro do host e trata o clique por
conta própria pode alternar duas vezes (conferir no Arkcode antes de atualizar). Posição do texto fixa depois do
trilho; `label-position` fica como opt-in futuro. Esforço P no elemento, M com os três wrappers e a story.

### 15. `@tooark/chart` sem wrapper no `@tooark/react` e sem as cores dos tokens

**Solicitado:** (a) um wrapper `ArkChart` em `@tooark/react`; (b) o gráfico pintado com os tokens `--ark-color-*`.

**Situação:** já avaliado, nos dois pontos; o pedido repete, com outras palavras, os itens 3a, 3b e 6, e nada do que
chegou agora muda o veredito. (a) O pacote não tem wrapper por decisão de arquitetura (item 3b: um wrapper em
`@tooark/react` arrastaria o ECharts como peer de todo consumidor), e o README do React documenta a receita da tag
crua com `useRef` e `option` por propriedade. O que empurra o app para `createElement` e para um `useRef<HTMLElement &
{ option }>` tipado à mão é a tipagem: o bloco `ark-chart` do `jsx-intrinsics.d.ts` tem `theme`, `renderer`, `height`,
`auto-resize` e `testid`, e não tem `option` nem `resolvedTheme` (item 3a). (b) É comportamento documentado: a seção
de configuração do README do chart diz que o gráfico pinta com o tema padrão do ECharts ou com o `dark` embutido, não
com os tokens. Confirmado no engine: a única leitura de ambiente é `resolveColorScheme` para escolher entre nenhum tema
e o `dark` do ECharts; nenhum `--ark-color-*` é lido. As séries saem na paleta padrão do ECharts (nove cores a partir
de `#5070dd`), textos e eixos nos neutros dele, e no escuro o tema embutido pinta um fundo opaco próprio.

**O que precisa fazer:** nada novo. Os detalhes que esta rodada levantou (como resolver `light-dark()` e `oklch` para
um canvas, fundo transparente, ordem dos intents) foram incorporados ao "O que precisa fazer" do item 6.

**Recomendação:** executar o 3a (tipagem, P) e o 6 (`palette="tokens"`, M); o 3b continua sendo decisão sua. O 3b
dizia "reabrir se mais de um app pedir": se este pedido vem de um segundo app, e não do Arkcode, essa condição está
satisfeita e a decisão volta para você, com o custo que o 3b já descreve (entry points separados com peers
opcionais). Enquanto o 6 não existe, o app pode passar `option.color`, `textStyle.color` e `backgroundColor` lidos
dos tokens com a mesma sonda que o item 6 descreve, normalizando `oklch` antes.

**Impacto:** o dos itens 3a e 6. Nenhuma linha nova de trabalho.

## Lacuna, resolver no app

### 2. Tema: `createThemeController`, script de início para CSP, `ArkThemeSwitch`

**Solicitado:** tirar das três telas a lógica de tema feita à mão.

**Situação:** o tema da lib é CSS puro: os tokens são `light-dark()` e os componentes seguem o `color-scheme` da
página; o README orienta o app a declarar `color-scheme` onde alterna o tema, e `@tooark/tokens` já expõe
`resolveColorScheme`/`observeColorScheme` para quem precisa do valor em JS.

**O que precisa fazer:** no app, um módulo único (chave de storage, atributo em `<html>`, escuta do sistema) e um
`<script src>` de início para o CSP; o switch de três estados sai de um `ark-toggle-group`.

**Recomendação:** não levar para a lib. Chave de storage, atributo e momento de aplicar são política do app; um
componente de switch teria de embutir essa política ou expor tantas opções que não pouparia nada.

**Impacto:** nenhum na lib. Rever se um segundo app pedir o mesmo controller.

### 4a. Visão de arquivo: `filename`, `highlightLines`, clique no número da linha, blame

**Solicitado:** atributos prontos no editor para a visão de arquivo do Arkcode.

**Situação:** já decidido em 2026-10-13: gramática por nome de arquivo, blame, destaque de linhas e permalink ficam no
app via `extensions` (release 1.6.0), que entra depois das extensões da lib sem recriar o editor. O clique no
número da linha sai por `EditorView.domEventHandlers` olhando o `.cm-gutterElement` alvo, sem duplicar a calha.
`filename` é chrome de cabeçalho do app (título + copiar), não do editor.

**Recomendação:** manter no app. Só `max-height` entra (item 4b).

**Impacto:** nenhum na lib.

### 10a. `ark-diff-viewer`

**Solicitado:** visualizador de diff.

**Situação:** `unifiedMergeView` de `@codemirror/merge` é uma `Extension` e entra pelo `extensions` do
`ark-code-editor`, com o original em `original`. O app instala `@codemirror/merge` na mesma versão do
`@codemirror/state` que já compartilha com o editor.

**Recomendação:** resolver no app, mesmo veredito do blame. Entraria na lib só se faltasse ponto de extensão.

**Impacto:** nenhum na lib. Um elemento próprio traria mais um peer para todo consumidor do `@tooark/code`.

## Recusado

### 7c. `ArkSwitch` helper

Recusado em 2026-09-29: o switch não tem rótulo visível (`label` vira `aria-label` do botão), então não há onde
ancorar um texto auxiliar. Texto de apoio fica ao lado, no app, ou o controle vira `ark-checkbox`, que tem `helper`.
Reavaliar quando o item 14 der ao switch um rótulo visível.

### 7d. `onValueChange`

Açúcar só do React (handler com o valor em vez do evento) fere a paridade entre frameworks, que é regra do projeto.
O wrapper entrega o evento e o valor está em `event.detail` ou `event.target.value`.

### 11a e 11b. `ArkChip` e `ArkStat` (adiar)

`ark-badge` cobre o chip estático (intent, variant, size, rounded, color). O chip interativo (removível, selecionável)
e o stat (número, rótulo, variação) são pequenos, mas não há consumidor pedindo hoje além da lista; entram quando um
app precisar, como opt-in (`removable` + `ark-remove` no badge, ou elementos novos).

## Decisão sua

### 1b. Herdar `lang` do `<html>` (e 1c, `setArkLocale()` global)

**Situação:** hoje cada componente lê só o próprio atributo `lang`. Herdar pelo ancestral mais próximo
(`closest("[lang]")`) é a semântica do HTML e eliminaria as 190 repetições, mas muda o padrão: uma página
`<html lang="pt-BR">` sem `lang` nos componentes passa de inglês para português. Isso contraria a regra de recurso
desligado por padrão.

**Alternativas:**

- 1b, herdar: comportamento mais correto e sem configuração; mudança visível para páginas `pt`/`es` que hoje
  recebem inglês sem reclamar.
- 1c, `setArkLocale("pt")` no core, no padrão dos serviços `toast()`/`announce()`: opt-in, uma chamada por app,
  padrão intacto; mais uma API global para documentar nos três frameworks.
- Fazer só o 1a agora e decidir 1b/1c depois.

**Recomendação:** 1b, se aceitar a mudança de padrão, com o atributo do componente sempre prevalecendo e o CHANGELOG
avisando; caso contrário 1c.

**Impacto:** 1b altera páginas existentes com `<html lang>` em `pt`/`es`; 1c não altera nada sem a chamada.

### 3b. Wrappers React, Vue e Angular para `ark-chart`, `ark-code-editor` e wysiwyg

**Situação:** reverte a decisão "pacotes laterais sem wrapper". Para não arrastar ECharts, CodeMirror e Tiptap como
peers de todo consumidor de `@tooark/react`, seriam entry points separados (`@tooark/react/code`,
`@tooark/react/chart`, e o equivalente em Vue e Angular) com peers opcionais; seis entry points, `check:publish` e
`check:ssr` cobrindo cada um.

**Recomendação:** não agora. O item 3a resolve a tipagem, e o que resta (eventos por prop) custa um `ref` por
elemento. Reabrir se mais de um app pedir.

**Impacto:** esforço M, três pacotes; sem mudança para quem usa as tags.

## Ordem sugerida

1. Mesclar `feat/data-view-pagination`, depois `feat/nav` (itens 8 e 11f).
2. Rodada de correções e itens P: 12 (card), 13 (campos esticados), 1a (`pt-BR`), 3a (tipagem JSX), 10b
   (`download`), 7e (`ark-navigate` no botão), 4b (`max-height`), 11e (`heading-level`), 11d (grupo do menu), 14
   (rótulo visível do switch).
3. Decidir 1b/1c (`lang`) e, com isso, 11c (`ark-time`).
4. Itens M: 5a (`--ark-syntax-*`), 6 (`palette="tokens"`).
5. Item G: 9 (`ark-tree`), com desenho de API antes.

O item 15 repete o 3a e o 6: se o gráfico for o que mais pesa no app, o 6 sobe da etapa 4 para o fim da etapa 2,
logo depois do 3a.
