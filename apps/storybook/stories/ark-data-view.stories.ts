import type {
  ArkDataViewCardRender,
  ArkDataViewColumn,
  ArkDataViewKey,
  ArkDataViewLayout,
  ArkDataViewMode,
  ArkDataViewQuery,
  ArkDataViewQueryChangeDetail,
  ArkDataViewReorderDetail,
  ArkDataViewRowClickDetail,
  ArkDataViewSelectionChangeDetail,
  ArkDataViewSort,
  ArkDataViewView,
  ArkSize,
  ArkTheme
} from "@tooark/core";
import { expect, userEvent, waitFor, within } from "storybook/test";

// Linha de documentação (sem controle) da tabela de argumentos: colunas, propriedades JS, eventos e slots.
function doc(category: string, description: string, type: string, defaultValue?: string) {
  return {
    control: false as const,
    description,
    table: {
      category,
      type: { summary: type },
      ...(defaultValue === undefined ? {} : { defaultValue: { summary: defaultValue } })
    }
  };
}

const SAMPLE = "Dados do exemplo";
const VIEW = "Apresentação";
const QUERY = "Consulta";
const FEATURES = "Recursos opcionais";
const CARDS = "Cards";
const SLOTS = "Slots";
const COLUMN = "Coluna (cada item de columns)";
const API = "Propriedades e métodos JS";
const EVENTS = "Eventos";

const meta = {
  title: "Core/ArkDataView",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: [
          "Coleção de registros em duas apresentações, tabela e cards. Recebe `rows` (os objetos do app, guardados por referência) e `columns` (qual campo aparece, onde e como) por propriedade JS.",
          "**Sem nenhum atributo** ele é uma tabela simples com o seletor de visualização no canto, que vira cards quando o próprio componente fica mais estreito que `breakpoint` (`no-view-selector` esconde o seletor e `view` continua valendo: `auto`, `table` ou `cards`). **Todo o resto é ligado por atributo**: `searchable` (busca), `page-size` (paginação), `selectable` (caixas de seleção e o slot `selection` para ações em massa), `reorderable` (alça de arrastar, setas e menu de mover) e `clickable` (`ark-row-click`).",
          'No `mode="client"` o componente busca, ordena e pagina `rows`; no `mode="server"` ele só publica a consulta em `ark-query-change` e o app devolve `rows`, `total` e `loading`.',
          "Cada célula mostra o texto do campo ou o que `render` da coluna devolver: um nó DOM (um `ark-avatar`, duas linhas de texto) ou um texto, nunca HTML. Nos wrappers o conteúdo é do framework: JSX no React, slot `#cell-<key>` no Vue, `ng-template[arkDataViewCell]` no Angular.",
          '```ts\nconst view = document.querySelector("ark-data-view");\nview.columns = [\n  { key: "name", label: "Nome", sortable: true, cardRole: "title" },\n  { key: "email", label: "E-mail" }\n];\nview.rows = users;\nview.addEventListener("ark-query-change", (event) => console.log(event.detail));\n```',
          "No **Playground** todos os atributos têm controle, os slots e o conteúdo das células ligam e desligam, e o painel abaixo do componente mostra os eventos emitidos. A tabela de argumentos também lista as opções de coluna, as propriedades JS, os eventos e os slots."
        ].join("\n\n")
      }
    }
  },
  argTypes: {
    records: {
      control: "inline-radio",
      options: [0, 3, 12, 60],
      description: "Quantidade de registros do exemplo (0 mostra o estado vazio)",
      table: { category: SAMPLE }
    },
    cells: {
      control: "inline-radio",
      options: ["texto", "componentes"],
      description:
        "Conteúdo das células do exemplo: o texto do campo, ou o `render` das colunas devolvendo nós (ark-avatar com duas linhas, ark-badge)",
      table: { category: SAMPLE }
    },

    view: {
      control: "inline-radio",
      options: ["auto", "table", "cards"],
      description:
        "Apresentação ao carregar. `auto` mostra cards quando o componente fica mais estreito que `breakpoint`; o seletor no canto reescreve o atributo",
      table: { category: VIEW, defaultValue: { summary: "auto" } }
    },
    noViewSelector: {
      control: "boolean",
      description:
        "Atributo `no-view-selector`: esconde o seletor de visualização do canto. `view` continua valendo (`auto`, `table` ou `cards`)",
      table: { category: VIEW, defaultValue: { summary: "false" } }
    },
    breakpoint: {
      control: "number",
      description:
        "Largura do PRÓPRIO componente, em px, abaixo da qual `auto` mostra cards (estreite a janela para ver)",
      table: { category: VIEW, defaultValue: { summary: "640" } }
    },
    label: {
      control: "text",
      description: "Nome acessível da tabela e da lista de cards",
      table: { category: VIEW }
    },
    size: {
      control: "inline-radio",
      options: ["xs", "sm", "md", "lg", "xl"],
      description: "Densidade: texto e padding das células, e o tamanho dos controles compostos",
      table: { category: VIEW, defaultValue: { summary: "md" } }
    },
    lang: {
      control: "inline-radio",
      options: ["en", "pt", "es"],
      description:
        "Idioma dos rótulos (busca, ordenação, seleção, reordenar, vazio, paginação); `custom` usa `locale-json`",
      table: { category: VIEW, defaultValue: { summary: "en" } }
    },
    theme: {
      control: "select",
      options: ["auto", "light", "dark"],
      description: "Força claro ou escuro no componente; sem ele herda o color-scheme da página",
      table: { category: VIEW }
    },
    testid: {
      control: "text",
      description:
        "Vira `data-testid` no host e, com sufixo, nas partes internas (`<testid>-row`, `<testid>-search`...)",
      table: { category: VIEW }
    },

    mode: {
      control: "inline-radio",
      options: ["client", "server"],
      description:
        "Quem busca, ordena e pagina: o componente (`client`) ou o app, a cada `ark-query-change` (`server`; neste exemplo um servidor simulado responde com atraso)",
      table: { category: QUERY, defaultValue: { summary: "client" } }
    },
    pageSize: {
      control: "number",
      description: "Atributo `page-size`: itens por página. 0 mostra todos e esconde a paginação",
      table: { category: QUERY, defaultValue: { summary: "0" } }
    },
    pageSizes: {
      control: "text",
      description:
        "Atributo `page-sizes`: opções do seletor de itens por página, separadas por vírgula; vazio esconde o seletor",
      table: { category: QUERY }
    },
    page: {
      control: "number",
      description: "Página atual, a partir de 1; um clique na paginação a reescreve",
      table: { category: QUERY, defaultValue: { summary: "1" } }
    },
    sort: {
      control: "text",
      description: "Ordenação atual: `chave:asc` ou `chave:desc` (ex.: `name:desc`); vazio é sem ordenação",
      table: { category: QUERY }
    },
    search: {
      control: "text",
      description: "Texto da busca (vale mesmo sem o campo de busca visível)",
      table: { category: QUERY }
    },
    total: doc(QUERY, 'Total de registros no servidor (`mode="server"`); sem ele vale o tamanho de `rows`', "number"),

    searchable: {
      control: "boolean",
      description: "Mostra o campo de busca",
      table: { category: FEATURES, defaultValue: { summary: "false" } }
    },
    searchPlaceholder: {
      control: "text",
      description: "Atributo `search-placeholder`: placeholder e rótulo acessível da busca",
      table: { category: FEATURES }
    },
    searchDebounce: {
      control: "number",
      description: "Atributo `search-debounce`: atraso em ms entre a última tecla e a consulta",
      table: { category: FEATURES, defaultValue: { summary: "300" } }
    },
    selectable: {
      control: "boolean",
      description: "Caixa de seleção por registro e a de selecionar tudo; a seleção fica em `selected`",
      table: { category: FEATURES, defaultValue: { summary: "false" } }
    },
    reorderable: {
      control: "boolean",
      description:
        "Alça por registro: arrasto com a linha de onde ele vai entrar, setas no teclado e menu de mover no clique. Desliga enquanto há ordenação ou busca",
      table: { category: FEATURES, defaultValue: { summary: "false" } }
    },
    clickable: {
      control: "boolean",
      description: "Linhas e cards focáveis, que emitem `ark-row-click` no clique, Enter ou Espaço",
      table: { category: FEATURES, defaultValue: { summary: "false" } }
    },
    loading: {
      control: "boolean",
      description: "Consulta em andamento: placeholders sem registros, ou os registros esmaecidos, com `aria-busy`",
      table: { category: FEATURES, defaultValue: { summary: "false" } }
    },

    cardColumns: {
      control: "inline-radio",
      options: [1, 2, 3, 4],
      description: "Atributo `card-columns`: colunas da grade de campos de cada card",
      table: { category: CARDS, defaultValue: { summary: "2" } }
    },
    cardBody: {
      control: "boolean",
      description:
        "Liga um `cardRender` de exemplo: a propriedade JS que desenha o corpo inteiro do card no lugar da grade de campos",
      table: { category: CARDS }
    },
    "--ark-data-view-card-min": doc(CARDS, "Custom property CSS: largura mínima de um card", "<length>", "16rem"),

    toolbarSlot: {
      control: "boolean",
      description: 'Põe um filho `slot="toolbar"`: ações do app ao lado da busca',
      table: { category: SLOTS }
    },
    selectionSlot: {
      control: "boolean",
      description:
        'Põe um filho `slot="selection"`: ações em massa do app, visíveis só enquanto há seleção (ligue `selectable`)',
      table: { category: SLOTS }
    },
    emptySlot: {
      control: "boolean",
      description: 'Põe um filho `slot="empty"`: estado vazio do app no lugar do próprio (ponha `records` em 0)',
      table: { category: SLOTS }
    },

    "column.key": doc(
      COLUMN,
      "Campo do registro; aceita caminho com ponto (`address.city`). Identifica a coluna em `sort`",
      "string"
    ),
    "column.label": doc(COLUMN, "Cabeçalho na tabela e rótulo do campo no card", "string"),
    "column.sortable": doc(
      COLUMN,
      "Cabeçalho clicável que ordena pelo campo (nos cards, entra no seletor de ordenação)",
      "boolean",
      "false"
    ),
    "column.searchable": doc(COLUMN, "O campo entra na busca do modo client", "boolean", "true"),
    "column.align": doc(
      COLUMN,
      "Alinhamento do cabeçalho e das células na tabela",
      '"left" | "center" | "right"',
      "left"
    ),
    "column.width": doc(COLUMN, "Largura da coluna na tabela (comprimento CSS)", "string"),
    "column.show": doc(COLUMN, "Em que apresentação o campo aparece", '"both" | "table" | "cards"', "both"),
    "column.cardRole": doc(
      COLUMN,
      "`title` leva o campo ao cabeçalho do card, sem rótulo",
      '"title" | "field"',
      "field"
    ),
    "column.cardSpan": doc(COLUMN, "Colunas da grade do card que o campo ocupa", "number", "1"),
    "column.cardLabel": doc(
      COLUMN,
      "`false` deixa o rótulo do campo no card só para o leitor de tela",
      "boolean",
      "true"
    ),
    "column.render": doc(
      COLUMN,
      "Conteúdo próprio da célula: devolve um nó DOM ou um texto. Recebe `{ row, column, value, index, view }`",
      "(context) => Node | string | number | null"
    ),
    "column.compare": doc(COLUMN, "Comparador próprio da ordenação no modo client", "(a, b) => number"),

    rows: doc(API, "Os registros (propriedade; o atributo aceita JSON). Atribuir substitui tudo", "object[]"),
    columns: doc(API, "As colunas (propriedade; o atributo aceita o JSON sem funções)", "ArkDataViewColumn[]"),
    "row-key": doc(API, "Atributo: campo que identifica cada registro (precisa ser único)", "string", "id"),
    selected: doc(API, "Chaves selecionadas; atribuir não emite evento", "(string | number)[]"),
    cardRender: doc(
      API,
      "Desenha o corpo de cada card. Recebe `{ row, index }`; `null` mantém a grade",
      "(context) => Node | string | null"
    ),
    query: doc(API, "Somente leitura: a consulta em uso", "{ page, pageSize, sort, search }"),
    resolvedView: doc(API, "Somente leitura: a apresentação em uso", '"table" | "cards"'),
    "clearSelection()": doc(API, "Limpa a seleção e emite `ark-selection-change`", "() => void"),

    "ark-query-change": doc(
      EVENTS,
      "Página, itens por página, ordenação ou busca mudaram por ação do usuário",
      "{ page, pageSize, sort, search, reason }"
    ),
    "ark-view-change": doc(EVENTS, "O usuário trocou a apresentação no seletor", "{ view }"),
    "ark-row-click": doc(EVENTS, "Clique, Enter ou Espaço numa linha ou card (com `clickable`)", "{ row, key, index }"),
    "ark-selection-change": doc(EVENTS, "A seleção mudou por ação do usuário", "{ selected, rows }"),
    "ark-reorder": doc(EVENTS, "Um registro foi movido; as posições são em `rows`", "{ key, from, to, rows }"),
    "ark-render": doc(EVENTS, "Depois de cada redesenho do conteúdo; não sobe (para integrações)", "-")
  },
  args: {
    records: 12,
    cells: "componentes",
    view: "auto",
    noViewSelector: false,
    breakpoint: 640,
    label: "Usuários",
    size: "md",
    lang: "pt",
    theme: "auto",
    testid: "",
    mode: "client",
    pageSize: 5,
    pageSizes: "5,10,25",
    page: 1,
    sort: "",
    search: "",
    searchable: true,
    searchPlaceholder: "",
    searchDebounce: 300,
    selectable: false,
    reorderable: false,
    clickable: false,
    loading: false,
    cardColumns: 2,
    cardBody: false,
    toolbarSlot: false,
    selectionSlot: false,
    emptySlot: false
  }
};

