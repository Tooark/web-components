import type { ArkRadioStyleOptions } from "@tooark/core";
import React, { createElement, type PropsWithChildren, useEffect } from "react";
import { ensureTooarkComponentsRegistered } from "./register";

export type ArkRadioProps = PropsWithChildren<
  ArkRadioStyleOptions & {
    disabled?: boolean;
    /** Nome do grupo: agrupa no formulario e para setas/roving tabindex. */
    name?: string;
    /** Valor submetido e publicado em `change` quando marcado. Padrao: "on". */
    value?: string;
    /** Rotulo proprio (<label for>); sem ele use aria-label ou filhos como rotulo livre. */
    label?: string;
    className?: string;
    /** Dispara so no radio que ganhou a marca. */
    onChange?: (event: CustomEvent<{ value: string }>) => void;
  }
>;

export function ArkRadio(props: ArkRadioProps): React.JSX.Element {
  const { children, className, checked, disabled, onChange, ...rest } = props;
  const ref = React.useRef<HTMLElement>(null);

  useEffect(() => {
    ensureTooarkComponentsRegistered();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || !onChange) return;

    const handler = (event: Event) => onChange(event as CustomEvent<{ value: string }>);
    el.addEventListener("change", handler);
    return () => el.removeEventListener("change", handler);
  }, [onChange]);

  const attrs: Record<string, string | undefined | React.Ref<HTMLElement>> = {
    ...rest,
    ref,
    class: className,
    checked: checked ? "" : undefined,
    disabled: disabled ? "" : undefined
  };

  return createElement("ark-radio", attrs, children);
}
