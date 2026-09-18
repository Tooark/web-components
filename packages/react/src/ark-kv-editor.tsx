import type { ArkKvEditorStyleOptions, ArkKvRow } from "@tooark/core";
import type React from "react";
import { createElement, useEffect, useRef } from "react";
import { ensureTooarkComponentsRegistered } from "./register";

export type ArkKvEditorProps = ArkKvEditorStyleOptions & {
  /** Linhas { id, key, value, enabled }; atribuir substitui tudo e renderiza de novo. */
  rows?: ArkKvRow[];
  /** Modo de edicao em massa (textarea). */
  bulk?: boolean;
  /** Tipos de valor da coluna de tipo (string, number, date, time, datetime, email, url); vazio esconde a coluna. */
  types?: string[];
  /** Mostra a coluna de descricao. */
  description?: boolean;
  /** Mostra o cadeado por linha: fechado mascara o valor como senha, com o olho para revelar. */
  secret?: boolean;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  descriptionPlaceholder?: string;
  readonly?: boolean;
  className?: string;
  /** Qualquer edicao, inclusive ao sair do modo em massa: detail.rows sao as linhas. */
  onChange?: (event: CustomEvent<{ rows: ArkKvRow[] }>) => void;
  onAdd?: (event: CustomEvent<{ id: string }>) => void;
  onDelete?: (event: CustomEvent<{ id: string }>) => void;
};

export function ArkKvEditor(props: ArkKvEditorProps): React.JSX.Element {
  const {
    className,
    rows,
    bulk,
    bulkFormat,
    types,
    description,
    secret,
    keyPlaceholder,
    valuePlaceholder,
    descriptionPlaceholder,
    readonly,
    localeJson,
    onChange,
    onAdd,
    onDelete,
    ...rest
  } = props;
  const ref = useRef<HTMLElement & { rows: ArkKvRow[] }>(null);

  useEffect(() => {
    ensureTooarkComponentsRegistered();
  }, []);

  // `rows` e propriedade (objetos), nao atributo.
  useEffect(() => {
    if (ref.current && rows) ref.current.rows = rows;
  }, [rows]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleChange = (event: Event): void => onChange?.(event as CustomEvent<{ rows: ArkKvRow[] }>);
    const handleAdd = (event: Event): void => onAdd?.(event as CustomEvent<{ id: string }>);
    const handleDelete = (event: Event): void => onDelete?.(event as CustomEvent<{ id: string }>);
    el.addEventListener("change", handleChange);
    el.addEventListener("ark-add", handleAdd);
    el.addEventListener("ark-delete", handleDelete);
    return () => {
      el.removeEventListener("change", handleChange);
      el.removeEventListener("ark-add", handleAdd);
      el.removeEventListener("ark-delete", handleDelete);
    };
  }, [onChange, onAdd, onDelete]);

  const attrs: Record<string, string | undefined | React.Ref<HTMLElement>> = {
    ...rest,
    ref,
    class: className,
    bulk: bulk ? "" : undefined,
    "bulk-format": bulkFormat,
    types: types && types.length > 0 ? types.join(",") : undefined,
    description: description ? "" : undefined,
    secret: secret ? "" : undefined,
    "key-placeholder": keyPlaceholder,
    "value-placeholder": valuePlaceholder,
    "description-placeholder": descriptionPlaceholder,
    readonly: readonly ? "" : undefined,
    "locale-json": localeJson
  };

  return createElement("ark-kv-editor", attrs);
}
