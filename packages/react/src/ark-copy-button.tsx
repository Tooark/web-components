import type { ArkCopyButtonStyleOptions } from "@tooark/core";
import type { ArkCopyButton as ArkCopyButtonElement } from "@tooark/web-components";
import type React from "react";
import { createElement, forwardRef, type PropsWithChildren, useEffect } from "react";
import { ensureTooarkComponentsRegistered } from "./register.js";
import { useForwardedRef } from "./use-forwarded-ref.js";

export type ArkCopyButtonProps = PropsWithChildren<
  ArkCopyButtonStyleOptions & {
    /** Texto a copiar. */
    value?: string;
    /** id de um elemento (vira o atributo for): copia o value de inputs/textareas ou o textContent. */
    htmlFor?: string;
    /** Duracao do feedback "copiado" em ms. Padrao: 1500. */
    feedbackMs?: number;
    disabled?: boolean;
    className?: string;
    onCopy?: (event: CustomEvent<{ value: string }>) => void;
  }
>;

export const ArkCopyButton = forwardRef<ArkCopyButtonElement, ArkCopyButtonProps>(
  function ArkCopyButton(props, forwardedRef): React.JSX.Element {
    const {
      children,
      className,
      htmlFor,
      feedbackMs,
      textColor,
      localeJson,
      loading,
      iconOnly,
      fullWidth,
      disabled,
      onCopy,
      ...rest
    } = props;
    const [ref, setRef] = useForwardedRef<ArkCopyButtonElement>(forwardedRef);

    useEffect(() => {
      ensureTooarkComponentsRegistered();
    }, []);

    useEffect(() => {
      const el = ref.current;
      if (!el || !onCopy) return;

      const handler = (event: Event) => onCopy(event as CustomEvent<{ value: string }>);
      el.addEventListener("ark-copy", handler);
      return () => el.removeEventListener("ark-copy", handler);
    }, [ref, onCopy]);

    const attrs: Record<string, string | undefined | React.Ref<ArkCopyButtonElement>> = {
      ...rest,
      ref: setRef,
      class: className,
      for: htmlFor,
      "feedback-ms": feedbackMs === undefined ? undefined : String(feedbackMs),
      "text-color": textColor,
      "locale-json": localeJson,
      loading: loading ? "" : undefined,
      disabled: disabled ? "" : undefined,
      "icon-only": iconOnly ? "" : undefined,
      "full-width": fullWidth ? "" : undefined
    };

    return createElement("ark-copy-button", attrs, children);
  }
);
