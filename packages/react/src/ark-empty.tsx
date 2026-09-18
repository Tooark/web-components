import type { ArkEmptyStyleOptions } from "@tooark/core";
import React, { createElement, type PropsWithChildren, useEffect } from "react";
import { ensureTooarkComponentsRegistered } from "./register";

export type ArkEmptyProps = PropsWithChildren<
  ArkEmptyStyleOptions & {
    /** Titulo (h3). */
    heading?: string;
    /** Texto abaixo do titulo. */
    description?: string;
    className?: string;
  }
>;

export function ArkEmpty(props: ArkEmptyProps): React.JSX.Element {
  const { children, className, ...rest } = props;

  useEffect(() => {
    ensureTooarkComponentsRegistered();
  }, []);

  const attrs: Record<string, string | undefined> = {
    ...rest,
    class: className
  };

  return createElement("ark-empty", attrs, children);
}
