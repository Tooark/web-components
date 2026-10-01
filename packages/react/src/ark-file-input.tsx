import type { ArkFileInputStyleOptions } from "@tooark/core";
import type { ArkFileInput as ArkFileInputElement } from "@tooark/web-components";
import type React from "react";
import { createElement, forwardRef, useEffect } from "react";
import { ensureTooarkComponentsRegistered } from "./register.js";
import { useForwardedRef } from "./use-forwarded-ref.js";

export type ArkFileInputProps = ArkFileInputStyleOptions & {
  /** Tipos aceitos pelo seletor nativo (accept). */
  accept?: string;
  /** Aceita varios arquivos; sem ele o drop fica com o primeiro. */
  multiple?: boolean;
  /** Escolhe uma pasta inteira: o seletor abre em modo pasta e a zona le as pastas soltas. Padrao: desligado. */
  directory?: boolean;
  /** Rotulo do campo (label for o input oculto; nomeia o botao junto do texto dele). */
  label?: string;
  helper?: string;
  /** Mensagem de erro; liga aria-invalid e a borda de erro. */
  errorMessage?: string;
  /** Estado de erro sem mensagem (borda danger e aria-invalid), como no ArkInput. */
  error?: boolean;
  disabled?: boolean;
  required?: boolean;
  /** Nome no formulario (input nativo oculto). */
  name?: string;
  className?: string;
  /** Arquivos escolhidos ou soltos em detail.files (array de File); com `directory`, detail.paths traz os caminhos. */
  onChange?: (event: CustomEvent<{ files: File[]; paths?: string[] }>) => void;
};

export const ArkFileInput = forwardRef<ArkFileInputElement, ArkFileInputProps>(
  function ArkFileInput(props, forwardedRef): React.JSX.Element {
    const { className, multiple, directory, errorMessage, error, disabled, required, localeJson, onChange, ...rest } =
      props;
    const [ref, setRef] = useForwardedRef<ArkFileInputElement>(forwardedRef);

    useEffect(() => {
      ensureTooarkComponentsRegistered();
    }, []);

    useEffect(() => {
      const el = ref.current;
      if (!el || !onChange) return;

      const handler = (event: Event) => onChange(event as CustomEvent<{ files: File[]; paths?: string[] }>);
      el.addEventListener("change", handler);
      return () => el.removeEventListener("change", handler);
    }, [ref, onChange]);

    const attrs: Record<string, string | undefined | React.Ref<ArkFileInputElement>> = {
      ...rest,
      ref: setRef,
      class: className,
      multiple: multiple ? "" : undefined,
      directory: directory ? "" : undefined,
      "error-message": errorMessage,
      error: error ? "" : undefined,
      disabled: disabled ? "" : undefined,
      required: required ? "" : undefined,
      "locale-json": localeJson
    };

    return createElement("ark-file-input", attrs);
  }
);
