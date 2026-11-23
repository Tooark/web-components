import type { ArkCommandItemStyleOptions, ArkCommandPaletteStyleOptions } from "@tooark/core";
import type {
  ArkCommandItem as ArkCommandItemElement,
  ArkCommandPalette as ArkCommandPaletteElement
} from "@tooark/web-components";
import type React from "react";
import { createElement, forwardRef, type PropsWithChildren, useEffect } from "react";
import { type ArkDomProps, domAttrs } from "./dom-props.js";
import { ensureTooarkComponentsRegistered } from "./register.js";
import { useForwardedRef } from "./use-forwarded-ref.js";
import { useIsomorphicLayoutEffect } from "./use-isomorphic-layout-effect.js";

export type ArkCommandPaletteProps = PropsWithChildren<
  ArkDomProps<
    ArkCommandPaletteStyleOptions & {
      /** Aberta; a saída anima antes de sair do top layer. */
      open?: boolean;
      /** Placeholder e nome do campo de busca. Padrão: a string `search` do idioma. */
      placeholder?: string;
      /** Atalho global: "/", "mod+k" (Ctrl ou Cmd), "ctrl+shift+p"... */
      hotkey?: string;
      /** Filtra localmente pelo label dos itens. */
      filter?: boolean;
      /** Debounce de ark-query em ms. Padrão: 150. */
      queryDelay?: number;
      /** Nome acessível do diálogo. */
      label?: string;
      /** Mensagem sem opções enquanto o campo está vazio (no lugar de `noResults`). */
      hint?: string;
      /** Busca assíncrona em andamento: sem opções a mensagem vira `searching`, e o listbox fica aria-busy. */
      busy?: boolean;
      /** A página continua rolando com a paleta aberta. */
      noScrollLock?: boolean;
      "aria-label"?: string;
      className?: string;
      onSelect?: (event: CustomEvent<{ value: string }>) => void;
      onQuery?: (event: CustomEvent<{ query: string }>) => void;
      onOpen?: (event: CustomEvent) => void;
      onClose?: (event: CustomEvent) => void;
    }
  >
>;

export const ArkCommandPalette = forwardRef<ArkCommandPaletteElement, ArkCommandPaletteProps>(
  function ArkCommandPalette(props, forwardedRef): React.JSX.Element {
    const {
      children,
      className,
      open,
      filter,
      busy,
      queryDelay,
      noScrollLock,
      localeJson,
      onSelect,
      onQuery,
      onOpen,
      onClose,
      ...rest
    } = props;
    const [ref, setRef] = useForwardedRef<ArkCommandPaletteElement>(forwardedRef);

    useEffect(() => {
      ensureTooarkComponentsRegistered();
    }, []);

    useIsomorphicLayoutEffect(() => {
      const el = ref.current;
      if (!el) return;

      const handleSelect = (event: Event): void => onSelect?.(event as CustomEvent<{ value: string }>);
      const handleQuery = (event: Event): void => onQuery?.(event as CustomEvent<{ query: string }>);
      // ark-open e ark-close borbulham: só os deste elemento chegam ao app. Os de um overlay de dentro chegavam também
      // (um ark-menu que fechava dentro de um diálogo chamava o onClose do diálogo).
      const handleOpen = (event: Event): void => {
        if (event.target === event.currentTarget) onOpen?.(event as CustomEvent);
      };
      const handleClose = (event: Event): void => {
        if (event.target === event.currentTarget) onClose?.(event as CustomEvent);
      };
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

    const attrs: Record<string, unknown> = {
      ...domAttrs(rest),
      ref: setRef,
      class: className,
      open: open ? "" : undefined,
      filter: filter ? "" : undefined,
      busy: busy ? "" : undefined,
      "no-scroll-lock": noScrollLock ? "" : undefined,
      "query-delay": queryDelay === undefined ? undefined : String(queryDelay),
      "locale-json": localeJson
    };

    return createElement("ark-command-palette", attrs, children);
  }
);

export type ArkCommandItemProps = PropsWithChildren<
  ArkDomProps<
    ArkCommandItemStyleOptions & {
      value: string;
      /** Seção em que a paleta lista o item. */
      group?: string;
      /** Texto do filtro e nome da opção. Padrão: o texto dos filhos sem slot. */
      label?: string;
      disabled?: boolean;
      className?: string;
    }
  >
>;

export const ArkCommandItem = forwardRef<ArkCommandItemElement, ArkCommandItemProps>(
  function ArkCommandItem(props, forwardedRef): React.JSX.Element {
    const { children, className, disabled, ...rest } = props;

    useEffect(() => {
      ensureTooarkComponentsRegistered();
    }, []);

    const attrs: Record<string, unknown> = {
      ...domAttrs(rest),
      ref: forwardedRef,
      class: className,
      disabled: disabled ? "" : undefined
    };

    return createElement("ark-command-item", attrs, children);
  }
);
