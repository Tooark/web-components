import type { ArkSelectOption, ArkSelectStyleOptions } from "@tooark/core";
import React, { createElement, type PropsWithChildren, useEffect } from "react";
import { ensureTooarkComponentsRegistered } from "./register";

export type ArkSelectProps = PropsWithChildren<
  ArkSelectStyleOptions & {
    label?: string;
    placeholder?: string;
    options?: ArkSelectOption[];
    value?: string;
    name?: string;
    helper?: string;
    error?: boolean;
    errorMessage?: string;
    disabled?: boolean;
    required?: boolean;
    className?: string;
    onInput?: (event: Event) => void;
    onChange?: (event: CustomEvent<{ value: string }>) => void;
  }
>;

export function ArkSelect(props: ArkSelectProps): React.JSX.Element {
  const { children, className, options, errorMessage, error, disabled, required, onInput, onChange, ...rest } = props;
  const ref = React.useRef<HTMLElement>(null);

  useEffect(() => {
    ensureTooarkComponentsRegistered();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleInput = (event: Event): void => onInput?.(event);
    const handleChange = (event: Event): void => onChange?.(event as CustomEvent<{ value: string }>);
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
    options: options ? JSON.stringify(options) : undefined,
    "error-message": errorMessage,
    error: error ? "" : undefined,
    disabled: disabled ? "" : undefined,
    required: required ? "" : undefined
  };

  return createElement("ark-select", attrs, children);
}
