import type { ArkAlertStyleOptions } from "@tooark/core";
import React, { createElement, type PropsWithChildren, useEffect } from "react";
import { ensureTooarkComponentsRegistered } from "./register.js";

export type ArkAlertProps = PropsWithChildren<
  ArkAlertStyleOptions & {
    /** Titulo proprio no inicio do alerta. */
    heading?: string;
    /** Botao de dispensar (rotulo por lang/localeJson). */
    dismissible?: boolean;
    className?: string;
    /** Depois da saida animada: o host ganha `hidden`; desmontar e do app. */
    onDismiss?: (event: CustomEvent) => void;
  }
>;

export function ArkAlert(props: ArkAlertProps): React.JSX.Element {
  const { children, className, localeJson, dismissible, onDismiss, ...rest } = props;
  const ref = React.useRef<HTMLElement>(null);

  useEffect(() => {
    ensureTooarkComponentsRegistered();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || !onDismiss) return;

    const handler = (event: Event) => onDismiss(event as CustomEvent);
    el.addEventListener("ark-dismiss", handler);
    return () => el.removeEventListener("ark-dismiss", handler);
  }, [onDismiss]);

  const attrs: Record<string, string | undefined | React.Ref<HTMLElement>> = {
    ...rest,
    ref,
    class: className,
    dismissible: dismissible ? "" : undefined,
    "locale-json": localeJson
  };

  return createElement("ark-alert", attrs, children);
}
