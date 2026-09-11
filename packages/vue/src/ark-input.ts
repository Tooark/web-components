import type { ArkIntent, ArkRounded, ArkSize, ArkTheme } from "@tooark/core";
import { defineComponent, h, type PropType } from "vue";
import { ensureTooarkComponentsRegistered } from "./register";

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
    readonly: { type: Boolean, default: false }
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
          readonly: props.readonly ? "" : undefined
        },
        slots.default ? slots.default() : []
      );
  }
});
