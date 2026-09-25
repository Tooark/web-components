import type { ArkIntent, ArkRounded, ArkSelectOption, ArkSize, ArkTheme } from "@tooark/core";
import { defineComponent, h, type PropType } from "vue";
import { ensureTooarkComponentsRegistered } from "./register.js";

export const ArkSelect = defineComponent({
  name: "ArkSelect",
  inheritAttrs: false,
  emits: ["change", "input"],
  props: {
    /** Propagado como data-testid ao elemento principal e sufixado nas partes internas. */
    testid: { type: String, default: undefined },
    label: { type: String, default: undefined },
    placeholder: { type: String, default: undefined },
    options: { type: Array as PropType<ArkSelectOption[]>, default: undefined },
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
    required: { type: Boolean, default: false }
  },
  setup(props, { attrs, slots, emit }) {
    ensureTooarkComponentsRegistered();
    return () =>
      h(
        "ark-select",
        {
          ...attrs,
          testid: props.testid,
          label: props.label,
          placeholder: props.placeholder,
          options: props.options ? JSON.stringify(props.options) : undefined,
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
          onChange: (event: CustomEvent<{ value: string }>) => emit("change", event),
          onInput: (event: Event) => emit("input", event)
        },
        slots.default ? slots.default() : []
      );
  }
});
