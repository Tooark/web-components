// Tailwind das stories (app consumidor) e CSS da lib, como um consumidor importaria.
import "./preview.css";
import "../../../packages/web-components/src/styles/index.css";
import { registerTooarkChart } from "@tooark/chart";
import { registerTooarkComponents } from "@tooark/web-components";
import { registerTooarkWysiwyg } from "@tooark/wysiwyg";

registerTooarkComponents();
registerTooarkChart();
registerTooarkWysiwyg();

const preview = {
  // Gera página de docs automaticamente para todas as stories
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    controls: {
      expanded: true
    },
    a11y: {
      // "todo": violações aparecem como aviso nos testes sem falhar a suíte.
      // Troque para "error" quando quiser que a11y quebre o CI.
      test: "todo",
      options: {
        // O addon anexa o resultado inteiro do axe a cada story e o dev server guarda todos para o painel.
        // Com os `passes` completos (um nó por elemento por regra) o "Run tests" da UI somava gigabytes e
        // matava o dev server por falta de heap; com resultTypes o axe só detalha violações e pendências
        // (os outros tipos ficam com um nó de amostra). O CLI não muda: ele não retém os relatórios.
        resultTypes: ["violations", "incomplete"]
      }
    }
  }
};

export default preview;
