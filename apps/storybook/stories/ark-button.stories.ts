import type { ArkSize, ArkButtonStyleOptions, ArkButtonType } from "@tooark/core";

const meta = {
  title: "Core/ArkButton",
  argTypes: {
    variant: { control: "select", options: ["solid", "outline", "ghost"] },
    intent: { control: "select", options: ["primary", "secondary", "success", "warning", "danger", "info", "neutral"] },
    theme: { control: "select", options: ["auto", "light", "dark"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    disabled: { control: "boolean" },
    type: { control: "radio", options: ["button", "submit", "reset"] },
    color: { control: "color" },
    textColor: { control: "color" },
    label: { control: "text" }
  },
  args: {
    variant: "primary",
    intent: "primary",
    theme: "auto",
    size: "md",
    disabled: false,
    type: "button",
    color: "",
    textColor: "",
    label: "Ação principal"
  }
};

export default meta;

type StoryArgs = {
  variant: NonNullable<ArkButtonStyleOptions["variant"]>;
  intent: NonNullable<ArkButtonStyleOptions["intent"]>;
  theme: NonNullable<ArkButtonStyleOptions["theme"]>;
  size: ArkSize;
  disabled: boolean;
  type: ArkButtonType;
  color: string;
  textColor: string;
  label: string;
};

export const Playground = {
  render: ({ variant, intent, theme, size, disabled, type, color, textColor, label }: StoryArgs) => {
    const element = document.createElement("ark-button");
    element.setAttribute("variant", variant);
    element.setAttribute("intent", intent);
    element.setAttribute("theme", theme);
    element.setAttribute("size", size);
    element.setAttribute("type", type);
    if (color) element.setAttribute("color", color);
    if (textColor) element.setAttribute("text-color", textColor);

    if (disabled) {
      element.setAttribute("disabled", "");
    }

    element.textContent = label;
    return element;
  }
};

export const Variants = {
  args: {
    theme: "light",
    disabled: false
  },
  render: () => {
    const wrap = document.createElement("div");
    wrap.style.display = "flex";
    wrap.style.flexWrap = "wrap";
    wrap.style.gap = "12px";

    ["primary", "secondary", "success", "warning", "danger", "info", "outline", "ghost"].forEach((v) => {
      const el = document.createElement("ark-button");
      el.setAttribute("variant", v);
      el.textContent = v;
      wrap.appendChild(el);
    });

    return wrap;
  }
};

export const IntentsDark = {
  args: {
    variant: "solid",
    theme: "dark"
  },
  render: () => {
    const wrap = document.createElement("div");
    wrap.style.display = "flex";
    wrap.style.flexWrap = "wrap";
    wrap.style.gap = "12px";
    wrap.style.padding = "16px";
    wrap.style.borderRadius = "12px";
    wrap.style.background = "#0f172a";

    ["primary", "secondary", "success", "warning", "danger", "info", "neutral"].forEach((intent) => {
      const el = document.createElement("ark-button");
      el.setAttribute("variant", "solid");
      el.setAttribute("intent", intent);
      el.setAttribute("theme", "dark");
      el.textContent = intent;
      wrap.appendChild(el);
    });

    return wrap;
  }
};

export const CustomColors = {
  args: {
    variant: "solid",
    color: "#7c3aed",
    textColor: "#ffffff",
    label: "Custom color"
  },
  render: Playground.render
};
