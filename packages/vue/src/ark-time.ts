import type { ArkTimeFormat } from "@tooark/core";
import { defineComponent, h, type PropType } from "vue";
import { ensureTooarkComponentsRegistered } from "./register.js";

/** `Date` e número viram ISO: o atributo é texto. */
function isoOf(value: string | number | Date | undefined): string | undefined {
  if (value === undefined || typeof value === "string") return value || undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

export const ArkTime = defineComponent({
  name: "ArkTime",
  inheritAttrs: false,
  props: {
    /** Propagado como data-testid ao elemento principal e sufixado nas partes internas. */
    testid: { type: String, default: undefined },
    /** Instante: ISO com ou sem fuso, só a data (`YYYY-MM-DD`), um `Date` ou ms. */
    datetime: { type: [String, Number, Date] as PropType<string | number | Date>, default: undefined },
    /** relative ("há 3 minutos"), date, time ou datetime. Padrão: "relative". */
    format: { type: String as PropType<ArkTimeFormat>, default: undefined },
    /** Idioma do Intl (qualquer tag, como `pt-BR`); sem ele, o de setArkLocale(), senão "en". */
    lang: { type: String, default: undefined }
  },
  setup(props, { attrs }) {
    ensureTooarkComponentsRegistered();
    return () =>
      h("ark-time", {
        ...attrs,
        testid: props.testid,
        datetime: isoOf(props.datetime),
        format: props.format,
        lang: props.lang
      });
  }
});
