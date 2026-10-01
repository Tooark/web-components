import type { ArkEmptyStyleOptions } from "@tooark/core";
import type { ArkEmpty as ArkEmptyElement } from "@tooark/web-components";
import React, { createElement, forwardRef, type PropsWithChildren, useEffect } from "react";
import type { ArkDomProps } from "./dom-props.js";
import { ensureTooarkComponentsRegistered } from "./register.js";

export type ArkEmptyProps = PropsWithChildren<
  ArkDomProps<
    ArkEmptyStyleOptions & {
      /** Titulo (h3). */
      heading?: string;
      /** Texto abaixo do titulo. */
      description?: string;
      className?: string;
    }
  >
>;

export const ArkEmpty = forwardRef<ArkEmptyElement, ArkEmptyProps>(
  function ArkEmpty(props, forwardedRef): React.JSX.Element {
    const { children, className, ...rest } = props;

    useEffect(() => {
      ensureTooarkComponentsRegistered();
    }, []);

    const attrs: Record<string, unknown> = {
      ...rest,
      ref: forwardedRef,
      class: className
    };

    return createElement("ark-empty", attrs, children);
  }
);
