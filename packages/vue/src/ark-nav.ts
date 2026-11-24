import type { ArkIntent, ArkLang, ArkNavCollapsible, ArkNavSide, ArkNavVariant, ArkSize, ArkTheme } from "@tooark/core";
import { defineComponent, h, onBeforeUnmount, onMounted, type PropType, ref } from "vue";
import { ensureTooarkComponentsRegistered } from "./register.js";

/** `detail` de `ark-navigate`: o destino do item e o seu identificador (`value`, ou o `href`). */
export type ArkNavNavigateDetail = { href: string | null; value: string };

export const ArkNav = defineComponent({
  name: "ArkNav",
  inheritAttrs: false,
  emits: ["ark-collapse", "ark-navigate"],
  props: {
    /** Propagado como data-testid ao elemento principal e sufixado nas partes internas. */
    testid: { type: String, default: undefined },
    variant: { type: String as PropType<ArkNavVariant>, default: "sidebar" },
    side: { type: String as PropType<ArkNavSide>, default: "left" },
    /** `value` (ou `href`) do item atual; sem ele cada item mantém o próprio `current`. */
    value: { type: String, default: undefined },
    collapsed: { type: Boolean, default: false },
    /** Botão de recolher e o que resta recolhida: true/"rail" (só ícones) ou "hidden" (só o logo e o botão). */
    collapsible: { type: [Boolean, String] as PropType<boolean | ArkNavCollapsible>, default: false },
    /** Vira aria-label da navegação. */
    label: { type: String, default: undefined },
    size: { type: String as PropType<ArkSize>, default: "md" },
    intent: { type: String as PropType<ArkIntent>, default: "primary" },
    theme: { type: String as PropType<ArkTheme>, default: "auto" },
    lang: { type: String as PropType<ArkLang>, default: undefined },
    localeJson: { type: String, default: undefined }
  },
  setup(props, { attrs, slots, emit }) {
    ensureTooarkComponentsRegistered();
    const elRef = ref<HTMLElement | null>(null);

    // Eventos customizados do DOM: ouvidos no elemento, não pelo h(), que não mapeia nomes com hífen. O emit é
    // síncrono, então um preventDefault() no handler do app ainda cancela a navegação.
    // Só o evento deste elemento: os ark-* borbulham, e o ark-toggle de um ark-tree dentro do grupo chegava aqui.
    const collapseHandler = (event: Event) => {
      if (event.target === event.currentTarget) emit("ark-collapse", event as CustomEvent<{ collapsed: boolean }>);
    };
    const navigateHandler = (event: Event) => emit("ark-navigate", event as CustomEvent<ArkNavNavigateDetail>);
    onMounted(() => {
      elRef.value?.addEventListener("ark-collapse", collapseHandler);
      elRef.value?.addEventListener("ark-navigate", navigateHandler);
    });
    onBeforeUnmount(() => {
      elRef.value?.removeEventListener("ark-collapse", collapseHandler);
      elRef.value?.removeEventListener("ark-navigate", navigateHandler);
    });

    return () =>
      h(
        "ark-nav",
        {
          ...attrs,
          testid: props.testid,
          ref: elRef,
          variant: props.variant,
          side: props.side,
          value: props.value,
          collapsed: props.collapsed ? "" : undefined,
          collapsible: props.collapsible === true ? "" : props.collapsible || undefined,
          label: props.label,
          size: props.size,
          intent: props.intent,
          theme: props.theme,
          lang: props.lang,
          "locale-json": props.localeJson
        },
        slots.default ? slots.default() : []
      );
  }
});

export const ArkNavItem = defineComponent({
  name: "ArkNavItem",
  inheritAttrs: false,
  emits: ["ark-navigate"],
  props: {
    /** Propagado como data-testid ao elemento principal e sufixado nas partes internas. */
    testid: { type: String, default: undefined },
    /** Destino do link; sem ele o item é um botão. */
    href: { type: String, default: undefined },
    target: { type: String, default: undefined },
    /** Texto do item, desenhado pelo componente (oculto no trilho). */
    label: { type: String, default: undefined },
    /** Identificador em `ark-navigate` e no `value` do ArkNav. Padrão: o `href`. */
    value: { type: String, default: undefined },
    current: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    divider: { type: Boolean, default: false }
  },
  setup(props, { attrs, slots, emit }) {
    ensureTooarkComponentsRegistered();
    const elRef = ref<HTMLElement | null>(null);

    const navigateHandler = (event: Event) => emit("ark-navigate", event as CustomEvent<ArkNavNavigateDetail>);
    onMounted(() => elRef.value?.addEventListener("ark-navigate", navigateHandler));
    onBeforeUnmount(() => elRef.value?.removeEventListener("ark-navigate", navigateHandler));

    return () =>
      h(
        "ark-nav-item",
        {
          ...attrs,
          testid: props.testid,
          ref: elRef,
          href: props.href,
          target: props.target,
          label: props.label,
          value: props.value,
          current: props.current ? "" : undefined,
          disabled: props.disabled ? "" : undefined,
          divider: props.divider ? "" : undefined
        },
        slots.default ? slots.default() : []
      );
  }
});

export const ArkNavGroup = defineComponent({
  name: "ArkNavGroup",
  inheritAttrs: false,
  emits: ["ark-toggle"],
  props: {
    /** Propagado como data-testid ao elemento principal e sufixado nas partes internas. */
    testid: { type: String, default: undefined },
    /** Texto do cabeçalho e nome do grupo. */
    label: { type: String, default: undefined },
    /** O cabeçalho é um botão que abre e fecha os itens. */
    expandable: { type: Boolean, default: false },
    /** Itens à mostra (com `expandable`). */
    open: { type: Boolean, default: false }
  },
  setup(props, { attrs, slots, emit }) {
    ensureTooarkComponentsRegistered();
    const elRef = ref<HTMLElement | null>(null);

    // Só o evento deste elemento: os ark-* borbulham, e o ark-toggle de um ark-tree dentro do grupo chegava aqui.
    const toggleHandler = (event: Event) => {
      if (event.target === event.currentTarget) emit("ark-toggle", event as CustomEvent<{ open: boolean }>);
    };
    onMounted(() => elRef.value?.addEventListener("ark-toggle", toggleHandler));
    onBeforeUnmount(() => elRef.value?.removeEventListener("ark-toggle", toggleHandler));

    return () =>
      h(
        "ark-nav-group",
        {
          ...attrs,
          testid: props.testid,
          ref: elRef,
          label: props.label,
          expandable: props.expandable ? "" : undefined,
          open: props.open ? "" : undefined
        },
        slots.default ? slots.default() : []
      );
  }
});
