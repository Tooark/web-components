import type { ArkTextareaResize, ArkTextareaStyleOptions } from "@tooark/core";
import React, { createElement, type PropsWithChildren, useEffect } from "react";
import { ensureTooarkComponentsRegistered } from "./register.js";

export type ArkTextareaProps = PropsWithChildren<
  ArkTextareaStyleOptions & {
    label?: string;
    placeholder?: string;
    value?: string;
    name?: string;
    /** Linhas visiveis iniciais. Padrao: 3. */
    rows?: number;
    /** Cresce com o conteudo (field-sizing nativo, fallback por JS). */
    autosize?: boolean;
    /** Fonte monoespacada, para codigo e dados. */
    monospace?: boolean;
    /** Direcoes de redimensionamento pelo usuario. Padrao: "vertical". */
    resize?: ArkTextareaResize;
    helper?: string;
    error?: boolean;
    errorMessage?: string;
    disabled?: boolean;
    required?: boolean;
    readonly?: boolean;
    autocomplete?: string;
    autofocus?: boolean;
    maxlength?: number;
    minlength?: number;
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

export function ArkTextarea(props: ArkTextareaProps): React.JSX.Element {
  const {
    children,
    className,
    rows,
    autosize,
    monospace,
    errorMessage,
    error,
    disabled,
    required,
    readonly,
    autofocus,
    maxlength,
    minlength,
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
    rows: attr(rows),
    autosize: autosize ? "" : undefined,
    monospace: monospace ? "" : undefined,
    "error-message": errorMessage,
    error: error ? "" : undefined,
    disabled: disabled ? "" : undefined,
    required: required ? "" : undefined,
    readonly: readonly ? "" : undefined,
    // Booleanos, não strings: o React 19 grava nas propriedades nativas autofocus/spellcheck do host (onde "" seria
    // false e "false" seria true), e o React 18 os serializa no atributo.
    autofocus: autofocus || undefined,
    maxlength: attr(maxlength),
    minlength: attr(minlength),
    spellcheck
  };

  return createElement("ark-textarea", attrs, children);
}
