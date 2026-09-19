import type { ArkSkeletonStyleOptions } from "@tooark/core";
import React, { createElement, type PropsWithChildren, useEffect } from "react";
import { ensureTooarkComponentsRegistered } from "./register.js";

export type ArkSkeletonProps = PropsWithChildren<
  ArkSkeletonStyleOptions & {
    /** Numero de barras; acima de 1 troca o bloco por barras em coluna. Padrao: 1. */
    rows?: number;
    /** Liga o brilho que varre (opt-in; para sob movimento reduzido). */
    animated?: boolean;
    className?: string;
    style?: React.CSSProperties;
  }
>;

export function ArkSkeleton(props: ArkSkeletonProps): React.JSX.Element {
  const { children, className, rows, animated, ...rest } = props;

  useEffect(() => {
    ensureTooarkComponentsRegistered();
  }, []);

  const attrs: Record<string, string | undefined | React.CSSProperties> = {
    ...rest,
    class: className,
    rows: rows === undefined ? undefined : String(rows),
    animated: animated ? "" : undefined
  };

  return createElement("ark-skeleton", attrs, children);
}
