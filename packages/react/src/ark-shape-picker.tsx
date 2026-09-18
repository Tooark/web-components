import type { ArkMarkShape, ArkShapePickerStyleOptions } from "@tooark/core";
import type React from "react";
import { createElement, useEffect, useRef } from "react";
import { ensureTooarkComponentsRegistered } from "./register";

export type ArkShapePickerProps = ArkShapePickerStyleOptions & {
  /** Forma selecionada. */
  value?: ArkMarkShape;
  /** Nome acessivel do radiogroup. */
  label?: string;
  disabled?: boolean;
  className?: string;
  /** Selecao mudou pelo usuario: detail.value e a forma. */
  onChange?: (event: CustomEvent<{ value: ArkMarkShape }>) => void;
};

export function ArkShapePicker(props: ArkShapePickerProps): React.JSX.Element {
  const { className, disabled, localeJson, onChange, ...rest } = props;
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    ensureTooarkComponentsRegistered();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || !onChange) return;

    const handler = (event: Event) => onChange(event as CustomEvent<{ value: ArkMarkShape }>);
    el.addEventListener("change", handler);
    return () => el.removeEventListener("change", handler);
  }, [onChange]);

  const attrs: Record<string, string | undefined | React.Ref<HTMLElement>> = {
    ...rest,
    ref,
    class: className,
    disabled: disabled ? "" : undefined,
    "locale-json": localeJson
  };

  return createElement("ark-shape-picker", attrs);
}
