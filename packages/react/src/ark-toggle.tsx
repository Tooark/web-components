import React, { createElement, PropsWithChildren, useEffect } from "react";

import type { ArkToggleGroupStyleOptions, ArkToggleStyleOptions } from "@tooark/core";
import { ensureTooarkComponentsRegistered } from "./register";

export type ArkToggleProps = PropsWithChildren<
  ArkToggleStyleOptions & {
    disabled?: boolean;
    className?: string;
    onChange?: (event: CustomEvent<{ pressed: boolean; value: string }>) => void;
  }
>;

export function ArkToggle(props: ArkToggleProps): React.JSX.Element {
  const { children, className, pressed, disabled, onChange, ...rest } = props;

  useEffect(() => {
    ensureTooarkComponentsRegistered();
  }, []);

  const ref = React.useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !onChange) return;

    const handler = (event: Event) => onChange(event as CustomEvent<{ pressed: boolean; value: string }>);
    el.addEventListener("change", handler);
    return () => el.removeEventListener("change", handler);
  }, [onChange]);

  const attrs: Record<string, string | boolean | undefined | React.Ref<HTMLElement>> = {
    ...rest,
    ref,
    class: className,
    pressed: pressed ? "" : undefined,
    disabled: disabled ? "" : undefined,
  };

  return createElement("ark-toggle", attrs, children);
}

export type ArkToggleGroupProps = PropsWithChildren<
  ArkToggleGroupStyleOptions & {
    disabled?: boolean;
    className?: string;
    onChange?: (event: CustomEvent<{ value?: string; values?: string[] }>) => void;
  }
>;

export function ArkToggleGroup(props: ArkToggleGroupProps): React.JSX.Element {
  const { children, className, multiple, disabled, onChange, ...rest } = props;

  useEffect(() => {
    ensureTooarkComponentsRegistered();
  }, []);

  const ref = React.useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !onChange) return;

    const handler = (event: Event) => onChange(event as CustomEvent<{ value?: string; values?: string[] }>);
    el.addEventListener("change", handler);
    return () => el.removeEventListener("change", handler);
  }, [onChange]);

  const attrs: Record<string, string | boolean | undefined | React.Ref<HTMLElement>> = {
    ...rest,
    ref,
    class: className,
    multiple: multiple ? "" : undefined,
    disabled: disabled ? "" : undefined,
  };

  return createElement("ark-toggle-group", attrs, children);
}
