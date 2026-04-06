import "../../../packages/core/src/styles/tailwind.css";
import { registerTooarkComponents } from "@tooark/core";

registerTooarkComponents();

const preview = {
  parameters: {
    layout: "centered",
    controls: {
      expanded: true
    }
  }
};

export default preview;
