import type { ArkSpinnerStyleOptions } from "@tooark/core";
import type { ArkSpinner as ArkSpinnerElement } from "@tooark/web-components";
import type React from "react";
import { createElement, forwardRef, useEffect } from "react";
import { ensureTooarkComponentsRegistered } from "./register.js";

export type ArkSpinnerProps = ArkSpinnerStyleOptions & {
  /** Rotulo so para leitores de tela. Padrao: a string `loading` do idioma. */
  label?: string;
  className?: string;
};

export const ArkSpinner = forwardRef<ArkSpinnerElement, ArkSpinnerProps>(
  function ArkSpinner(props, forwardedRef): React.JSX.Element {
    const { className, localeJson, ...rest } = props;

    useEffect(() => {
      ensureTooarkComponentsRegistered();
    }, []);

    const attrs: Record<string, string | undefined | React.Ref<ArkSpinnerElement>> = {
      ...rest,
      ref: forwardedRef,
      class: className,
      "locale-json": localeJson
    };

    return createElement("ark-spinner", attrs);
  }
);