export default meta;

type StoryArgs = {
  records: number;
  cells: "texto" | "componentes";
  view: ArkDataViewView;
  noViewSelector?: boolean;
  mode: ArkDataViewMode;
  searchable: boolean;
  searchPlaceholder?: string;
  searchDebounce?: number;
  selectable: boolean;
  reorderable: boolean;
  clickable: boolean;
  loading: boolean;
  page?: number;
  pageSize: number;
  pageSizes: string;
  total?: number;
  sort?: string;
  search?: string;
  cardColumns: number;
  cardBody: boolean;
  toolbarSlot: boolean;
  selectionSlot: boolean;
  emptySlot: boolean;
  breakpoint: number;
  label?: string;
  size: ArkSize;
  lang: "en" | "pt" | "es";
  theme: ArkTheme;
  testid?: string;
  width?: string;
};

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  team: string;
  age: number;
  active: boolean;
};

type DataViewEl = HTMLElement & {
  rows: User[];
  columns: ArkDataViewColumn<User>[];
  selected: ArkDataViewKey[];
  cardRender: ArkDataViewCardRender<User> | null;
  view: ArkDataViewView;
  noViewSelector: boolean;
  resolvedView: ArkDataViewLayout;
  page: number;
  pageSize: number;
  total: number | null;
  sort: ArkDataViewSort | null;
  search: string;
  query: ArkDataViewQuery;
  loading: boolean;
  clearSelection: () => void;
};

const USERS: User[] = [
  { id: 1, name: "Ana Lima", email: "ana.lima@tooark.com", role: "Admin", team: "Plataforma", age: 34, active: true },
  { id: 2, name: "Bruno Reis", email: "bruno.reis@tooark.com", role: "Editor", team: "Produto", age: 28, active: true },
  {
    id: 3,
    name: "Carla Dias",
    email: "carla.dias@tooark.com",
    role: "Leitor",
    team: "Suporte",
    age: 41,
    active: false
  },
  {
    id: 4,
    name: "Diego Alves",
    email: "diego.alves@tooark.com",
    role: "Editor",
    team: "Produto",
    age: 9,
    active: true
  },
  { id: 5, name: "Elisa Nunes", email: "elisa.nunes@tooark.com", role: "Admin", team: "Dados", age: 37, active: true },
  {
    id: 6,
    name: "Fabio Costa",
    email: "fabio.costa@tooark.com",
    role: "Leitor",
    team: "Suporte",
    age: 52,
    active: false
  },
  { id: 7, name: "Gabi Rocha", email: "gabi.rocha@tooark.com", role: "Editor", team: "Dados", age: 25, active: true },
  {
    id: 8,
    name: "Hugo Melo",
    email: "hugo.melo@tooark.com",
    role: "Leitor",
    team: "Plataforma",
    age: 31,
    active: true
  },
  { id: 9, name: "Iara Pinto", email: "iara.pinto@tooark.com", role: "Admin", team: "Produto", age: 46, active: true },
  { id: 10, name: "João Sá", email: "joao.sa@tooark.com", role: "Editor", team: "Suporte", age: 22, active: false },
  { id: 11, name: "Karen Luz", email: "karen.luz@tooark.com", role: "Leitor", team: "Dados", age: 39, active: true },
  {
    id: 12,
    name: "Lucas Maia",
    email: "lucas.maia@tooark.com",
    role: "Editor",
    team: "Plataforma",
    age: 30,
    active: true
  }
];

const COLUMNS: ArkDataViewColumn<User>[] = [
  { key: "name", label: "Nome", sortable: true, cardRole: "title" },
  { key: "email", label: "E-mail", cardSpan: 2 },
  { key: "role", label: "Perfil", sortable: true },
  { key: "age", label: "Idade", sortable: true, align: "right" }
];

function createDataView(
  args: Partial<StoryArgs>,
  rows: User[] = USERS,
  columns: ArkDataViewColumn<User>[] = COLUMNS
): DataViewEl {
  const el = document.createElement("ark-data-view") as DataViewEl;
  if (args.view) el.setAttribute("view", args.view);
  if (args.noViewSelector) el.setAttribute("no-view-selector", "");
  if (args.mode) el.setAttribute("mode", args.mode);
  if (args.searchable) el.setAttribute("searchable", "");
  if (args.searchPlaceholder) el.setAttribute("search-placeholder", args.searchPlaceholder);
  if (args.searchDebounce !== undefined) el.setAttribute("search-debounce", String(args.searchDebounce));
  if (args.selectable) el.setAttribute("selectable", "");
  if (args.reorderable) el.setAttribute("reorderable", "");
  if (args.clickable) el.setAttribute("clickable", "");
  if (args.loading) el.setAttribute("loading", "");
  if (args.page) el.setAttribute("page", String(args.page));
  if (args.pageSize) el.setAttribute("page-size", String(args.pageSize));
  if (args.pageSizes) el.setAttribute("page-sizes", args.pageSizes);
  if (args.total !== undefined) el.setAttribute("total", String(args.total));
  if (args.sort) el.setAttribute("sort", args.sort);
  if (args.search) el.setAttribute("search", args.search);
  if (args.cardColumns) el.setAttribute("card-columns", String(args.cardColumns));
  if (args.breakpoint) el.setAttribute("breakpoint", String(args.breakpoint));
  if (args.label) el.setAttribute("label", args.label);
  if (args.size) el.setAttribute("size", args.size);
  if (args.lang) el.setAttribute("lang", args.lang);
  if (args.theme) el.setAttribute("theme", args.theme);
  if (args.testid) el.setAttribute("testid", args.testid);
  el.style.width = args.width ?? "56rem";
  el.style.maxWidth = args.width ? "" : "100%";
  el.columns = columns;
  el.rows = rows;
  return el;
}

