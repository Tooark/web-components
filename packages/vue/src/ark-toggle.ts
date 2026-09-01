import { defineComponent, h, type PropType } from "vue";
import type { ArkIntent, ArkSize, ArkTheme } from "@tooark/core";
import { ensureTooarkComponentsRegistered } from "./register";

export const ArkToggle = defineComponent({
  name: "ArkToggle",
  inheritAttrs: false,
  emits: ["change"],
  props: {
    pressed: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    intent: { type: String as PropType<ArkIntent>, default: "primary" },
    theme: { type: String as PropType<ArkTheme>, default: "auto" },
    size: { type: String as PropType<ArkSize>, default: "md" },
    value: { type: String, default: undefined }
  },
  setup(props, { attrs, slots, emit }) {
    ensureTooarkComponentsRegistered();
    return () =>
      h(
        "ark-toggle",
        {
          ...attrs,
          intent: props.intent,
          theme: props.theme,
          size: props.size,
          value: props.value,
          pressed: props.pressed ? "" : undefined,
          disabled: props.disabled ? "" : undefined,
          onChange: (event: CustomEvent<{ pressed: boolean; value: string }>) => emit("change", event)
        },
        slots.default ? slots.default() : []
      );
  }
});

export const ArkToggleGroup = defineComponent({
  name: "ArkToggleGroup",
  inheritAttrs: false,
  emits: ["change"],
  props: {
    value: { type: String, default: undefined },
    multiple: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    intent: { type: String as PropType<ArkIntent>, default: undefined },
    theme: { type: String as PropType<ArkTheme>, default: undefined },
    size: { type: String as PropType<ArkSize>, default: undefined }
  },
  setup(props, { attrs, slots, emit }) {
    ensureTooarkComponentsRegistered();
    return () =>
      h(
        "ark-toggle-group",
        {
          ...attrs,
          value: props.value,
          intent: props.intent,
          theme: props.theme,
          size: props.size,
          multiple: props.multiple ? "" : undefined,
          disabled: props.disabled ? "" : undefined,
          onChange: (event: CustomEvent<{ value?: string; values?: string[] }>) => emit("change", event)
        },
        slots.default ? slots.default() : []
      );
  }
});
