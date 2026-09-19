import type { ArkTabStyleOptions, ArkTabsStyleOptions } from "@tooark/core";
import React, { createElement, type PropsWithChildren, useEffect } from "react";
import { ensureTooarkComponentsRegistered } from "./register.js";

export type ArkTabsProps = PropsWithChildren<
  ArkTabsStyleOptions & {
    /** Value da aba ativa; sem ele a primeira habilitada assume. */
    value?: string;
    /** Vira aria-label da faixa. */
    label?: string;
    className?: string;
    onChange?: (event: CustomEvent<{ value: string }>) => void;
    /** Uma aba fechavel pediu para fechar; remover a aba e do app. */
    onClose?: (event: CustomEvent<{ value: string }>) => void;
  }
>;

export function ArkTabs(props: ArkTabsProps): React.JSX.Element {
  const { children, className, localeJson, onChange, onClose, ...rest } = props;
  const ref = React.useRef<HTMLElement>(null);

  useEffect(() => {
    ensureTooarkComponentsRegistered();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleChange = (event: Event): void => onChange?.(event as CustomEvent<{ value: string }>);
    const handleClose = (event: Event): void => onClose?.(event as CustomEvent<{ value: string }>);
    el.addEventListener("change", handleChange);
    el.addEventListener("ark-close", handleClose);
    return () => {
      el.removeEventListener("change", handleChange);
      el.removeEventListener("ark-close", handleClose);
    };
  }, [onChange, onClose]);

  const attrs: Record<string, string | undefined | React.Ref<HTMLElement>> = {
    ...rest,
    ref,
    class: className,
    "locale-json": localeJson
  };

  return createElement("ark-tabs", attrs, children);
}

export type ArkTabProps = PropsWithChildren<
  ArkTabStyleOptions & {
    value: string;
    disabled?: boolean;
    /** id do painel que a aba controla (aria-controls). */
    controls?: string;
    /** Botao de fechar, clique do meio e Delete (so na variante editor). */
    closable?: boolean;
    /** Ponto de alteracoes nao salvas. */
    dirty?: boolean;
    className?: string;
  }
>;

export function ArkTab(props: ArkTabProps): React.JSX.Element {
  const { children, className, disabled, closable, dirty, ...rest } = props;

  useEffect(() => {
    ensureTooarkComponentsRegistered();
  }, []);

  const attrs: Record<string, string | undefined> = {
    ...rest,
    class: className,
    disabled: disabled ? "" : undefined,
    closable: closable ? "" : undefined,
    dirty: dirty ? "" : undefined
  };

  return createElement("ark-tab", attrs, children);
}
