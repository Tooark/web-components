import type React from "react";

/**
 * Props de um wrapper somadas aos atributos e handlers DOM do React (`id`, `style`, `title`, `tabIndex`, `aria-*`,
 * `onClick`, `onKeyDown`...), que o wrapper repassa ao elemento `ark-*`. O que o wrapper define vale sobre o homônimo
 * do React: `className`, e um `onChange` que recebe o `CustomEvent` do elemento em vez do `FormEvent`. `children` fica
 * de fora: só os wrappers de elementos com conteúdo o declaram.
 */
export type ArkDomProps<Props> = Props & Omit<React.HTMLAttributes<HTMLElement>, keyof Props | "children">;
