import type React from "react";

/**
 * Props de um wrapper somadas aos atributos e handlers DOM do React (`id`, `style`, `title`, `tabIndex`, `aria-*`,
 * `onClick`, `onKeyDown`...), que o wrapper repassa ao elemento `ark-*`. O que o wrapper define vale sobre o homônimo
 * do React: `className`, e um `onChange` que recebe o `CustomEvent` do elemento em vez do `FormEvent`. `children` fica
 * de fora: só os wrappers de elementos com conteúdo o declaram.
 */
export type ArkDomProps<Props> = Props & Omit<React.HTMLAttributes<HTMLElement>, keyof Props | "children">;

/**
 * O `rest` de um wrapper pronto para o elemento, com os `aria-*` booleanos convertidos em texto. Num custom element
 * o React 19 grava `true` como atributo vazio (`aria-pressed=""`, valor inválido em ARIA), enquanto num elemento
 * nativo grava `"true"`; os tipos do React aceitam o booleano nos dois, então o wrapper iguala o resultado.
 */
export function domAttrs(rest: object): Record<string, unknown> {
  const attrs: Record<string, unknown> = { ...rest };
  for (const name of Object.keys(attrs)) {
    if (typeof attrs[name] === "boolean" && name.startsWith("aria-")) attrs[name] = String(attrs[name]);
  }
  return attrs;
}
