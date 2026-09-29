import type { ArkBadgeStyleOptions } from "@tooark/core";
import type { ArkBadge as ArkBadgeElement } from "@tooark/web-components";
import React, { createElement, forwardRef, type PropsWithChildren, useEffect } from "react";
import { ensureTooarkComponentsRegistered } from "./register.js";

export type ArkBadgeProps = PropsWithChildren<
  ArkBadgeStyleOptions & {
    className?: string;
  }
>;

export const ArkBadge = forwardRef<ArkBadgeElement, ArkBadgeProps>(
  function ArkBadge(props, forwardedRef): React.JSX.Element {
    const { children, className, ...rest } = props;

    useEffect(() => {
      ensureTooarkComponentsRegistered();
    }, []);

    const attrs: Record<string, string | undefined | React.Ref<ArkBadgeElement>> = {
      ...rest,
      ref: forwardedRef,
      class: className
    };

    return createElement("ark-badge", attrs, children);
  }
);
