import type { ArkIntent, ArkSize, ArkTheme } from "@tooark/core";
import { defineComponent, h, type PropType } from "vue";
import { ensureTooarkComponentsRegistered } from "./register.js";

export const ArkCheckbox = defineComponent({
  name: "ArkCheckbox",
  inheritAttrs: false,
  emits: ["change"],
  props: {
    /** Propagado como data-testid ao elemento principal e sufixado nas partes internas. */
    testid: { type: String, default: undefined },
    checked: { type: Boolean, default: false },
    indeterminate: { type: Boolean, default: false },
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
        "ark-checkbox",
        {
          ...attrs,
          testid: props.testid,
          intent: props.intent,
          theme: props.theme,
          size: props.size,
          name: props.name,
          value: props.value,
          label: props.label,
          checked: props.checked ? "" : undefined,
          indeterminate: props.indeterminate ? "" : undefined,
          disabled: props.disabled ? "" : undefined,
          onChange: (event: CustomEvent<{ checked: boolean }>) => emit("change", event)
        },
        slots.default ? slots.default() : []
      );
  }
});
