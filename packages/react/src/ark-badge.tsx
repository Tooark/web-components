import type { ArkBadgeStyleOptions } from "@tooark/core";
import type { ArkBadge as ArkBadgeElement } from "@tooark/web-components";
import React, { createElement, forwardRef, type PropsWithChildren, useEffect } from "react";
import type { ArkDomProps } from "./dom-props.js";
import { ensureTooarkComponentsRegistered } from "./register.js";

export type ArkBadgeProps = PropsWithChildren<
  ArkDomProps<
    ArkBadgeStyleOptions & {
      className?: string;
    }
  >
>;

export const ArkBadge = forwardRef<ArkBadgeElement, ArkBadgeProps>(
  function ArkBadge(props, forwardedRef): React.JSX.Element {
    const { children, className, ...rest } = props;

    useEffect(() => {
      ensureTooarkComponentsRegistered();
    }, []);

    const attrs: Record<string, unknown> = {
      ...rest,
      ref: forwardedRef,
      class: className
    };

    return createElement("ark-badge", attrs, children);
  }
);
