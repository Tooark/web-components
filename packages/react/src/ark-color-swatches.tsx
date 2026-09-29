import type { ArkColorSwatch, ArkColorSwatchesStyleOptions } from "@tooark/core";
import type { ArkColorSwatches as ArkColorSwatchesElement } from "@tooark/web-components";
import type React from "react";
import { createElement, forwardRef, useEffect } from "react";
import { ensureTooarkComponentsRegistered } from "./register.js";
import { useForwardedRef } from "./use-forwarded-ref.js";

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

export const ArkColorSwatches = forwardRef<ArkColorSwatchesElement, ArkColorSwatchesProps>(
  function ArkColorSwatches(props, forwardedRef): React.JSX.Element {
    const { className, colors, disabled, onChange, ...rest } = props;
    const [ref, setRef] = useForwardedRef<ArkColorSwatchesElement>(forwardedRef);

    useEffect(() => {
      ensureTooarkComponentsRegistered();
    }, []);

    useEffect(() => {
      const el = ref.current;
      if (!el || !onChange) return;

      const handler = (event: Event) => onChange(event as CustomEvent<{ value: string }>);
      el.addEventListener("change", handler);
      return () => el.removeEventListener("change", handler);
    }, [ref, onChange]);

    const attrs: Record<string, string | undefined | React.Ref<ArkColorSwatchesElement>> = {
      ...rest,
      ref: setRef,
      class: className,
      colors: colors ? JSON.stringify(colors) : undefined,
      disabled: disabled ? "" : undefined
    };

    return createElement("ark-color-swatches", attrs);
  }
);
