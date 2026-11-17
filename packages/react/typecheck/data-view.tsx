// Verificação só de tipos (ver dom-props.tsx): o ArkDataView é genérico no registro, e um registro declarado como
// `interface` no app precisa ser aceito sem cast, no wrapper e no elemento.
import type { ArkDataViewCardRender, ArkDataViewColumn } from "@tooark/core";
import type { ArkDataView as ArkDataViewElement } from "@tooark/web-components";
import type { ReactNode } from "react";
import { ArkDataView, type ArkDataViewReactColumn, ArkPagination } from "../src/index.js";

interface User {
  id: number;
  name: string;
  active: boolean;
}

const users: User[] = [{ id: 1, name: "Ana", active: true }];
const columns: ArkDataViewColumn<User>[] = [
  { key: "name", label: "Nome", sortable: true, render: ({ row }) => row.name.toUpperCase() },
  { key: "active", label: "Ativo", compare: (a, b) => Number(a.active) - Number(b.active) }
];

/** No wrapper o `render` da coluna devolve JSX (ou texto, ou nada), com o registro tipado. */
const jsxColumns: ArkDataViewReactColumn<User>[] = [
  { key: "name", label: "Nome", render: ({ row }) => <strong title={row.name}>{row.name}</strong> },
  { key: "active", label: "Ativo", render: ({ row }) => (row.active ? "sim" : null) }
];

/** O registro é inferido de `rows`, ou dado no parâmetro; sem nenhum dos dois vale o registro genérico. */
export const accepted: ReactNode[] = [
  <ArkDataView key="jsx" rows={users} columns={jsxColumns} cardRender={({ row }) => <p>{row.name}</p>} />,
  <ArkDataView
    key="inferido"
    id="usuarios"
    rows={users}
    columns={columns}
    selected={[1]}
    sort={{ key: "name", direction: "asc" }}
    onClick={(event) => event.currentTarget}
    onRowClick={(event) => event.detail.row.name.length}
    onSelectionChange={(event) => event.detail.rows[0]?.active}
    onReorder={(event) => event.detail.rows.map((user) => user.id)}
    onQueryChange={(event) => event.detail.sort?.direction}
    cardRender={({ row }) => row.name}
  >
    <div slot="selection" />
  </ArkDataView>,
  <ArkDataView<User> key="explicito" rows={users} columns={[{ key: "id", label: "#", render: ({ row }) => row.id }]} />,
  <ArkDataView key="generico" view="cards" noViewSelector mode="server" total={0} sort="name:desc" />,
  <ArkPagination
    key="paginacao"
    page={2}
    total={50}
    pageSizes={[10, 25]}
    aria-label="Páginas"
    onPageChange={(event) => event.detail.pageCount}
  />
];

/** O elemento aceita os mesmos registros e colunas tipados, pela propriedade. */
export function assign(el: ArkDataViewElement): void {
  el.rows = users;
  el.columns = columns;
  el.selected = [1, "a"];
  el.sort = { key: "name", direction: "desc" };
  const card: ArkDataViewCardRender<User> = ({ row }) => row.name;
  el.cardRender = card;
}

/** O que continua sendo erro. */
export const rejected: ReactNode[] = [
  // Campo que não existe no registro.
  // @ts-expect-error
  <ArkDataView key="campo" rows={users} onRowClick={(event) => event.detail.row.nome} />,
  // Apresentação que não existe.
  // @ts-expect-error
  <ArkDataView key="view" view="grid" />,
  <ArkDataView
    key="render"
    rows={users}
    // O render devolve o que o React desenha (ou um nó DOM), não um objeto qualquer.
    // @ts-expect-error
    columns={[{ key: "active", label: "Ativo", render: ({ row }) => ({ ativo: row.active }) }]}
  />,
  // Paginação não tem conteúdo.
  // @ts-expect-error
  <ArkPagination key="filhos">1</ArkPagination>
];
