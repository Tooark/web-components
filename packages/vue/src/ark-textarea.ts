import type { ArkIntent, ArkRounded, ArkSize, ArkTextareaResize, ArkTheme } from "@tooark/core";
import { defineComponent, h, type PropType } from "vue";
import { ensureTooarkComponentsRegistered } from "./register";

export const ArkTextarea = defineComponent({
  name: "ArkTextarea",
  inheritAttrs: false,
  props: {
    label: { type: String, default: undefined },
    placeholder: { type: String, default: undefined },
    value: { type: String, default: undefined },
    name: { type: String, default: undefined },
    rows: { type: Number, default: undefined },
    autosize: { type: Boolean, default: false },
    monospace: { type: Boolean, default: false },
    resize: { type: String as PropType<ArkTextareaResize>, default: "vertical" },
    size: { type: String as PropType<ArkSize>, default: "md" },
    intent: { type: String as PropType<ArkIntent>, default: "primary" },
    theme: { type: String as PropType<ArkTheme>, default: "auto" },
    rounded: { type: String as PropType<ArkRounded>, default: "lg" },
    helper: { type: String, default: undefined },
    error: { type: Boolean, default: false },
    errorMessage: { type: String, default: undefined },
    disabled: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false },
    autocomplete: { type: String, default: undefined },
    autofocus: { type: Boolean, default: false },
    maxlength: { type: Number, default: undefined },
    minlength: { type: Number, default: undefined },
    // String, nao Boolean: Vue converte Boolean ausente em false, o que desligaria a correcao por padrao.
    spellcheck: { type: String as PropType<"true" | "false">, default: undefined }
  },
  setup(props, { attrs, slots }) {
    ensureTooarkComponentsRegistered();
    return () =>
      h(
        "ark-textarea",
        {
          ...attrs,
          label: props.label,
          placeholder: props.placeholder,
          value: props.value,
          name: props.name,
          rows: props.rows,
          autosize: props.autosize ? "" : undefined,
          monospace: props.monospace ? "" : undefined,
          resize: props.resize,
          size: props.size,
          intent: props.intent,
          theme: props.theme,
          rounded: props.rounded,
          helper: props.helper,
          "error-message": props.errorMessage,
          error: props.error ? "" : undefined,
          disabled: props.disabled ? "" : undefined,
          required: props.required ? "" : undefined,
          readonly: props.readonly ? "" : undefined,
          autocomplete: props.autocomplete,
          autofocus: props.autofocus ? "" : undefined,
          maxlength: props.maxlength,
          minlength: props.minlength,
          spellcheck: props.spellcheck
        },
        slots.default ? slots.default() : []
      );
  }
});
