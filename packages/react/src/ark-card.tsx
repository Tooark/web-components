import type { ArkCardStyleOptions } from "@tooark/core";
import type { ArkCard as ArkCardElement } from "@tooark/web-components";
import React, { createElement, forwardRef, type PropsWithChildren, useEffect } from "react";
import type { ArkDomProps } from "./dom-props.js";
import { ensureTooarkComponentsRegistered } from "./register.js";

export type ArkCardProps = PropsWithChildren<
  ArkDomProps<
    ArkCardStyleOptions & {
      /** Título (h2) na linha de cima; com ele o filho slot="header" vira a linha seguinte do cabeçalho. */
      heading?: string;
      className?: string;
    }
  >
>;

export const ArkCard = forwardRef<ArkCardElement, ArkCardProps>(
  function ArkCard(props, forwardedRef): React.JSX.Element {
    const { children, className, headingLevel, ...rest } = props;

    useEffect(() => {
      ensureTooarkComponentsRegistered();
    }, []);

    const attrs: Record<string, unknown> = {
      ...rest,
      ref: forwardedRef,
      class: className,
      "heading-level": headingLevel
    };

    return createElement("ark-card", attrs, children);
  }
);
