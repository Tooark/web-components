import type { ArkToasterStyleOptions } from "@tooark/core";
import type React from "react";
import { createElement, useEffect } from "react";
import { ensureTooarkComponentsRegistered } from "./register.js";

export type ArkToasterProps = ArkToasterStyleOptions & {
  className?: string;
};

export function ArkToaster(props: ArkToasterProps): React.JSX.Element {
  const { theme, position, richColors, closeButton, maxVisible, duration, className, testid } = props;

  useEffect(() => {
    ensureTooarkComponentsRegistered();
  }, []);

  const attrs: Record<string, string | number | boolean | undefined> = {
    theme,
    position,
    "max-visible": maxVisible,
    duration,
    testid,
    class: className,
    "rich-colors": richColors ? true : undefined,
    "close-button": closeButton === undefined ? undefined : closeButton ? true : "false"
  };

  return createElement("ark-toaster", attrs);
}
