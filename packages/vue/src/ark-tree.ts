import type { ArkSize, ArkTheme, ArkTreeIcons, ArkTreeItemIcon, ArkTreeSelection } from "@tooark/core";
import { defineComponent, h, onBeforeUnmount, onMounted, type PropType, ref } from "vue";
import { ensureTooarkComponentsRegistered } from "./register.js";

export const ArkTree = defineComponent({
  name: "ArkTree",
  inheritAttrs: false,
  emits: ["ark-toggle", "ark-selection-change", "ark-activate"],
  props: {
    /** Propagado como data-testid ao elemento principal. */
    testid: { type: String, default: undefined },
    /** none (só navega, expande e ativa), single ou multiple. Padrão: "none". */
    selection: { type: String as PropType<ArkTreeSelection>, default: undefined },
    checkboxes: { type: Boolean, default: false },
    propagate: { type: Boolean, default: false },
    /** Valores selecionados: um em `single`, a lista em `multiple`. */
    value: { type: [String, Array] as PropType<string | string[]>, default: undefined },
    /** Nome da árvore (vira `aria-label`). */
    label: { type: String, default: undefined },
    /** `files` desenha o ícone próprio de pasta ou arquivo; `none` esconde todos. */
    icons: { type: String as PropType<ArkTreeIcons>, default: undefined },
    /** Cor dos ícones: um intent, `current` (a cor do texto) ou uma cor CSS. */
    iconColor: { type: String, default: undefined },
    size: { type: String as PropType<ArkSize>, default: undefined },
    theme: { type: String as PropType<ArkTheme>, default: undefined }
  },
  setup(props, { attrs, slots, emit }) {
    ensureTooarkComponentsRegistered();
    const elRef = ref<HTMLElement | null>(null);

    // Eventos customizados do DOM: ouvidos no elemento, não pelo h(), que não mapeia nomes com hífen.
    // Só os eventos desta árvore: os ark-* borbulham, e ark-toggle e ark-selection-change também são de outros
    // componentes (ark-nav-group, ark-data-view).
    const toggleHandler = (event: Event) => {
      if (event.target === event.currentTarget) emit("ark-toggle", event as CustomEvent);
    };
    const selectionHandler = (event: Event) => {
      if (event.target === event.currentTarget) emit("ark-selection-change", event as CustomEvent);
    };
    const activateHandler = (event: Event) => {
      if (event.target === event.currentTarget) emit("ark-activate", event as CustomEvent);
    };
    onMounted(() => {
      elRef.value?.addEventListener("ark-toggle", toggleHandler);
      elRef.value?.addEventListener("ark-selection-change", selectionHandler);
      elRef.value?.addEventListener("ark-activate", activateHandler);
    });
    onBeforeUnmount(() => {
      elRef.value?.removeEventListener("ark-toggle", toggleHandler);
      elRef.value?.removeEventListener("ark-selection-change", selectionHandler);
      elRef.value?.removeEventListener("ark-activate", activateHandler);
    });

    return () =>
      h(
        "ark-tree",
        {
          ...attrs,
          ref: elRef,
          testid: props.testid,
          selection: props.selection,
          checkboxes: props.checkboxes ? "" : undefined,
          propagate: props.propagate ? "" : undefined,
          value: Array.isArray(props.value)
            ? props.value.length
              ? JSON.stringify(props.value)
              : undefined
            : props.value || undefined,
          label: props.label,
          icons: props.icons,
          "icon-color": props.iconColor,
          size: props.size,
          theme: props.theme
        },
        slots.default ? slots.default() : []
      );
  }
});

export const ArkTreeItem = defineComponent({
  name: "ArkTreeItem",
  inheritAttrs: false,
  props: {
    testid: { type: String, default: undefined },
    value: { type: String, default: undefined },
    /** Texto do nó (também usado na busca por digitação). */
    label: { type: String, default: undefined },
    /** Ícone próprio deste nó: folder, file ou none. */
    icon: { type: String as PropType<ArkTreeItemIcon>, default: undefined },
    expanded: { type: Boolean, default: false },
    /** Mostra o chevron sem filhos: carregue os filhos no `@ark-toggle` com `expanded: true`. */
    lazy: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    selected: { type: Boolean, default: false },
    /** Caixa com `checkboxes`: true, false ou "mixed". */
    checked: { type: [Boolean, String] as PropType<boolean | "mixed">, default: undefined },
    disabled: { type: Boolean, default: false }
  },
  setup(props, { attrs, slots }) {
    ensureTooarkComponentsRegistered();
    return () =>
      h(
        "ark-tree-item",
        {
          ...attrs,
          testid: props.testid,
          value: props.value,
          label: props.label,
          icon: props.icon,
          expanded: props.expanded ? "" : undefined,
          lazy: props.lazy ? "" : undefined,
          loading: props.loading ? "" : undefined,
          selected: props.selected ? "" : undefined,
          // "^" grava como atributo: o "mixed" e o desmarcado sairiam errados pela propriedade booleana.
          "^checked": props.checked === "mixed" ? "mixed" : props.checked ? "" : undefined,
          disabled: props.disabled ? "" : undefined
        },
        slots.default ? slots.default() : []
      );
  }
});
