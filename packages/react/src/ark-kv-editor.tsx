import type { ArkKvEditorStyleOptions, ArkKvRow, ArkKvValueField } from "@tooark/core";
import type { ArkKvEditor as ArkKvEditorElement } from "@tooark/web-components";
import type React from "react";
import { createElement, forwardRef, useEffect } from "react";
import { type ArkDomProps, domAttrs } from "./dom-props.js";
import { ensureTooarkComponentsRegistered } from "./register.js";
import { useForwardedRef } from "./use-forwarded-ref.js";

export type ArkKvEditorProps = ArkDomProps<
  ArkKvEditorStyleOptions & {
    /** Linhas { id, key, value, enabled }; atribuir substitui tudo e renderiza de novo. */
    rows?: ArkKvRow[];
    /** Modo de edição em massa (textarea). */
    bulk?: boolean;
    /** Tipos de valor da coluna de tipo (string, number, date, time, datetime, email, url); vazio esconde a coluna. */
    types?: string[];
    /** Mostra a coluna de descrição. */
    description?: boolean;
    /** Mostra o cadeado por linha: fechado mascara o valor como senha, com o olho para revelar. */
    secret?: boolean;
    keyPlaceholder?: string;
    valuePlaceholder?: string;
    descriptionPlaceholder?: string;
    readonly?: boolean;
    /**
     * Cria a célula de valor de cada linha no lugar do ark-input (um campo com autocomplete de variáveis, por exemplo);
     * linhas secretas mantêm o campo de senha. Precisa ser estável (useCallback): uma função nova recria as células.
     */
    valueField?: ArkKvValueField;
    className?: string;
    /** Qualquer edição, inclusive ao sair do modo em massa: detail.rows são as linhas. */
    onChange?: (event: CustomEvent<{ rows: ArkKvRow[] }>) => void;
    onAdd?: (event: CustomEvent<{ id: string }>) => void;
    onDelete?: (event: CustomEvent<{ id: string }>) => void;
  }
>;

export const ArkKvEditor = forwardRef<ArkKvEditorElement, ArkKvEditorProps>(
  function ArkKvEditor(props, forwardedRef): React.JSX.Element {
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
      valueField,
      localeJson,
      onChange,
      onAdd,
      onDelete,
      ...rest
    } = props;
    const [ref, setRef] = useForwardedRef<ArkKvEditorElement>(forwardedRef);

    useEffect(() => {
      ensureTooarkComponentsRegistered();
    }, []);

    // `rows` é propriedade (objetos), não atributo.
    useEffect(() => {
      if (ref.current && rows) ref.current.rows = rows;
    }, [ref, rows]);

    // `valueField` é função, então propriedade; só passa a ser gravada quando o app dá uma, para o editor sem ela não
    // recriar as linhas na montagem.
    useEffect(() => {
      const el = ref.current;
      if (el && (valueField || el.valueField)) el.valueField = valueField ?? null;
    }, [ref, valueField]);

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
    }, [ref, onChange, onAdd, onDelete]);

    const attrs: Record<string, unknown> = {
      ...domAttrs(rest),
      ref: setRef,
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
);
