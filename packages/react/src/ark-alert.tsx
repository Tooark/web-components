import type { ArkAlertStyleOptions } from "@tooark/core";
import type { ArkAlert as ArkAlertElement } from "@tooark/web-components";
import React, { createElement, forwardRef, type PropsWithChildren, useEffect } from "react";
import type { ArkDomProps } from "./dom-props.js";
import { ensureTooarkComponentsRegistered } from "./register.js";
import { useForwardedRef } from "./use-forwarded-ref.js";

export type ArkAlertProps = PropsWithChildren<
  ArkDomProps<
    ArkAlertStyleOptions & {
      /** Titulo proprio no inicio do alerta. */
      heading?: string;
      /** Botao de dispensar (rotulo por lang/localeJson). */
      dismissible?: boolean;
      className?: string;
      /** Depois da saida animada: o host ganha `hidden`; desmontar e do app. */
      onDismiss?: (event: CustomEvent) => void;
    }
  >
>;

export const ArkAlert = forwardRef<ArkAlertElement, ArkAlertProps>(
  function ArkAlert(props, forwardedRef): React.JSX.Element {
    const { children, className, localeJson, dismissible, onDismiss, ...rest } = props;
    const [ref, setRef] = useForwardedRef<ArkAlertElement>(forwardedRef);

    useEffect(() => {
      ensureTooarkComponentsRegistered();
    }, []);

    useEffect(() => {
      const el = ref.current;
      if (!el || !onDismiss) return;

      const handler = (event: Event) => onDismiss(event as CustomEvent);
      el.addEventListener("ark-dismiss", handler);
      return () => el.removeEventListener("ark-dismiss", handler);
    }, [ref, onDismiss]);

    const attrs: Record<string, unknown> = {
      ...rest,
      ref: setRef,
      class: className,
      dismissible: dismissible ? "" : undefined,
      "locale-json": localeJson
    };

    return createElement("ark-alert", attrs, children);
  }
);
