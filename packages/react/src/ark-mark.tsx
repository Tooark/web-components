import type { ArkMarkStyleOptions } from "@tooark/core";
import type React from "react";
import { createElement, useEffect } from "react";
import { ensureTooarkComponentsRegistered } from "./register.js";

export type ArkMarkProps = ArkMarkStyleOptions & {
  /** Com rotulo a marca vira role="img" nomeado; sem ele e decorativa (aria-hidden). */
  label?: string;
  className?: string;
};

export function ArkMark(props: ArkMarkProps): React.JSX.Element {
  const { className, size, ...rest } = props;

  useEffect(() => {
    ensureTooarkComponentsRegistered();
  }, []);

  const attrs: Record<string, string | undefined> = {
    ...rest,
    class: className,
    size: size === undefined ? undefined : String(size)
  };

  return createElement("ark-mark", attrs);
}
