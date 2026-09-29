import type { ArkCardStyleOptions } from "@tooark/core";
import type { ArkCard as ArkCardElement } from "@tooark/web-components";
import React, { createElement, forwardRef, type PropsWithChildren, useEffect } from "react";
import { ensureTooarkComponentsRegistered } from "./register.js";

export type ArkCardProps = PropsWithChildren<
  ArkCardStyleOptions & {
    /** Titulo (h2) na linha de cima; com ele o filho slot="header" vira a linha seguinte do cabecalho. */
    heading?: string;
    className?: string;
  }
>;

export const ArkCard = forwardRef<ArkCardElement, ArkCardProps>(
  function ArkCard(props, forwardedRef): React.JSX.Element {
    const { children, className, ...rest } = props;

    useEffect(() => {
      ensureTooarkComponentsRegistered();
    }, []);

    const attrs: Record<string, string | undefined | React.Ref<ArkCardElement>> = {
      ...rest,
      ref: forwardedRef,
      class: className
    };

    return createElement("ark-card", attrs, children);
  }
);
