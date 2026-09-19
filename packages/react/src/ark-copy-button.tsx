import type { ArkCopyButtonStyleOptions } from "@tooark/core";
import type React from "react";
import { createElement, type PropsWithChildren, useEffect, useRef } from "react";
import { ensureTooarkComponentsRegistered } from "./register.js";

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

export function ArkCopyButton(props: ArkCopyButtonProps): React.JSX.Element {
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
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    ensureTooarkComponentsRegistered();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || !onCopy) return;

    const handler = (event: Event) => onCopy(event as CustomEvent<{ value: string }>);
    el.addEventListener("ark-copy", handler);
    return () => el.removeEventListener("ark-copy", handler);
  }, [onCopy]);

  const attrs: Record<string, string | undefined | React.Ref<HTMLElement>> = {
    ...rest,
    ref,
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
