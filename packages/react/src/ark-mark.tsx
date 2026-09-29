import type { ArkMarkStyleOptions } from "@tooark/core";
import type { ArkMark as ArkMarkElement } from "@tooark/web-components";
import type React from "react";
import { createElement, forwardRef, useEffect } from "react";
import { ensureTooarkComponentsRegistered } from "./register.js";

export type ArkMarkProps = ArkMarkStyleOptions & {
  /** Com rotulo a marca vira role="img" nomeado; sem ele e decorativa (aria-hidden). */
  label?: string;
  className?: string;
};

export const ArkMark = forwardRef<ArkMarkElement, ArkMarkProps>(
  function ArkMark(props, forwardedRef): React.JSX.Element {
    const { className, size, ...rest } = props;

    useEffect(() => {
      ensureTooarkComponentsRegistered();
    }, []);

    const attrs: Record<string, string | undefined | React.Ref<ArkMarkElement>> = {
      ...rest,
      ref: forwardedRef,
      class: className,
      size: size === undefined ? undefined : String(size)
    };

    return createElement("ark-mark", attrs);
  }
);
