import type { ArkIntent, ArkSize, ArkTheme } from "@tooark/core";
import { defineComponent, h, type PropType } from "vue";
import { ensureTooarkComponentsRegistered } from "./register";

export const ArkSwitch = defineComponent({
  name: "ArkSwitch",
  inheritAttrs: false,
  emits: ["change"],
  props: {
    checked: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    intent: { type: String as PropType<ArkIntent>, default: "primary" },
    theme: { type: String as PropType<ArkTheme>, default: "auto" },
    size: { type: String as PropType<ArkSize>, default: "md" },
    labels: { type: Boolean, default: false },
    labelOn: { type: String, default: undefined },
    labelOff: { type: String, default: undefined },
    icons: { type: Boolean, default: false },
    color: { type: String, default: undefined },
    name: { type: String, default: undefined },
    value: { type: String, default: undefined },
    label: { type: String, default: undefined }
  },
  setup(props, { attrs, emit }) {
    ensureTooarkComponentsRegistered();
    return () =>
      h("ark-switch", {
        ...attrs,
        intent: props.intent,
        theme: props.theme,
        size: props.size,
        color: props.color,
        name: props.name,
        value: props.value,
        label: props.label,
        "label-on": props.labelOn,
        "label-off": props.labelOff,
        checked: props.checked ? "" : undefined,
        disabled: props.disabled ? "" : undefined,
        labels: props.labels ? "" : undefined,
        icons: props.icons ? "" : undefined,
        onChange: (event: CustomEvent<{ checked: boolean }>) => emit("change", event)
      });
  }
});
