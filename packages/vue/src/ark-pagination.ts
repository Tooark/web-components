import type { ArkIntent, ArkLang, ArkPageChangeDetail, ArkSize, ArkTheme } from "@tooark/core";
import { defineComponent, h, onBeforeUnmount, onMounted, type PropType, ref } from "vue";
import { ensureTooarkComponentsRegistered } from "./register.js";

export const ArkPagination = defineComponent({
  name: "ArkPagination",
  inheritAttrs: false,
  emits: ["ark-page-change"],
  props: {
    /** Propagado como data-testid ao elemento principal e sufixado nas partes internas. */
    testid: { type: String, default: undefined },
    /** Página atual, a partir de 1; um clique a reescreve no elemento e emite ark-page-change. */
    page: { type: Number, default: undefined },
    pageSize: { type: Number, default: undefined },
    total: { type: Number, default: undefined },
    /** Opções do seletor de itens por página; sem elas o seletor não aparece. */
    pageSizes: { type: Array as PropType<number[]>, default: undefined },
    siblings: { type: Number, default: undefined },
    disabled: { type: Boolean, default: false },
    size: { type: String as PropType<ArkSize>, default: "md" },
    intent: { type: String as PropType<ArkIntent>, default: "primary" },
    theme: { type: String as PropType<ArkTheme>, default: "auto" },
    lang: { type: String as PropType<ArkLang>, default: undefined },
    localeJson: { type: String, default: undefined }
  },
  setup(props, { attrs, emit }) {
    ensureTooarkComponentsRegistered();
    const elRef = ref<HTMLElement | null>(null);

    // Evento customizado do DOM: ouvido no elemento, não pelo h(), que não mapeia nomes com hífen.
    const pageHandler = (event: Event) => emit("ark-page-change", event as CustomEvent<ArkPageChangeDetail>);
    onMounted(() => elRef.value?.addEventListener("ark-page-change", pageHandler));
    onBeforeUnmount(() => elRef.value?.removeEventListener("ark-page-change", pageHandler));

    return () =>
      h("ark-pagination", {
        ...attrs,
        testid: props.testid,
        ref: elRef,
        page: props.page !== undefined ? String(props.page) : undefined,
        "page-size": props.pageSize !== undefined ? String(props.pageSize) : undefined,
        total: props.total !== undefined ? String(props.total) : undefined,
        "page-sizes": props.pageSizes && props.pageSizes.length > 0 ? props.pageSizes.join(",") : undefined,
        siblings: props.siblings !== undefined ? String(props.siblings) : undefined,
        disabled: props.disabled ? "" : undefined,
        size: props.size,
        intent: props.intent,
        theme: props.theme,
        lang: props.lang,
        "locale-json": props.localeJson
      });
  }
});
