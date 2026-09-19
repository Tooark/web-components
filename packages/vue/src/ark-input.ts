import type { ArkIntent, ArkLang, ArkRounded, ArkSize, ArkTheme } from "@tooark/core";
import { defineComponent, h, type PropType } from "vue";
import { ensureTooarkComponentsRegistered } from "./register.js";

export const ArkInput = defineComponent({
  name: "ArkInput",
  inheritAttrs: false,
  props: {
    type: { type: String, default: "text" },
    label: { type: String, default: undefined },
    placeholder: { type: String, default: undefined },
    value: { type: String, default: undefined },
    name: { type: String, default: undefined },
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
    reveal: { type: Boolean, default: false },
    lang: { type: String as PropType<ArkLang>, default: undefined },
    localeJson: { type: String, default: undefined },
    autocomplete: { type: String, default: undefined },
    autofocus: { type: Boolean, default: false },
    inputmode: { type: String, default: undefined },
    maxlength: { type: Number, default: undefined },
    minlength: { type: Number, default: undefined },
    pattern: { type: String, default: undefined },
    min: { type: [String, Number], default: undefined },
    max: { type: [String, Number], default: undefined },
    step: { type: [String, Number], default: undefined },
    // String, nao Boolean: Vue converte Boolean ausente em false, o que desligaria a correcao por padrao.
    spellcheck: { type: String as PropType<"true" | "false">, default: undefined }
  },
  setup(props, { attrs, slots }) {
    ensureTooarkComponentsRegistered();
    return () =>
      h(
        "ark-input",
        {
          ...attrs,
          type: props.type,
          label: props.label,
          placeholder: props.placeholder,
          value: props.value,
          name: props.name,
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
          reveal: props.reveal ? "" : undefined,
          lang: props.lang,
          "locale-json": props.localeJson,
          autocomplete: props.autocomplete,
          autofocus: props.autofocus ? "" : undefined,
          inputmode: props.inputmode,
          maxlength: props.maxlength,
          minlength: props.minlength,
          pattern: props.pattern,
          min: props.min,
          max: props.max,
          step: props.step,
          spellcheck: props.spellcheck
        },
        slots.default ? slots.default() : []
      );
  }
});
