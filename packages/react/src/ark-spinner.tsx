import type { ArkSpinnerStyleOptions } from "@tooark/core";
import type { ArkSpinner as ArkSpinnerElement } from "@tooark/web-components";
import type React from "react";
import { createElement, forwardRef, useEffect } from "react";
import { type ArkDomProps, domAttrs } from "./dom-props.js";
import { ensureTooarkComponentsRegistered } from "./register.js";

export type ArkSpinnerProps = ArkDomProps<
  ArkSpinnerStyleOptions & {
    /** Rótulo só para leitores de tela. Padrão: a string `loading` do idioma. */
    label?: string;
    className?: string;
  }
>;

export const ArkSpinner = forwardRef<ArkSpinnerElement, ArkSpinnerProps>(
  function ArkSpinner(props, forwardedRef): React.JSX.Element {
    const { className, localeJson, ...rest } = props;

    useEffect(() => {
      ensureTooarkComponentsRegistered();
    }, []);

    const attrs: Record<string, unknown> = {
      ...domAttrs(rest),
      ref: forwardedRef,
      class: className,
      "locale-json": localeJson
    };

    return createElement("ark-spinner", attrs);
  }
);
