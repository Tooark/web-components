import type { ArkToggleGroupStyleOptions, ArkToggleStyleOptions } from "@tooark/core";
import type { ArkToggle as ArkToggleElement, ArkToggleGroup as ArkToggleGroupElement } from "@tooark/web-components";
import React, { createElement, forwardRef, type PropsWithChildren, useEffect } from "react";
import { ensureTooarkComponentsRegistered } from "./register.js";
import { useForwardedRef } from "./use-forwarded-ref.js";

export type ArkToggleProps = PropsWithChildren<
  ArkToggleStyleOptions & {
    disabled?: boolean;
    className?: string;
    onChange?: (event: CustomEvent<{ pressed: boolean; value: string }>) => void;
  }
>;

export const ArkToggle = forwardRef<ArkToggleElement, ArkToggleProps>(
  function ArkToggle(props, forwardedRef): React.JSX.Element {
    const { children, className, pressed, disabled, onChange, ...rest } = props;

    useEffect(() => {
      ensureTooarkComponentsRegistered();
    }, []);

    const [ref, setRef] = useForwardedRef<ArkToggleElement>(forwardedRef);

    useEffect(() => {
      const el = ref.current;
      if (!el || !onChange) return;

      const handler = (event: Event) => onChange(event as CustomEvent<{ pressed: boolean; value: string }>);
      el.addEventListener("change", handler);
      return () => el.removeEventListener("change", handler);
    }, [ref, onChange]);

    const attrs: Record<string, string | boolean | undefined | React.Ref<ArkToggleElement>> = {
      ...rest,
      ref: setRef,
      class: className,
      pressed: pressed ? "" : undefined,
      disabled: disabled ? "" : undefined
    };

    return createElement("ark-toggle", attrs, children);
  }
);

export type ArkToggleGroupProps = PropsWithChildren<
  ArkToggleGroupStyleOptions & {
    disabled?: boolean;
    className?: string;
    onChange?: (event: CustomEvent<{ value?: string; values?: string[] }>) => void;
  }
>;

export const ArkToggleGroup = forwardRef<ArkToggleGroupElement, ArkToggleGroupProps>(
  function ArkToggleGroup(props, forwardedRef): React.JSX.Element {
    const { children, className, multiple, disabled, onChange, ...rest } = props;

    useEffect(() => {
      ensureTooarkComponentsRegistered();
    }, []);

    const [ref, setRef] = useForwardedRef<ArkToggleGroupElement>(forwardedRef);

    useEffect(() => {
      const el = ref.current;
      if (!el || !onChange) return;

      const handler = (event: Event) => onChange(event as CustomEvent<{ value?: string; values?: string[] }>);
      el.addEventListener("change", handler);
      return () => el.removeEventListener("change", handler);
    }, [ref, onChange]);

    const attrs: Record<string, string | boolean | undefined | React.Ref<ArkToggleGroupElement>> = {
      ...rest,
      ref: setRef,
      class: className,
      multiple: multiple ? "" : undefined,
      disabled: disabled ? "" : undefined
    };

    return createElement("ark-toggle-group", attrs, children);
  }
);
