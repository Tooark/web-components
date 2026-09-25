import type { ArkDatepickerLang, ArkIntent, ArkSchedulerEvent, ArkSchedulerView, ArkTheme } from "@tooark/core";
import { defineComponent, h, type PropType } from "vue";
import { ensureTooarkComponentsRegistered } from "./register.js";

export const ArkScheduler = defineComponent({
  name: "ArkScheduler",
  inheritAttrs: false,
  emits: ["ark-event-click", "ark-slot-click", "ark-view-change", "ark-range-change"],
  props: {
    /** Propagado como data-testid ao elemento principal e sufixado nas partes internas. */
    testid: { type: String, default: undefined },
    view: { type: String as PropType<ArkSchedulerView>, default: "week" },
    date: { type: String, default: undefined },
    events: { type: Array as PropType<ArkSchedulerEvent[]>, default: undefined },
    lang: { type: String as PropType<ArkDatepickerLang>, default: "en" },
    theme: { type: String as PropType<ArkTheme>, default: "auto" },
    intent: { type: String as PropType<ArkIntent>, default: "primary" },
    hourStart: { type: Number, default: undefined },
    hourEnd: { type: Number, default: undefined },
    slotMinutes: { type: Number, default: undefined },
    hoursFormat: { type: String as PropType<"24" | "12">, default: undefined },
    views: { type: String, default: undefined },
    localeJson: { type: String, default: undefined }
  },
  setup(props, { attrs, emit }) {
    ensureTooarkComponentsRegistered();
    return () =>
      h("ark-scheduler", {
        ...attrs,
        testid: props.testid,
        view: props.view,
        date: props.date,
        lang: props.lang,
        "locale-json": props.localeJson,
        theme: props.theme,
        intent: props.intent,
        views: props.views,
        events: props.events ? JSON.stringify(props.events) : undefined,
        "hour-start": props.hourStart !== undefined ? String(props.hourStart) : undefined,
        "hour-end": props.hourEnd !== undefined ? String(props.hourEnd) : undefined,
        "slot-minutes": props.slotMinutes !== undefined ? String(props.slotMinutes) : undefined,
        "hours-format": props.hoursFormat,
        onArkEventClick: (event: CustomEvent) => emit("ark-event-click", event.detail),
        onArkSlotClick: (event: CustomEvent) => emit("ark-slot-click", event.detail),
        onArkViewChange: (event: CustomEvent) => emit("ark-view-change", event.detail),
        onArkRangeChange: (event: CustomEvent) => emit("ark-range-change", event.detail)
      });
  }
});
