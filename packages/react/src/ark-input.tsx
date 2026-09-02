import React, { createElement, PropsWithChildren, useEffect } from "react";
import type { ArkInputStyleOptions } from "@tooark/core";
import { ensureTooarkComponentsRegistered } from "./register";

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
    className?: string;
    onInput?: (event: Event) => void;
    onChange?: (event: Event) => void;
  }
>;

export function ArkInput(props: ArkInputProps): React.JSX.Element {
  const { children, className, errorMessage, error, disabled, required, readonly, onInput, onChange, ...rest } = props;
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

  const attrs: Record<string, string | undefined | React.Ref<HTMLElement>> = {
    ...rest,
    ref,
    class: className,
    "error-message": errorMessage,
    error: error ? "" : undefined,
    disabled: disabled ? "" : undefined,
    required: required ? "" : undefined,
    readonly: readonly ? "" : undefined,
  };

  return createElement("ark-input", attrs, children);
}
