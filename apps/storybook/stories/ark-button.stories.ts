import type { ArkRounded, ArkSize, ArkButtonStyleOptions, ArkButtonType } from "@tooark/core";

const meta = {
  title: "Core/ArkButton",
  argTypes: {
    variant: { control: "select", options: ["solid", "outline", "ghost"] },
    intent: { control: "select", options: ["primary", "secondary", "success", "warning", "danger", "info", "neutral"] },
    theme: { control: "select", options: ["auto", "light", "dark"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg", "xl"] },
    rounded: { control: "inline-radio", options: ["none", "sm", "md", "lg", "xl", "full"] },
    disabled: { control: "boolean" },
    loading: { control: "boolean" },
    iconOnly: { control: "boolean" },
    fullWidth: { control: "boolean" },
    href: { control: "text" },
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
    rounded: "md",
    disabled: false,
    loading: false,
    iconOnly: false,
    fullWidth: false,
    href: "",
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
  rounded: ArkRounded;
  disabled: boolean;
  loading: boolean;
  iconOnly: boolean;
  fullWidth: boolean;
  href: string;
  type: ArkButtonType;
  color: string;
  textColor: string;
  label: string;
};

export const Playground = {
  render: ({ variant, intent, theme, size, rounded, disabled, loading, iconOnly, fullWidth, href, type, color, textColor, label }: StoryArgs) => {
    const element = document.createElement("ark-button");
    element.setAttribute("variant", variant);
    element.setAttribute("intent", intent);
    element.setAttribute("theme", theme);
    element.setAttribute("size", size);
    element.setAttribute("rounded", rounded);
    element.setAttribute("type", type);
    if (color) element.setAttribute("color", color);
    if (textColor) element.setAttribute("text-color", textColor);
    if (href) element.setAttribute("href", href);

    if (disabled) element.setAttribute("disabled", "");
    if (loading) element.setAttribute("loading", "");
    if (iconOnly) element.setAttribute("icon-only", "");
    if (fullWidth) element.setAttribute("full-width", "");

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

export const Rounded = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.style.display = "flex";
    wrap.style.flexWrap = "wrap";
    wrap.style.alignItems = "center";
    wrap.style.gap = "12px";

    ["none", "sm", "md", "lg", "xl", "full"].forEach((rounded) => {
      const el = document.createElement("ark-button");
      el.setAttribute("rounded", rounded);
      el.textContent = rounded;
      wrap.appendChild(el);
    });

    return wrap;
  }
};

export const IconOnlyCircle = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.style.display = "flex";
    wrap.style.alignItems = "center";
    wrap.style.gap = "12px";

    [
      { intent: "success", icon: "✓" },
      { intent: "danger", icon: "✕" },
      { intent: "info", icon: "i" },
      { intent: "primary", icon: "+" }
    ].forEach(({ intent, icon }) => {
      const el = document.createElement("ark-button");
      el.setAttribute("icon-only", "");
      el.setAttribute("rounded", "full");
      el.setAttribute("intent", intent);
      el.setAttribute("aria-label", intent);
      const span = document.createElement("span");
      span.style.width = "1.25em";
      span.style.textAlign = "center";
      span.textContent = icon;
      el.appendChild(span);
      wrap.appendChild(el);
    });

    return wrap;
  }
};

export const Loading = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.style.display = "flex";
    wrap.style.alignItems = "center";
    wrap.style.gap = "12px";

    ["solid", "outline", "ghost"].forEach((variant) => {
      const el = document.createElement("ark-button");
      el.setAttribute("variant", variant);
      el.setAttribute("loading", "");
      el.textContent = "Salvando...";
      wrap.appendChild(el);
    });

    return wrap;
  }
};

export const FullWidth = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.style.width = "360px";
    wrap.style.display = "grid";
    wrap.style.gap = "8px";

    const solid = document.createElement("ark-button");
    solid.setAttribute("full-width", "");
    solid.textContent = "Continuar";
    wrap.appendChild(solid);

    const outline = document.createElement("ark-button");
    outline.setAttribute("full-width", "");
    outline.setAttribute("variant", "outline");
    outline.textContent = "Cancelar";
    wrap.appendChild(outline);

    return wrap;
  }
};

export const AsLink = {
  render: () => {
    const el = document.createElement("ark-button");
    el.setAttribute("href", "https://github.com/tooark");
    el.setAttribute("target", "_blank");
    el.setAttribute("variant", "outline");
    el.textContent = "Abrir no GitHub";
    return el;
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