/** Chaves dos registros na tela, na ordem (linhas da tabela ou cards). */
function shown(el: HTMLElement): string[] {
  return Array.from(el.querySelectorAll<HTMLElement>("[data-ark-row]")).map((row) => row.dataset.arkRow ?? "");
}

/** Uma parte interna pelo hook `data-ark`; sem nome, o próprio host. */
function part(el: HTMLElement, name: string): HTMLElement {
  return name ? (el.querySelector(`[data-ark="data-view-${name}"]`) as HTMLElement) : el;
}

/** Célula com ark-avatar e duas linhas de texto em tamanhos diferentes: o `render` de uma coluna devolve um nó. */
function userCell(user: User): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = "flex items-center gap-3";
  const avatar = document.createElement("ark-avatar");
  avatar.setAttribute("name", user.name);
  avatar.setAttribute("size", "sm");
  const text = document.createElement("div");
  text.className = "flex min-w-0 flex-col";
  const name = document.createElement("span");
  name.className = "text-sm font-semibold";
  name.textContent = user.name;
  const email = document.createElement("span");
  email.className = "truncate text-xs font-normal";
  email.style.color = "var(--ark-color-fg-muted)";
  email.textContent = user.email;
  text.append(name, email);
  wrap.append(avatar, text);
  return wrap;
}

function statusBadge(user: User): HTMLElement {
  const badge = document.createElement("ark-badge");
  badge.setAttribute("intent", user.active ? "success" : "neutral");
  badge.setAttribute("size", "sm");
  badge.textContent = user.active ? "Ativo" : "Inativo";
  return badge;
}

const RICH_COLUMNS: ArkDataViewColumn<User>[] = [
  { key: "name", label: "Usuário", sortable: true, cardRole: "title", render: ({ row }) => userCell(row) },
  { key: "role", label: "Perfil", sortable: true },
  { key: "team", label: "Time" },
  { key: "active", label: "Status", cardLabel: false, render: ({ row }) => statusBadge(row) },
  { key: "age", label: "Idade", sortable: true, align: "right", show: "table" }
];

/** Registros do exemplo: os doze de base, repetidos com outro id e nome quando o exemplo pede mais. */
function makeUsers(count: number): User[] {
  return Array.from({ length: count }, (_, index) => {
    const base = USERS[index % USERS.length];
    const round = Math.floor(index / USERS.length);
    if (round === 0) return base;
    return {
      ...base,
      id: index + 1,
      name: `${base.name} ${round + 1}`,
      email: base.email.replace("@", `${round + 1}@`)
    };
  });
}

function bulkActions(el: DataViewEl): HTMLElement {
  const actions = document.createElement("div");
  actions.setAttribute("slot", "selection");
  const deactivate = document.createElement("ark-button");
  deactivate.setAttribute("variant", "outline");
  deactivate.setAttribute("size", "sm");
  deactivate.textContent = "Desativar";
  deactivate.addEventListener("click", () => {
    const keys = el.selected;
    el.rows = el.rows.map((user) => (keys.includes(user.id) ? { ...user, active: false } : user));
  });
  const remove = document.createElement("ark-button");
  remove.setAttribute("intent", "danger");
  remove.setAttribute("size", "sm");
  remove.textContent = "Excluir";
  remove.addEventListener("click", () => {
    const keys = el.selected;
    el.rows = el.rows.filter((user) => !keys.includes(user.id));
  });
  actions.append(deactivate, remove);
  return actions;
}

function toolbarActions(): HTMLElement {
  const toolbar = document.createElement("div");
  toolbar.setAttribute("slot", "toolbar");
  const exportButton = document.createElement("ark-button");
  exportButton.setAttribute("variant", "outline");
  exportButton.textContent = "Exportar";
  const create = document.createElement("ark-button");
  create.textContent = "Novo usuário";
  toolbar.append(exportButton, create);
  return toolbar;
}

function emptyState(): HTMLElement {
  const empty = document.createElement("ark-empty");
  empty.setAttribute("slot", "empty");
  empty.setAttribute("heading", "Nenhum usuário por aqui");
  empty.setAttribute("description", 'Este é o estado vazio do app, num filho slot="empty".');
  const action = document.createElement("ark-button");
  action.setAttribute("slot", "action");
  action.textContent = "Novo usuário";
  empty.appendChild(action);
  return empty;
}

/** Corpo de card do exemplo: uma frase no lugar da grade de campos. */
const cardSentence: ArkDataViewCardRender<User> = ({ row }) => {
  const body = document.createElement("p");
  body.className = "text-sm";
  body.textContent = `${row.role} no time ${row.team}, ${row.age} anos.`;
  return body;
};

/** Painel que mostra os eventos emitidos pelo componente, do mais novo para o mais antigo. */
function eventLog(el: DataViewEl): HTMLElement {
  const panel = document.createElement("section");
  panel.className = "rounded-lg border p-3 text-xs";
  panel.style.borderColor = "var(--ark-color-border)";
  panel.style.color = "var(--ark-color-fg-muted)";
  const title = document.createElement("strong");
  title.textContent = "Eventos";
  const list = document.createElement("pre");
  list.className = "mt-2 max-h-40 overflow-auto whitespace-pre-wrap font-mono";
  list.textContent = "(interaja com o componente)";
  panel.append(title, list);

  const lines: string[] = [];
  const summarize: Record<string, (detail: Record<string, unknown>) => unknown> = {
    "ark-query-change": (detail) => detail,
    "ark-view-change": (detail) => detail,
    "ark-row-click": ({ key, index }) => ({ key, index, row: "(o objeto de rows)" }),
    "ark-selection-change": ({ selected }) => ({ selected }),
    "ark-reorder": ({ key, from, to }) => ({ key, from, to })
  };
  for (const [name, pick] of Object.entries(summarize)) {
    el.addEventListener(name, (event) => {
      lines.unshift(`${name} ${JSON.stringify(pick((event as CustomEvent<Record<string, unknown>>).detail))}`);
      list.textContent = lines.slice(0, 8).join("\n");
    });
  }
  return panel;
}

// "Servidor" do exemplo: cada `ark-query-change` vira uma requisição (um corte local com atraso) que devolve `rows`
// e `total`, com `loading` no intervalo.
function simulateServer(el: DataViewEl, data: User[]): void {
  el.addEventListener("ark-query-change", (event) => {
    const { page, pageSize, sort, search } = (event as CustomEvent<ArkDataViewQueryChangeDetail>).detail;
    el.loading = true;
    window.setTimeout(() => {
      let rows = data.filter((user) => user.name.toLowerCase().includes(search.toLowerCase()));
      if (sort) {
        const key = sort.key as keyof User;
        const direction = sort.direction === "desc" ? -1 : 1;
        rows = rows
          .slice()
          .sort((a, b) => direction * String(a[key]).localeCompare(String(b[key]), "pt", { numeric: true }));
      }
      el.total = rows.length;
      el.rows = pageSize > 0 ? rows.slice((page - 1) * pageSize, page * pageSize) : rows;
      el.loading = false;
    }, 400);
  });
}

function createPlayground(args: StoryArgs): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = "flex flex-col gap-4";
  const data = makeUsers(args.records);
  const server = args.mode === "server";
  const el = createDataView(
    { ...args, total: server ? data.length : undefined, width: "100%" },
    server && args.pageSize > 0 ? data.slice(0, args.pageSize) : data,
    args.cells === "componentes" ? RICH_COLUMNS : COLUMNS
  );
  if (args.cardBody) el.cardRender = cardSentence;
  if (args.toolbarSlot) el.appendChild(toolbarActions());
  if (args.selectionSlot) el.appendChild(bulkActions(el));
  if (args.emptySlot) el.appendChild(emptyState());
  if (server) simulateServer(el, data);
  wrap.append(el, eventLog(el));
  return wrap;
}

function story(description: string) {
  return { docs: { description: { story: description } } };
}

export const Playground = {
  parameters: story(
    "Todos os atributos têm controle. Ligue `selectable` com `selectionSlot`, `reorderable` (sem `sort` nem busca), `clickable`, troque `mode` para `server` e acompanhe os eventos no painel abaixo do componente. Estreite a janela para ver `auto` virar cards."
  ),
  render: (args: StoryArgs) => createPlayground(args)
};

export const Minimal = {
  parameters: story(
    "O padrão, sem nenhum atributo além dos dados: a tabela e o seletor de visualização. Busca, paginação, seleção, reordenação e clique só existem quando o atributo deles liga."
  ),
  render: () => createDataView({ lang: "pt", label: "Usuários" }, USERS.slice(0, 5))
};

