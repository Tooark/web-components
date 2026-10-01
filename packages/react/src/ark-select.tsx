import type { ArkSelectOption, ArkSelectStyleOptions } from "@tooark/core";
import type { ArkSelect as ArkSelectElement } from "@tooark/web-components";
import React, { createElement, forwardRef, type PropsWithChildren, useEffect } from "react";
import type { ArkDomProps } from "./dom-props.js";
import { ensureTooarkComponentsRegistered } from "./register.js";
import { useForwardedRef } from "./use-forwarded-ref.js";

export type ArkSelectProps = PropsWithChildren<
  ArkDomProps<
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
  >
>;

export const ArkSelect = forwardRef<ArkSelectElement, ArkSelectProps>(
  function ArkSelect(props, forwardedRef): React.JSX.Element {
    const { children, className, options, errorMessage, error, disabled, required, onInput, onChange, ...rest } = props;
    const [ref, setRef] = useForwardedRef<ArkSelectElement>(forwardedRef);

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
    }, [ref, onInput, onChange]);

    const attrs: Record<string, unknown> = {
      ...rest,
      ref: setRef,
      class: className,
      options: options ? JSON.stringify(options) : undefined,
      "error-message": errorMessage,
      error: error ? "" : undefined,
      disabled: disabled ? "" : undefined,
      required: required ? "" : undefined
    };

    return createElement("ark-select", attrs, children);
  }
);
