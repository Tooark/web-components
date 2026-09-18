import type { ArkStatusDotStyleOptions } from "@tooark/core";
import type React from "react";
import { createElement, useEffect } from "react";
import { ensureTooarkComponentsRegistered } from "./register";

export type ArkStatusDotProps = ArkStatusDotStyleOptions & {
  /** Com rotulo o ponto vira role="img" nomeado; sem ele e decorativo (aria-hidden). */
  label?: string;
  className?: string;
};

export function ArkStatusDot(props: ArkStatusDotProps): React.JSX.Element {
  const { className, ...rest } = props;

  useEffect(() => {
    ensureTooarkComponentsRegistered();
  }, []);

  const attrs: Record<string, string | undefined> = {
    ...rest,
    class: className
  };

  return createElement("ark-status-dot", attrs);
}