export const NoViewSelector = {
  parameters: story(
    '`no-view-selector` esconde o seletor do canto e `view` continua decidindo a apresentação: aqui `view="table"` fixa a tabela mesmo com o componente estreito; com `auto` (o padrão) ele ainda viraria cards, e `cards` fixaria os cards.'
  ),
  render: () =>
    createDataView({ view: "table", noViewSelector: true, lang: "pt", label: "Usuários" }, USERS.slice(0, 5))
};

export const Cards = {
  parameters: story(
    '`view="cards"`: a coluna com `cardRole: "title"` vira o cabeçalho do card e as demais preenchem a grade de `card-columns`; colunas ordenáveis entram no seletor de ordenação.'
  ),
  render: () => createDataView({ view: "cards", searchable: true, pageSize: 6, lang: "pt", label: "Usuários" })
};

export const CardLayout = {
  parameters: story(
    'Distribuição dos campos no card: `card-columns="3"`, `cardSpan` (o e-mail ocupa as três colunas), `cardLabel: false` (o status sem rótulo visível) e `show` (a idade só na tabela, o time só nos cards).'
  ),
  render: () =>
    createDataView({ view: "cards", cardColumns: 3, lang: "pt", label: "Usuários" }, USERS.slice(0, 6), [
      { key: "name", label: "Nome", cardRole: "title" },
      { key: "email", label: "E-mail", cardSpan: 3 },
      { key: "role", label: "Perfil" },
      { key: "team", label: "Time", show: "cards" },
      { key: "active", label: "Status", cardLabel: false, render: ({ row }) => statusBadge(row) },
      { key: "age", label: "Idade", show: "table", align: "right" }
    ])
};

export const CardBody = {
  parameters: story("`cardRender` (propriedade JS) desenha o corpo inteiro do card no lugar da grade de campos."),
  render: () => {
    const el = createDataView({ view: "cards", lang: "pt", label: "Usuários" }, USERS.slice(0, 6), RICH_COLUMNS);
    el.cardRender = cardSentence;
    return el;
  }
};

export const CustomCells = {
  parameters: story(
    "O `render` da coluna devolve um nó: um ark-avatar ao lado do campo em duas linhas de tamanhos diferentes, e um ark-badge no status. O mesmo `render` vale na tabela e no card."
  ),
  render: () => createDataView({ searchable: true, pageSize: 5, lang: "pt", label: "Usuários" }, USERS, RICH_COLUMNS)
};

export const Sizes = {
  parameters: story("`size` de `xs` a `xl`: texto e padding das células, e o tamanho dos controles compostos."),
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "flex flex-col gap-8";
    for (const size of ["xs", "sm", "md", "lg", "xl"] as ArkSize[]) {
      wrap.appendChild(
        createDataView(
          { size, searchable: true, selectable: true, pageSize: 2, lang: "pt", label: `Tamanho ${size}` },
          USERS
        )
      );
    }
    return wrap;
  }
};

export const BulkActions = {
  parameters: story(
    "`selectable` com o slot `selection`: marcar registros mostra a barra de seleção e os botões do app, que leem `selected` e devolvem `rows` novo."
  ),
  render: () => {
    const el = createDataView({ selectable: true, pageSize: 5, lang: "pt", label: "Usuários" }, USERS, RICH_COLUMNS);
    el.appendChild(bulkActions(el));
    return el;
  }
};

export const Slots = {
  parameters: story(
    "Os três slots: `toolbar` (ações ao lado da busca), `selection` (ações em massa, só com seleção) e `empty` (estado vazio do app; busque por algo que não existe e ele NÃO aparece, porque busca sem resultado usa a mensagem própria; ele vale para a lista sem registros)."
  ),
  render: () => {
    const el = createDataView({ searchable: true, selectable: true, lang: "pt", label: "Usuários" }, USERS.slice(0, 4));
    el.append(toolbarActions(), bulkActions(el), emptyState());
    return el;
  }
};

export const Clickable = {
  parameters: story(
    "`clickable`: linhas focáveis que emitem `ark-row-click` no clique, Enter ou Espaço, com o próprio objeto de `rows` no detail. O clique na caixa de seleção ou num botão da linha não conta."
  ),
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "flex flex-col gap-4";
    const el = createDataView({ clickable: true, selectable: true, lang: "pt", label: "Usuários" }, USERS.slice(0, 4));
    wrap.append(el, eventLog(el));
    return wrap;
  }
};

export const Reorderable = {
  parameters: story(
    "`reorderable` na tabela: arraste pela alça (a linha na cor do tema mostra onde o registro vai entrar), use as setas com o foco na alça, ou clique nela para o menu de mover."
  ),
  render: () => createDataView({ reorderable: true, lang: "pt", label: "Usuários" }, USERS.slice(0, 6), RICH_COLUMNS)
};

export const ReorderableCards = {
  parameters: story(
    "`reorderable` nos cards: a linha de inserção aparece no vão entre os cards, em pé quando estão lado a lado e deitada quando estão empilhados numa coluna só."
  ),
  render: () =>
    createDataView({ view: "cards", reorderable: true, lang: "pt", label: "Usuários" }, USERS.slice(0, 6), RICH_COLUMNS)
};

export const Loading = {
  parameters: story("`loading` sem registros: placeholders na forma da apresentação em uso."),
  render: () => createDataView({ loading: true, pageSize: 5, lang: "pt" }, [])
};

export const Empty = {
  parameters: story("Sem registros: o estado vazio próprio (um ark-empty com a string do idioma)."),
  render: () => createDataView({ searchable: true, lang: "pt" }, [])
};

export const ServerSide = {
  parameters: story(
    '`mode="server"`: o componente só publica a consulta. Aqui um servidor simulado responde a cada `ark-query-change` com `rows` e `total`, e `loading` fica ligado no intervalo.'
  ),
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "flex flex-col gap-4";
    const el = createDataView(
      { mode: "server", searchable: true, pageSize: 5, pageSizes: "5,10", total: USERS.length, lang: "pt" },
      USERS.slice(0, 5)
    );
    simulateServer(el, USERS);
    wrap.append(el, eventLog(el));
    return wrap;
  }
};

// Busca sem acento nem caixa, ordenação em ciclo (texto e número), paginação e itens por página: tudo no
// componente, com um `ark-query-change` por mudança e a página voltando para a primeira.
export const ClientQuery = {
  render: () =>
    createDataView({
      view: "table",
      searchable: true,
      searchDebounce: 0,
      pageSize: 5,
      pageSizes: "5,10",
      lang: "pt",
      label: "Usuários"
    }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const el = canvasElement.querySelector("ark-data-view") as DataViewEl;
    const events: ArkDataViewQueryChangeDetail[] = [];
    const leaked: string[] = [];
    el.addEventListener("ark-query-change", (event) =>
      events.push((event as CustomEvent<ArkDataViewQueryChangeDetail>).detail)
    );
    for (const type of ["change", "input", "ark-page-change"]) el.addEventListener(type, () => leaked.push(type));

    await expect(getComputedStyle(el).display).toBe("grid");
    await expect(canvas.getByRole("table", { name: "Usuários" })).toBeVisible();
    await expect(shown(el)).toEqual(["1", "2", "3", "4", "5"]);
    await expect(part(el, "pagination").querySelector('[data-ark="pagination-summary"]')).toHaveTextContent(
      "1–5 de 12"
    );

    // Ordenação: crescente, decrescente, nenhuma; o foco fica no botão do cabeçalho.
    const nameHeader = () => canvas.getByRole("columnheader", { name: /Nome/ });
    await expect(nameHeader()).toHaveAttribute("aria-sort", "none");
    await expect(canvas.getByRole("columnheader", { name: "E-mail" })).not.toHaveAttribute("aria-sort");
    await userEvent.click(within(nameHeader()).getByRole("button"));
    await expect(el).toHaveAttribute("sort", "name:asc");
    await expect(nameHeader()).toHaveAttribute("aria-sort", "ascending");
    await expect(within(nameHeader()).getByRole("button")).toHaveFocus();
    await expect(events.at(-1)).toEqual({
      page: 1,
      pageSize: 5,
      sort: { key: "name", direction: "asc" },
      search: "",
      reason: "sort"
    });
    await userEvent.click(within(nameHeader()).getByRole("button"));
    await expect(nameHeader()).toHaveAttribute("aria-sort", "descending");
    await expect(shown(el)).toEqual(["12", "11", "10", "9", "8"]);
    await userEvent.click(within(nameHeader()).getByRole("button"));
    await expect(el).not.toHaveAttribute("sort");
    await expect(events.at(-1)?.sort).toBeNull();
    await expect(shown(el)).toEqual(["1", "2", "3", "4", "5"]);

    // Número ordena como número (9 antes de 22), não como texto.
    await userEvent.click(within(canvas.getByRole("columnheader", { name: /Idade/ })).getByRole("button"));
    await expect(shown(el)).toEqual(["4", "10", "7", "2", "12"]);

    // Paginação: a página 2 mostra os cinco seguintes e reescreve `page`.
    await userEvent.click(canvas.getByRole("button", { name: "Página 2" }));
    await expect(el).toHaveAttribute("page", "2");
    await expect(shown(el)).toEqual(["8", "1", "5", "11", "3"]);
    await expect(events.at(-1)).toMatchObject({ page: 2, reason: "page" });

    // Buscar volta para a primeira página e filtra sem depender de acento ou caixa.
    const search = canvas.getByRole("searchbox", { name: "Buscar" });
    await userEvent.type(search, "JOAO");
    await expect(el).toHaveAttribute("search", "JOAO");
    await expect(el).toHaveAttribute("page", "1");
    await expect(shown(el)).toEqual(["10"]);
    await expect(events.at(-1)).toMatchObject({ page: 1, search: "JOAO", reason: "search" });
    await expect(part(el, "pagination").querySelector('[data-ark="pagination-summary"]')).toHaveTextContent("1–1 de 1");

    // Sem resultado: o estado vazio de busca, e a paginação some.
    await userEvent.clear(search);
    await userEvent.type(search, "zzz");
    await expect(shown(el)).toEqual([]);
    await expect(part(el, "empty")).toHaveAttribute("heading", "Nenhum resultado");
    await expect(part(el, "footer")).not.toBeVisible();
    await userEvent.clear(search);
    await expect(el).not.toHaveAttribute("search");
    await expect(shown(el)).toHaveLength(5);

    // Um `search` gravado por fora chega ao campo; o `sort` também vale por propriedade.
    el.search = "produto";
    await expect(search).toHaveValue("produto");
    await expect(shown(el)).toEqual([]);
    el.search = "";
    el.sort = { key: "role", direction: "desc" };
    await expect(el).toHaveAttribute("sort", "role:desc");
    await expect(canvas.getByRole("columnheader", { name: /Perfil/ })).toHaveAttribute("aria-sort", "descending");
    el.sort = null;

    // Itens por página: o seletor da paginação composta vira um `ark-query-change`.
    const before = events.length;
    await userEvent.selectOptions(canvas.getByRole("combobox", { name: "Por página" }), "10");
    await expect(el).toHaveAttribute("page-size", "10");
    await expect(shown(el)).toHaveLength(10);
    await expect(events).toHaveLength(before + 1);
    await expect(events.at(-1)).toMatchObject({ page: 1, pageSize: 10, reason: "page-size" });
    await expect(el.query).toEqual({ page: 1, pageSize: 10, sort: null, search: "" });

    // Nada dos controles compostos vaza do host.
    await expect(leaked).toEqual([]);
  }
};

