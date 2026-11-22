import type { ArkTreeItemStyleOptions, ArkTreeSelection, ArkTreeStyleOptions } from "@tooark/core";
import type { ArkTree as ArkTreeElement, ArkTreeItem as ArkTreeItemElement } from "@tooark/web-components";
import React, { createElement, forwardRef, type PropsWithChildren, useEffect } from "react";
import type { ArkDomProps } from "./dom-props.js";
import { ensureTooarkComponentsRegistered } from "./register.js";
import { useForwardedRef } from "./use-forwarded-ref.js";
import { useIsomorphicLayoutEffect } from "./use-isomorphic-layout-effect.js";

/** `detail` do `ark-toggle`: o item expandido ou recolhido. */
export type ArkTreeToggleDetail = { value: string; expanded: boolean; item: ArkTreeItemElement };
/** `detail` do `ark-selection-change`: os valores escolhidos (`value` em `single`). */
export type ArkTreeSelectionDetail = { values: string[]; value?: string | null };
/** `detail` do `ark-activate`: o item ativado (Enter ou clique na linha). */
export type ArkTreeActivateDetail = { value: string; item: ArkTreeItemElement };

export type ArkTreeProps = PropsWithChildren<
  ArkDomProps<
    ArkTreeStyleOptions & {
      /** none (só navega, expande e ativa), single ou multiple. Padrão: "none". */
      selection?: ArkTreeSelection;
      /** Com `multiple`: uma caixa por nó. */
      checkboxes?: boolean;
      /** Com `checkboxes`: marcar um pai marca os descendentes, e o pai fica mixed com parte marcada. */
      propagate?: boolean;
      /** Valores selecionados: um em `single`, a lista em `multiple`. */
      value?: string | string[];
      /** Nome da árvore (vira `aria-label`). */
      label?: string;
      className?: string;
      onToggle?: (event: CustomEvent<ArkTreeToggleDetail>) => void;
      onSelectionChange?: (event: CustomEvent<ArkTreeSelectionDetail>) => void;
      onActivate?: (event: CustomEvent<ArkTreeActivateDetail>) => void;
    }
  >
>;

export const ArkTree = forwardRef<ArkTreeElement, ArkTreeProps>(
  function ArkTree(props, forwardedRef): React.JSX.Element {
    const { children, className, checkboxes, propagate, value, onToggle, onSelectionChange, onActivate, ...rest } =
      props;
    const [ref, setRef] = useForwardedRef<ArkTreeElement>(forwardedRef);

    useEffect(() => {
      ensureTooarkComponentsRegistered();
    }, []);

    useIsomorphicLayoutEffect(() => {
      const el = ref.current;
      if (!el) return;
      const handleToggle = (event: Event): void => onToggle?.(event as CustomEvent<ArkTreeToggleDetail>);
      const handleSelection = (event: Event): void => onSelectionChange?.(event as CustomEvent<ArkTreeSelectionDetail>);
      const handleActivate = (event: Event): void => onActivate?.(event as CustomEvent<ArkTreeActivateDetail>);
      el.addEventListener("ark-toggle", handleToggle);
      el.addEventListener("ark-selection-change", handleSelection);
      el.addEventListener("ark-activate", handleActivate);
      return () => {
        el.removeEventListener("ark-toggle", handleToggle);
        el.removeEventListener("ark-selection-change", handleSelection);
        el.removeEventListener("ark-activate", handleActivate);
      };
    }, [ref, onToggle, onSelectionChange, onActivate]);

    const attrs: Record<string, unknown> = {
      ...rest,
      ref: setRef,
      class: className,
      checkboxes: checkboxes ? "" : undefined,
      propagate: propagate ? "" : undefined,
      value: Array.isArray(value) ? (value.length ? JSON.stringify(value) : undefined) : value || undefined
    };

    return createElement("ark-tree", attrs, children);
  }
);

export type ArkTreeItemProps = PropsWithChildren<
  ArkDomProps<
    ArkTreeItemStyleOptions & {
      value?: string;
      /** Texto do nó (também usado na busca por digitação). */
      label?: string;
      expanded?: boolean;
      /** Mostra o chevron sem filhos: carregue os filhos no `onToggle` com `expanded: true`. */
      lazy?: boolean;
      /** Spinner no lugar do chevron enquanto os filhos carregam. */
      loading?: boolean;
      selected?: boolean;
      /** Caixa com `checkboxes`: true, false ou "mixed". */
      checked?: boolean | "mixed";
      disabled?: boolean;
      className?: string;
    }
  >
>;

export const ArkTreeItem = forwardRef<ArkTreeItemElement, ArkTreeItemProps>(
  function ArkTreeItem(props, forwardedRef): React.JSX.Element {
    const { children, className, expanded, lazy, loading, selected, checked, disabled, ...rest } = props;

    useEffect(() => {
      ensureTooarkComponentsRegistered();
    }, []);

    const attrs: Record<string, unknown> = {
      ...rest,
      ref: forwardedRef,
      class: className,
      expanded: expanded ? "" : undefined,
      lazy: lazy ? "" : undefined,
      loading: loading ? "" : undefined,
      selected: selected ? "" : undefined,
      checked: checked === "mixed" ? "mixed" : checked ? "" : undefined,
      disabled: disabled ? "" : undefined
    };

    return createElement("ark-tree-item", attrs, children);
  }
);
