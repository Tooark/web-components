import type { ArkRadioStyleOptions } from "@tooark/core";
import type { ArkRadio as ArkRadioElement } from "@tooark/web-components";
import React, { createElement, forwardRef, type PropsWithChildren, useEffect } from "react";
import { ensureTooarkComponentsRegistered } from "./register.js";
import { useForwardedRef } from "./use-forwarded-ref.js";

export type ArkRadioProps = PropsWithChildren<
  ArkRadioStyleOptions & {
    disabled?: boolean;
    /** Nome do grupo: agrupa no formulario e para setas/roving tabindex. */
    name?: string;
    /** Valor submetido e publicado em `change` quando marcado. Padrao: "on". */
    value?: string;
    /** Rotulo proprio (<label for>); sem ele use aria-label ou filhos como rotulo livre. */
    label?: string;
    /** Dica abaixo do rotulo, ligada ao controle por aria-describedby. */
    helper?: string;
    className?: string;
    /** Dispara so no radio que ganhou a marca. */
    onChange?: (event: CustomEvent<{ value: string }>) => void;
  }
>;

export const ArkRadio = forwardRef<ArkRadioElement, ArkRadioProps>(
  function ArkRadio(props, forwardedRef): React.JSX.Element {
    const { children, className, checked, disabled, onChange, ...rest } = props;
    const [ref, setRef] = useForwardedRef<ArkRadioElement>(forwardedRef);

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

    const attrs: Record<string, string | undefined | React.Ref<ArkRadioElement>> = {
      ...rest,
      ref: setRef,
      class: className,
      checked: checked ? "" : undefined,
      disabled: disabled ? "" : undefined
    };

    return createElement("ark-radio", attrs, children);
  }
);
