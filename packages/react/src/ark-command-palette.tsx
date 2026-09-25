import type { ArkCommandItemStyleOptions, ArkCommandPaletteStyleOptions } from "@tooark/core";
import type React from "react";
import { createElement, type PropsWithChildren, useEffect, useRef } from "react";
import { ensureTooarkComponentsRegistered } from "./register.js";
import { useIsomorphicLayoutEffect } from "./use-isomorphic-layout-effect.js";

export type ArkCommandPaletteProps = PropsWithChildren<
  ArkCommandPaletteStyleOptions & {
    /** Aberta; a saida anima antes de sair do top layer. */
    open?: boolean;
    /** Placeholder e nome do campo de busca. Padrao: a string `search` do idioma. */
    placeholder?: string;
    /** Atalho global: "/", "mod+k" (Ctrl ou Cmd), "ctrl+shift+p"... */
    hotkey?: string;
    /** Filtra localmente pelo label dos itens. */
    filter?: boolean;
    /** Debounce de ark-query em ms. Padrao: 150. */
    queryDelay?: number;
    /** Nome acessivel do dialogo. */
    label?: string;
    /** A pagina continua rolando com a paleta aberta. */
    noScrollLock?: boolean;
    "aria-label"?: string;
    className?: string;
    onSelect?: (event: CustomEvent<{ value: string }>) => void;
    onQuery?: (event: CustomEvent<{ query: string }>) => void;
    onOpen?: (event: CustomEvent) => void;
    onClose?: (event: CustomEvent) => void;
  }
>;

export function ArkCommandPalette(props: ArkCommandPaletteProps): React.JSX.Element {
  const {
    children,
    className,
    open,
    filter,
    queryDelay,
    noScrollLock,
    localeJson,
    onSelect,
    onQuery,
    onOpen,
    onClose,
    ...rest
  } = props;
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    ensureTooarkComponentsRegistered();
  }, []);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleSelect = (event: Event): void => onSelect?.(event as CustomEvent<{ value: string }>);
    const handleQuery = (event: Event): void => onQuery?.(event as CustomEvent<{ query: string }>);
    const handleOpen = (event: Event): void => onOpen?.(event as CustomEvent);
    const handleClose = (event: Event): void => onClose?.(event as CustomEvent);
    el.addEventListener("ark-select", handleSelect);
    el.addEventListener("ark-query", handleQuery);
    el.addEventListener("ark-open", handleOpen);
    el.addEventListener("ark-close", handleClose);
    return () => {
      el.removeEventListener("ark-select", handleSelect);
      el.removeEventListener("ark-query", handleQuery);
      el.removeEventListener("ark-open", handleOpen);
      el.removeEventListener("ark-close", handleClose);
    };
  }, [onSelect, onQuery, onOpen, onClose]);

  const attrs: Record<string, string | undefined | React.Ref<HTMLElement>> = {
    ...rest,
    ref,
    class: className,
    open: open ? "" : undefined,
    filter: filter ? "" : undefined,
    "no-scroll-lock": noScrollLock ? "" : undefined,
    "query-delay": queryDelay === undefined ? undefined : String(queryDelay),
    "locale-json": localeJson
  };

  return createElement("ark-command-palette", attrs, children);
}

export type ArkCommandItemProps = PropsWithChildren<
  ArkCommandItemStyleOptions & {
    value: string;
    /** Secao em que a paleta lista o item. */
    group?: string;
    /** Texto do filtro e nome da opcao. Padrao: o texto dos filhos sem slot. */
    label?: string;
    disabled?: boolean;
    className?: string;
  }
>;

export function ArkCommandItem(props: ArkCommandItemProps): React.JSX.Element {
  const { children, className, disabled, ...rest } = props;

  useEffect(() => {
    ensureTooarkComponentsRegistered();
  }, []);

  const attrs: Record<string, string | undefined> = {
    ...rest,
    class: className,
    disabled: disabled ? "" : undefined
  };

  return createElement("ark-command-item", attrs, children);
}
