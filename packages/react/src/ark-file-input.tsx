import type { ArkFileInputStyleOptions } from "@tooark/core";
import type React from "react";
import { createElement, useEffect, useRef } from "react";
import { ensureTooarkComponentsRegistered } from "./register.js";

export type ArkFileInputProps = ArkFileInputStyleOptions & {
  /** Tipos aceitos pelo seletor nativo (accept). */
  accept?: string;
  /** Aceita varios arquivos; sem ele o drop fica com o primeiro. */
  multiple?: boolean;
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
  /** Arquivos escolhidos ou soltos: detail.files e um array de File. */
  onChange?: (event: CustomEvent<{ files: File[] }>) => void;
};

export function ArkFileInput(props: ArkFileInputProps): React.JSX.Element {
  const { className, multiple, errorMessage, error, disabled, required, localeJson, onChange, ...rest } = props;
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    ensureTooarkComponentsRegistered();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || !onChange) return;

    const handler = (event: Event) => onChange(event as CustomEvent<{ files: File[] }>);
    el.addEventListener("change", handler);
    return () => el.removeEventListener("change", handler);
  }, [onChange]);

  const attrs: Record<string, string | undefined | React.Ref<HTMLElement>> = {
    ...rest,
    ref,
    class: className,
    multiple: multiple ? "" : undefined,
    "error-message": errorMessage,
    error: error ? "" : undefined,
    disabled: disabled ? "" : undefined,
    required: required ? "" : undefined,
    "locale-json": localeJson
  };

  return createElement("ark-file-input", attrs);
}
