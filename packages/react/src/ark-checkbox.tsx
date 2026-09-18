import type { ArkCheckboxStyleOptions } from "@tooark/core";
import React, { createElement, type PropsWithChildren, useEffect } from "react";
import { ensureTooarkComponentsRegistered } from "./register";

export type ArkCheckboxProps = PropsWithChildren<
  ArkCheckboxStyleOptions & {
    disabled?: boolean;
    /** Nome no formulario (submete `value` quando marcado). */
    name?: string;
    /** Valor submetido quando marcado. Padrao: "on". */
    value?: string;
    /** Rotulo proprio (<label for>); sem ele use aria-label ou filhos como rotulo livre. */
    label?: string;
    className?: string;
    onChange?: (event: CustomEvent<{ checked: boolean }>) => void;
  }
>;

export function ArkCheckbox(props: ArkCheckboxProps): React.JSX.Element {
  const { children, className, checked, indeterminate, disabled, onChange, ...rest } = props;
  const ref = React.useRef<HTMLElement>(null);

  useEffect(() => {
    ensureTooarkComponentsRegistered();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || !onChange) return;

    const handler = (event: Event) => onChange(event as CustomEvent<{ checked: boolean }>);
    el.addEventListener("change", handler);
    return () => el.removeEventListener("change", handler);
  }, [onChange]);

  const attrs: Record<string, string | undefined | React.Ref<HTMLElement>> = {
    ...rest,
    ref,
    class: className,
    checked: checked ? "" : undefined,
    indeterminate: indeterminate ? "" : undefined,
    disabled: disabled ? "" : undefined
  };

  return createElement("ark-checkbox", attrs, children);
}
