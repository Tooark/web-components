import type { ArkStatusDotStyleOptions } from "@tooark/core";
import type { ArkStatusDot as ArkStatusDotElement } from "@tooark/web-components";
import type React from "react";
import { createElement, forwardRef, useEffect } from "react";
import type { ArkDomProps } from "./dom-props.js";
import { ensureTooarkComponentsRegistered } from "./register.js";

export type ArkStatusDotProps = ArkDomProps<
  ArkStatusDotStyleOptions & {
    /** Com rotulo o ponto vira role="img" nomeado; sem ele e decorativo (aria-hidden). */
    label?: string;
    className?: string;
  }
>;

export const ArkStatusDot = forwardRef<ArkStatusDotElement, ArkStatusDotProps>(
  function ArkStatusDot(props, forwardedRef): React.JSX.Element {
    const { className, ...rest } = props;

    useEffect(() => {
      ensureTooarkComponentsRegistered();
    }, []);

    const attrs: Record<string, unknown> = {
      ...rest,
      ref: forwardedRef,
      class: className
    };

    return createElement("ark-status-dot", attrs);
  }
);
