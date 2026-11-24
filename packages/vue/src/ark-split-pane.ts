import type { ArkLang, ArkSplitPaneDirection, ArkTheme } from "@tooark/core";
import { defineComponent, h, onBeforeUnmount, onMounted, type PropType, ref } from "vue";
import { ensureTooarkComponentsRegistered } from "./register.js";

export const ArkSplitPane = defineComponent({
  name: "ArkSplitPane",
  inheritAttrs: false,
  emits: ["ark-resize"],
  props: {
    /** Propagado como data-testid ao elemento principal e sufixado nas partes internas. */
    testid: { type: String, default: undefined },
    direction: { type: String as PropType<ArkSplitPaneDirection>, default: "horizontal" },
    sizes: { type: Array as PropType<number[]>, default: undefined },
    theme: { type: String as PropType<ArkTheme>, default: "auto" },
    lang: { type: String as PropType<ArkLang>, default: undefined },
    localeJson: { type: String, default: undefined }
  },
  setup(props, { attrs, slots, emit }) {
    ensureTooarkComponentsRegistered();
    const elRef = ref<HTMLElement | null>(null);

    // Evento customizado do DOM: ouvido no elemento, não pelo h(), que não mapeia nomes com hífen.
    // Só o ark-resize deste elemento: o evento borbulha, e o de outro split-pane dentro de um painel chegava aqui com
    // os tamanhos do de dentro.
    const resizeHandler = (event: Event) => {
      if (event.target === event.currentTarget) emit("ark-resize", event as CustomEvent<{ sizes: number[] }>);
    };
    onMounted(() => elRef.value?.addEventListener("ark-resize", resizeHandler));
    onBeforeUnmount(() => elRef.value?.removeEventListener("ark-resize", resizeHandler));

    return () =>
      h(
        "ark-split-pane",
        {
          ...attrs,
          testid: props.testid,
          ref: elRef,
          direction: props.direction,
          sizes: props.sizes ? props.sizes.join(",") : undefined,
          theme: props.theme,
          lang: props.lang,
          "locale-json": props.localeJson
        },
        slots.default ? slots.default() : []
      );
  }
});
