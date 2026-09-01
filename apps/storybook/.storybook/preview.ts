import "../../../packages/core/src/styles/tailwind.css";
import { registerTooarkComponents } from "@tooark/web-components";
import { registerTooarkChart } from "@tooark/chart";
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
      test: "todo"
    }
  }
};

export default preview;
