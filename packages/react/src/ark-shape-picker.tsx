import type { ArkMarkShape, ArkShapePickerStyleOptions } from "@tooark/core";
import type { ArkShapePicker as ArkShapePickerElement } from "@tooark/web-components";
import type React from "react";
import { createElement, forwardRef, useEffect } from "react";
import type { ArkDomProps } from "./dom-props.js";
import { ensureTooarkComponentsRegistered } from "./register.js";
import { useForwardedRef } from "./use-forwarded-ref.js";

export type ArkShapePickerProps = ArkDomProps<
  ArkShapePickerStyleOptions & {
    /** Forma selecionada. */
    value?: ArkMarkShape;
    /** Formas oferecidas, na ordem (ou "all"). Padrao: as dez. */
    shapes?: ArkMarkShape[] | "all";
    /** Nome acessivel do radiogroup. */
    label?: string;
    disabled?: boolean;
    className?: string;
    /** Selecao mudou pelo usuario: detail.value e a forma. */
    onChange?: (event: CustomEvent<{ value: ArkMarkShape }>) => void;
  }
>;

export const ArkShapePicker = forwardRef<ArkShapePickerElement, ArkShapePickerProps>(
  function ArkShapePicker(props, forwardedRef): React.JSX.Element {
    const { className, disabled, shapes, localeJson, onChange, ...rest } = props;
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

    const attrs: Record<string, unknown> = {
      ...rest,
      ref: setRef,
      class: className,
      disabled: disabled ? "" : undefined,
      shapes: Array.isArray(shapes) ? (shapes.length > 0 ? shapes.join(",") : undefined) : shapes,
      "locale-json": localeJson
    };

    return createElement("ark-shape-picker", attrs);
  }
);
