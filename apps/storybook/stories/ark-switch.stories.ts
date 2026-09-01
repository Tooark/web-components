import { expect, userEvent, within } from "storybook/test";
import type { ArkIntent, ArkSize, ArkTheme } from "@tooark/core";

const meta = {
  title: "Core/ArkSwitch",
  argTypes: {
    checked: { control: "boolean" },
    disabled: { control: "boolean" },
    intent: { control: "select", options: ["primary", "secondary", "success", "warning", "danger", "info", "neutral"] },
    theme: { control: "select", options: ["auto", "light", "dark"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg", "xl"] },
    labels: { control: "boolean" },
    labelOn: { control: "text" },
    labelOff: { control: "text" },
    icons: { control: "boolean" },
    color: { control: "color" }
  },
  args: {
    checked: false,
    disabled: false,
    intent: "primary",
    theme: "auto",
    size: "md",
    labels: false,
    labelOn: "",
    labelOff: "",
    icons: false,
    color: ""
  }
};

export default meta;

type StoryArgs = {
  checked: boolean;
  disabled: boolean;
  intent: ArkIntent;
  theme: ArkTheme;
  size: ArkSize;
  labels: boolean;
  labelOn: string;
  labelOff: string;
  icons: boolean;
  color: string;
};

function createSwitch (args: Partial<StoryArgs> & { label?: string }): HTMLElement {
  const el = document.createElement("ark-switch");
  el.setAttribute("intent", args.intent || "primary");
  el.setAttribute("theme", args.theme || "auto");
  el.setAttribute("size", args.size || "md");
  el.setAttribute("label", args.label || "Alternar");
  if (args.checked) el.setAttribute("checked", "");
  if (args.disabled) el.setAttribute("disabled", "");
  if (args.labels) el.setAttribute("labels", "");
  if (args.icons) el.setAttribute("icons", "");
  if (args.labelOn) el.setAttribute("label-on", args.labelOn);
  if (args.labelOff) el.setAttribute("label-off", args.labelOff);
  if (args.color) el.setAttribute("color", args.color);
  return el;
}

export const Playground = {
  render: (args: StoryArgs) => createSwitch(args)
};

export const Styles = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.style.display = "grid";
    wrap.style.gap = "16px";

    const rows: Array<{ label: string; off: Partial<StoryArgs>; on: Partial<StoryArgs> }> = [
      { label: "Simples", off: {}, on: { checked: true } },
      { label: "Com texto", off: { labels: true }, on: { labels: true, checked: true } },
      { label: "Com ícones", off: { icons: true, intent: "success" }, on: { icons: true, intent: "success", checked: true } },
      { label: "Texto + ícones", off: { labels: true, icons: true, intent: "success" }, on: { labels: true, icons: true, intent: "success", checked: true } },
      { label: "Danger/Success", off: { icons: true, intent: "danger", checked: true }, on: { icons: true, intent: "success", checked: true } }
    ];

    rows.forEach((row) => {
      const line = document.createElement("div");
      line.style.display = "flex";
      line.style.alignItems = "center";
      line.style.gap = "16px";

      const label = document.createElement("span");
      label.style.width = "120px";
      label.style.font = "13px sans-serif";
      label.style.color = "#475569";
      label.textContent = row.label;
      line.appendChild(label);

      line.appendChild(createSwitch({ ...row.off, label: `${row.label} off` }));
      line.appendChild(createSwitch({ ...row.on, label: `${row.label} on` }));
      wrap.appendChild(line);
    });

    return wrap;
  }
};

export const Sizes = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.style.display = "flex";
    wrap.style.alignItems = "center";
    wrap.style.gap = "16px";

    ["sm", "md", "lg", "xl"].forEach((size) => {
      wrap.appendChild(createSwitch({ size: size as ArkSize, checked: true, label: size }));
    });

    return wrap;
  }
};

export const Intents = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.style.display = "flex";
    wrap.style.flexWrap = "wrap";
    wrap.style.gap = "12px";

    ["primary", "secondary", "success", "warning", "danger", "info", "neutral"].forEach((intent) => {
      wrap.appendChild(createSwitch({ intent: intent as ArkIntent, checked: true, label: intent }));
    });

    return wrap;
  }
};

export const TogglesOnClick = {
  render: () => createSwitch({ label: "Notificações" }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const control = canvas.getByRole("switch", { name: "Notificações" });

    await expect(control).toHaveAttribute("aria-checked", "false");
    await userEvent.click(control);
    await expect(control).toHaveAttribute("aria-checked", "true");
    await userEvent.click(control);
    await expect(control).toHaveAttribute("aria-checked", "false");
  }
};

export const TestHooks = {
  render: () => {
    const el = createSwitch({ labels: true, label: "Hooks" });
    el.setAttribute("testid", "meu-switch");
    return el;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const control = canvasElement.querySelector('[data-ark="switch"]');
    const thumb = canvasElement.querySelector('[data-ark="switch-thumb"]');

    await expect(control).not.toBeNull();
    await expect(thumb).not.toBeNull();
    await expect(control).toHaveAttribute("data-testid", "meu-switch");
    await expect(thumb).toHaveAttribute("data-testid", "meu-switch-thumb");
  }
};

export const DisabledDoesNotToggle = {
  render: () => createSwitch({ disabled: true, label: "Bloqueado" }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const control = canvasElement.querySelector("ark-switch button") as HTMLButtonElement;

    await expect(control).toBeDisabled();
    await expect(control).toHaveAttribute("aria-checked", "false");
  }
};
