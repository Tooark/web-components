import type {
  ArkDataViewCardContext,
  ArkDataViewCardRender,
  ArkDataViewCellContext,
  ArkDataViewColumn,
  ArkDataViewKey,
  ArkDataViewQueryChangeDetail,
  ArkDataViewReorderDetail,
  ArkDataViewRow,
  ArkDataViewRowClickDetail,
  ArkDataViewSelectionChangeDetail,
  ArkDataViewSort,
  ArkDataViewStyleOptions,
  ArkDataViewViewChangeDetail
} from "@tooark/core";
import type { ArkDataView as ArkDataViewElement } from "@tooark/web-components";
import type React from "react";
import { createElement, Fragment, forwardRef, type PropsWithChildren, useEffect, useReducer, useRef } from "react";
import { createPortal, flushSync } from "react-dom";
import { type ArkDomProps, domAttrs } from "./dom-props.js";
import { ensureTooarkComponentsRegistered } from "./register.js";
import { useForwardedRef } from "./use-forwarded-ref.js";
import { useIsomorphicLayoutEffect } from "./use-isomorphic-layout-effect.js";

/**
 * Coluna do ArkDataView: a do elemento, com um `render` que devolve o que um componente React devolveria (JSX, texto,
 * `null` para nada) e que roda de novo a cada render do wrapper, como qualquer filho. Um nó DOM também é aceito.
 */
export type ArkDataViewReactColumn<Row extends object = ArkDataViewRow> = Omit<ArkDataViewColumn<Row>, "render"> & {
  render?(context: ArkDataViewCellContext<Row>): React.ReactNode | Node;
};

/**
 * Desenha o corpo de cada card em JSX no lugar da grade de campos; `null` ou `undefined` mantém a grade naquele card.
 * Tirado de um método (parâmetros bivariantes), como o tipo do elemento.
 */
export type ArkDataViewReactCardRender<Row extends object = ArkDataViewRow> = {
  render(context: ArkDataViewCardContext<Row>): React.ReactNode | Node;
}["render"];

export type ArkDataViewProps<Row extends object = ArkDataViewRow> = PropsWithChildren<
  ArkDomProps<
    ArkDataViewStyleOptions & {
      /** Registros (propriedade JS, guardados por referência); uma lista nova renderiza de novo. */
      rows?: Row[];
      /**
       * Colunas (propriedade JS): qual campo aparece, onde e como, com `render` em JSX para o conteúdo da célula. Não
       * precisa ser estável: o elemento só refaz as células quando os dados das colunas mudam, e o `render` é lido de
       * novo a cada render do wrapper.
       */
      columns?: ArkDataViewReactColumn<Row>[];
      /** Campo que identifica cada registro. Padrão: "id". */
      rowKey?: string;
      /** Página atual, a partir de 1. */
      page?: number;
      /** Itens por página; sem ele não há paginação. */
      pageSize?: number;
      /** Opções do seletor de itens por página. */
      pageSizes?: number[];
      /** Total de registros no servidor (mode "server"). */
      total?: number;
      /** Ordenação atual: { key, direction } ou "chave:asc". */
      sort?: ArkDataViewSort | string | null;
      /** Texto da busca. */
      search?: string;
      /** Mostra o campo de busca. */
      searchable?: boolean;
      /** Placeholder e rótulo acessível da busca. Padrão: a string `search` do idioma. */
      searchPlaceholder?: string;
      /** Atraso em ms entre a última tecla e a consulta. Padrão: 300. */
      searchDebounce?: number;
      /** Caixa de seleção por registro e a de selecionar tudo. */
      selectable?: boolean;
      /** Chaves selecionadas (propriedade JS); atribuir não emite evento. */
      selected?: ArkDataViewKey[];
      /** Alça de reordenar por registro (arrasto, setas e menu de mover). */
      reorderable?: boolean;
      /** Linha e card focáveis, que emitem onRowClick. */
      clickable?: boolean;
      /** Consulta em andamento: placeholders ou registros esmaecidos, com aria-busy. */
      loading?: boolean;
      /** Nome acessível da tabela e da lista de cards. */
      label?: string;
      /** Desenha o corpo de cada card em JSX no lugar da grade de campos. */
      cardRender?: ArkDataViewReactCardRender<Row>;
      className?: string;
      /** Página, itens por página, ordenação ou busca mudaram: detail é a consulta inteira mais `reason`. */
      onQueryChange?: (event: CustomEvent<ArkDataViewQueryChangeDetail>) => void;
      /** O usuário trocou a apresentação no seletor. */
      onViewChange?: (event: CustomEvent<ArkDataViewViewChangeDetail>) => void;
      /** Clique, Enter ou Espaço numa linha ou card (com clickable): detail é { row, key, index }. */
      onRowClick?: (event: CustomEvent<ArkDataViewRowClickDetail<Row>>) => void;
      /** A seleção mudou por ação do usuário: detail é { selected, rows }. */
      onSelectionChange?: (event: CustomEvent<ArkDataViewSelectionChangeDetail<Row>>) => void;
      /** Um registro foi movido: detail é { key, from, to, rows }. Persistir é do app. */
      onReorder?: (event: CustomEvent<ArkDataViewReorderDetail<Row>>) => void;
    }
  >
