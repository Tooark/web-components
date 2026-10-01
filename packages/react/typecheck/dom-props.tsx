// Verificação só de tipos: o build roda `tsc -p tsconfig.typecheck.json` (noEmit) sobre este arquivo, e nada daqui
// vai para o dist. Fixa que os wrappers aceitam os atributos e handlers DOM do React, tipados, e que o que o wrapper
// define continua valendo sobre o homônimo do React. Um `@ts-expect-error` que deixa de ser erro falha o build.
import type { ReactNode } from "react";
import {
  ArkAvatar,
  ArkBadge,
  ArkCheckbox,
  ArkCommandItem,
  ArkFileInput,
  ArkInput,
  ArkMenu,
  ArkMenuItem,
  ArkProgress,
  ArkRadio,
  ArkSelect,
  ArkSwitch,
  ArkTab,
  ArkTabs,
  ArkToggle
} from "../src/index.js";

/** Atributos e handlers DOM em wrappers com e sem filhos, com e sem eventos próprios. */
export const accepted: ReactNode[] = [
  <ArkCheckbox
    key="checkbox"
    id="aceite"
    title="Aceite"
    style={{ margin: 4 }}
    tabIndex={-1}
    aria-label="Aceite"
    data-linha="1"
    onClick={(event) => event.stopPropagation()}
    onKeyDown={(event) => event.key}
    onChange={(event) => event.detail.checked}
  />,
  <ArkRadio key="radio" name="plano" value="pro" onClick={(event) => event.currentTarget} onFocus={() => {}} />,
  <ArkSwitch key="switch" label="Notificar" onClick={(event) => event.clientX} onChange={(event) => event.detail} />,
  <ArkToggle key="toggle" role="switch" onPointerDown={(event) => event.pointerId}>
    Negrito
  </ArkToggle>,
  <ArkAvatar key="avatar" name="Ana" onClick={() => {}} hidden />,
  <ArkBadge key="badge" id="novo" onMouseEnter={() => {}}>
    Novo
  </ArkBadge>,
  <ArkProgress key="progress" value={3} aria-describedby="dica" onClick={() => {}} />,
  <ArkInput key="input" label="E-mail" id="email" onBlur={(event) => event.relatedTarget} onInput={(event) => event} />,
  <ArkSelect key="select" label="Método" onKeyDown={() => {}} onChange={(event) => event.detail.value} />,
  <ArkFileInput key="file" directory onDragOver={() => {}} onChange={(event) => event.detail.paths} />,
  <ArkMenu key="menu" htmlFor="gatilho" onContextMenu={() => {}} onSelect={(event) => event.detail.value}>
    <ArkMenuItem value="copiar" onClick={() => {}}>
      Copiar
    </ArkMenuItem>
  </ArkMenu>,
  <ArkTabs key="tabs" onAuxClick={() => {}} onChange={(event) => event.detail.value}>
    <ArkTab value="a" onDoubleClick={() => {}}>
      A
    </ArkTab>
  </ArkTabs>,
  <ArkCommandItem key="item" value="abrir" onMouseDown={() => {}}>
    Abrir
  </ArkCommandItem>
];

/** O que continua sendo erro. */
export const rejected: ReactNode[] = [
  // O onChange do wrapper recebe o CustomEvent do elemento, não o FormEvent do React.
  // @ts-expect-error
  <ArkCheckbox key="evento" onChange={(event: React.FormEvent<HTMLElement>) => event.currentTarget} />,
  // Wrapper de elemento sem conteúdo não aceita filhos.
  // @ts-expect-error
  <ArkAvatar key="filhos">Ana</ArkAvatar>,
  // Prop que não existe.
  // @ts-expect-error
  <ArkProgress key="prop" valeu={3} />,
  // Handler com o tipo errado.
  // @ts-expect-error
  <ArkRadio key="handler" name="plano" value="pro" onClick="clique" />
];
