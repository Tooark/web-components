import type { ArkAvatarStyleOptions } from "@tooark/core";
import type React from "react";
import { createElement, useEffect } from "react";
import { ensureTooarkComponentsRegistered } from "./register.js";

export type ArkAvatarProps = ArkAvatarStyleOptions & {
  /** Nome da pessoa: vira aria-label e as iniciais (primeira letra, ou primeira + ultima com sobrenome). */
  name?: string;
  /** Imagem; em erro de carga caem as iniciais. */
  src?: string;
  className?: string;
};

export function ArkAvatar(props: ArkAvatarProps): React.JSX.Element {
  const { className, ...rest } = props;

  useEffect(() => {
    ensureTooarkComponentsRegistered();
  }, []);

  const attrs: Record<string, string | undefined> = {
    ...rest,
    class: className
  };

  return createElement("ark-avatar", attrs);
}