// `auto` segue a largura do PRÓPRIO componente; o seletor reescreve `view`; `no-view-selector` o esconde;
// `show` da coluna escolhe em que apresentação o campo aparece; nos cards a ordenação vai para um seletor.
export const ViewSwitch = {
  render: () =>
    createDataView({ view: "auto", lang: "pt", label: "Usuários", width: "56rem" }, USERS.slice(0, 4), [
      { key: "name", label: "Nome", sortable: true, cardRole: "title" },
      { key: "email", label: "E-mail", show: "table" },
      { key: "team", label: "Time", show: "cards", cardSpan: 2 },
      { key: "age", label: "Idade", sortable: true }
    ]),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const el = canvasElement.querySelector("ark-data-view") as DataViewEl;
    const views: string[] = [];
    el.addEventListener("ark-view-change", (event) => views.push((event as CustomEvent<{ view: string }>).detail.view));

    await expect(el.view).toBe("auto");
    await expect(el.resolvedView).toBe("table");
    await expect(el).toHaveAttribute("data-ark-view", "table");
    await expect(canvas.getAllByRole("columnheader").map((th) => th.textContent)).toEqual(["Nome", "E-mail", "Idade"]);
    await expect(part(el, "sort")).not.toBeVisible();

    // Estreito: cards, com a barra de ferramentas empilhada. Nenhum evento: ninguém escolheu.
    el.style.width = "24rem";
    await waitFor(() => expect(el.resolvedView).toBe("cards"));
    await expect(el).toHaveAttribute("data-ark-narrow");
    await expect(canvas.queryByRole("table")).toBeNull();
    const list = canvas.getByRole("list", { name: "Usuários" });
    await expect(within(list).getAllByRole("listitem")).toHaveLength(4);
    // O título vai para o cabeçalho do card, sem rótulo; os outros campos são termo e valor.
    const first = within(list).getAllByRole("listitem")[0];
    await expect(Array.from(first.querySelectorAll("dt")).map((dt) => dt.textContent)).toEqual(["Time", "Idade"]);
    await expect(first).toHaveTextContent("Ana Lima");
    await expect(first).not.toHaveTextContent("ana.lima@tooark.com");
    await expect(first.querySelector("dl")).toHaveClass("ark:grid-cols-2");
    await expect(first.querySelector("dl > div")).toHaveClass("ark:col-span-2");

    // Um pouco acima do breakpoint ainda é cards (folga contra oscilação); bem acima volta a tabela.
    el.style.width = "41rem";
    await new Promise((resolve) => setTimeout(resolve, 100));
    await expect(el.resolvedView).toBe("cards");
    el.style.width = "56rem";
    await waitFor(() => expect(el.resolvedView).toBe("table"));
    await expect(el).not.toHaveAttribute("data-ark-narrow");
    await expect(views).toEqual([]);

    // O seletor reescreve `view` e emite; clicar na visualização ativa não a solta.
    const cards = canvas.getByRole("button", { name: "Cards" });
    const table = canvas.getByRole("button", { name: "Tabela" });
    await expect(table).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(cards);
    await expect(el).toHaveAttribute("view", "cards");
    await expect(views).toEqual(["cards"]);
    await expect(cards).toHaveAttribute("aria-pressed", "true");
    await expect(table).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(cards);
    await expect(cards).toHaveAttribute("aria-pressed", "true");
    await expect(views).toEqual(["cards"]);

    // Cards não têm cabeçalho clicável: a ordenação é um seletor com as colunas ordenáveis nos dois sentidos.
    const sort = canvas.getByRole("combobox", { name: "Ordenar por" }) as HTMLSelectElement;
    await expect(Array.from(sort.options).map((option) => option.textContent)).toEqual([
      "Ordenar por",
      "Nome (crescente)",
      "Nome (decrescente)",
      "Idade (crescente)",
      "Idade (decrescente)"
    ]);
    await userEvent.selectOptions(sort, "age:desc");
    await expect(el).toHaveAttribute("sort", "age:desc");
    await expect(shown(el)).toEqual(["3", "1", "2", "4"]);
    await userEvent.selectOptions(sort, "");
    await expect(el).not.toHaveAttribute("sort");

    // `card-columns` troca a grade de campos.
    el.setAttribute("card-columns", "3");
    await expect(el.querySelector("dl")).toHaveClass("ark:grid-cols-3");

    // `no-view-selector` esconde o seletor e `view` continua valendo: fixa cards, fixa tabela, e o `auto` segue a
    // largura do componente como antes.
    el.noViewSelector = true;
    await expect(el).toHaveAttribute("no-view-selector");
    await expect(part(el, "views")).not.toBeVisible();
    await expect(el.resolvedView).toBe("cards");
    el.view = "table";
    await expect(canvas.getByRole("table")).toBeVisible();
    el.view = "auto";
    await expect(el.resolvedView).toBe("table");
    el.style.width = "24rem";
    await waitFor(() => expect(el.resolvedView).toBe("cards"));
    await expect(part(el, "views")).not.toBeVisible();
    el.noViewSelector = false;
    await expect(part(el, "views")).toBeVisible();
  }
};

// `clickable`: linha e card focáveis; clique, Enter e Espaço emitem `ark-row-click` com o MESMO objeto de `rows`;
// um controle dentro da linha fica com o próprio comportamento.
export const RowClick = {
  render: () =>
    createDataView({ view: "table", clickable: true, selectable: true, lang: "pt" }, USERS.slice(0, 3), [
      { key: "name", label: "Nome" },
      {
        key: "id",
        label: "Ações",
        render: ({ row }) => {
          const button = document.createElement("button");
          button.type = "button";
          button.textContent = `Editar ${row.name}`;
          return button;
        }
      }
    ]),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const el = canvasElement.querySelector("ark-data-view") as DataViewEl;
    const clicks: Array<ArkDataViewRowClickDetail<User>> = [];
    el.addEventListener("ark-row-click", (event) =>
      clicks.push((event as CustomEvent<ArkDataViewRowClickDetail<User>>).detail)
    );
    const rows = () => Array.from(el.querySelectorAll<HTMLElement>("tr[data-ark-row]"));

    await expect(rows()[0]).toHaveAttribute("tabindex", "0");
    await userEvent.click(canvas.getByText("Bruno Reis"));
    await expect(clicks).toHaveLength(1);
    await expect({ key: clicks[0].key, index: clicks[0].index }).toEqual({ key: 2, index: 1 });
    await expect(clicks[0].row === el.rows[1]).toBe(true);

    // Botão do app e a caixa de seleção dentro da linha não abrem a linha.
    await userEvent.click(canvas.getByRole("button", { name: "Editar Ana Lima" }));
    await userEvent.click(canvas.getByRole("checkbox", { name: "Selecionar Ana Lima" }));
    await expect(clicks).toHaveLength(1);
    await expect(el.selected).toEqual([1]);

    // Teclado: Enter e Espaço com o foco na própria linha.
    rows()[2].focus();
    await userEvent.keyboard("{Enter}");
    await expect(clicks.at(-1)?.key).toBe(3);
    await userEvent.keyboard(" ");
    await expect(clicks).toHaveLength(3);
    // Enter num controle dentro da linha é do controle.
    canvas.getByRole("button", { name: "Editar Carla Dias" }).focus();
    await userEvent.keyboard("{Enter}");
    await expect(clicks).toHaveLength(3);

    // Cards: o card é o alvo.
    el.view = "cards";
    const card = el.querySelector<HTMLElement>("li[data-ark-row]") as HTMLElement;
    await expect(card).toHaveAttribute("tabindex", "0");
    await userEvent.click(within(card).getByText("Ana Lima"));
    await expect(clicks.at(-1)?.key).toBe(1);

    // Sem `clickable`, nada é focável nem emite.
    el.removeAttribute("clickable");
    await expect(el.querySelector("li[data-ark-row]")).not.toHaveAttribute("tabindex");
    await userEvent.click(canvas.getAllByText("Ana Lima")[0]);
    await expect(clicks).toHaveLength(4);
  }
};

