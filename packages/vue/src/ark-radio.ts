import type { ArkIntent, ArkSize, ArkTheme } from "@tooark/core";
import { defineComponent, h, type PropType } from "vue";
import { ensureTooarkComponentsRegistered } from "./register.js";

export const ArkRadio = defineComponent({
  name: "ArkRadio",
  inheritAttrs: false,
  emits: ["change"],
  props: {
    checked: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    intent: { type: String as PropType<ArkIntent>, default: "primary" },
    theme: { type: String as PropType<ArkTheme>, default: "auto" },
    size: { type: String as PropType<ArkSize>, default: "md" },
    name: { type: String, default: undefined },
    value: { type: String, default: undefined },
    label: { type: String, default: undefined }
  },
  setup(props, { attrs, slots, emit }) {
    ensureTooarkComponentsRegistered();
    return () =>
      h(
        "ark-radio",
        {
          ...attrs,
          intent: props.intent,
          theme: props.theme,
          size: props.size,
          name: props.name,
          value: props.value,
          label: props.label,
          checked: props.checked ? "" : undefined,
          disabled: props.disabled ? "" : undefined,
          onChange: (event: CustomEvent<{ value: string }>) => emit("change", event)
        },
        slots.default ? slots.default() : []
      );
  }
});
