import type { ArkBadgeStyleOptions } from "@tooark/core";
import React, { createElement, type PropsWithChildren, useEffect } from "react";
import { ensureTooarkComponentsRegistered } from "./register.js";

export type ArkBadgeProps = PropsWithChildren<
  ArkBadgeStyleOptions & {
    className?: string;
  }
>;

export function ArkBadge(props: ArkBadgeProps): React.JSX.Element {
  const { children, className, ...rest } = props;

  useEffect(() => {
    ensureTooarkComponentsRegistered();
  }, []);

  const attrs: Record<string, string | undefined> = {
    ...rest,
    class: className
  };

  return createElement("ark-badge", attrs, children);
}
