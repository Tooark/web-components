import { defineComponent, h, onBeforeUnmount, onMounted, ref, type PropType } from "vue";
import type { ArkCarouselSnap, ArkIntent, ArkTheme } from "@tooark/core";
import { ensureTooarkComponentsRegistered } from "./register";

export const ArkCarousel = defineComponent({
  name: "ArkCarousel",
  inheritAttrs: false,
  props: {
    theme: { type: String as PropType<ArkTheme>, default: "auto" },
    intent: { type: String as PropType<ArkIntent>, default: "primary" },
    accentColor: { type: String, default: undefined },
    slidesPerView: { type: Number, default: 1 },
    gap: { type: Number, default: 12 },
    startIndex: { type: Number, default: 0 },
    loop: { type: Boolean, default: false },
    autoplay: { type: Boolean, default: false },
    autoplayDelay: { type: Number, default: 4200 },
    showDots: { type: Boolean, default: true },
    showArrows: { type: Boolean, default: true },
    dragFree: { type: Boolean, default: false },
    snap: { type: String as PropType<ArkCarouselSnap>, default: "mandatory" }
  },
  emits: ["ark-slide-change"],
  setup(props, { attrs, emit, slots }) {
    ensureTooarkComponentsRegistered();
    const elRef = ref<HTMLElement | null>(null);

    const handler = (e: Event) => {
      emit("ark-slide-change", (e as CustomEvent).detail);
    };

    onMounted(() => elRef.value?.addEventListener("ark-slide-change", handler));
    onBeforeUnmount(() => elRef.value?.removeEventListener("ark-slide-change", handler));

    return () =>
      h(
        "ark-carousel",
        {
          ...attrs,
          ref: elRef,
          theme: props.theme,
          intent: props.intent,
          "accent-color": props.accentColor,
          "slides-per-view": props.slidesPerView,
          gap: props.gap,
          "start-index": props.startIndex,
          loop: props.loop ? "" : undefined,
          autoplay: props.autoplay ? "" : undefined,
          "autoplay-delay": props.autoplayDelay,
          "show-dots": props.showDots ? undefined : "false",
          "show-arrows": props.showArrows ? undefined : "false",
          "drag-free": props.dragFree ? "" : undefined,
          snap: props.snap
        },
        slots.default ? slots.default() : []
      );
  }
});
