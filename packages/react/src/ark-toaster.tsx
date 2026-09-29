import type { ArkToasterStyleOptions } from "@tooark/core";
import type { ArkToaster as ArkToasterElement } from "@tooark/web-components";
import type React from "react";
import { createElement, forwardRef, useEffect } from "react";
import { ensureTooarkComponentsRegistered } from "./register.js";
import { useForwardedRef } from "./use-forwarded-ref.js";

export type ArkToasterProps = ArkToasterStyleOptions & {
  className?: string;
  /** Botão de ação de um toast: detail traz o id do toast e o actionId das opções. */
  onAction?: (event: CustomEvent<{ id: string; actionId: string | null }>) => void;
};

export const ArkToaster = forwardRef<ArkToasterElement, ArkToasterProps>(
  function ArkToaster(props, forwardedRef): React.JSX.Element {
    const { position, richColors, closeButton, maxVisible, className, onAction, ...rest } = props;
    const [ref, setRef] = useForwardedRef<ArkToasterElement>(forwardedRef);

    useEffect(() => {
      ensureTooarkComponentsRegistered();
    }, []);

    useEffect(() => {
      const el = ref.current;
      if (!el || !onAction) return;
      const handler = (event: Event): void => onAction(event as CustomEvent<{ id: string; actionId: string | null }>);
      el.addEventListener("ark-toast-action", handler);
      return () => el.removeEventListener("ark-toast-action", handler);
    }, [ref, onAction]);

    // O rest leva theme, duration, lang, testid e o que mais vier (data-*, aria-*) ao elemento.
    const attrs: Record<string, unknown> = {
      ...rest,
      ref: setRef,
      position,
      "max-visible": maxVisible,
      class: className,
      "rich-colors": richColors ? true : undefined,
      "close-button": closeButton === undefined ? undefined : closeButton ? true : "false"
    };

    return createElement("ark-toaster", attrs);
  }
);
