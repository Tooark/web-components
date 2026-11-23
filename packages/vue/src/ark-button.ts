import type {
  ArkButtonNavigateDetail,
  ArkButtonStatus,
  ArkButtonType,
  ArkButtonVariant,
  ArkIntent,
  ArkRounded,
  ArkSize,
  ArkTheme
} from "@tooark/core";
import { defineComponent, h, type PropType } from "vue";
import { ensureTooarkComponentsRegistered } from "./register.js";

export const ArkButton = defineComponent({
  name: "ArkButton",
  inheritAttrs: false,
  emits: {
    // Tipa o @click; o bloqueio de disabled/loading do host impede que o listener dispare.
    click: (_event: MouseEvent) => true,
    /** Clique simples no link (`href`), cancelável. */
    "ark-navigate": (_event: CustomEvent<ArkButtonNavigateDetail>) => true
  },
  props: {
    /** Propagado como data-testid ao elemento principal e sufixado nas partes internas. */
    testid: { type: String, default: undefined },
    variant: { type: String as PropType<ArkButtonVariant>, default: "primary" },
    // Sem padrão: um intent fixo venceria o de `variant="danger"` (o elemento usa intent || variant).
    intent: { type: String as PropType<ArkIntent>, default: undefined },
    theme: { type: String as PropType<ArkTheme>, default: "auto" },
    size: { type: String as PropType<ArkSize>, default: "md" },
    rounded: { type: String as PropType<ArkRounded>, default: "md" },
    type: { type: String as PropType<ArkButtonType>, default: "button" },
    disabled: { type: Boolean, default: false },
    /** Id do formulário a que o botão pertence quando fica fora dele, como no `<button form>` nativo. */
    form: { type: String, default: undefined },
    loading: { type: Boolean, default: false },
    status: { type: String as PropType<ArkButtonStatus>, default: undefined },
    statusLabel: { type: String, default: undefined },
    iconOnly: { type: Boolean, default: false },
    fullWidth: { type: Boolean, default: false },
    href: { type: String, default: undefined },
    target: { type: String, default: undefined },
    /** Com href, baixa em vez de navegar: true (ou "") usa o nome da URL, uma string define o nome do arquivo. */
    download: { type: [Boolean, String], default: undefined },
    color: { type: String, default: undefined },
    textColor: { type: String, default: undefined }
  },
  setup(props, { attrs, emit, slots }) {
    ensureTooarkComponentsRegistered();
    return () =>
      h(
        "ark-button",
        {
          ...attrs,
          testid: props.testid,
          onClick: (event: MouseEvent) => emit("click", event),
          onArkNavigate: (event: CustomEvent<ArkButtonNavigateDetail>) => emit("ark-navigate", event),
          variant: props.variant,
          intent: props.intent,
          theme: props.theme,
          size: props.size,
          rounded: props.rounded,
          type: props.type,
          form: props.form,
          href: props.href,
          target: props.target,
          download: props.download === true ? "" : props.download || undefined,
          color: props.color,
          "text-color": props.textColor,
          disabled: props.disabled ? "" : undefined,
          loading: props.loading ? "" : undefined,
          status: props.status,
          "status-label": props.statusLabel,
          "icon-only": props.iconOnly ? "" : undefined,
          "full-width": props.fullWidth ? "" : undefined
        },
        slots.default ? slots.default() : []
      );
  }
});
