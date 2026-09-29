import type { ArkTabStyleOptions, ArkTabsStyleOptions } from "@tooark/core";
import type { ArkTab as ArkTabElement, ArkTabs as ArkTabsElement } from "@tooark/web-components";
import React, { createElement, forwardRef, type PropsWithChildren, useEffect } from "react";
import { ensureTooarkComponentsRegistered } from "./register.js";
import { useForwardedRef } from "./use-forwarded-ref.js";

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

export const ArkTabs = forwardRef<ArkTabsElement, ArkTabsProps>(
  function ArkTabs(props, forwardedRef): React.JSX.Element {
    const { children, className, localeJson, onChange, onClose, ...rest } = props;
    const [ref, setRef] = useForwardedRef<ArkTabsElement>(forwardedRef);

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
    }, [ref, onChange, onClose]);

    const attrs: Record<string, string | undefined | React.Ref<ArkTabsElement>> = {
      ...rest,
      ref: setRef,
      class: className,
      "locale-json": localeJson
    };

    return createElement("ark-tabs", attrs, children);
  }
);

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

export const ArkTab = forwardRef<ArkTabElement, ArkTabProps>(function ArkTab(props, forwardedRef): React.JSX.Element {
  const { children, className, disabled, closable, dirty, ...rest } = props;

  useEffect(() => {
    ensureTooarkComponentsRegistered();
  }, []);

  const attrs: Record<string, string | undefined | React.Ref<ArkTabElement>> = {
    ...rest,
    ref: forwardedRef,
    class: className,
    disabled: disabled ? "" : undefined,
    closable: closable ? "" : undefined,
    dirty: dirty ? "" : undefined
  };

  return createElement("ark-tab", attrs, children);
});
