import type { ArkSpinnerStyleOptions } from "@tooark/core";
import type { ArkSpinner as ArkSpinnerElement } from "@tooark/web-components";
import type React from "react";
import { createElement, forwardRef, useEffect } from "react";
import type { ArkDomProps } from "./dom-props.js";
import { ensureTooarkComponentsRegistered } from "./register.js";

export type ArkSpinnerProps = ArkDomProps<
  ArkSpinnerStyleOptions & {
    /** Rotulo so para leitores de tela. Padrao: a string `loading` do idioma. */
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
      ...rest,
      ref: forwardedRef,
      class: className,
      "locale-json": localeJson
    };

    return createElement("ark-spinner", attrs);
  }
);
