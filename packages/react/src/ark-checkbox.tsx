import type { ArkCheckboxStyleOptions } from "@tooark/core";
import type { ArkCheckbox as ArkCheckboxElement } from "@tooark/web-components";
import React, { createElement, forwardRef, type PropsWithChildren, useEffect } from "react";
import type { ArkDomProps } from "./dom-props.js";
import { ensureTooarkComponentsRegistered } from "./register.js";
import { useForwardedRef } from "./use-forwarded-ref.js";

export type ArkCheckboxProps = PropsWithChildren<
  ArkDomProps<
    ArkCheckboxStyleOptions & {
      disabled?: boolean;
      /** Nome no formulario (submete `value` quando marcado). */
      name?: string;
      /** Valor submetido quando marcado. Padrao: "on". */
      value?: string;
      /** Rotulo proprio (<label for>); sem ele use aria-label ou filhos como rotulo livre. */
      label?: string;
      /** Dica abaixo do rotulo, ligada ao controle por aria-describedby. */
      helper?: string;
      className?: string;
      onChange?: (event: CustomEvent<{ checked: boolean }>) => void;
    }
  >
>;

export const ArkCheckbox = forwardRef<ArkCheckboxElement, ArkCheckboxProps>(
  function ArkCheckbox(props, forwardedRef): React.JSX.Element {
    const { children, className, checked, indeterminate, disabled, onChange, ...rest } = props;
    const [ref, setRef] = useForwardedRef<ArkCheckboxElement>(forwardedRef);

    useEffect(() => {
      ensureTooarkComponentsRegistered();
    }, []);

    useEffect(() => {
      const el = ref.current;
      if (!el || !onChange) return;

      const handler = (event: Event) => onChange(event as CustomEvent<{ checked: boolean }>);
      el.addEventListener("change", handler);
      return () => el.removeEventListener("change", handler);
    }, [ref, onChange]);

    const attrs: Record<string, unknown> = {
      ...rest,
      ref: setRef,
      class: className,
      checked: checked ? "" : undefined,
      indeterminate: indeterminate ? "" : undefined,
      disabled: disabled ? "" : undefined
    };

    return createElement("ark-checkbox", attrs, children);
  }
);
