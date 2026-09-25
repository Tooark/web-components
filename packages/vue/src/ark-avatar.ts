import type { ArkAvatarShape, ArkSize, ArkTheme } from "@tooark/core";
import { defineComponent, h, type PropType } from "vue";
import { ensureTooarkComponentsRegistered } from "./register.js";

export const ArkAvatar = defineComponent({
  name: "ArkAvatar",
  inheritAttrs: false,
  props: {
    /** Propagado como data-testid ao elemento principal e sufixado nas partes internas. */
    testid: { type: String, default: undefined },
    name: { type: String, default: undefined },
    src: { type: String, default: undefined },
    size: { type: String as PropType<ArkSize>, default: "md" },
    shape: { type: String as PropType<ArkAvatarShape>, default: "circle" },
    color: { type: String, default: undefined },
    theme: { type: String as PropType<ArkTheme>, default: "auto" }
  },
  setup(props, { attrs }) {
    ensureTooarkComponentsRegistered();
    return () =>
      h("ark-avatar", {
        ...attrs,
        testid: props.testid,
        name: props.name,
        src: props.src,
        size: props.size,
        shape: props.shape,
        color: props.color,
        theme: props.theme
      });
  }
});
