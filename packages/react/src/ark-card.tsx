import type { ArkCardStyleOptions } from "@tooark/core";
import type { ArkCard as ArkCardElement } from "@tooark/web-components";
import React, { createElement, forwardRef, type PropsWithChildren, useEffect } from "react";
import { type ArkDomProps, domAttrs } from "./dom-props.js";
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
    const { children, className, headingLevel, wrapActions, ...rest } = props;

    useEffect(() => {
      ensureTooarkComponentsRegistered();
    }, []);

    const attrs: Record<string, unknown> = {
      ...domAttrs(rest),
      ref: forwardedRef,
      class: className,
      "heading-level": headingLevel,
      "wrap-actions": wrapActions ? "" : undefined
    };

    return createElement("ark-card", attrs, children);
  }
);