>;

/** Um nó que o elemento recebeu no lugar do conteúdo de uma célula (ou do corpo de um card), onde o React desenha. */
type Bridged =
  | { id: number; kind: "cell"; key: string; context: ArkDataViewCellContext }
  | { id: number; kind: "card"; context: ArkDataViewCardContext };

let hostSeq = 0;

// Assinatura das colunas sem as funções (só se existem): enquanto ela não muda o elemento fica com as colunas que
// tem, e um `render` novo a cada render do app (colunas declaradas inline) não refaz a tabela.
function signatureOf(columns: ArkDataViewReactColumn[] | undefined): string {
  if (!columns) return "";
  return JSON.stringify(
    columns.map(({ render, compare, ...data }) => [data, typeof render === "function", typeof compare === "function"])
  );
}

function isDomNode(value: unknown): value is Node {
  return typeof Node !== "undefined" && value instanceof Node;
}

const ArkDataViewBase = forwardRef<ArkDataViewElement, ArkDataViewProps>(
  function ArkDataView(props, forwardedRef): React.JSX.Element {
    const {
      children,
      className,
      rows,
      columns,
      rowKey,
      noViewSelector,
      page,
      pageSize,
      pageSizes,
      total,
      sort,
      search,
      searchable,
      searchPlaceholder,
      searchDebounce,
      selectable,
      selected,
      reorderable,
      clickable,
      loading,
      breakpoint,
      cardColumns,
      cardRender,
      localeJson,
      onQueryChange,
      onViewChange,
      onRowClick,
      onSelectionChange,
      onReorder,
      ...rest
    } = props;
    const [ref, setRef] = useForwardedRef<ArkDataViewElement>(forwardedRef);
    const [, repaint] = useReducer((count: number) => count + 1, 0);
    // Nós de célula entregues ao elemento, onde os portais desenham; quem cria e quem descarta é o elemento.
    const hosts = useRef(new Map<HTMLElement, Bridged>());
    // O que o app passou no último render confirmado: as funções entregues ao elemento leem daqui, então continuam
    // as mesmas enquanto o `render` do app muda.
    const latest = useRef<{ columns?: ArkDataViewReactColumn[]; cardRender?: ArkDataViewReactCardRender }>({});
    const bridge = useRef<{
      signature: string | null;
      cell: (key: string, context: ArkDataViewCellContext) => Node;
      card: ArkDataViewCardRender;
      compare: (key: string, a: ArkDataViewRow, b: ArkDataViewRow) => number;
    } | null>(null);
    if (!bridge.current) {
      const host = (entry: Bridged): HTMLElement => {
        const node = document.createElement("span");
        node.style.display = "contents";
        hosts.current.set(node, entry);
        return node;
      };
      bridge.current = {
        signature: null,
        cell: (key, context) => {
          const out = latest.current.columns?.find((column) => column.key === key)?.render?.(context);
          return isDomNode(out) ? out : host({ id: ++hostSeq, kind: "cell", key, context });
        },
        card: (context) => {
          const out = latest.current.cardRender?.(context);
          // Sem JSX para este card, a grade de campos do elemento fica.
          if (out === null || out === undefined || isDomNode(out)) return out;
          return host({ id: ++hostSeq, kind: "card", context });
        },
        compare: (key, a, b) => latest.current.columns?.find((column) => column.key === key)?.compare?.(a, b) ?? 0
      };
    }

    useEffect(() => {
      ensureTooarkComponentsRegistered();
    }, []);

    useIsomorphicLayoutEffect(() => {
      latest.current = { columns, cardRender };
    });

    // A cada redesenho do conteúdo o elemento troca os nós de célula: os que saíram do DOM são descartados e os
    // portais dos novos são desenhados antes da pintura. Num microtask, porque o redesenho pode vir de dentro de um
    // efeito do React, onde o flushSync não pode rodar.
    useIsomorphicLayoutEffect(() => {
      const el = ref.current;
      if (!el) return;
      let alive = true;
      let queued = false;
      const flush = (): void => {
        queued = false;
        if (!alive) return;
        let dropped = false;
        for (const node of Array.from(hosts.current.keys())) {
          if (node.isConnected) continue;
          hosts.current.delete(node);
          dropped = true;
        }
        if (hosts.current.size > 0 || dropped) flushSync(repaint);
      };
      const handleRender = (): void => {
        if (queued) return;
        queued = true;
        queueMicrotask(flush);
      };
      el.addEventListener("ark-render", handleRender);
      return () => {
        alive = false;
        el.removeEventListener("ark-render", handleRender);
      };
    }, [ref]);

    // `columns`, `rows` e `selected` são propriedades (objetos e funções), não atributos; as colunas vão antes das
    // linhas para a primeira renderização com dados já ter as células certas. As colunas só são regravadas quando a
    // assinatura delas muda.
    const signature = signatureOf(columns);
    useEffect(() => {
      const el = ref.current;
      const api = bridge.current;
      const list = latest.current.columns;
      if (!el || !api || !list || api.signature === signature) return;
      api.signature = signature;
      el.columns = list.map(({ render, compare, ...data }) => ({
        ...data,
        ...(render ? { render: (context: ArkDataViewCellContext) => api.cell(data.key, context) } : {}),
        ...(compare ? { compare: (a: ArkDataViewRow, b: ArkDataViewRow) => api.compare(data.key, a, b) } : {})
      }));
    }, [ref, signature]);

    useEffect(() => {
      if (ref.current && rows) ref.current.rows = rows;
    }, [ref, rows]);

    useEffect(() => {
      if (ref.current && selected) ref.current.selected = selected;
    }, [ref, selected]);

    // Função, então propriedade; só é gravada quando o app dá uma (e uma vez só: quem muda é a função lida por ela),
    // para a view sem ela não refazer os cards.
    const hasCardRender = typeof cardRender === "function";
    useEffect(() => {
      const el = ref.current;
      const api = bridge.current;
      if (!el || !api) return;
      if (hasCardRender) {
        if (el.cardRender !== api.card) el.cardRender = api.card;
      } else if (el.cardRender) {
        el.cardRender = null;
      }
    }, [ref, hasCardRender]);

    useEffect(() => {
      const el = ref.current;
      if (!el) return;

      const handlers: Array<[string, EventListener]> = [];
      function bind<T>(name: string, handler?: (event: CustomEvent<T>) => void): void {
        if (!handler) return;
        // Só os eventos deste data-view: os ark-* borbulham, e os de um componente dentro de uma célula ou de um slot
        // (outro data-view, um ark-tree com o mesmo ark-selection-change) chegariam aqui com o detail do outro.
        const listener: EventListener = (event) => {
          if (event.target === event.currentTarget) handler(event as CustomEvent<T>);
        };
        el!.addEventListener(name, listener);
        handlers.push([name, listener]);
      }

      bind("ark-query-change", onQueryChange);
      bind("ark-view-change", onViewChange);
      bind("ark-row-click", onRowClick);
      bind("ark-selection-change", onSelectionChange);
      bind("ark-reorder", onReorder);

      return () => {
        for (const [name, listener] of handlers) {
          el.removeEventListener(name, listener);
        }
      };
    }, [ref, onQueryChange, onViewChange, onRowClick, onSelectionChange, onReorder]);

    const attrs: Record<string, unknown> = {
      ...domAttrs(rest),
      ref: setRef,
      class: className,
      "row-key": rowKey,
      "no-view-selector": noViewSelector ? "" : undefined,
      breakpoint: breakpoint !== undefined ? String(breakpoint) : undefined,
      page: page !== undefined ? String(page) : undefined,
      "page-size": pageSize !== undefined ? String(pageSize) : undefined,
      "page-sizes": pageSizes && pageSizes.length > 0 ? pageSizes.join(",") : undefined,
      total: total !== undefined ? String(total) : undefined,
      sort: sort && typeof sort === "object" ? `${sort.key}:${sort.direction}` : sort || undefined,
      search: search || undefined,
      searchable: searchable ? "" : undefined,
      "search-placeholder": searchPlaceholder,
      "search-debounce": searchDebounce !== undefined ? String(searchDebounce) : undefined,
      selectable: selectable ? "" : undefined,
      reorderable: reorderable ? "" : undefined,
      clickable: clickable ? "" : undefined,
      loading: loading ? "" : undefined,
      "card-columns": cardColumns !== undefined ? String(cardColumns) : undefined,
      "locale-json": localeJson
    };

    // Um portal por nó de célula, com o `render` deste render do app: o conteúdo se atualiza como qualquer filho,
    // sem o elemento refazer a tabela.
    const portals: React.ReactPortal[] = [];
    for (const [node, entry] of hosts.current) {
      const content =
        entry.kind === "cell"
          ? columns?.find((column) => column.key === entry.key)?.render?.(entry.context)
          : cardRender?.(entry.context);
      if (isDomNode(content)) continue;
      portals.push(createPortal(content, node, String(entry.id)));
    }

    return createElement(Fragment, null, createElement("ark-data-view", attrs, children), portals);
  }
);

/**
 * Wrapper do ark-data-view. Genérico no registro: `<ArkDataView<User> rows={users} ... />` tipa `columns`, `render`
 * e o `detail.row` dos eventos com o tipo do app (inferido de `rows` quando o parâmetro é omitido).
 */
export const ArkDataView = ArkDataViewBase as <Row extends object = ArkDataViewRow>(
  props: ArkDataViewProps<Row> & React.RefAttributes<ArkDataViewElement>
) => React.JSX.Element;
