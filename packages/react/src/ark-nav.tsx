import type {
  ArkNavCollapsible,
  ArkNavGroupStyleOptions,
  ArkNavItemStyleOptions,
  ArkNavStyleOptions
} from "@tooark/core";
import type {
  ArkNav as ArkNavElement,
  ArkNavGroup as ArkNavGroupElement,
  ArkNavItem as ArkNavItemElement
} from "@tooark/web-components";
import React, { createElement, forwardRef, type PropsWithChildren, useEffect } from "react";
import { type ArkDomProps, domAttrs } from "./dom-props.js";
import { ensureTooarkComponentsRegistered } from "./register.js";
import { useForwardedRef } from "./use-forwarded-ref.js";

/** `detail` de `ark-navigate`: o destino do item e o seu identificador (`value`, ou o `href`). */
export type ArkNavNavigateDetail = { href: string | null; value: string };

export type ArkNavProps = PropsWithChildren<
  ArkDomProps<
    ArkNavStyleOptions & {
      /** `value` (ou `href`) do item atual; sem ele cada item mantém o próprio `current`. */
      value?: string;
      /** Sidebar recolhida. */
      collapsed?: boolean;
      /** Botão de recolher e o que resta recolhida: true/"rail" (só ícones) ou "hidden" (só o logo e o botão). */
      collapsible?: boolean | ArkNavCollapsible;
      /** Vira aria-label da navegação. */
      label?: string;
      className?: string;
      /** O botão de recolher foi acionado; detail.collapsed é o novo estado, para o app guardar. */
      onCollapse?: (event: CustomEvent<{ collapsed: boolean }>) => void;
      /** Um item foi acionado (sobe dos itens); preventDefault() cancela a navegação do navegador para o app rotear. */
      onNavigate?: (event: CustomEvent<ArkNavNavigateDetail>) => void;
    }
  >
>;

export const ArkNav = forwardRef<ArkNavElement, ArkNavProps>(function ArkNav(props, forwardedRef): React.JSX.Element {
  const { children, className, collapsed, collapsible, localeJson, onCollapse, onNavigate, ...rest } = props;
  const [ref, setRef] = useForwardedRef<ArkNavElement>(forwardedRef);

  useEffect(() => {
    ensureTooarkComponentsRegistered();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleCollapse = (event: Event): void => onCollapse?.(event as CustomEvent<{ collapsed: boolean }>);
    const handleNavigate = (event: Event): void => onNavigate?.(event as CustomEvent<ArkNavNavigateDetail>);
    el.addEventListener("ark-collapse", handleCollapse);
    el.addEventListener("ark-navigate", handleNavigate);
    return () => {
      el.removeEventListener("ark-collapse", handleCollapse);
      el.removeEventListener("ark-navigate", handleNavigate);
    };
  }, [ref, onCollapse, onNavigate]);

  const attrs: Record<string, unknown> = {
    ...domAttrs(rest),
    ref: setRef,
    class: className,
    collapsed: collapsed ? "" : undefined,
    collapsible: collapsible === true ? "" : collapsible || undefined,
    "locale-json": localeJson
  };

  return createElement("ark-nav", attrs, children);
});

export type ArkNavItemProps = PropsWithChildren<
  ArkDomProps<
    ArkNavItemStyleOptions & {
      /** Destino do link; sem ele o item é um botão. */
      href?: string;
      /** `target` do link (`_blank` ganha rel noopener). */
      target?: string;
      /** Texto do item, desenhado pelo componente (oculto no trilho). */
      label?: string;
      /** Identificador em `ark-navigate` e no `value` do ArkNav. Padrão: o `href`. */
      value?: string;
      /** Página atual (`aria-current="page"`). */
      current?: boolean;
      disabled?: boolean;
      /** Linha separadora (role separator). */
      divider?: boolean;
      className?: string;
      /** Este item foi acionado; preventDefault() cancela a navegação do navegador. */
      onNavigate?: (event: CustomEvent<ArkNavNavigateDetail>) => void;
    }
  >
>;

export const ArkNavItem = forwardRef<ArkNavItemElement, ArkNavItemProps>(
  function ArkNavItem(props, forwardedRef): React.JSX.Element {
    const { children, className, current, disabled, divider, onNavigate, ...rest } = props;
    const [ref, setRef] = useForwardedRef<ArkNavItemElement>(forwardedRef);

    useEffect(() => {
      ensureTooarkComponentsRegistered();
    }, []);

    useEffect(() => {
      const el = ref.current;
      if (!el) return;

      const handleNavigate = (event: Event): void => onNavigate?.(event as CustomEvent<ArkNavNavigateDetail>);
      el.addEventListener("ark-navigate", handleNavigate);
      return () => el.removeEventListener("ark-navigate", handleNavigate);
    }, [ref, onNavigate]);

    const attrs: Record<string, unknown> = {
      ...domAttrs(rest),
      ref: setRef,
      class: className,
      current: current ? "" : undefined,
      disabled: disabled ? "" : undefined,
      divider: divider ? "" : undefined
    };

    return createElement("ark-nav-item", attrs, children);
  }
);

export type ArkNavGroupProps = PropsWithChildren<
  ArkDomProps<
    ArkNavGroupStyleOptions & {
      /** Texto do cabeçalho e nome do grupo. */
      label?: string;
      /** O cabeçalho é um botão que abre e fecha os itens. */
      expandable?: boolean;
      /** Itens à mostra (com `expandable`). */
      open?: boolean;
      className?: string;
      /** O cabeçalho expansível foi acionado; detail.open é o novo estado. */
      onToggle?: (event: CustomEvent<{ open: boolean }>) => void;
    }
  >
>;

export const ArkNavGroup = forwardRef<ArkNavGroupElement, ArkNavGroupProps>(
  function ArkNavGroup(props, forwardedRef): React.JSX.Element {
    const { children, className, expandable, open, onToggle, ...rest } = props;
    const [ref, setRef] = useForwardedRef<ArkNavGroupElement>(forwardedRef);

    useEffect(() => {
      ensureTooarkComponentsRegistered();
    }, []);

    useEffect(() => {
      const el = ref.current;
      if (!el) return;

      const handleToggle = (event: Event): void => onToggle?.(event as CustomEvent<{ open: boolean }>);
      el.addEventListener("ark-toggle", handleToggle);
      return () => el.removeEventListener("ark-toggle", handleToggle);
    }, [ref, onToggle]);

    const attrs: Record<string, unknown> = {
      ...domAttrs(rest),
      ref: setRef,
      class: className,
      expandable: expandable ? "" : undefined,
      open: open ? "" : undefined
    };

    return createElement("ark-nav-group", attrs, children);
  }
);
