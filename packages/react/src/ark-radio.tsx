import type { ArkRadioGroupStyleOptions, ArkRadioStyleOptions } from "@tooark/core";
import type { ArkRadio as ArkRadioElement, ArkRadioGroup as ArkRadioGroupElement } from "@tooark/web-components";
import React, { createElement, forwardRef, type PropsWithChildren, useEffect } from "react";
import { type ArkDomProps, domAttrs } from "./dom-props.js";
import { ensureTooarkComponentsRegistered } from "./register.js";
import { useForwardedRef } from "./use-forwarded-ref.js";

export type ArkRadioProps = PropsWithChildren<
  ArkDomProps<
    ArkRadioStyleOptions & {
      disabled?: boolean;
      /** Nome do grupo: agrupa no formulário e para setas/roving tabindex. */
      name?: string;
      /** Valor submetido e publicado em `change` quando marcado. Padrão: "on". */
      value?: string;
      /** Rótulo próprio (<label for>); sem ele use aria-label ou filhos como rótulo livre. */
      label?: string;
      /** Dica abaixo do rótulo, ligada ao controle por aria-describedby. */
      helper?: string;
      className?: string;
      /** Dispara só no radio que ganhou a marca. */
      onChange?: (event: CustomEvent<{ value: string }>) => void;
    }
  >
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

    const attrs: Record<string, unknown> = {
      ...domAttrs(rest),
      ref: setRef,
      class: className,
      checked: checked ? "" : undefined,
      disabled: disabled ? "" : undefined
    };

    return createElement("ark-radio", attrs, children);
  }
);

/** Props do ArkRadioGroup: name, size, intent e theme valem para todos os rádios do grupo. */
export type ArkRadioGroupProps = PropsWithChildren<
  ArkDomProps<
    ArkRadioGroupStyleOptions & {
      /** O `value` do rádio marcado; atribuído, marca o rádio desse valor. */
      value?: string;
      /** `name` gravado em cada rádio, para o formulário. */
      name?: string;
      /** Legenda própria do grupo. */
      label?: string;
      /** Texto de apoio abaixo do grupo. */
      helper?: string;
      /** Marca o grupo como inválido, com ou sem mensagem. */
      error?: boolean;
      /** Mensagem de erro abaixo do grupo (vence o helper e marca inválido). */
      errorMessage?: string;
      /** Escolha obrigatória (aria-required). */
      required?: boolean;
      /** Desabilita todos os rádios do grupo. */
      disabled?: boolean;
      className?: string;
      /** Um só por mudança, do grupo, com o `value` do rádio que ganhou a marca. */
      onChange?: (event: CustomEvent<{ value: string }>) => void;
    }
  >
>;

export const ArkRadioGroup = forwardRef<ArkRadioGroupElement, ArkRadioGroupProps>(
  function ArkRadioGroup(props, forwardedRef): React.JSX.Element {
    const { children, className, error, errorMessage, required, disabled, onChange, ...rest } = props;

    useEffect(() => {
      ensureTooarkComponentsRegistered();
    }, []);

    const [ref, setRef] = useForwardedRef<ArkRadioGroupElement>(forwardedRef);

    useEffect(() => {
      const el = ref.current;
      if (!el || !onChange) return;

      // O grupo para o `change` dos rádios e publica o próprio: só o dele (target no host) chega aqui.
      const handler = (event: Event) => {
        if (event.target === el) onChange(event as CustomEvent<{ value: string }>);
      };
      el.addEventListener("change", handler);
      return () => el.removeEventListener("change", handler);
    }, [ref, onChange]);

    const attrs: Record<string, unknown> = {
      ...domAttrs(rest),
      ref: setRef,
      class: className,
      error: error ? "" : undefined,
      "error-message": errorMessage || undefined,
      required: required ? "" : undefined,
      disabled: disabled ? "" : undefined
    };

    return createElement("ark-radio-group", attrs, children);
  }
);