// `selectable`: caixa por registro, selecionar tudo (com estado misto), barra de seleção com a contagem e o slot
// `selection` do app visível só enquanto há seleção. A seleção atravessa as páginas e sai com o registro excluído.
export const Selection = {
  render: () => {
    const el = createDataView({ view: "table", selectable: true, pageSize: 5, lang: "pt" });
    el.appendChild(bulkActions(el));
    return el;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const el = canvasElement.querySelector("ark-data-view") as DataViewEl;
    const events: Array<ArkDataViewSelectionChangeDetail<User>> = [];
    let leaked = 0;
    el.addEventListener("ark-selection-change", (event) =>
      events.push((event as CustomEvent<ArkDataViewSelectionChangeDetail<User>>).detail)
    );
    el.addEventListener("change", () => leaked++);
    const all = () => canvas.getByRole("checkbox", { name: "Selecionar tudo" });
    const actions = el.querySelector('[slot="selection"]') as HTMLElement;

    await expect(part(el, "selection")).not.toBeVisible();
    await expect(actions).not.toBeVisible();
    await expect(actions).toHaveAttribute("data-ark", "data-view-actions");

    await userEvent.click(canvas.getByRole("checkbox", { name: "Selecionar Bruno Reis" }));
    await expect(events.at(-1)?.selected).toEqual([2]);
    await expect(events.at(-1)?.rows.map((user) => user.name)).toEqual(["Bruno Reis"]);
    await expect(el.querySelector('tr[data-ark-row="2"]')).toHaveAttribute("data-ark-selected");
    await expect(canvas.getByRole("checkbox", { name: "Selecionar Bruno Reis" })).toHaveFocus();
    await expect(all()).toHaveAttribute("aria-checked", "mixed");
    await expect(part(el, "selection-count")).toHaveTextContent("1 selecionado(s)");
    await expect(actions).toBeVisible();

    // Selecionar tudo marca o que falta na página; de novo, desmarca a página.
    await userEvent.click(all());
    await expect(el.selected).toEqual([2, 1, 3, 4, 5]);
    await expect(all()).toHaveAttribute("aria-checked", "true");
    await expect(part(el, "selection-count")).toHaveTextContent("5 selecionado(s)");

    // Outra página: a seleção continua, e a caixa do cabeçalho fala só do que está à vista.
    await userEvent.click(canvas.getByRole("button", { name: "Página 2" }));
    await expect(all()).toHaveAttribute("aria-checked", "false");
    await expect(part(el, "selection-count")).toHaveTextContent("5 selecionado(s)");
    await userEvent.click(canvas.getByRole("checkbox", { name: "Selecionar Gabi Rocha" }));
    await expect(el.selected).toEqual([2, 1, 3, 4, 5, 7]);

    // Ação em massa do app: exclui os selecionados; a seleção dos que saíram de `rows` é descartada.
    await userEvent.click(within(actions).getByText("Excluir"));
    await expect(el.rows.map((user) => user.id)).toEqual([6, 8, 9, 10, 11, 12]);
    await expect(el.selected).toEqual([]);
    await expect(actions).not.toBeVisible();
    await expect(part(el, "selection")).not.toBeVisible();

    // Gravar `selected` por fora marca sem emitir; limpar emite.
    const before = events.length;
    el.page = 1;
    el.selected = [8, 9];
    await expect(events).toHaveLength(before);
    await expect(canvas.getByRole("checkbox", { name: "Selecionar Hugo Melo" })).toHaveAttribute(
      "aria-checked",
      "true"
    );
    await userEvent.click(canvas.getByRole("button", { name: "Limpar seleção" }));
    await expect(events.at(-1)).toEqual({ selected: [], rows: [] });
    await expect(el.selected).toEqual([]);

    // Cards: sem cabeçalho, a barra fica à vista com a caixa de selecionar tudo rotulada.
    el.view = "cards";
    await expect(part(el, "selection")).toBeVisible();
    await userEvent.click(canvas.getByRole("checkbox", { name: "Selecionar tudo" }));
    await expect(el.selected).toEqual([6, 8, 9, 10, 11]);
    await expect(canvas.getByRole("checkbox", { name: "5 selecionado(s)" })).toHaveAttribute("aria-checked", "true");
    await expect(el.querySelector('li[data-ark-row="6"]')).toHaveAttribute("data-ark-selected");

    await expect(leaked).toBe(0);
  }
};

function pointer(type: string, target: Element, x: number, y: number): void {
  target.dispatchEvent(
    new PointerEvent(type, { pointerId: 1, isPrimary: true, clientX: x, clientY: y, button: 0, bubbles: true })
  );
}

