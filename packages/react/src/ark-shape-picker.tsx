import type { ArkMarkShape, ArkShapePickerStyleOptions } from "@tooark/core";
import type { ArkShapePicker as ArkShapePickerElement } from "@tooark/web-components";
import type React from "react";
import { createElement, forwardRef, useEffect } from "react";
import { ensureTooarkComponentsRegistered } from "./register.js";
import { useForwardedRef } from "./use-forwarded-ref.js";

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

export const ArkShapePicker = forwardRef<ArkShapePickerElement, ArkShapePickerProps>(
  function ArkShapePicker(props, forwardedRef): React.JSX.Element {
    const { className, disabled, localeJson, onChange, ...rest } = props;
    const [ref, setRef] = useForwardedRef<ArkShapePickerElement>(forwardedRef);

    useEffect(() => {
      ensureTooarkComponentsRegistered();
    }, []);

    useEffect(() => {
      const el = ref.current;
      if (!el || !onChange) return;

      const handler = (event: Event) => onChange(event as CustomEvent<{ value: ArkMarkShape }>);
      el.addEventListener("change", handler);
      return () => el.removeEventListener("change", handler);
    }, [ref, onChange]);

    const attrs: Record<string, string | undefined | React.Ref<ArkShapePickerElement>> = {
      ...rest,
      ref: setRef,
      class: className,
      disabled: disabled ? "" : undefined,
      "locale-json": localeJson
    };

    return createElement("ark-shape-picker", attrs);
  }
);
