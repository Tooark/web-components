import type {
  ArkButtonNavigateDetail,
  ArkButtonStatus,
  ArkButtonType,
  ArkButtonVariant,
  ArkIntent,
  ArkOrientation,
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

export const ArkButtonGroup = defineComponent({
  name: "ArkButtonGroup",
  inheritAttrs: false,
  props: {
    /** Propagado como data-testid ao host. */
    testid: { type: String, default: undefined },
    /** Direção da fila. Padrão: "horizontal". */
    orientation: { type: String as PropType<ArkOrientation>, default: undefined },
    /** Botões separados pelo gap do size, em vez de colados. */
    spaced: { type: Boolean, default: false },
    /** O grupo ocupa a largura disponível e a reparte entre os botões. */
    fullWidth: { type: Boolean, default: false },
    /** Desabilita todos os botões do grupo. */
    disabled: { type: Boolean, default: false },
    /** Nome do grupo (vira `aria-label`). */
    label: { type: String, default: undefined },
    // Sem padrão: só o que o app der ao grupo é gravado nos botões.
    variant: { type: String as PropType<ArkButtonVariant>, default: undefined },
    intent: { type: String as PropType<ArkIntent>, default: undefined },
    size: { type: String as PropType<ArkSize>, default: undefined },
    rounded: { type: String as PropType<ArkRounded>, default: undefined },
    theme: { type: String as PropType<ArkTheme>, default: undefined }
  },
  setup(props, { attrs, slots }) {
    ensureTooarkComponentsRegistered();
    return () =>
      h(
        "ark-button-group",
        {
          ...attrs,
          testid: props.testid,
          orientation: props.orientation,
          label: props.label,
          variant: props.variant,
          intent: props.intent,
          size: props.size,
          rounded: props.rounded,
          theme: props.theme,
          spaced: props.spaced ? "" : undefined,
          "full-width": props.fullWidth ? "" : undefined,
          disabled: props.disabled ? "" : undefined
        },
        slots.default ? slots.default() : []
      );
  }
});