// `reorderable`: a alça move por arrasto (com a marca de onde o registro vai entrar) e por setas no teclado, que
// devolvem o foco a ela; `ark-reorder` leva as posições em `rows` e a lista nova. Ordenação e busca desligam a alça.
export const Reorder = {
  render: () => createDataView({ view: "table", reorderable: true, lang: "pt" }, USERS.slice(0, 4)),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const el = canvasElement.querySelector("ark-data-view") as DataViewEl;
    const events: Array<ArkDataViewReorderDetail<User>> = [];
    el.addEventListener("ark-reorder", (event) =>
      events.push((event as CustomEvent<ArkDataViewReorderDetail<User>>).detail)
    );
    const handle = (name: string) => canvas.getByRole("button", { name: `Reordenar ${name}` });

    // Teclado: seta para baixo desce uma posição e o foco acompanha o registro.
    handle("Ana Lima").focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(shown(el)).toEqual(["2", "1", "3", "4"]);
    await expect(events.at(-1)).toMatchObject({ key: 1, from: 0, to: 1 });
    await expect(events.at(-1)?.rows.map((user) => user.id)).toEqual([2, 1, 3, 4]);
    await expect(el.rows.map((user) => user.id)).toEqual([2, 1, 3, 4]);
    await expect(handle("Ana Lima")).toHaveFocus();
    await userEvent.keyboard("{ArrowUp}{ArrowUp}");
    // A segunda seta já está no topo: não move nem emite.
    await expect(shown(el)).toEqual(["1", "2", "3", "4"]);
    await expect(events).toHaveLength(2);
    // Na tabela as setas horizontais não movem.
    await userEvent.keyboard("{ArrowRight}");
    await expect(events).toHaveLength(2);

    // Arrasto: da primeira linha até o meio da terceira; a marca fica depois do alvo.
    const rowRect = (id: string) =>
      (el.querySelector(`tr[data-ark-row="${id}"]`) as HTMLElement).getBoundingClientRect();
    const grip = handle("Ana Lima");
    const start = grip.getBoundingClientRect();
    const x = start.left + start.width / 2;
    pointer("pointerdown", grip, x, start.top + start.height / 2);
    await expect(el).not.toHaveAttribute("data-ark-dragging");
    const targetY = rowRect("3").top + rowRect("3").height / 2;
    pointer("pointermove", grip, x, targetY);
    await expect(el).toHaveAttribute("data-ark-dragging");
    await expect(el.querySelector('tr[data-ark-row="1"]')).toHaveAttribute("data-ark-drag-source");
    await expect(el.querySelector('tr[data-ark-row="3"]')).toHaveAttribute("data-ark-drop", "after");
    pointer("pointerup", grip, x, targetY);
    await expect(el).not.toHaveAttribute("data-ark-dragging");
    await expect(shown(el)).toEqual(["2", "3", "1", "4"]);
    await expect(events.at(-1)).toMatchObject({ key: 1, from: 0, to: 2 });

    // Esc cancela o arrasto: nada move.
    const again = handle("Diego Alves");
    const from = again.getBoundingClientRect();
    pointer("pointerdown", again, from.left + 4, from.top + 4);
    pointer("pointermove", again, from.left + 4, rowRect("2").top + 2);
    await expect(el.querySelector('tr[data-ark-row="2"]')).toHaveAttribute("data-ark-drop", "before");
    again.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    await expect(el).not.toHaveAttribute("data-ark-dragging");
    pointer("pointerup", again, from.left + 4, rowRect("2").top + 2);
    await expect(events).toHaveLength(3);

    // Um toque sem arrastar também não move.
    pointer("pointerdown", again, from.left + 4, from.top + 4);
    pointer("pointerup", again, from.left + 4, from.top + 4);
    await expect(events).toHaveLength(3);

    // Um toque na alça abre o menu de mover: a alternativa sem arrastar, e o caminho até o início ou o fim da lista.
    let leaked = 0;
    for (const type of ["ark-select", "ark-open", "ark-close"]) el.addEventListener(type, () => leaked++);
    await expect(handle("Ana Lima")).toHaveAttribute("aria-haspopup", "menu");
    await userEvent.click(handle("Ana Lima"));
    const menu = part(el, "menu");
    await waitFor(() => expect(menu.matches(":popover-open")).toBe(true));
    await expect(handle("Ana Lima")).toHaveAttribute("aria-expanded", "true");
    await expect(menu).toHaveAccessibleName("Reordenar Ana Lima");
    const option = (name: string) => within(menu).getByRole("menuitem", { name });
    await expect(option("Mover para o fim")).not.toHaveAttribute("disabled");
    await userEvent.click(option("Mover para o início"));
    await expect(shown(el)).toEqual(["1", "2", "3", "4"]);
    await expect(events.at(-1)).toMatchObject({ key: 1, from: 2, to: 0 });
    await expect(menu.matches(":popover-open")).toBe(false);
    await waitFor(() => expect(handle("Ana Lima")).toHaveFocus());

    // No topo, subir e ir ao início ficam desligados; Esc fecha sem mover e devolve o foco à alça.
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(menu.matches(":popover-open")).toBe(true));
    await expect(option("Mover para cima")).toHaveAttribute("disabled");
    await expect(option("Mover para o início")).toHaveAttribute("disabled");
    await expect(option("Mover para baixo")).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(handle("Ana Lima")).toHaveFocus());
    await expect(handle("Ana Lima")).toHaveAttribute("aria-expanded", "false");
    await expect(events).toHaveLength(4);
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(menu.matches(":popover-open")).toBe(true));
    await userEvent.click(option("Mover para baixo"));
    await expect(shown(el)).toEqual(["2", "1", "3", "4"]);
    // Os eventos do ark-menu composto não saem do host.
    await expect(leaked).toBe(0);

    // Lista ordenada não tem ordem manual: as alças desligam e voltam sem a ordenação.
    el.sort = "name:asc";
    await expect(handle("Ana Lima")).toBeDisabled();
    el.sort = null;
    await expect(handle("Ana Lima")).toBeEnabled();

    // Cards: as setas horizontais também movem.
    el.view = "cards";
    handle("Bruno Reis").focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(shown(el)).toEqual(["1", "2", "3", "4"]);
    await expect(handle("Bruno Reis")).toHaveFocus();

    // Arrasto nos cards: a linha de inserção é um ::after na cor primary, em pé na borda do card alvo quando os
    // cards estão lado a lado.
    const card = (id: string) => el.querySelector(`li[data-ark-row="${id}"]`) as HTMLElement;
    const center = (node: HTMLElement) => {
      const box = node.getBoundingClientRect();
      return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
    };
    let grab = handle("Ana Lima");
    let origin = center(grab);
    let goal = center(card("3"));
    pointer("pointerdown", grab, origin.x, origin.y);
    pointer("pointermove", grab, goal.x, goal.y);
    await expect(card("3")).toHaveAttribute("data-ark-drop", "after");
    await expect(card("1")).toHaveAttribute("data-ark-drag-source");
    await expect(el).not.toHaveAttribute("data-ark-drop-stacked");
    let line = getComputedStyle(card("3"), "::after");
    await expect({ content: line.content, width: line.width }).toEqual({ content: '""', width: "3px" });
    await expect(line.backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
    await expect(Number.parseFloat(line.height)).toBeGreaterThan(40);
    await expect(getComputedStyle(card("2"), "::after").content).toBe("none");
    pointer("pointerup", grab, goal.x, goal.y);
    await expect(shown(el)).toEqual(["2", "3", "1", "4"]);

    // Empilhados numa coluna só, a linha deita no vão entre os cards.
    el.style.width = "20rem";
    await waitFor(() => expect(el).toHaveAttribute("data-ark-narrow"));
    grab = handle("Diego Alves");
    origin = center(grab);
    goal = center(card("2"));
    pointer("pointerdown", grab, origin.x, origin.y);
    pointer("pointermove", grab, goal.x, goal.y);
    await expect(el).toHaveAttribute("data-ark-drop-stacked");
    await expect(card("2")).toHaveAttribute("data-ark-drop", "before");
    line = getComputedStyle(card("2"), "::after");
    await expect(line.height).toBe("3px");
    await expect(Number.parseFloat(line.width)).toBeGreaterThan(100);
    grab.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    await expect(el).not.toHaveAttribute("data-ark-drop-stacked");
    await expect(card("2")).not.toHaveAttribute("data-ark-drop");
    pointer("pointerup", grab, goal.x, goal.y);
    await expect(shown(el)).toEqual(["2", "3", "1", "4"]);
  }
};

// Numa lista mais alta que a área de rolagem, arrastar até a borda rola a lista sob o ponteiro e o alvo acompanha;
// soltar encerra a rolagem.
export const ReorderAutoScroll = {
  render: () => {
    const box = document.createElement("div");
    box.setAttribute("data-rolagem", "");
    box.style.height = "14rem";
    box.style.overflowY = "auto";
    box.appendChild(createDataView({ view: "table", reorderable: true, lang: "pt" }));
    return box;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const box = canvasElement.querySelector("[data-rolagem]") as HTMLElement;
    const el = canvasElement.querySelector("ark-data-view") as DataViewEl;
    const events: Array<ArkDataViewReorderDetail<User>> = [];
    el.addEventListener("ark-reorder", (event) =>
      events.push((event as CustomEvent<ArkDataViewReorderDetail<User>>).detail)
    );

    await expect(box.scrollHeight).toBeGreaterThan(box.clientHeight);
    const grip = canvas.getByRole("button", { name: "Reordenar Ana Lima" });
    const start = grip.getBoundingClientRect();
    const x = start.left + start.width / 2;
    const edge = box.getBoundingClientRect().bottom - 8;
    pointer("pointerdown", grip, x, start.top + start.height / 2);
    pointer("pointermove", grip, x, edge);
    await waitFor(() => expect(box.scrollTop).toBeGreaterThan(100));
    // O alvo acompanha a rolagem: já não é uma das primeiras linhas.
    const marked = el.querySelector<HTMLElement>("tr[data-ark-drop]");
    await expect(Number(marked?.dataset.arkRow)).toBeGreaterThan(4);
    pointer("pointerup", grip, x, edge);
    await expect(events).toHaveLength(1);
    await expect(events[0].to).toBeGreaterThan(3);

    const top = box.scrollTop;
    await new Promise((resolve) => setTimeout(resolve, 80));
    await expect(box.scrollTop).toBe(top);
  }
};

// Um slot que o app só acrescenta depois (renderização condicional de um framework) entra atrás dos nós do
// componente: eles voltam para o fim do host, para a ordem de tabulação seguir a visual, sem perder o foco.
export const LateSlot = {
  render: () => createDataView({ view: "table", selectable: true, lang: "pt" }, USERS.slice(0, 3)),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const el = canvasElement.querySelector("ark-data-view") as DataViewEl;
    const box = () => canvas.getByRole("checkbox", { name: "Selecionar Ana Lima" });

    await userEvent.click(box());
    await expect(box()).toHaveFocus();
    const actions = document.createElement("div");
    actions.setAttribute("slot", "selection");
    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "Excluir";
    actions.appendChild(remove);
    el.appendChild(actions);

    // O MutationObserver reage num microtask.
    await waitFor(() => expect(actions).toHaveAttribute("data-ark", "data-view-actions"));
    await expect(actions).toBeVisible();
    const following = actions.compareDocumentPosition(part(el, "content")) & Node.DOCUMENT_POSITION_FOLLOWING;
    await expect(following).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    await expect(el.lastElementChild).toHaveAttribute("data-ark-chrome");
    // O nó do usuário não foi movido: continua filho direto do host, e a caixa marcada segue com o foco.
    await expect(actions.parentElement).toBe(el);
    await expect(box()).toHaveFocus();
    await expect(box()).toHaveAttribute("aria-checked", "true");
    // A ordem de tabulação passa pela ação antes de chegar à tabela.
    remove.focus();
    await userEvent.tab();
    await expect(canvas.getByRole("checkbox", { name: "Selecionar tudo" })).toHaveFocus();
  }
};

