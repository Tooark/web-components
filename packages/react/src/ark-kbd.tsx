import type { ArkKbdStyleOptions } from "@tooark/core";
import type React from "react";
import { createElement, type PropsWithChildren, useEffect } from "react";
import { ensureTooarkComponentsRegistered } from "./register";

export type ArkKbdProps = PropsWithChildren<
  ArkKbdStyleOptions & {
    className?: string;
  }
>;

export function ArkKbd(props: ArkKbdProps): React.JSX.Element {
  const { children, className, ...rest } = props;

  useEffect(() => {
    ensureTooarkComponentsRegistered();
  }, []);

  const attrs: Record<string, string | undefined> = {
    ...rest,
    class: className
  };

  return createElement("ark-kbd", attrs, children);
}
