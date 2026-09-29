import type { ArkKbdStyleOptions } from "@tooark/core";
import type { ArkKbd as ArkKbdElement } from "@tooark/web-components";
import type React from "react";
import { createElement, forwardRef, type PropsWithChildren, useEffect } from "react";
import { ensureTooarkComponentsRegistered } from "./register.js";

export type ArkKbdProps = PropsWithChildren<
  ArkKbdStyleOptions & {
    className?: string;
  }
>;

export const ArkKbd = forwardRef<ArkKbdElement, ArkKbdProps>(function ArkKbd(props, forwardedRef): React.JSX.Element {
  const { children, className, ...rest } = props;

  useEffect(() => {
    ensureTooarkComponentsRegistered();
  }, []);

  const attrs: Record<string, string | undefined | React.Ref<ArkKbdElement>> = {
    ...rest,
    ref: forwardedRef,
    class: className
  };

  return createElement("ark-kbd", attrs, children);
});