// Modo servidor: o componente mostra `rows` como chegou (sem ordenar, filtrar ou cortar), conta as páginas por
// `total` e publica a consulta; `loading` marca o conteúdo ocupado e desliga a paginação.
export const ServerQuery = {
  render: () =>
    createDataView(
      { view: "table", mode: "server", searchable: true, searchDebounce: 0, pageSize: 5, total: 42, lang: "pt" },
      USERS.slice(0, 5)
    ),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const el = canvasElement.querySelector("ark-data-view") as DataViewEl;
    const events: ArkDataViewQueryChangeDetail[] = [];
    el.addEventListener("ark-query-change", (event) =>
      events.push((event as CustomEvent<ArkDataViewQueryChangeDetail>).detail)
    );
    const summary = () => part(el, "pagination").querySelector('[data-ark="pagination-summary"]');

    await expect(summary()).toHaveTextContent("1–5 de 42");
    await expect(canvas.getByRole("button", { name: "Página 9" })).toBeVisible();

    // Ordenar e buscar só publicam: as linhas ficam como o app entregou.
    await userEvent.click(within(canvas.getByRole("columnheader", { name: /Nome/ })).getByRole("button"));
    await userEvent.click(within(canvas.getByRole("columnheader", { name: /Nome/ })).getByRole("button"));
    await expect(events.at(-1)).toMatchObject({ sort: { key: "name", direction: "desc" }, reason: "sort" });
    await expect(shown(el)).toEqual(["1", "2", "3", "4", "5"]);
    await userEvent.type(canvas.getByRole("searchbox"), "zz");
    await expect(events.at(-1)).toMatchObject({ search: "zz", reason: "search", page: 1 });
    await expect(shown(el)).toHaveLength(5);

    await userEvent.click(canvas.getByRole("button", { name: "Página 3" }));
    await expect(events.at(-1)).toMatchObject({ page: 3, pageSize: 5, search: "zz" });
    await expect(el).toHaveAttribute("page", "3");
    await expect(summary()).toHaveTextContent("11–15 de 42");

    // O app responde: registros novos e total novo; a página pedida além do total é limitada na exibição.
    el.loading = true;
    await expect(part(el, "content")).toHaveAttribute("aria-busy", "true");
    await expect(canvas.getByRole("button", { name: "Página 1" })).toBeDisabled();
    await expect(shown(el)).toHaveLength(5);
    el.rows = USERS.slice(5, 8);
    el.total = 8;
    el.loading = false;
    await expect(part(el, "content")).not.toHaveAttribute("aria-busy");
    await expect(shown(el)).toEqual(["6", "7", "8"]);
    await expect(el.query.page).toBe(2);
    await expect(summary()).toHaveTextContent("6–8 de 8");

    // Carregando sem nenhum registro: placeholders no lugar das linhas.
    el.rows = [];
    el.loading = true;
    await expect(el.querySelectorAll("ark-skeleton").length).toBeGreaterThan(0);
    await expect(part(el, "empty")).toBeNull();
    el.loading = false;
    await expect(part(el, "empty")).toHaveAttribute("heading", "Nenhum resultado");
  }
};

// `render` da coluna devolve um nó (ark-avatar + duas linhas) ou um texto, e sabe em que apresentação está;
// texto nunca vira HTML. `cardRender` desenha o corpo inteiro do card.
export const CustomRender = {
  render: () =>
    createDataView({ view: "table", lang: "pt" }, USERS.slice(0, 2), [
      { key: "name", label: "Usuário", cardRole: "title", render: ({ row }) => userCell(row) },
      { key: "age", label: "Idade", render: ({ value, view }) => `${value} anos (${view})` },
      { key: "role", label: "Perfil", render: () => "<b>negrito</b>" },
      { key: "team", label: "Time", render: () => null },
      { key: "address.city", label: "Cidade" }
    ]),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const el = canvasElement.querySelector("ark-data-view") as DataViewEl;
    const cells = () => Array.from(el.querySelectorAll<HTMLElement>('[data-ark-row="1"] [data-ark="data-view-cell"]'));

    await expect(cells()[0].querySelector("ark-avatar")).toHaveAttribute("name", "Ana Lima");
    await expect(cells()[0]).toHaveTextContent("Ana Limaana.lima@tooark.com");
    await expect(cells()[1]).toHaveTextContent("34 anos (table)");
    // O texto do render entra como texto: nenhuma tag é criada.
    await expect(cells()[2].textContent).toBe("<b>negrito</b>");
    await expect(cells()[2].querySelector("b")).toBeNull();
    // null mantém o valor do campo.
    await expect(cells()[3]).toHaveTextContent("Plataforma");

    // Chave com ponto lê o caminho dentro do registro.
    el.rows = [{ ...USERS[0], address: { city: "Recife" } } as unknown as User];
    await expect(cells()[4]).toHaveTextContent("Recife");

    // `ark-render` sai a cada redesenho do conteúdo e não sobe (é o gancho das integrações de framework).
    let renders = 0;
    let bubbled = 0;
    el.addEventListener("ark-render", () => renders++);
    canvasElement.addEventListener("ark-render", () => bubbled++);
    el.view = "cards";
    await expect({ renders, bubbled }).toEqual({ renders: 1, bubbled: 0 });
    await expect(cells()[0].querySelector("ark-avatar")).not.toBeNull();
    await expect(cells()[1]).toHaveTextContent("34 anos (cards)");

    // cardRender: o corpo do card é do app; o cabeçalho (título) continua.
    el.cardRender = ({ row, index }) => {
      const body = document.createElement("p");
      body.textContent = `${index}: ${row.team}`;
      return body;
    };
    await expect(el.querySelector('[data-ark="data-view-card-body"] p')).toHaveTextContent("0: Plataforma");
    await expect(el.querySelector("dl")).toBeNull();
    await expect(el.querySelector('[data-ark="data-view-card"] ark-avatar')).not.toBeNull();
    el.cardRender = null;
    await expect(el.querySelector("dl")).not.toBeNull();
  }
};

// Sem registros: o ark-empty próprio ("Nenhuma entrada", ou "Nenhum resultado" numa busca); um filho
// `slot="empty"` do app toma o lugar dele e só aparece nesse estado.
export const EmptyStates = {
  render: () => {
    const el = createDataView({ view: "table", searchable: true, searchDebounce: 0, lang: "pt" }, []);
    const custom = document.createElement("p");
    custom.setAttribute("slot", "empty");
    custom.textContent = "Nenhum usuário cadastrado ainda.";
    el.appendChild(custom);
    return el;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const el = canvasElement.querySelector("ark-data-view") as DataViewEl;
    const custom = el.querySelector('[slot="empty"]') as HTMLElement;

    // Com o slot do app, o conteúdo próprio sai de cena.
    await expect(el).toHaveAttribute("data-ark-empty");
    await expect(part(el, "content")).not.toBeVisible();
    await expect(custom).toBeVisible();
    await expect(custom).toHaveAttribute("data-ark", "data-view-empty");

    // Com registros, o slot some e a tabela volta.
    el.rows = USERS.slice(0, 2);
    await expect(el).not.toHaveAttribute("data-ark-empty");
    await expect(custom).not.toBeVisible();
    await expect(part(el, "content")).toBeVisible();

    // Busca sem resultado não é lista vazia: fica a mensagem própria, não o estado vazio do app.
    el.search = "zzz";
    await expect(el).not.toHaveAttribute("data-ark-empty");
    await expect(custom).not.toBeVisible();
    await expect(el.querySelector('ark-empty[data-ark="data-view-empty"]')).toHaveAttribute(
      "heading",
      "Nenhum resultado"
    );
    el.search = "";

    // Sem o slot, vale o ark-empty do componente.
    custom.remove();
    el.rows = [];
    await waitFor(() => expect(part(el, "empty")).toHaveAttribute("heading", "Nenhuma entrada"));
    await expect(part(el, "content")).toBeVisible();
  }
};

// Atributos JSON servem ao HTML puro: `columns` e `rows` sem funções, com `row-key` apontando outro campo.
export const JsonAttributes = {
  render: () => {
    const el = document.createElement("ark-data-view") as DataViewEl;
    el.setAttribute("view", "table");
    el.setAttribute("row-key", "sku");
    el.setAttribute(
      "columns",
      JSON.stringify([
        { key: "sku", label: "SKU" },
        { key: "qty", label: "Qtd" }
      ])
    );
    el.setAttribute(
      "rows",
      JSON.stringify([
        { sku: "A-1", qty: 3 },
        { sku: "B-2", qty: 0 }
      ])
    );
    el.style.width = "32rem";
    return el;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const el = canvasElement.querySelector("ark-data-view") as DataViewEl;
    await expect(shown(el)).toEqual(["A-1", "B-2"]);
    await expect(
      within(el)
        .getAllByRole("columnheader")
        .map((th) => th.textContent)
    ).toEqual(["SKU", "Qtd"]);
    await expect(part(el, "footer")).not.toBeVisible();
    await expect(part(el, "search")).not.toBeVisible();
    // JSON inválido vira lista vazia, sem lançar.
    el.setAttribute("rows", "{não é json");
    await expect(shown(el)).toEqual([]);
  }
};

export const TestHooks = {
  render: () =>
    createDataView(
      {
        view: "table",
        searchable: true,
        selectable: true,
        reorderable: true,
        pageSize: 5,
        lang: "pt",
        testid: "usuarios"
      },
      USERS.slice(0, 6)
    ),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const el = canvasElement.querySelector("ark-data-view") as DataViewEl;
    const hooks: Record<string, string> = {
      "": "usuarios",
      search: "usuarios-search",
      views: "usuarios-views",
      "view-table": "usuarios-view-table",
      "view-cards": "usuarios-view-cards",
      selection: "usuarios-selection",
      content: "usuarios-content",
      table: "usuarios-table",
      header: "usuarios-header",
      row: "usuarios-row",
      cell: "usuarios-cell",
      handle: "usuarios-handle",
      select: "usuarios-select",
      "select-all": "usuarios-select-all",
      footer: "usuarios-footer",
      pagination: "usuarios-pagination"
    };
    for (const [name, testid] of Object.entries(hooks)) {
      await expect({ name, testid: part(el, name)?.getAttribute("data-testid") }).toEqual({ name, testid });
    }

    el.setAttribute("view", "cards");
    await expect(part(el, "list")).toHaveAttribute("data-testid", "usuarios-list");
    await expect(part(el, "card")).toHaveAttribute("data-testid", "usuarios-card");
    await expect(part(el, "sort")).toHaveAttribute("data-testid", "usuarios-sort");
  }
};
