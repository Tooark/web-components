import type { ArkDatepickerLang, ArkIntent, ArkTheme } from "@tooark/core";
import { defineComponent, h, type PropType } from "vue";
import { ensureTooarkComponentsRegistered } from "./register.js";

export const ArkClock = defineComponent({
  name: "ArkClock",
  inheritAttrs: false,
  emits: ["ark-change"],
  props: {
    /** Propagado como data-testid ao elemento principal e sufixado nas partes internas. */
    testid: { type: String, default: undefined },
    value: { type: String, default: undefined },
    lang: { type: String as PropType<ArkDatepickerLang>, default: "en" },
    theme: { type: String as PropType<ArkTheme>, default: "auto" },
    intent: { type: String as PropType<ArkIntent>, default: "primary" },
    seconds: { type: Boolean, default: false },
    stepMinutes: { type: Number, default: undefined },
    hoursFormat: { type: String as PropType<"24" | "12">, default: "24" }
  },
  setup(props, { attrs, emit }) {
    ensureTooarkComponentsRegistered();
    return () =>
      h("ark-clock", {
        ...attrs,
        testid: props.testid,
        value: props.value,
        lang: props.lang,
        theme: props.theme,
        intent: props.intent,
        seconds: props.seconds ? "" : undefined,
        "step-minutes": props.stepMinutes !== undefined ? String(props.stepMinutes) : undefined,
        "hours-format": props.hoursFormat,
        onArkChange: (event: CustomEvent<{ value: string }>) => emit("ark-change", event.detail)
      });
  }
});
