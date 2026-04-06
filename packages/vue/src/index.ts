import { h, defineComponent, ref, onMounted, onBeforeUnmount } from "vue";
import { registerTooarkComponents } from "@tooark/core";

export const ArkButton = defineComponent({
  name: "ArkButton",
  inheritAttrs: false,
  props: {
    variant: { type: String, default: "primary" },
    size: { type: String, default: "md" },
    type: { type: String, default: "button" },
    disabled: { type: Boolean, default: false }
  },
  setup(props, { attrs, slots }) {
    registerTooarkComponents();
    return () =>
      h(
        "ark-button",
        { ...attrs, variant: props.variant, size: props.size, type: props.type, disabled: props.disabled ? "" : undefined },
        slots.default ? slots.default() : []
      );
  }
});

export const ArkDatepicker = defineComponent({
  name: "ArkDatepicker",
  inheritAttrs: false,
  props: {
    lang: { type: String, default: "en" },
    localeJson: { type: [String, Object], default: undefined },
    value: { type: String, default: undefined },
    min: { type: String, default: undefined },
    max: { type: String, default: undefined }
  },
  emits: ["ark-change"],
  setup(props, { attrs, emit }) {
    registerTooarkComponents();
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
        "locale-json": localeAttr,
        value: props.value,
        min: props.min,
        max: props.max
      });
    };
  }
});
