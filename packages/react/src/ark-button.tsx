import type { ArkButtonNavigateDetail, ArkButtonStyleOptions, ArkButtonType } from "@tooark/core";
import type { ArkButton as ArkButtonElement } from "@tooark/web-components";
import type React from "react";
import { createElement, forwardRef, type PropsWithChildren, useEffect } from "react";
import { type ArkDomProps, domAttrs } from "./dom-props.js";
import { ensureTooarkComponentsRegistered } from "./register.js";
import { useForwardedRef } from "./use-forwarded-ref.js";

/** Props do ArkButton: opções de estilo mais os atributos e handlers DOM do React (onClick, onFocus, id, style...). */
export type ArkButtonProps = PropsWithChildren<
  ArkDomProps<
    ArkButtonStyleOptions & {
      type?: ArkButtonType;
      disabled?: boolean;
      /** Clique simples no link (`href`), cancelável: `event.preventDefault()` e o roteamento da SPA. */
      onNavigate?: (event: CustomEvent<ArkButtonNavigateDetail>) => void;
    }
  >
>;

export const ArkButton = forwardRef<ArkButtonElement, ArkButtonProps>(
  function ArkButton(props, forwardedRef): React.JSX.Element {
    const {
      children,
      className,
      textColor,
      loading,
      statusLabel,
      iconOnly,
      fullWidth,
      disabled,
      download,
      onNavigate,
      ...rest
    } = props;

    useEffect(() => {
      ensureTooarkComponentsRegistered();
    }, []);

    const [ref, setRef] = useForwardedRef<ArkButtonElement>(forwardedRef);

    useEffect(() => {
      const el = ref.current;
      if (!el || !onNavigate) return;
      const handler = (event: Event): void => onNavigate(event as CustomEvent<ArkButtonNavigateDetail>);
      el.addEventListener("ark-navigate", handler);
      return () => el.removeEventListener("ark-navigate", handler);
    }, [ref, onNavigate]);

    // Handlers (onClick...) seguem no rest: o React os delega a partir da raiz, e o bloqueio
    // de disabled/loading do host (captura + stopImmediatePropagation) impede que disparem.
    const attrs: Record<string, unknown> = {
      ...domAttrs(rest),
      ref: setRef,
      class: className,
      "text-color": textColor,
      disabled: disabled ? "" : undefined,
      loading: loading ? "" : undefined,
      "status-label": statusLabel,
      "icon-only": iconOnly ? "" : undefined,
      "full-width": fullWidth ? "" : undefined,
      download: download === true ? "" : download || undefined
    };

    return createElement("ark-button", attrs, children);
  }
);
