import type { ArkInputStyleOptions, ArkLang } from "@tooark/core";
import React, { createElement, type PropsWithChildren, useEffect } from "react";
import { ensureTooarkComponentsRegistered } from "./register.js";

export type ArkInputProps = PropsWithChildren<
  ArkInputStyleOptions & {
    type?: string;
    label?: string;
    placeholder?: string;
    value?: string;
    name?: string;
    helper?: string;
    error?: boolean;
    errorMessage?: string;
    disabled?: boolean;
    required?: boolean;
    readonly?: boolean;
    /** Com type="password", botao de mostrar/ocultar na ponta direita. */
    reveal?: boolean;
    lang?: ArkLang;
    localeJson?: string;
    autocomplete?: string;
    autofocus?: boolean;
    inputmode?: string;
    maxlength?: number;
    minlength?: number;
    pattern?: string;
    min?: string | number;
    max?: string | number;
    step?: string | number;
    spellcheck?: boolean;
    "aria-label"?: string;
    className?: string;
    onInput?: (event: Event) => void;
    onChange?: (event: Event) => void;
  }
>;

// Atributo do custom element: string ou ausente.
function attr(value: string | number | undefined): string | undefined {
  return value === undefined ? undefined : String(value);
}

export function ArkInput(props: ArkInputProps): React.JSX.Element {
  const {
    children,
    className,
    errorMessage,
    error,
    disabled,
    required,
    readonly,
    reveal,
    localeJson,
    autofocus,
    maxlength,
    minlength,
    min,
    max,
    step,
    spellcheck,
    onInput,
    onChange,
    ...rest
  } = props;
  const ref = React.useRef<HTMLElement>(null);

  useEffect(() => {
    ensureTooarkComponentsRegistered();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleInput = (event: Event): void => onInput?.(event);
    const handleChange = (event: Event): void => onChange?.(event);
    el.addEventListener("input", handleInput);
    el.addEventListener("change", handleChange);
    return () => {
      el.removeEventListener("input", handleInput);
      el.removeEventListener("change", handleChange);
    };
  }, [onInput, onChange]);

  const attrs: Record<string, string | boolean | undefined | React.Ref<HTMLElement>> = {
    ...rest,
    ref,
    class: className,
    "error-message": errorMessage,
    "locale-json": localeJson,
    error: error ? "" : undefined,
    disabled: disabled ? "" : undefined,
    required: required ? "" : undefined,
    readonly: readonly ? "" : undefined,
    reveal: reveal ? "" : undefined,
    // Booleanos, não strings: o React 19 grava nas propriedades nativas autofocus/spellcheck do host (onde "" seria
    // false e "false" seria true), e o React 18 os serializa no atributo.
    autofocus: autofocus || undefined,
    maxlength: attr(maxlength),
    minlength: attr(minlength),
    min: attr(min),
    max: attr(max),
    step: attr(step),
    spellcheck
  };

  return createElement("ark-input", attrs, children);
}
