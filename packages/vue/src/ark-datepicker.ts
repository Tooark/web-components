import type { ArkCalendarEvent, ArkDatepickerLang, ArkIntent, ArkTheme } from "@tooark/core";
import { defineComponent, h, onBeforeUnmount, onMounted, type PropType, ref } from "vue";
import { ensureTooarkComponentsRegistered } from "./register.js";

export const ArkDatepicker = defineComponent({
  name: "ArkDatepicker",
  inheritAttrs: false,
  props: {
    lang: { type: String as PropType<ArkDatepickerLang>, default: "en" },
    localeJson: { type: [String, Object], default: undefined },
    theme: { type: String as PropType<ArkTheme>, default: "auto" },
    intent: { type: String as PropType<ArkIntent>, default: "primary" },
    accentColor: { type: String, default: undefined },
    value: { type: String, default: undefined },
    min: { type: String, default: undefined },
    max: { type: String, default: undefined },
    mode: { type: String as PropType<"datetime" | "date" | "time">, default: "datetime" },
    input: { type: Boolean, default: false },
    placeholder: { type: String, default: undefined },
    name: { type: String, default: undefined },
    format: { type: String, default: undefined },
    seconds: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    events: { type: Array as PropType<ArkCalendarEvent[]>, default: undefined },
    eventDisplay: { type: String as PropType<"dots" | "count" | "list">, default: undefined },
    stepMinutes: { type: Number, default: undefined },
    hoursFormat: { type: String as PropType<"24" | "12">, default: undefined }
  },
  emits: ["ark-change"],
  setup(props, { attrs, emit }) {
    ensureTooarkComponentsRegistered();
    const elRef = ref<HTMLElement | null>(null);

    const handler = (e: Event) => {
      emit("ark-change", (e as CustomEvent).detail);
    };

    onMounted(() => elRef.value?.addEventListener("ark-change", handler));
    onBeforeUnmount(() => elRef.value?.removeEventListener("ark-change", handler));

    return () => {
      const localeAttr = props.localeJson
        ? typeof props.localeJson === "string"
          ? props.localeJson
          : JSON.stringify(props.localeJson)
        : undefined;

      return h("ark-datepicker", {
        ...attrs,
        ref: elRef,
        lang: props.lang,
        theme: props.theme,
        intent: props.intent,
        "accent-color": props.accentColor,
        "locale-json": localeAttr,
        value: props.value,
        min: props.min,
        max: props.max,
        mode: props.mode,
        placeholder: props.placeholder,
        name: props.name,
        format: props.format,
        input: props.input ? "" : undefined,
        seconds: props.seconds ? "" : undefined,
        disabled: props.disabled ? "" : undefined,
        events: props.events ? JSON.stringify(props.events) : undefined,
        "event-display": props.eventDisplay,
        "step-minutes": props.stepMinutes !== undefined ? String(props.stepMinutes) : undefined,
        "hours-format": props.hoursFormat
      });
    };
  }
});
