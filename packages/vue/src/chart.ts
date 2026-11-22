// Entry point @tooark/vue/chart: o wrapper do ark-chart, fora da entrada principal para que o ECharts (peer do
// @tooark/chart) só entre no app que importa este caminho.
import { type ArkChart as ArkChartElement, type EChartsOption, registerTooarkChart } from "@tooark/chart";
import { defineComponent, h, onBeforeUnmount, onMounted, type PropType, ref, toRaw, watch } from "vue";

export const ArkChart = defineComponent({
  name: "ArkChart",
  inheritAttrs: false,
  emits: ["ark-chart-click"],
  props: {
    /** Propagado como data-testid ao contêiner do gráfico. */
    testid: { type: String, default: undefined },
    /** Opções nativas do ECharts; trocar a referência re-renderiza o gráfico (`notMerge`). */
    option: { type: Object as PropType<EChartsOption | null>, default: undefined },
    /** auto (segue o color-scheme da página), light ou dark. Padrão: "auto". */
    theme: { type: String as PropType<"auto" | "light" | "dark">, default: undefined },
    /** default ou tokens (cores dos tokens `--ark-color-*`, @tooark/chart 1.7+). Padrão: "default". */
    palette: { type: String as PropType<"default" | "tokens">, default: undefined },
    renderer: { type: String as PropType<"canvas" | "svg">, default: undefined },
    /** Altura (comprimento CSS). Padrão: "320px". */
    height: { type: String, default: undefined },
    /** false desliga o redimensionamento junto com o contêiner. Padrão: true. */
    autoResize: { type: Boolean, default: undefined }
  },
  setup(props, { attrs, emit }) {
    registerTooarkChart();
    const elRef = ref<ArkChartElement | null>(null);

    // Pela propriedade e só com referência nova: um objeto no h() viraria "[object Object]" antes do registro, e cada
    // atribuição re-renderiza o gráfico.
    const syncOption = (): void => {
      const el = elRef.value;
      const next = props.option === undefined ? undefined : (toRaw(props.option) ?? null);
      if (el && next !== undefined && el.option !== next) el.option = next;
    };
    watch(() => props.option, syncOption);

    const clickHandler = (event: Event) => emit("ark-chart-click", event as CustomEvent);
    onMounted(() => {
      syncOption();
      elRef.value?.addEventListener("ark-chart-click", clickHandler);
    });
    onBeforeUnmount(() => elRef.value?.removeEventListener("ark-chart-click", clickHandler));

    return () =>
      h("ark-chart", {
        ...attrs,
        ref: elRef,
        testid: props.testid,
        theme: props.theme,
        palette: props.palette,
        renderer: props.renderer,
        height: props.height,
        "auto-resize": props.autoResize === false ? "false" : undefined
      });
  }
});
