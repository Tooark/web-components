import "../../../packages/core/src/styles/tailwind.css";
import { registerTooarkComponents } from "@tooark/web-components";
import { registerTooarkChart } from "@tooark/chart";
import { registerTooarkWysiwyg } from "@tooark/wysiwyg";

registerTooarkComponents();
registerTooarkChart();
registerTooarkWysiwyg();

const preview = {
  parameters: {
    layout: "centered",
    controls: {
      expanded: true
    }
  }
};

export default preview;
