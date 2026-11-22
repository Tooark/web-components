import type { ArkCardPadding, ArkHeadingLevel, ArkRounded, ArkTheme } from "@tooark/core";
import { defineComponent, h, type PropType } from "vue";
import { ensureTooarkComponentsRegistered } from "./register.js";

export const ArkCard = defineComponent({
  name: "ArkCard",
  inheritAttrs: false,
  props: {
    /** Propagado como data-testid ao elemento principal e sufixado nas partes internas. */
    testid: { type: String, default: undefined },
    heading: { type: String, default: undefined },
    padding: { type: String as PropType<ArkCardPadding>, default: undefined },
    rounded: { type: String as PropType<ArkRounded>, default: undefined },
    theme: { type: String as PropType<ArkTheme>, default: "auto" },
    /** Nível do título próprio (h1 a h6). Padrão: 2. */
    headingLevel: { type: Number as PropType<ArkHeadingLevel>, default: undefined },
    /** Ações que não cabem quebram em mais linhas, sem esmagar o título. */
    wrapActions: { type: Boolean, default: false }
  },
  setup(props, { attrs, slots }) {
    ensureTooarkComponentsRegistered();
    return () =>
      h(
        "ark-card",
        {
          ...attrs,
          testid: props.testid,
          heading: props.heading,
          padding: props.padding,
          rounded: props.rounded,
          theme: props.theme,
          "heading-level": props.headingLevel,
          "wrap-actions": props.wrapActions ? "" : undefined
        },
        slots.default ? slots.default() : []
      );
  }
});
