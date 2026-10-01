import type { ArkProgressStyleOptions } from "@tooark/core";
import type { ArkProgress as ArkProgressElement } from "@tooark/web-components";
import type React from "react";
import { createElement, forwardRef, useEffect } from "react";
import type { ArkDomProps } from "./dom-props.js";
import { ensureTooarkComponentsRegistered } from "./register.js";

export type ArkProgressProps = ArkDomProps<
  ArkProgressStyleOptions & {
    /** Valor atual, de 0 a max. Padrao: 0. */
    value?: number;
    /** Valor maximo. Padrao: 100. */
    max?: number;
    /** Segmento em loop no lugar do valor (loader continuo, isento de movimento reduzido). */
    indeterminate?: boolean;
    /** Nome acessivel (aria-label). */
    label?: string;
    /** Mostra a porcentagem ao lado do trilho. */
    showValue?: boolean;
    className?: string;
  }
>;

export const ArkProgress = forwardRef<ArkProgressElement, ArkProgressProps>(
  function ArkProgress(props, forwardedRef): React.JSX.Element {
    const { className, value, max, indeterminate, showValue, ...rest } = props;

    useEffect(() => {
      ensureTooarkComponentsRegistered();
    }, []);

    const attrs: Record<string, unknown> = {
      ...rest,
      ref: forwardedRef,
      class: className,
      value: value === undefined ? undefined : String(value),
      max: max === undefined ? undefined : String(max),
      indeterminate: indeterminate ? "" : undefined,
      "show-value": showValue ? "" : undefined
    };

    return createElement("ark-progress", attrs);
  }
);
