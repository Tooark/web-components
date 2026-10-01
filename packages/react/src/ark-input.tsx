import type { ArkInputStyleOptions, ArkLang } from "@tooark/core";
import type { ArkInput as ArkInputElement } from "@tooark/web-components";
import React, { createElement, forwardRef, type PropsWithChildren, useEffect } from "react";
import type { ArkDomProps } from "./dom-props.js";
import { ensureTooarkComponentsRegistered } from "./register.js";
import { useForwardedRef } from "./use-forwarded-ref.js";

export type ArkInputProps = PropsWithChildren<
  ArkDomProps<
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
  >
>;

// Atributo do custom element: string ou ausente.
function attr(value: string | number | undefined): string | undefined {
  return value === undefined ? undefined : String(value);
}

export const ArkInput = forwardRef<ArkInputElement, ArkInputProps>(
  function ArkInput(props, forwardedRef): React.JSX.Element {
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
    const [ref, setRef] = useForwardedRef<ArkInputElement>(forwardedRef);

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
    }, [ref, onInput, onChange]);

    const attrs: Record<string, unknown> = {
      ...rest,
      ref: setRef,
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
);
