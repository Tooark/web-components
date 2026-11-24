import type {
  ArkDataViewCardContext,
  ArkDataViewCardRender,
  ArkDataViewCellContext,
  ArkDataViewColumn,
  ArkDataViewKey,
  ArkDataViewMode,
  ArkDataViewRow,
  ArkDataViewSort,
  ArkDataViewView,
  ArkLang,
  ArkSize,
  ArkTheme
} from "@tooark/core";
import {
  defineComponent,
  h,
  isVNode,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  type PropType,
  ref,
  Teleport,
  type VNode,
  type VNodeChild,
  watch
} from "vue";
import { ensureTooarkComponentsRegistered } from "./register.js";

const EVENTS = ["ark-query-change", "ark-view-change", "ark-row-click", "ark-selection-change", "ark-reorder"] as const;

/**
 * Coluna do ArkDataView: a do elemento, com um `render` que também devolve VNodes (`h(...)`). O jeito do template é
 * o slot `#cell-<key>="{ row, value, index, view }"`, que vale sobre o `render` da coluna.
 */
export type ArkDataViewVueColumn<Row extends object = ArkDataViewRow> = Omit<ArkDataViewColumn<Row>, "render"> & {
  render?(context: ArkDataViewCellContext<Row>): VNode | VNode[] | Node | string | number | null | undefined;
};

/** Desenha o corpo de cada card; pode devolver VNodes. O jeito do template é o slot `#card="{ row, index }"`. */
export type ArkDataViewVueCardRender<Row extends object = ArkDataViewRow> = {
  render(context: ArkDataViewCardContext<Row>): VNode | VNode[] | Node | string | number | null | undefined;
}["render"];

type DataViewElement = HTMLElement & {
  rows: ArkDataViewRow[];
  columns: ArkDataViewColumn[];
  selected: ArkDataViewKey[];
  cardRender: ArkDataViewCardRender | null;
};

/** Um nó que o elemento recebeu no lugar do conteúdo de uma célula (ou do corpo de um card), onde o Vue desenha. */
type Bridged =
  | { id: number; kind: "cell"; key: string; context: ArkDataViewCellContext }
  | { id: number; kind: "card"; context: ArkDataViewCardContext };

let hostSeq = 0;

function isDomNode(value: unknown): value is Node {
  return typeof Node !== "undefined" && value instanceof Node;
}

function isVNodes(value: unknown): value is VNode | VNode[] {
  return isVNode(value) || Array.isArray(value);
}

