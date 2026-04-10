import { defineComponent, h, type PropType } from "vue";
import type { ArkTheme, ArkToastPosition } from "@tooark/core";
import { ensureTooarkComponentsRegistered } from "./register";

export const ArkToaster = defineComponent({
  name: "ArkToaster",
  inheritAttrs: false,
  props: {
    theme: { type: String as PropType<ArkTheme>, default: "auto" },
    position: { type: String as PropType<ArkToastPosition>, default: "bottom-right" },
    richColors: { type: Boolean, default: false },
    closeButton: { type: Boolean, default: true },
    maxVisible: { type: Number, default: 4 },
    duration: { type: Number, default: 4000 }
  },
  setup(props, { attrs }) {
    ensureTooarkComponentsRegistered();

    return () =>
      h("ark-toaster", {
        ...attrs,
        theme: props.theme,
        position: props.position,
        "max-visible": props.maxVisible,
        duration: props.duration,
        "rich-colors": props.richColors ? "" : undefined,
        "close-button": props.closeButton ? undefined : "false"
      });
  }
});
