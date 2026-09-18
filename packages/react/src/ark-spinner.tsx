import type { ArkSpinnerStyleOptions } from "@tooark/core";
import type React from "react";
import { createElement, useEffect } from "react";
import { ensureTooarkComponentsRegistered } from "./register";

export type ArkSpinnerProps = ArkSpinnerStyleOptions & {
  /** Rotulo so para leitores de tela. Padrao: a string `loading` do idioma. */
  label?: string;
  className?: string;
};

export function ArkSpinner(props: ArkSpinnerProps): React.JSX.Element {
  const { className, localeJson, ...rest } = props;

  useEffect(() => {
    ensureTooarkComponentsRegistered();
  }, []);

  const attrs: Record<string, string | undefined> = {
    ...rest,
    class: className,
    "locale-json": localeJson
  };

  return createElement("ark-spinner", attrs);
}