export const ArkDataView = defineComponent({
  name: "ArkDataView",
  inheritAttrs: false,
  emits: [...EVENTS],
  props: {
    /** Propagado como data-testid ao elemento principal e sufixado nas partes internas. */
    testid: { type: String, default: undefined },
    /** Registros (propriedade JS, guardados por referência). */
    rows: { type: Array as PropType<ArkDataViewRow[]>, default: undefined },
    /** Colunas (propriedade JS): qual campo aparece, onde e como; o conteúdo próprio vem do slot `cell-<key>`. */
    columns: { type: Array as PropType<ArkDataViewVueColumn[]>, default: undefined },
    rowKey: { type: String, default: undefined },
    view: { type: String as PropType<ArkDataViewView>, default: undefined },
    /** Esconde o seletor de visualização do canto; `view` continua decidindo a apresentação. */
    noViewSelector: { type: Boolean, default: false },
    breakpoint: { type: Number, default: undefined },
    mode: { type: String as PropType<ArkDataViewMode>, default: undefined },
    page: { type: Number, default: undefined },
    pageSize: { type: Number, default: undefined },
    pageSizes: { type: Array as PropType<number[]>, default: undefined },
    total: { type: Number, default: undefined },
    /** Ordenação atual: { key, direction } ou "chave:asc". */
    sort: { type: [Object, String] as PropType<ArkDataViewSort | string | null>, default: undefined },
    search: { type: String, default: undefined },
    searchable: { type: Boolean, default: false },
    searchPlaceholder: { type: String, default: undefined },
    searchDebounce: { type: Number, default: undefined },
    selectable: { type: Boolean, default: false },
    /** Chaves selecionadas (propriedade JS); atribuir não emite evento. */
    selected: { type: Array as PropType<ArkDataViewKey[]>, default: undefined },
    reorderable: { type: Boolean, default: false },
    clickable: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    cardColumns: { type: Number, default: undefined },
    /** Desenha o corpo de cada card no lugar da grade de campos; o slot `card` vale sobre ela. */
    cardRender: { type: Function as PropType<ArkDataViewVueCardRender>, default: undefined },
    label: { type: String, default: undefined },
    size: { type: String as PropType<ArkSize>, default: "md" },
    theme: { type: String as PropType<ArkTheme>, default: "auto" },
    lang: { type: String as PropType<ArkLang>, default: undefined },
    localeJson: { type: String, default: undefined }
  },
  setup(props, { attrs, slots, emit }) {
    ensureTooarkComponentsRegistered();
    const elRef = ref<DataViewElement | null>(null);
    // Nós de célula entregues ao elemento, onde os Teleports desenham; quem cria e quem descarta é o elemento, fora
    // da reatividade, então `version` avisa o render deste componente.
    const hosts = new Map<HTMLElement, Bridged>();
    const version = ref(0);
    let appliedColumns: string | null = null;

    const host = (entry: Bridged): HTMLElement => {
      const node = document.createElement("span");
      node.style.display = "contents";
      hosts.set(node, entry);
      return node;
    };
    const columnOf = (key: string) => props.columns?.find((column) => column.key === key);

    // Funções entregues ao elemento: estáveis, leem o slot e as props do momento. Com slot a célula é do Vue; sem
    // ele vale o `render` da coluna, que só vira Teleport quando devolve VNodes (nó, texto e null seguem a regra do
    // elemento).
    const renderCell = (key: string, context: ArkDataViewCellContext): Node | string | number | null | undefined => {
      if (!slots[`cell-${key}`]) {
        const out = columnOf(key)?.render?.(context);
        if (!isVNodes(out)) return out;
      }
      return host({ id: ++hostSeq, kind: "cell", key, context });
    };
    const renderCard: ArkDataViewCardRender = (context) => {
      if (!slots.card) {
        const out = props.cardRender?.(context);
        if (!isVNodes(out)) return out;
      }
      return host({ id: ++hostSeq, kind: "card", context });
    };

    // As colunas só são regravadas quando os dados delas mudam (ou os slots de célula): uma lista declarada inline
    // no template, nova a cada render, não refaz a tabela.
    const syncColumns = () => {
      const el = elRef.value;
      const columns = props.columns;
      if (!el || !columns) return;
      const signature = JSON.stringify(
        columns.map(({ render, compare, ...data }) => [
          data,
          typeof render === "function" || Boolean(slots[`cell-${data.key}`]),
          typeof compare === "function"
        ])
      );
      if (signature === appliedColumns) return;
      appliedColumns = signature;
      el.columns = columns.map(({ render, compare, ...data }) => ({
        ...data,
        ...(render || slots[`cell-${data.key}`]
          ? { render: (context: ArkDataViewCellContext) => renderCell(data.key, context) }
          : {}),
        ...(compare
          ? { compare: (a: ArkDataViewRow, b: ArkDataViewRow) => columnOf(data.key)?.compare?.(a, b) ?? 0 }
          : {})
      }));
    };
    // `rows` e `selected` são propriedades (objetos), não atributos. Sem `deep`: os registros ficam por referência
    // no elemento, e só uma lista nova renderiza de novo.
    const syncRows = () => {
      if (elRef.value && props.rows) elRef.value.rows = props.rows;
    };
    const syncSelected = () => {
      if (elRef.value && props.selected) elRef.value.selected = props.selected;
    };
    // Função, então propriedade; só é gravada quando o app dá uma (ou o slot `card`), para a view sem ela não
    // refazer os cards.
    const syncCardRender = () => {
      const el = elRef.value;
      if (!el) return;
      if (props.cardRender || slots.card) {
        if (el.cardRender !== renderCard) el.cardRender = renderCard;
      } else if (el.cardRender) {
        el.cardRender = null;
      }
    };
    watch(() => props.columns, syncColumns);
    watch(() => props.rows, syncRows);
    watch(() => props.selected, syncSelected);
    watch(() => props.cardRender, syncCardRender);

    // A cada redesenho do conteúdo o elemento troca os nós de célula: os que saíram do DOM são descartados e o
    // render deste componente teleporta o conteúdo para os novos.
    const renderHandler = () => {
      const before = hosts.size;
      for (const node of Array.from(hosts.keys())) {
        if (!node.isConnected) hosts.delete(node);
      }
      if (before > 0 || hosts.size > 0) version.value++;
    };

    // Eventos customizados do DOM: ouvidos no elemento, não pelo h(), que não mapeia nomes com hífen.
    // Só os eventos deste data-view: os ark-* borbulham, e os de um componente dentro de uma célula ou de um slot
    // (outro data-view, um ark-tree com o mesmo ark-selection-change) chegariam aqui com o detail do outro.
    const handlers = EVENTS.map(
      (name) =>
        [
          name,
          (event: Event) => {
            if (event.target === event.currentTarget) emit(name, event as CustomEvent);
          }
        ] as const
    );
    onMounted(() => {
      elRef.value?.addEventListener("ark-render", renderHandler);
      syncColumns();
      syncRows();
      syncSelected();
      syncCardRender();
      for (const [name, handler] of handlers) elRef.value?.addEventListener(name, handler);
    });
    // Um slot de célula ou de card que aparece ou some depois (v-if no template) muda o que o elemento desenha.
    onUpdated(() => {
      syncColumns();
      syncCardRender();
    });
    onBeforeUnmount(() => {
      elRef.value?.removeEventListener("ark-render", renderHandler);
      for (const [name, handler] of handlers) elRef.value?.removeEventListener(name, handler);
    });

    return () => {
      const sort = props.sort;
      // Lido para o render depender dele: os nós de célula mudam fora da reatividade.
      void version.value;
      const teleports: VNode[] = [];
      for (const [node, entry] of hosts) {
        let content: unknown;
        if (entry.kind === "cell") {
          const slot = slots[`cell-${entry.key}`];
          content = slot ? slot(entry.context) : columnOf(entry.key)?.render?.(entry.context);
        } else {
          content = slots.card ? slots.card(entry.context) : props.cardRender?.(entry.context);
        }
        if (isDomNode(content)) continue;
        const children = Array.isArray(content) ? content : content === null || content === undefined ? [] : [content];
        teleports.push(h(Teleport, { to: node, key: entry.id }, children as VNodeChild[]));
      }

      return [
        h(
          "ark-data-view",
          {
            ...attrs,
            testid: props.testid,
            ref: elRef,
            "row-key": props.rowKey,
            view: props.view,
            "no-view-selector": props.noViewSelector ? "" : undefined,
            breakpoint: props.breakpoint !== undefined ? String(props.breakpoint) : undefined,
            mode: props.mode,
            page: props.page !== undefined ? String(props.page) : undefined,
            "page-size": props.pageSize !== undefined ? String(props.pageSize) : undefined,
            "page-sizes": props.pageSizes && props.pageSizes.length > 0 ? props.pageSizes.join(",") : undefined,
            total: props.total !== undefined ? String(props.total) : undefined,
            sort: sort && typeof sort === "object" ? `${sort.key}:${sort.direction}` : sort || undefined,
            search: props.search || undefined,
            searchable: props.searchable ? "" : undefined,
            "search-placeholder": props.searchPlaceholder,
            "search-debounce": props.searchDebounce !== undefined ? String(props.searchDebounce) : undefined,
            selectable: props.selectable ? "" : undefined,
            reorderable: props.reorderable ? "" : undefined,
            clickable: props.clickable ? "" : undefined,
            loading: props.loading ? "" : undefined,
            "card-columns": props.cardColumns !== undefined ? String(props.cardColumns) : undefined,
            label: props.label,
            size: props.size,
            theme: props.theme,
            lang: props.lang,
            "locale-json": props.localeJson
          },
          slots.default ? slots.default() : []
        ),
        ...teleports
      ];
    };
  }
});
