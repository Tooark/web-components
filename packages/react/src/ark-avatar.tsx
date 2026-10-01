import type { ArkAvatarStyleOptions } from "@tooark/core";
import type { ArkAvatar as ArkAvatarElement } from "@tooark/web-components";
import type React from "react";
import { createElement, forwardRef, useEffect } from "react";
import type { ArkDomProps } from "./dom-props.js";
import { ensureTooarkComponentsRegistered } from "./register.js";

export type ArkAvatarProps = ArkDomProps<
  ArkAvatarStyleOptions & {
    /** Nome da pessoa: vira aria-label e as iniciais (primeira letra, ou primeira + ultima com sobrenome). */
    name?: string;
    /** Imagem; em erro de carga caem as iniciais. */
    src?: string;
    className?: string;
  }
>;

export const ArkAvatar = forwardRef<ArkAvatarElement, ArkAvatarProps>(
  function ArkAvatar(props, forwardedRef): React.JSX.Element {
    const { className, ...rest } = props;

    useEffect(() => {
      ensureTooarkComponentsRegistered();
    }, []);

    const attrs: Record<string, unknown> = {
      ...rest,
      ref: forwardedRef,
      class: className
    };

    return createElement("ark-avatar", attrs);
  }
);
