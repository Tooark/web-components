import type { ArkButtonStyleOptions, ArkButtonType } from "@tooark/core";
import type { ArkButton as ArkButtonElement } from "@tooark/web-components";
import type React from "react";
import { createElement, forwardRef, type PropsWithChildren, useEffect } from "react";
import { ensureTooarkComponentsRegistered } from "./register.js";

/** Props do ArkButton: opções de estilo mais os atributos e handlers DOM do React (onClick, onFocus, id, style...). */
export type ArkButtonProps = PropsWithChildren<
  ArkButtonStyleOptions &
    Omit<React.HTMLAttributes<HTMLElement>, keyof ArkButtonStyleOptions | "children"> & {
      type?: ArkButtonType;
      disabled?: boolean;
    }
>;

export const ArkButton = forwardRef<ArkButtonElement, ArkButtonProps>(
  function ArkButton(props, forwardedRef): React.JSX.Element {
    const { children, className, textColor, loading, statusLabel, iconOnly, fullWidth, disabled, ...rest } = props;

    useEffect(() => {
      ensureTooarkComponentsRegistered();
    }, []);

    // Handlers (onClick...) seguem no rest: o React os delega a partir da raiz, e o bloqueio
    // de disabled/loading do host (captura + stopImmediatePropagation) impede que disparem.
    const attrs: Record<string, unknown> = {
      ...rest,
      ref: forwardedRef,
      class: className,
      "text-color": textColor,
      disabled: disabled ? "" : undefined,
      loading: loading ? "" : undefined,
      "status-label": statusLabel,
      "icon-only": iconOnly ? "" : undefined,
      "full-width": fullWidth ? "" : undefined
    };

    return createElement("ark-button", attrs, children);
  }
);
