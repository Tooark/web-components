import type { ArkCardStyleOptions } from "@tooark/core";
import React, { createElement, type PropsWithChildren, useEffect } from "react";
import { ensureTooarkComponentsRegistered } from "./register";

export type ArkCardProps = PropsWithChildren<
  ArkCardStyleOptions & {
    /** Titulo (h2) na linha de cima; com ele o filho slot="header" vira a linha seguinte do cabecalho. */
    heading?: string;
    className?: string;
  }
>;

export function ArkCard(props: ArkCardProps): React.JSX.Element {
  const { children, className, ...rest } = props;

  useEffect(() => {
    ensureTooarkComponentsRegistered();
  }, []);

  const attrs: Record<string, string | undefined> = {
    ...rest,
    class: className
  };

  return createElement("ark-card", attrs, children);
}
