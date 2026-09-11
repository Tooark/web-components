import type { ArkIntent, ArkSize, ArkTheme } from "@tooark/core";
import { expect, userEvent, waitFor, within } from "storybook/test";

const meta = {
  title: "Core/ArkToggle",
  argTypes: {
    pressed: { control: "boolean" },
    disabled: { control: "boolean" },
    intent: { control: "select", options: ["primary", "secondary", "success", "warning", "danger", "info", "neutral"] },
    theme: { control: "select", options: ["auto", "light", "dark"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg", "xl"] },
    label: { control: "text" }
  },
  args: {
    pressed: false,
    disabled: false,
    intent: "primary",
    theme: "auto",
    size: "md",
    label: "Action"
  }
};

export default meta;

type StoryArgs = {
  pressed: boolean;
  disabled: boolean;
  intent: ArkIntent;
  theme: ArkTheme;
  size: ArkSize;
  label: string;
};

function createToggle(
  label: string,
  options: {
    pressed?: boolean;
    disabled?: boolean;
    value?: string;
    intent?: string;
    theme?: string;
    size?: string;
  } = {}
): HTMLElement {
  const el = document.createElement("ark-toggle");
  if (options.intent) el.setAttribute("intent", options.intent);
  if (options.theme) el.setAttribute("theme", options.theme);
  if (options.size) el.setAttribute("size", options.size);
  if (options.value) el.setAttribute("value", options.value);
  if (options.pressed) el.setAttribute("pressed", "");
  if (options.disabled) el.setAttribute("disabled", "");
  el.textContent = label;
  return el;
}

export const Playground = {
  render: ({ pressed, disabled, intent, theme, size, label }: StoryArgs) =>
    createToggle(label, { pressed, disabled, intent, theme, size })
};

export const Group = {
  render: () => {
    const group = document.createElement("ark-toggle-group");
    group.setAttribute("value", "left");
    group.appendChild(createToggle("Left", { value: "left" }));
    group.appendChild(createToggle("Center", { value: "center" }));
    group.appendChild(createToggle("Right", { value: "right" }));
    return group;
  }
};

export const GroupMultiple = {
  render: () => {
    const group = document.createElement("ark-toggle-group");
    group.setAttribute("multiple", "");
    group.setAttribute("value", "bold,italic");
    group.appendChild(createToggle("Bold", { value: "bold" }));
    group.appendChild(createToggle("Italic", { value: "italic" }));
    group.appendChild(createToggle("Underline", { value: "underline" }));
    return group;
  }
};

export const GroupDark = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.style.padding = "16px";
    wrap.style.borderRadius = "12px";
    wrap.style.background = "#0f172a";

    const group = document.createElement("ark-toggle-group");
    group.setAttribute("theme", "dark");
    group.setAttribute("value", "day");
    group.appendChild(createToggle("Day", { value: "day" }));
    group.appendChild(createToggle("Week", { value: "week" }));
    group.appendChild(createToggle("Month", { value: "month" }));
    wrap.appendChild(group);

    return wrap;
  }
};

export const StandaloneIntents = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.style.display = "flex";
    wrap.style.flexWrap = "wrap";
    wrap.style.gap = "12px";

    ["primary", "success", "warning", "danger", "info"].forEach((intent) => {
      wrap.appendChild(createToggle(intent, { intent, pressed: true }));
    });

    return wrap;
  }
};

export const TogglesOnClick = {
  render: () => createToggle("Favorito"),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const control = canvas.getByRole("button", { name: "Favorito" });

    await expect(control).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(control);
    await expect(control).toHaveAttribute("aria-pressed", "true");
  }
};

export const GroupDynamicItems = {
  render: Group.render,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const group = canvasElement.querySelector("ark-toggle-group")!;

    // O host é o próprio grupo: role e itens como filhos diretos.
    await expect(group).toHaveAttribute("role", "group");
    await expect(canvas.getByRole("button", { name: "Left" }).parentElement).toBe(group);

    // Item adicionado depois da montagem herda o size do grupo e entra na seleção.
    group.setAttribute("size", "sm");
    const extra = createToggle("Extra", { value: "extra" });
    group.appendChild(extra);
    await waitFor(() => expect(extra).toHaveAttribute("size", "sm"));

    await userEvent.click(extra);
    await expect(group).toHaveAttribute("value", "extra");
    await expect(canvas.getByRole("button", { name: "Left" })).toHaveAttribute("aria-pressed", "false");
  }
};

export const GroupExclusiveSelection = {
  render: Group.render,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const left = canvas.getByRole("button", { name: "Left" });
    const center = canvas.getByRole("button", { name: "Center" });

    await expect(left).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(center);
    await expect(center).toHaveAttribute("aria-pressed", "true");
    await expect(left).toHaveAttribute("aria-pressed", "false");

    const group = canvasElement.querySelector("ark-toggle-group");
    await expect(group).toHaveAttribute("value", "center");
  }
};
