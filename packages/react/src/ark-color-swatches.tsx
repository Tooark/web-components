import type { ArkColorSwatch, ArkColorSwatchesStyleOptions } from "@tooark/core";
import type React from "react";
import { createElement, useEffect, useRef } from "react";
import { ensureTooarkComponentsRegistered } from "./register.js";

export type ArkColorSwatchesProps = ArkColorSwatchesStyleOptions & {
  /** Cor selecionada (o value da amostra). */
  value?: string;
  /** Amostras { name, value }[]; vai como JSON no atributo. */
  colors?: ArkColorSwatch[];
  /** Nome acessivel do radiogroup. */
  label?: string;
  disabled?: boolean;
  className?: string;
  /** Selecao mudou pelo usuario: detail.value e a cor. */
  onChange?: (event: CustomEvent<{ value: string }>) => void;
};

export function ArkColorSwatches(props: ArkColorSwatchesProps): React.JSX.Element {
  const { className, colors, disabled, onChange, ...rest } = props;
  const ref = useRef<HTMLElement>(null);

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
    colors: colors ? JSON.stringify(colors) : undefined,
    disabled: disabled ? "" : undefined
  };

  return createElement("ark-color-swatches", attrs);
}
