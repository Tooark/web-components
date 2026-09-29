import type { ArkSkeletonStyleOptions } from "@tooark/core";
import type { ArkSkeleton as ArkSkeletonElement } from "@tooark/web-components";
import React, { createElement, forwardRef, type PropsWithChildren, useEffect } from "react";
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

export const ArkSkeleton = forwardRef<ArkSkeletonElement, ArkSkeletonProps>(
  function ArkSkeleton(props, forwardedRef): React.JSX.Element {
    const { children, className, rows, animated, ...rest } = props;

    useEffect(() => {
      ensureTooarkComponentsRegistered();
    }, []);

    const attrs: Record<string, string | undefined | React.CSSProperties | React.Ref<ArkSkeletonElement>> = {
      ...rest,
      ref: forwardedRef,
      class: className,
      rows: rows === undefined ? undefined : String(rows),
      animated: animated ? "" : undefined
    };

    return createElement("ark-skeleton", attrs, children);
  }
);
