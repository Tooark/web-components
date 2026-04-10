import React, { createElement, PropsWithChildren, useEffect } from "react";

import type { ArkButtonStyleOptions, ArkButtonType } from "@tooark/core";
import { ensureTooarkComponentsRegistered } from "./register";

export type ArkButtonProps = PropsWithChildren<
  ArkButtonStyleOptions & {
    type?: ArkButtonType;
    disabled?: boolean;
    className?: string;
  }
>;

export function ArkButton(props: ArkButtonProps): React.JSX.Element {
  const { children, className, textColor, ...rest } = props;

  useEffect(() => {
    ensureTooarkComponentsRegistered();
  }, []);

  const attrs: Record<string, string | boolean | undefined> = {
    ...rest,
    class: className,
    "text-color": textColor,
  };

  return createElement("ark-button", attrs, children);
}
